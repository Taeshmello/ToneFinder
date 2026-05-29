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
        if (apiKey.isBlank()) return Flux.error(IllegalStateException("SERVICE_UNAVAILABLE"))

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

}
