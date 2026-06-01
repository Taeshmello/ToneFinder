package com.tonefinder.repository

import com.tonefinder.entity.CommunityPostLike
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional

interface CommunityPostLikeRepository : JpaRepository<CommunityPostLike, Long> {
    fun findByPostIdAndUserId(postId: Long, userId: Long): CommunityPostLike?
    fun countByPostId(postId: Long): Int
    fun existsByPostIdAndUserId(postId: Long, userId: Long): Boolean

    @Query("SELECT l.postId, COUNT(l.id) FROM CommunityPostLike l GROUP BY l.postId")
    fun countGroupByPostId(): List<Array<Any>>

    @Transactional
    fun deleteByPostId(postId: Long)
}
