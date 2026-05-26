export interface User {
  id: number
  email: string
  nickname: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname?: string
}

export interface AuthResponse {
  token: string
  email: string
  nickname: string | null
}

export interface UpdateUserRequest {
  nickname?: string
  currentPassword?: string
  newPassword?: string
}
