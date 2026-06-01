package com.tonefinder.repository

import com.tonefinder.entity.CommunityPostComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface CommunityPostCommentRepository : JpaRepository<CommunityPostComment, Long> {
    fun findByPostIdOrderByCreatedAtAsc(postId: Long): List<CommunityPostComment>
    fun countByPostId(postId: Long): Int

    @Query("SELECT c.postId, COUNT(c.id) FROM CommunityPostComment c GROUP BY c.postId")
    fun countGroupByPostId(): List<Array<Any>>

    @Transactional
    fun deleteByPostId(postId: Long)
}
