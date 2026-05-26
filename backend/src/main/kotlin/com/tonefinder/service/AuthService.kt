package com.tonefinder.service

import com.tonefinder.dto.AuthResponse
import com.tonefinder.entity.User
import com.tonefinder.repository.UserRepository
import com.tonefinder.util.JwtUtil
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil,
) {
    fun register(email: String, password: String, nickname: String?): AuthResponse {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("이미 사용 중인 이메일입니다.")
        }
        val user = userRepository.save(
            User(
                email = email,
                password = passwordEncoder.encode(password),
                nickname = nickname,
            )
        )
        val token = jwtUtil.generateToken(user.email)
        return AuthResponse(token, user.email, user.nickname)
    }

    fun login(email: String, password: String): AuthResponse {
        val user = userRepository.findByEmail(email)
            ?: throw IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.")
        if (!passwordEncoder.matches(password, user.password)) {
            throw IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.")
        }
        val token = jwtUtil.generateToken(user.email)
        return AuthResponse(token, user.email, user.nickname)
    }
}
