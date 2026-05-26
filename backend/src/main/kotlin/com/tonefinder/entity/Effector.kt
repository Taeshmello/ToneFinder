package com.tonefinder.entity

import jakarta.persistence.*

@Entity
@Table(name = "effectors")
class Effector(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val name: String = "",
    val brand: String = "",
    val type: String = "",
    @Column(columnDefinition = "text")
    val knobsJson: String = "",
)
