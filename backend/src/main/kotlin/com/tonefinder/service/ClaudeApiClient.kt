package com.tonefinder.service

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.ParameterizedTypeReference
import org.springframework.http.codec.ServerSentEvent
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.Duration

@Component
class ClaudeApiClient(
    @Value("\${claude.api.key:}") private val apiKey: String,
    @Value("\${claude.api.model:claude-sonnet-4-6}") private val model: String,
    @Value("\${claude.api.max-tokens:4096}") private val maxTokens: Int,
    private val objectMapper: ObjectMapper,
) {
    private val webClient = WebClient.builder()
        .baseUrl("https://api.anthropic.com")
        .defaultHeader("anthropic-version", "2023-06-01")
        .codecs { it.defaultCodecs().maxInMemorySize(2 * 1024 * 1024) }
        .build()

    fun stream(prompt: String): Flux<String> {
        if (apiKey.isBlank()) return streamMock()

        val body = mapOf(
            "model" to model,
            "max_tokens" to maxTokens,
            "stream" to true,
            "messages" to listOf(mapOf("role" to "user", "content" to prompt)),
        )

        val responseType = object : ParameterizedTypeReference<ServerSentEvent<String>>() {}

        return webClient.post()
            .uri("/v1/messages")
            .header("x-api-key", apiKey)
            .bodyValue(body)
            .retrieve()
            .bodyToFlux(responseType)
            .flatMap { sse ->
                val data = sse.data() ?: return@flatMap Mono.empty<String>()
                if (data == "[DONE]") return@flatMap Mono.empty<String>()
                runCatching {
                    val node = objectMapper.readTree(data)
                    if (node["type"]?.asText() == "content_block_delta" &&
                        node["delta"]?.get("type")?.asText() == "text_delta") {
                        val text = node["delta"]["text"]?.asText()
                        if (!text.isNullOrEmpty()) Mono.just(text) else Mono.empty()
                    } else Mono.empty()
                }.getOrElse { Mono.empty() }
            }
    }

    private fun streamMock(): Flux<String> {
        val mockJson = """
{
  "toneCharacteristics": {
    "brightness": 7,
    "warmth": 4,
    "gain": 8,
    "type": "overdrive",
    "description": "중고역대가 강조된 따뜻한 오버드라이브 톤. 블루스와 클래식 록에 적합한 크런치 사운드입니다."
  },
  "recommendedGear": {
    "guitar": "Gibson Les Paul Standard",
    "amplifier": {"name": "JCM800", "brand": "Marshall"}
  },
  "ampSettings": {"bass": 6, "middle": 7, "treble": 6, "presence": 5, "gain": 8, "master": 6},
  "effectorSettings": [
    {"name": "Ibanez Tube Screamer TS-9", "knobs": [{"name": "Drive", "value": 7}, {"name": "Tone", "value": 6}, {"name": "Level", "value": 5}]},
    {"name": "Boss DD-7", "knobs": [{"name": "E.Level", "value": 4}, {"name": "F.Back", "value": 3}, {"name": "D.Time", "value": 5}]}
  ],
  "signalChain": ["Ibanez Tube Screamer TS-9", "Boss DD-7", "Marshall JCM800"]
}""".trimIndent()

        val lines = mockJson.lines()
        return Flux.interval(Duration.ofMillis(80))
            .take(lines.size.toLong())
            .map { i -> lines[i.toInt()] + "\n" }
    }
}
