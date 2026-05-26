package com.tonefinder.controller

import com.tonefinder.dto.UpdateUserRequest
import com.tonefinder.dto.UserResponse
import com.tonefinder.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(private val userService: UserService) {

    @GetMapping("/me")
    fun getMe(@AuthenticationPrincipal userId: Long): ResponseEntity<UserResponse> =
        ResponseEntity.ok(userService.getMe(userId))

    @PutMapping("/me")
    fun updateMe(
        @AuthenticationPrincipal userId: Long,
        @RequestBody req: UpdateUserRequest,
    ): ResponseEntity<UserResponse> =
        ResponseEntity.ok(userService.updateMe(userId, req))
}
