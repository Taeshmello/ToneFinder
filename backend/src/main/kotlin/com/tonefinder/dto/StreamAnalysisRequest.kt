package com.tonefinder.dto

data class StreamAnalysisRequest(
    val analysisResultId: Long,
    val sampleRate: Int,
    val duration: Double,
    val peakFrequency: Double,
    val dynamicRange: Double,
    val spectralCentroid: Double,
)
