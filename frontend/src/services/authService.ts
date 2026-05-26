import { api } from './api'
import type { AuthResponse, LoginRequest, RegisterRequest, UpdateUserRequest, User } from '../types/auth'

export const authService = {
  register: (req: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', req).then((r) => r.data),

  login: (req: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', req).then((r) => r.data),

  getMe: () =>
    api.get<User>('/users/me').then((r) => r.data),

  updateMe: (req: UpdateUserRequest) =>
    api.put<User>('/users/me', req).then((r) => r.data),
}
