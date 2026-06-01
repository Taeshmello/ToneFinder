import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { communityService } from '../../services/communityService'
import type { CommunityPostCommentResponse } from '../../types/community'

interface CommentListProps {
  postId: number
  comments: CommunityPostCommentResponse[]
  isLoggedIn: boolean
}

export default function CommentList({ postId, comments, isLoggedIn }: CommentListProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')

  const addComment = useMutation({
    mutationFn: (text: string) => communityService.addComment(postId, { content: text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] })
      setContent('')
    },
  })

  const deleteComment = useMutation({
    mutationFn: (commentId: number) => communityService.deleteComment(postId, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'post', postId] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    addComment.mutate(content.trim())
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700">댓글 {comments.length}개</h3>

      {comments.length === 0 && (
        <p className="text-xs text-slate-400 py-2">첫 댓글을 남겨보세요.</p>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <span className="text-xs font-medium text-slate-700">{c.authorNickname}</span>
              <span className="text-xs text-slate-400 ml-2">
                {new Date(c.createdAt).toLocaleDateString('ko-KR')}
              </span>
              <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{c.content}</p>
            </div>
            {c.isOwner && (
              <button
                onClick={() => deleteComment.mutate(c.id)}
                className="text-xs text-slate-400 hover:text-rose-500 flex-shrink-0"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 입력하세요"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={addComment.isPending}
            className="px-3 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50"
          >
            {addComment.isPending ? '…' : '등록'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-400 pt-1">댓글을 남기려면 로그인이 필요합니다.</p>
      )}
    </div>
  )
}
