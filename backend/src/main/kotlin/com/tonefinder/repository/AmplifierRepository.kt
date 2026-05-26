package com.tonefinder.repository

import com.tonefinder.entity.Amplifier
import org.springframework.data.jpa.repository.JpaRepository

interface AmplifierRepository : JpaRepository<Amplifier, Long>
