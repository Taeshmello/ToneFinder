import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { communityService } from '../services/communityService'
import PostCard from '../components/community/PostCard'
import WritePostModal from '../components/community/WritePostModal'
import { useNavigate } from 'react-router-dom'

const TONE_TYPES = ['전체', 'clean', 'crunch', 'overdrive', 'distortion', 'fuzz']

export default function CommunityPage() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [sort, setSort] = useState<'latest' | 'popular'>('latest')
  const [toneType, setToneType] = useState<string>('전체')
  const [writeOpen, setWriteOpen] = useState(false)

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community', 'posts', sort, toneType],
    queryFn: () => communityService.getPosts({
      sort,
      toneType: toneType === '전체' ? undefined : toneType,
    }),
  })

  return (
    <div className="max-w-xl mx-auto p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-800">커뮤니티</h2>
        <button
          onClick={() => isLoggedIn ? setWriteOpen(true) : navigate('/login')}
          className="text-sm font-medium bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
        >
          게시글 작성
        </button>
      </div>

      {/* 필터 + 정렬 */}
      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap">
          {TONE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setToneType(t)}
              className={`px-3 py-1 text-xs rounded-full font-medium border transition-colors ${
                toneType === t
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['latest', 'popular'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                sort === s ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s === 'latest' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      {isLoading ? (
        <p className="text-slate-400 text-sm py-8 text-center">불러오는 중…</p>
      ) : posts?.length === 0 ? (
        <p className="text-slate-400 text-sm py-8 text-center">게시글이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}

      <WritePostModal open={writeOpen} onClose={() => setWriteOpen(false)} />
    </div>
  )
}
