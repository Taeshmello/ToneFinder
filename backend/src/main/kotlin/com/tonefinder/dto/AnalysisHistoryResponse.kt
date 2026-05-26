package com.tonefinder.dto

import com.tonefinder.entity.AnalysisResult
import java.time.LocalDateTime

data class AnalysisHistoryResponse(
    val id: Long,
    val audioHash: String,
    val audioFilename: String?,
    val createdAt: LocalDateTime,
) {
    companion object {
        fun from(a: AnalysisResult) =
            AnalysisHistoryResponse(a.id, a.audioHash, a.audioFilename, a.createdAt)
    }
}
