package com.tonefinder.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "tone_presets")
class TonePreset(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String = "",

    @Column(name = "analysis_result_id")
    val analysisResultId: Long? = null,

    @Column(name = "is_favorite")
    var isFavorite: Boolean = false,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
