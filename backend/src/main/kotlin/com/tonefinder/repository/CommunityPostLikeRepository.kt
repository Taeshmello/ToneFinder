package com.tonefinder.repository

import com.tonefinder.entity.CommunityPostLike
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.transaction.annotation.Transactional

interface CommunityPostLikeRepository : JpaRepository<CommunityPostLike, Long> {
    fun findByPostIdAndUserId(postId: Long, userId: Long): CommunityPostLike?
    fun countByPostId(postId: Long): Int
    fun existsByPostIdAndUserId(postId: Long, userId: Long): Boolean

    @Transactional
    fun deleteByPostId(postId: Long)
}
