package com.tonefinder.controller

import com.tonefinder.dto.UploadResponse
import com.tonefinder.service.AudioService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/audio")
class AudioController(private val audioService: AudioService) {

    @PostMapping("/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun upload(
        @RequestParam("file") file: MultipartFile,
        @AuthenticationPrincipal userId: Long?,
    ): ResponseEntity<UploadResponse> {
        if (file.isEmpty) return ResponseEntity.badRequest().build()
        val contentType = file.contentType ?: ""
        if (!contentType.startsWith("audio/") && !contentType.startsWith("video/")) {
            return ResponseEntity.badRequest().build()
        }
        val outcome = audioService.upload(file, userId)
        return ResponseEntity.ok(
            UploadResponse(
                id = outcome.result.id,
                audioHash = outcome.result.audioHash,
                audioFilename = outcome.result.audioFilename,
                cached = outcome.cached,
            )
        )
    }
}
