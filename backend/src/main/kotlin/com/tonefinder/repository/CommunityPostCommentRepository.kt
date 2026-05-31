package com.tonefinder.repository

import com.tonefinder.entity.CommunityPostComment
import org.springframework.data.jpa.repository.JpaRepository

interface CommunityPostCommentRepository : JpaRepository<CommunityPostComment, Long> {
    fun findByPostIdOrderByCreatedAtAsc(postId: Long): List<CommunityPostComment>
    fun countByPostId(postId: Long): Int
    fun deleteByPostId(postId: Long)
}
