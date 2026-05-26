package com.tonefinder.service

import com.tonefinder.dto.UpdateUserRequest
import com.tonefinder.dto.UserResponse
import com.tonefinder.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) {
    fun getMe(userId: Long): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("사용자를 찾을 수 없습니다.") }
        return UserResponse.from(user)
    }

    fun updateMe(userId: Long, req: UpdateUserRequest): UserResponse {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("사용자를 찾을 수 없습니다.") }
        req.nickname?.let { user.nickname = it }
        if (req.currentPassword != null && req.newPassword != null) {
            if (!passwordEncoder.matches(req.currentPassword, user.password)) {
                throw IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.")
            }
            user.password = passwordEncoder.encode(req.newPassword)
        }
        return UserResponse.from(userRepository.save(user))
    }
}
