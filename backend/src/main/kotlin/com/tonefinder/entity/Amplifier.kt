package com.tonefinder.entity

import jakarta.persistence.*

@Entity
@Table(name = "amplifiers")
class Amplifier(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    val name: String = "",
    val brand: String = "",
)
