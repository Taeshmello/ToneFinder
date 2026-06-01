import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { communityService } from '../services/communityService'
import type { ToneResult } from '../types/tone'
import ToneCharCard from '../components/tone/ToneCharCard'
import AmpPanel from '../components/tone/AmpPanel'
import EffectorCard from '../components/tone/EffectorCard'
import SignalChainView from '../components/tone/SignalChainView'
import GearCard from '../components/tone/GearCard'
import CommentList from '../components/community/CommentList'
import ConfirmDialog from '../components/common/ConfirmDialog'

const TONE_TYPE_STYLE: Record<string, string> = {
  clean: 'bg-blue-100 text-blue-700',
  crunch: 'bg-amber-100 text-amber-700',
  overdrive: 'bg-orange-100 text-orange-700',
  distortion: 'bg-red-100 text-red-700',
  fuzz: 'bg-purple-100 text-purple-700',
  unknown: 'bg-slate-100 text-slate-500',
}

export default function CommunityPostPage() {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const queryClient = useQueryClient()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const { data: post, isLoading } = useQuery({
    queryKey: ['community', 'post', postId],
    queryFn: () => communityService.getPost(postId),
    enabled: !!postId,
  })

  const { data: comments } = useQuery({
    queryKey: ['community', 'post', postId, 'comments'],
    queryFn: () => communityService.getComments(postId),
    enabled: !!postId,
  })

  const [liked, setLiked] = useState<boolean | null>(null)
  const [likeCount, setLikeCount] = useState<number | null>(null)

  const toggleLike = useMutation({
    mutationFn: () => communityService.toggleLike(postId),
    onSuccess: (res) => { setLiked(res.liked); setLikeCount(res.likeCount) },
  })

  const deletePost = useMutation({
    mutationFn: () => communityService.deletePost(postId),
    onSuccess: () => navigate('/community'),
  })

  const copyPreset = useMutation({
    mutationFn: () => communityService.copyPreset(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presets'] })
      setCopyMessage('프리셋이 내 프리셋에 복사되었습니다.')
      setTimeout(() => setCopyMessage(null), 3000)
    },
  })

  if (isLoading) return <div className="max-w-xl mx-auto p-6 text-slate-400 text-sm">불러오는 중…</div>
  if (!post) return <div className="max-w-xl mx-auto p-6 text-slate-400 text-sm">게시글을 찾을 수 없습니다.</div>

  const currentLiked = liked ?? post.isLikedByMe
  const currentLikeCount = likeCount ?? post.likeCount

  let toneResult: ToneResult | null = null
  if (post.toneCharacteristicsJson) {
    try { toneResult = JSON.parse(post.toneCharacteristicsJson) as ToneResult } catch { /* ignore */ }
  }

  const toneStyle = TONE_TYPE_STYLE[post.toneType] ?? TONE_TYPE_STYLE.unknown

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div>
        <button onClick={() => navigate('/community')}
          className="text-xs text-slate-400 hover:text-slate-600 mb-3 block">
          ← 커뮤니티로 돌아가기
        </button>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-semibold text-slate-800 flex-1">{post.title}</h1>
          <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${toneStyle}`}>
            {post.toneType}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{post.authorNickname}</span>
          <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => isLoggedIn ? toggleLike.mutate() : navigate('/login')}
          disabled={toggleLike.isPending}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            currentLiked
              ? 'bg-rose-50 text-rose-500 border-rose-200'
              : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200'
          }`}
        >
          {currentLiked ? '♥' : '♡'} {currentLikeCount}
        </button>
        <button
          onClick={() => isLoggedIn ? copyPreset.mutate() : navigate('/login')}
          disabled={copyPreset.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-500 hover:border-teal-300 transition-colors"
        >
          {copyPreset.isPending ? '복사 중…' : '프리셋 복사'}
        </button>
        {post.isOwner && (
          <button onClick={() => setDeleteOpen(true)}
            className="ml-auto text-xs text-slate-400 hover:text-rose-500">
            삭제
          </button>
        )}
      </div>

      {copyMessage && (
        <p className="text-xs text-teal-600 bg-teal-50 px-3 py-2 rounded-lg">{copyMessage}</p>
      )}

      {/* 본문 */}
      <div className="bg-slate-50 rounded-xl p-4">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* 프리셋 시각화 */}
      {toneResult ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2">
            {post.presetName}
          </h2>
          <ToneCharCard tc={toneResult.toneCharacteristics} />
          <AmpPanel amp={toneResult.ampSettings} amplifier={toneResult.recommendedGear.amplifier} />
          {toneResult.effectorSettings.map((e) => (
            <EffectorCard key={e.name} effector={e} />
          ))}
          <SignalChainView chain={toneResult.signalChain} />
          <GearCard gear={toneResult.recommendedGear} />
        </div>
      ) : (
        <p className="text-xs text-slate-400">프리셋 분석 데이터가 없습니다.</p>
      )}

      {/* 댓글 */}
      <div className="border-t border-slate-200 pt-4">
        <CommentList
          postId={postId}
          comments={comments ?? []}
          isLoggedIn={isLoggedIn}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        message="이 게시글을 삭제할까요?"
        onConfirm={() => { deletePost.mutate(); setDeleteOpen(false) }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}
