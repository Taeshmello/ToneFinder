package com.tonefinder.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "community_posts")
class CommunityPost(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long = 0,

    @Column(name = "preset_id", nullable = false)
    val presetId: Long = 0,

    @Column(nullable = false, length = 200)
    val title: String = "",

    @Column(nullable = false, columnDefinition = "text")
    val content: String = "",

    @Column(name = "tone_type", nullable = false, length = 50)
    val toneType: String = "unknown",

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
