package com.tonefinder.dto

import com.tonefinder.entity.User

data class UserResponse(
    val id: Long,
    val email: String,
    val nickname: String?,
) {
    companion object {
        fun from(user: User) = UserResponse(user.id, user.email, user.nickname)
    }
}

data class UpdateUserRequest(
    val nickname: String? = null,
    val currentPassword: String? = null,
    val newPassword: String? = null,
)
