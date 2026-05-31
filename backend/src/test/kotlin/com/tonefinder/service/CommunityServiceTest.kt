package com.tonefinder.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.tonefinder.dto.CreatePostRequest
import com.tonefinder.entity.*
import com.tonefinder.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.Spy
import org.mockito.junit.jupiter.MockitoExtension
import java.util.*

@ExtendWith(MockitoExtension::class)
class CommunityServiceTest {

    @Mock lateinit var postRepository: CommunityPostRepository
    @Mock lateinit var likeRepository: CommunityPostLikeRepository
    @Mock lateinit var commentRepository: CommunityPostCommentRepository
    @Mock lateinit var presetRepository: TonePresetRepository
    @Mock lateinit var analysisRepository: AnalysisResultRepository
    @Mock lateinit var userRepository: UserRepository

    // ObjectMapper는 실제 인스턴스 사용 — @Spy로 Mockito 생성자 주입에 포함
    @Spy
    val objectMapper: ObjectMapper = ObjectMapper()

    @InjectMocks
    lateinit var service: CommunityService

    @Test
    fun `create - 본인 소유 프리셋이면 게시글 저장`() {
        val userId = 1L
        val preset = TonePreset(id = 10L, userId = userId, name = "내 프리셋", analysisResultId = 5L)
        val analysisResult = AnalysisResult(id = 5L,
            toneCharacteristics = """{"toneCharacteristics":{"type":"clean"},"recommendedGear":{},"ampSettings":{},"effectorSettings":[],"signalChain":[]}""")
        val req = CreatePostRequest(presetId = 10L, title = "제목", content = "내용")

        `when`(presetRepository.findById(10L)).thenReturn(Optional.of(preset))
        `when`(analysisRepository.findById(5L)).thenReturn(Optional.of(analysisResult))
        `when`(postRepository.save(any())).thenAnswer { it.arguments[0] }
        `when`(userRepository.findById(userId)).thenReturn(Optional.of(
            User(id = userId, email = "test@test.com", nickname = "테스터")
        ))
        `when`(likeRepository.countByPostId(0L)).thenReturn(0)
        `when`(commentRepository.countByPostId(0L)).thenReturn(0)

        val result = service.create(userId, req)

        assertEquals("제목", result.title)
        assertEquals("clean", result.toneType)
    }

    @Test
    fun `create - 타인 프리셋이면 예외 발생`() {
        val preset = TonePreset(id = 10L, userId = 99L, name = "남의 프리셋")
        `when`(presetRepository.findById(10L)).thenReturn(Optional.of(preset))

        assertThrows<IllegalArgumentException> {
            service.create(1L, CreatePostRequest(presetId = 10L, title = "제목", content = "내용"))
        }
    }

    @Test
    fun `toggleLike - 좋아요 없으면 추가하고 liked=true 반환`() {
        `when`(postRepository.existsById(1L)).thenReturn(true)
        `when`(likeRepository.findByPostIdAndUserId(1L, 2L)).thenReturn(null)
        `when`(likeRepository.save(any())).thenAnswer { it.arguments[0] }
        `when`(likeRepository.countByPostId(1L)).thenReturn(1)

        val result = service.toggleLike(2L, 1L)

        assertTrue(result.liked)
        assertEquals(1, result.likeCount)
        verify(likeRepository).save(any())
    }

    @Test
    fun `toggleLike - 좋아요 있으면 삭제하고 liked=false 반환`() {
        val like = CommunityPostLike(id = 5L, postId = 1L, userId = 2L)
        `when`(postRepository.existsById(1L)).thenReturn(true)
        `when`(likeRepository.findByPostIdAndUserId(1L, 2L)).thenReturn(like)
        `when`(likeRepository.countByPostId(1L)).thenReturn(0)

        val result = service.toggleLike(2L, 1L)

        assertFalse(result.liked)
        assertEquals(0, result.likeCount)
        verify(likeRepository).delete(like)
    }

    @Test
    fun `deletePost - 본인 게시글이면 삭제`() {
        val post = CommunityPost(id = 1L, userId = 2L, presetId = 10L, title = "제목", content = "내용")
        `when`(postRepository.findById(1L)).thenReturn(Optional.of(post))

        service.deletePost(2L, 1L)

        verify(likeRepository).deleteByPostId(1L)
        verify(commentRepository).deleteByPostId(1L)
        verify(postRepository).delete(post)
    }

    @Test
    fun `deletePost - 타인 게시글이면 예외 발생`() {
        val post = CommunityPost(id = 1L, userId = 99L, presetId = 10L, title = "제목", content = "내용")
        `when`(postRepository.findById(1L)).thenReturn(Optional.of(post))

        assertThrows<IllegalArgumentException> {
            service.deletePost(1L, 1L)
        }
    }
}
