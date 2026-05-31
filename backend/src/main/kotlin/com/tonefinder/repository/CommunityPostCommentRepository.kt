package com.tonefinder.repository

import com.tonefinder.entity.CommunityPostComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

interface CommunityPostCommentRepository : JpaRepository<CommunityPostComment, Long> {
    fun findByPostIdOrderByCreatedAtAsc(postId: Long): List<CommunityPostComment>
    fun countByPostId(postId: Long): Int

    @Transactional
    fun deleteByPostId(postId: Long)
}
