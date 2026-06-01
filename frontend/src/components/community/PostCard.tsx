import { useNavigate } from 'react-router-dom'
import type { CommunityPostSummary } from '../../types/community'

const TONE_TYPE_STYLE: Record<string, string> = {
  clean: 'bg-blue-100 text-blue-700',
  crunch: 'bg-amber-100 text-amber-700',
  overdrive: 'bg-orange-100 text-orange-700',
  distortion: 'bg-red-100 text-red-700',
  fuzz: 'bg-purple-100 text-purple-700',
  unknown: 'bg-slate-100 text-slate-500',
}

interface PostCardProps {
  post: CommunityPostSummary
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate()
  const toneStyle = TONE_TYPE_STYLE[post.toneType] ?? TONE_TYPE_STYLE.unknown

  return (
    <button
      onClick={() => navigate(`/community/${post.id}`)}
      className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate">{post.title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{post.authorNickname}</p>
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${toneStyle}`}>
          {post.toneType}
        </span>
      </div>
      <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
        <span>♡ {post.likeCount}</span>
        <span>💬 {post.commentCount}</span>
        <span className="ml-auto">{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
      </div>
    </button>
  )
}
