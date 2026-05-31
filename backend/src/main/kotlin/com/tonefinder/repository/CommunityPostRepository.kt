package com.tonefinder.repository

import com.tonefinder.entity.CommunityPost
import org.springframework.data.jpa.repository.JpaRepository

interface CommunityPostRepository : JpaRepository<CommunityPost, Long> {
    fun findAllByOrderByCreatedAtDesc(): List<CommunityPost>
    fun findAllByToneTypeOrderByCreatedAtDesc(toneType: String): List<CommunityPost>
}
