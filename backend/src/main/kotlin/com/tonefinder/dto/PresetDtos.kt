package com.tonefinder.dto

import com.tonefinder.entity.TonePreset
import java.time.LocalDateTime

data class PresetRequest(
    val name: String,
    val analysisResultId: Long,
)

data class PresetResponse(
    val id: Long,
    val name: String,
    val analysisResultId: Long?,
    val isFavorite: Boolean,
    val createdAt: LocalDateTime,
    val toneCharacteristicsJson: String?,
) {
    companion object {
        fun from(p: TonePreset, toneJson: String? = null) = PresetResponse(
            p.id, p.name, p.analysisResultId, p.isFavorite, p.createdAt, toneJson
        )
    }
}
