package com.tonefinder.repository

import com.tonefinder.entity.AnalysisResult
import org.springframework.data.jpa.repository.JpaRepository

interface AnalysisResultRepository : JpaRepository<AnalysisResult, Long> {
    fun findFirstByAudioHash(audioHash: String): AnalysisResult?
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<AnalysisResult>
    fun findFirstByAudioHashAndUserId(audioHash: String, userId: Long): AnalysisResult?
}
