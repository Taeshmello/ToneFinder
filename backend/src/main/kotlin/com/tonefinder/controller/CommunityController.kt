package com.tonefinder.controller

import com.tonefinder.dto.CreateCommentRequest
import com.tonefinder.dto.CreatePostRequest
import com.tonefinder.service.CommunityService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/community/posts")
class CommunityController(private val communityService: CommunityService) {

    @GetMapping
    fun getPosts(
        @RequestParam(defaultValue = "latest") sort: String,
        @RequestParam(required = false) toneType: String?,
    ) = ResponseEntity.ok(communityService.getPosts(sort, toneType))

    @PostMapping
    fun createPost(
        @AuthenticationPrincipal userId: Long,
        @RequestBody req: CreatePostRequest,
    ) = ResponseEntity.ok(communityService.create(userId, req))

    @GetMapping("/{id}")
    fun getPost(
        @PathVariable id: Long,
        @AuthenticationPrincipal userId: Long?,
    ) = ResponseEntity.ok(communityService.getPost(id, userId))

    @DeleteMapping("/{id}")
    fun deletePost(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
    ): ResponseEntity<Void> {
        communityService.deletePost(userId, id)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/likes")
    fun toggleLike(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
    ) = ResponseEntity.ok(communityService.toggleLike(userId, id))

    @GetMapping("/{id}/comments")
    fun getComments(
        @PathVariable id: Long,
        @AuthenticationPrincipal userId: Long?,
    ) = ResponseEntity.ok(communityService.getComments(id, userId))

    @PostMapping("/{id}/comments")
    fun addComment(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
        @RequestBody req: CreateCommentRequest,
    ) = ResponseEntity.ok(communityService.addComment(userId, id, req))

    @DeleteMapping("/{id}/comments/{commentId}")
    fun deleteComment(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
        @PathVariable commentId: Long,
    ): ResponseEntity<Void> {
        communityService.deleteComment(userId, commentId)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{id}/preset/copy")
    fun copyPreset(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
    ) = ResponseEntity.ok(communityService.copyPreset(userId, id))
}
