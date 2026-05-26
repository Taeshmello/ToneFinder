package com.tonefinder.service

import com.tonefinder.dto.PresetRequest
import com.tonefinder.dto.PresetResponse
import com.tonefinder.entity.TonePreset
import com.tonefinder.repository.AnalysisResultRepository
import com.tonefinder.repository.TonePresetRepository
import org.springframework.stereotype.Service

@Service
class PresetService(
    private val repository: TonePresetRepository,
    private val analysisRepository: AnalysisResultRepository,
) {

    fun create(userId: Long, req: PresetRequest): PresetResponse {
        val preset = repository.save(
            TonePreset(userId = userId, name = req.name, analysisResultId = req.analysisResultId)
        )
        return PresetResponse.from(preset)
    }

    fun getMyPresets(userId: Long): List<PresetResponse> =
        repository.findByUserIdOrderByCreatedAtDesc(userId).map { preset ->
            val toneJson = preset.analysisResultId?.let { id ->
                analysisRepository.findById(id).map { it.toneCharacteristics }.orElse(null)
            }
            PresetResponse.from(preset, toneJson)
        }

    fun delete(userId: Long, presetId: Long) {
        val preset = repository.findById(presetId).orElseThrow { IllegalArgumentException("프리셋을 찾을 수 없습니다.") }
        if (preset.userId != userId) throw IllegalArgumentException("삭제 권한이 없습니다.")
        repository.delete(preset)
    }
}
