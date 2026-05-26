package com.tonefinder.controller

import com.tonefinder.dto.AnalysisHistoryResponse
import com.tonefinder.dto.StreamAnalysisRequest
import com.tonefinder.repository.AnalysisResultRepository
import com.tonefinder.service.AnalysisService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.ServerSentEvent
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/v1/analysis")
class AnalysisController(
    private val repository: AnalysisResultRepository,
    private val analysisService: AnalysisService,
) {
    @GetMapping("/me")
    fun getMyHistory(@AuthenticationPrincipal userId: Long): ResponseEntity<List<AnalysisHistoryResponse>> =
        ResponseEntity.ok(
            repository.findByUserIdOrderByCreatedAtDesc(userId).map { AnalysisHistoryResponse.from(it) }
        )

    @DeleteMapping("/{id}")
    fun deleteHistory(
        @PathVariable id: Long,
        @AuthenticationPrincipal userId: Long,
    ): ResponseEntity<Void> {
        val result = repository.findById(id).orElseThrow { IllegalArgumentException("이력을 찾을 수 없습니다.") }
        if (result.userId != userId) return ResponseEntity.status(403).build()
        repository.delete(result)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun streamAnalysis(
        @RequestBody req: StreamAnalysisRequest,
        @AuthenticationPrincipal userId: Long,
    ): Flux<ServerSentEvent<String>> =
        analysisService.stream(
            req.analysisResultId, userId,
            req.sampleRate, req.duration,
            req.peakFrequency, req.dynamicRange, req.spectralCentroid,
        )
}
