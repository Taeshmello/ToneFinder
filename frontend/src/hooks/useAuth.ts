import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import type { LoginRequest, RegisterRequest, UpdateUserRequest } from '../types/auth'

const TOKEN_KEY = 'tf_token'

export function useAuth() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    enabled: !!localStorage.getItem(TOKEN_KEY),
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (req: LoginRequest) => authService.login(req),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (req: RegisterRequest) => authService.register(req),
    onSuccess: (data) => {
      localStorage.setItem(TOKEN_KEY, data.token)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const updateMeMutation = useMutation({
    mutationFn: (req: UpdateUserRequest) => authService.updateMe(req),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    queryClient.clear()
    window.location.href = '/'
  }

  return {
    user: user ?? null,
    isLoggedIn: !!user,
    isLoading,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    updateMe: updateMeMutation.mutateAsync,
    logout,
  }
}
