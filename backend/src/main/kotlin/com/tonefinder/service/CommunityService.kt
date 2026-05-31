package com.tonefinder.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.tonefinder.dto.*
import com.tonefinder.entity.CommunityPost
import com.tonefinder.entity.CommunityPostComment
import com.tonefinder.entity.CommunityPostLike
import com.tonefinder.entity.TonePreset
import com.tonefinder.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.format.DateTimeFormatter

@Service
class CommunityService(
    private val postRepository: CommunityPostRepository,
    private val likeRepository: CommunityPostLikeRepository,
    private val commentRepository: CommunityPostCommentRepository,
    private val presetRepository: TonePresetRepository,
    private val analysisRepository: AnalysisResultRepository,
    private val userRepository: UserRepository,
    private val objectMapper: ObjectMapper,
) {
    private val formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    fun getPosts(sort: String, toneType: String?): List<CommunityPostSummary> {
        val posts = if (toneType != null)
            postRepository.findAllByToneTypeOrderByCreatedAtDesc(toneType)
        else
            postRepository.findAllByOrderByCreatedAtDesc()

        val summaries = posts.map { toSummary(it) }
        return if (sort == "popular") summaries.sortedByDescending { it.likeCount } else summaries
    }

    fun getPost(postId: Long, userId: Long?): CommunityPostDetail {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("게시글을 찾을 수 없습니다.") }
        val author = userRepository.findById(post.userId).orElse(null)
        val preset = presetRepository.findById(post.presetId).orElse(null)
        val toneJson = preset?.analysisResultId?.let { id ->
            analysisRepository.findById(id).map { it.toneCharacteristics }.orElse(null)
        }
        return CommunityPostDetail(
            id = post.id,
            title = post.title,
            content = post.content,
            authorNickname = author?.nickname ?: author?.email ?: "알 수 없음",
            toneType = post.toneType,
            likeCount = likeRepository.countByPostId(post.id),
            commentCount = commentRepository.countByPostId(post.id),
            isLikedByMe = userId?.let { likeRepository.existsByPostIdAndUserId(post.id, it) } ?: false,
            isOwner = userId == post.userId,
            presetName = preset?.name ?: "",
            toneCharacteristicsJson = toneJson,
            createdAt = post.createdAt.format(formatter),
        )
    }

    @Transactional
    fun create(userId: Long, req: CreatePostRequest): CommunityPostSummary {
        val preset = presetRepository.findById(req.presetId)
            .orElseThrow { IllegalArgumentException("프리셋을 찾을 수 없습니다.") }
        if (preset.userId != userId) throw IllegalArgumentException("본인 프리셋만 공유할 수 있습니다.")

        val toneType = extractToneType(preset)

        val post = postRepository.save(
            CommunityPost(
                userId = userId,
                presetId = req.presetId,
                title = req.title,
                content = req.content,
                toneType = toneType,
            )
        )
        return toSummary(post)
    }

    @Transactional
    fun deletePost(userId: Long, postId: Long) {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("게시글을 찾을 수 없습니다.") }
        if (post.userId != userId) throw IllegalArgumentException("삭제 권한이 없습니다.")
        likeRepository.deleteByPostId(postId)
        commentRepository.deleteByPostId(postId)
        postRepository.delete(post)
    }

    @Transactional
    fun toggleLike(userId: Long, postId: Long): LikeToggleResponse {
        if (!postRepository.existsById(postId)) throw IllegalArgumentException("게시글을 찾을 수 없습니다.")
        val existing = likeRepository.findByPostIdAndUserId(postId, userId)
        if (existing != null) {
            likeRepository.delete(existing)
        } else {
            likeRepository.save(CommunityPostLike(postId = postId, userId = userId))
        }
        return LikeToggleResponse(
            liked = existing == null,
            likeCount = likeRepository.countByPostId(postId),
        )
    }

    fun getComments(postId: Long, userId: Long?): List<CommunityPostCommentResponse> {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId).map { comment ->
            val author = userRepository.findById(comment.userId).orElse(null)
            CommunityPostCommentResponse(
                id = comment.id,
                authorNickname = author?.nickname ?: author?.email ?: "알 수 없음",
                content = comment.content,
                createdAt = comment.createdAt.format(formatter),
                isOwner = userId == comment.userId,
            )
        }
    }

    @Transactional
    fun addComment(userId: Long, postId: Long, req: CreateCommentRequest): CommunityPostCommentResponse {
        if (!postRepository.existsById(postId)) throw IllegalArgumentException("게시글을 찾을 수 없습니다.")
        val comment = commentRepository.save(
            CommunityPostComment(postId = postId, userId = userId, content = req.content)
        )
        val author = userRepository.findById(userId).orElse(null)
        return CommunityPostCommentResponse(
            id = comment.id,
            authorNickname = author?.nickname ?: author?.email ?: "알 수 없음",
            content = comment.content,
            createdAt = comment.createdAt.format(formatter),
            isOwner = true,
        )
    }

    @Transactional
    fun deleteComment(userId: Long, commentId: Long) {
        val comment = commentRepository.findById(commentId).orElseThrow { IllegalArgumentException("댓글을 찾을 수 없습니다.") }
        if (comment.userId != userId) throw IllegalArgumentException("삭제 권한이 없습니다.")
        commentRepository.delete(comment)
    }

    @Transactional
    fun copyPreset(userId: Long, postId: Long): PresetResponse {
        val post = postRepository.findById(postId).orElseThrow { IllegalArgumentException("게시글을 찾을 수 없습니다.") }
        val original = presetRepository.findById(post.presetId)
            .orElseThrow { IllegalArgumentException("프리셋을 찾을 수 없습니다.") }
        val copied = presetRepository.save(
            TonePreset(
                userId = userId,
                name = "[복사] ${original.name}",
                analysisResultId = original.analysisResultId,
            )
        )
        val toneJson = copied.analysisResultId?.let { id ->
            analysisRepository.findById(id).map { it.toneCharacteristics }.orElse(null)
        }
        return PresetResponse.from(copied, toneJson)
    }

    private fun toSummary(post: CommunityPost): CommunityPostSummary {
        val author = userRepository.findById(post.userId).orElse(null)
        return CommunityPostSummary(
            id = post.id,
            title = post.title,
            authorNickname = author?.nickname ?: author?.email ?: "알 수 없음",
            toneType = post.toneType,
            likeCount = likeRepository.countByPostId(post.id),
            commentCount = commentRepository.countByPostId(post.id),
            createdAt = post.createdAt.format(formatter),
        )
    }

    private fun extractToneType(preset: TonePreset): String {
        val analysisResultId = preset.analysisResultId ?: return "unknown"
        val toneJson = analysisRepository.findById(analysisResultId)
            .map { it.toneCharacteristics }.orElse(null) ?: return "unknown"
        return try {
            objectMapper.readTree(toneJson)
                .path("toneCharacteristics").path("type").asText("unknown")
        } catch (e: Exception) {
            "unknown"
        }
    }
}
