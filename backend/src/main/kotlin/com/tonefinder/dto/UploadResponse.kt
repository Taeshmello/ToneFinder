package com.tonefinder.dto

data class UploadResponse(
    val id: Long,
    val audioHash: String,
    val audioFilename: String?,
    val cached: Boolean,
)
