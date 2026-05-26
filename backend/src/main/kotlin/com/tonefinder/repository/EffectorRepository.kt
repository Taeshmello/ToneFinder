package com.tonefinder.repository

import com.tonefinder.entity.Effector
import org.springframework.data.jpa.repository.JpaRepository

interface EffectorRepository : JpaRepository<Effector, Long>
