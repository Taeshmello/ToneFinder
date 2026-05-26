package com.tonefinder.controller

import com.tonefinder.dto.PresetRequest
import com.tonefinder.dto.PresetResponse
import com.tonefinder.service.PresetService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/presets")
class PresetController(private val presetService: PresetService) {

    @PostMapping
    fun create(
        @AuthenticationPrincipal userId: Long,
        @RequestBody req: PresetRequest,
    ): ResponseEntity<PresetResponse> =
        ResponseEntity.ok(presetService.create(userId, req))

    @GetMapping
    fun getAll(@AuthenticationPrincipal userId: Long): ResponseEntity<List<PresetResponse>> =
        ResponseEntity.ok(presetService.getMyPresets(userId))

    @DeleteMapping("/{id}")
    fun delete(
        @AuthenticationPrincipal userId: Long,
        @PathVariable id: Long,
    ): ResponseEntity<Void> {
        presetService.delete(userId, id)
        return ResponseEntity.noContent().build()
    }
}
