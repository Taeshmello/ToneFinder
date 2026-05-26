package com.tonefinder.repository

import com.tonefinder.entity.TonePreset
import org.springframework.data.jpa.repository.JpaRepository

interface TonePresetRepository : JpaRepository<TonePreset, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<TonePreset>
}
