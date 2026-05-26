package com.tonefinder.entity

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.LocalDateTime

@Entity
@Table(
    name = "analysis_results",
    indexes = [Index(name = "idx_analysis_audio_hash", columnList = "audio_hash")]
)
class AnalysisResult(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id")
    val userId: Long? = null,

    @Column(name = "audio_hash", nullable = false, length = 64)
    val audioHash: String = "",

    @Column(name = "audio_filename", length = 255)
    val audioFilename: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tone_characteristics", columnDefinition = "jsonb")
    var toneCharacteristics: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings_json", columnDefinition = "jsonb")
    var settingsJson: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "signal_chain", columnDefinition = "jsonb")
    var signalChain: String? = null,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
