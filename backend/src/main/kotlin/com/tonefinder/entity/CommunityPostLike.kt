package com.tonefinder.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "community_post_likes",
    uniqueConstraints = [UniqueConstraint(columnNames = ["post_id", "user_id"])]
)
class CommunityPostLike(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "post_id", nullable = false)
    val postId: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long = 0,

    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
