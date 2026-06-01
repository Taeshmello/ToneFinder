export interface CommunityPostSummary {
  id: number
  title: string
  authorNickname: string
  toneType: string
  likeCount: number
  commentCount: number
  createdAt: string
}

export interface CommunityPostDetail {
  id: number
  title: string
  content: string
  authorNickname: string
  toneType: string
  likeCount: number
  commentCount: number
  isLikedByMe: boolean
  isOwner: boolean
  presetName: string
  toneCharacteristicsJson: string | null
  createdAt: string
}

export interface CommunityPostCommentResponse {
  id: number
  authorNickname: string
  content: string
  createdAt: string
  isOwner: boolean
}

export interface LikeToggleResponse {
  liked: boolean
  likeCount: number
}

export interface CreatePostRequest {
  presetId: number
  title: string
  content: string
}

export interface CreateCommentRequest {
  content: string
}
