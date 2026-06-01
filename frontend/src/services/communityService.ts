import { api } from './api'
import type {
  CommunityPostSummary,
  CommunityPostDetail,
  CommunityPostCommentResponse,
  LikeToggleResponse,
  CreatePostRequest,
  CreateCommentRequest,
} from '../types/community'
import type { PresetResponse } from '../types/preset'

export const communityService = {
  getPosts: (params?: { sort?: string; toneType?: string }) =>
    api.get<CommunityPostSummary[]>('/community/posts', { params }).then((r) => r.data),

  getPost: (id: number) =>
    api.get<CommunityPostDetail>(`/community/posts/${id}`).then((r) => r.data),

  createPost: (req: CreatePostRequest) =>
    api.post<CommunityPostSummary>('/community/posts', req).then((r) => r.data),

  deletePost: (id: number) =>
    api.delete(`/community/posts/${id}`),

  toggleLike: (id: number) =>
    api.post<LikeToggleResponse>(`/community/posts/${id}/likes`).then((r) => r.data),

  getComments: (id: number) =>
    api.get<CommunityPostCommentResponse[]>(`/community/posts/${id}/comments`).then((r) => r.data),

  addComment: (id: number, req: CreateCommentRequest) =>
    api.post<CommunityPostCommentResponse>(`/community/posts/${id}/comments`, req).then((r) => r.data),

  deleteComment: (postId: number, commentId: number) =>
    api.delete(`/community/posts/${postId}/comments/${commentId}`),

  copyPreset: (id: number) =>
    api.post<PresetResponse>(`/community/posts/${id}/preset/copy`).then((r) => r.data),
}
