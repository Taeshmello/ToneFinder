package com.tonefinder.dto

data class CreatePostRequest(
    val presetId: Long,
    val title: String,
    val content: String,
)

data class CreateCommentRequest(
    val content: String,
)

data class CommunityPostSummary(
    val id: Long,
    val title: String,
    val authorNickname: String,
    val toneType: String,
    val likeCount: Int,
    val commentCount: Int,
    val createdAt: String,
)

data class CommunityPostDetail(
    val id: Long,
    val title: String,
    val content: String,
    val authorNickname: String,
    val toneType: String,
    val likeCount: Int,
    val commentCount: Int,
    val isLikedByMe: Boolean,
    val isOwner: Boolean,
    val presetName: String,
    val toneCharacteristicsJson: String?,
    val createdAt: String,
)

data class CommunityPostCommentResponse(
    val id: Long,
    val authorNickname: String,
    val content: String,
    val createdAt: String,
    val isOwner: Boolean,
)

data class LikeToggleResponse(
    val liked: Boolean,
    val likeCount: Int,
)
