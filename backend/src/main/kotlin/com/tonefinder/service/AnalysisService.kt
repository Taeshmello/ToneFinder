package com.tonefinder.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.tonefinder.entity.AnalysisResult
import com.tonefinder.repository.AnalysisResultRepository
import com.tonefinder.repository.EffectorRepository
import org.slf4j.LoggerFactory
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.scheduler.Schedulers

@Service
class AnalysisService(
    private val repository: AnalysisResultRepository,
    private val claudeApiClient: ClaudeApiClient,
    private val effectorRepository: EffectorRepository,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(AnalysisService::class.java)

    fun stream(
        analysisResultId: Long,
        userId: Long,
        sampleRate: Int,
        duration: Double,
        peakFrequency: Double,
        dynamicRange: Double,
        spectralCentroid: Double,
    ): Flux<ServerSentEvent<String>> {
        val result = repository.findById(analysisResultId)
            .orElseThrow { IllegalArgumentException("분석 결과를 찾을 수 없습니다.") }
        if (result.userId != null && result.userId != userId) {
            throw IllegalArgumentException("접근 권한이 없습니다.")
        }

        if (result.toneCharacteristics != null) {
            return Flux.just(
                ServerSentEvent.builder<String>()
                    .event("complete")
                    .data(result.toneCharacteristics)
                    .build()
            )
        }

        val prompt = buildPrompt(result, sampleRate, duration, peakFrequency, dynamicRange, spectralCentroid)
        val accumulated = StringBuilder()

        return claudeApiClient.stream(prompt)
            .map { chunk ->
                accumulated.append(chunk)
                ServerSentEvent.builder<String>().event("chunk").data(chunk).build()
            }
            .concatWith(
                Mono.fromCallable {
                    val json = accumulated.toString()
                    result.toneCharacteristics = json
                    repository.save(result)
                    ServerSentEvent.builder<String>().event("complete").data(json).build()
                }.subscribeOn(Schedulers.boundedElastic())
            )
            .onErrorResume { e ->
                log.error("Claude 스트리밍 오류", e)
                val msg = when (e) {
                    is WebClientResponseException -> "Claude API 오류 (${e.statusCode.value()}): ${e.responseBodyAsString.take(200)}"
                    else -> "분석 중 오류가 발생했습니다: ${e.message}"
                }
                Flux.just(ServerSentEvent.builder<String>().event("error").data(msg).build())
            }
    }

    private fun buildPrompt(
        result: AnalysisResult,
        sampleRate: Int,
        duration: Double,
        peakFrequency: Double,
        dynamicRange: Double,
        spectralCentroid: Double,
    ): String {
        val effectors = effectorRepository.findAll()
        val effectorContext = effectors.joinToString("\n") { e ->
            @Suppress("UNCHECKED_CAST")
            val knobs = objectMapper.readValue(e.knobsJson, List::class.java as Class<List<String>>).joinToString(", ")
            "- ${e.brand} ${e.name} (${e.type}): $knobs 노브"
        }

        return """
당신은 20년 경력의 기타 톤 전문가입니다.

아래 오디오 분석 데이터를 기반으로 이 기타 사운드의 톤 특성을 분석하고,
해당 톤을 재현하기 위한 장비 세팅을 추천해주세요.

## 오디오 분석 데이터
- 파일명: ${result.audioFilename ?: "알 수 없음"}
- 샘플레이트: ${sampleRate}Hz
- 재생 길이: ${"%.1f".format(duration)}초
- 피크 주파수: ${"%.1f".format(peakFrequency)}Hz
- 다이내믹 레인지: ${"%.1f".format(dynamicRange)}dB
- 스펙트럴 센트로이드: ${"%.1f".format(spectralCentroid)}Hz

## 이펙터 DB 참고 정보
$effectorContext

## 응답 형식 (반드시 JSON만, 다른 텍스트 없이)
```json
{
  "toneCharacteristics": {
    "brightness": 0-10,
    "warmth": 0-10,
    "gain": 0-10,
    "type": "clean|crunch|overdrive|distortion|fuzz",
    "description": "톤 특성 한국어 설명"
  },
  "recommendedGear": {
    "guitar": "추천 기타",
    "amplifier": {"name": "앰프명", "brand": "브랜드"}
  },
  "ampSettings": {
    "bass": 0-10, "middle": 0-10, "treble": 0-10,
    "presence": 0-10, "gain": 0-10, "master": 0-10
  },
  "effectorSettings": [
    {"name": "이펙터명", "knobs": [{"name": "노브명", "value": 0-10}]}
  ],
  "signalChain": ["이펙터1", "이펙터2", "앰프"]
}
```
        """.trimIndent()
    }
}
