import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { presetService } from '../../services/presetService'
import { communityService } from '../../services/communityService'
import Modal from '../common/Modal'

interface WritePostModalProps {
  open: boolean
  onClose: () => void
}

export default function WritePostModal({ open, onClose }: WritePostModalProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [presetId, setPresetId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const { data: presets } = useQuery({
    queryKey: ['presets'],
    queryFn: presetService.getAll,
    enabled: open,
  })

  const createPost = useMutation({
    mutationFn: communityService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
      setTitle(''); setContent(''); setPresetId(''); setError(null)
      onClose()
    },
    onError: () => setError('게시글 작성에 실패했습니다.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('제목을 입력해주세요.'); return }
    if (!content.trim()) { setError('내용을 입력해주세요.'); return }
    if (!presetId) { setError('공유할 프리셋을 선택해주세요.'); return }
    setError(null)
    createPost.mutate({ title: title.trim(), content: content.trim(), presetId: presetId as number })
  }

  return (
    <Modal open={open} onClose={onClose} title="게시글 작성">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-xs text-rose-500">{error}</p>}
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="프리셋에 대한 설명을 작성해주세요"
            rows={4}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1">공유할 프리셋</label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value ? Number(e.target.value) : '')}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">프리셋을 선택하세요</option>
            {presets?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {presets?.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">저장된 프리셋이 없습니다. 먼저 프리셋을 저장해주세요.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
            취소
          </button>
          <button type="submit" disabled={createPost.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
            {createPost.isPending ? '올리는 중…' : '게시하기'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
