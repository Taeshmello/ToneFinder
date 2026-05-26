import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { analysisService } from '../services/analysisService'
import { presetService } from '../services/presetService'
import type { PresetResponse } from '../types/preset'
import type { ToneResult } from '../types/tone'
import Modal from '../components/common/Modal'
import ConfirmDialog from '../components/common/ConfirmDialog'
import InputDialog from '../components/common/InputDialog'
import ToneCharCard from '../components/tone/ToneCharCard'
import GearCard from '../components/tone/GearCard'
import AmpPanel from '../components/tone/AmpPanel'
import EffectorCard from '../components/tone/EffectorCard'
import SignalChainView from '../components/tone/SignalChainView'

type Tab = 'history' | 'presets' | 'settings'

function HistoryTab() {
  const queryClient = useQueryClient()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [presetTargetId, setPresetTargetId] = useState<number | null>(null)

  const { data: history, isLoading } = useQuery({
    queryKey: ['analysis', 'me'],
    queryFn: analysisService.getMyHistory,
  })

  const createPreset = useMutation({
    mutationFn: ({ name, analysisResultId }: { name: string; analysisResultId: number }) =>
      presetService.create({ name, analysisResultId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  })

  const deleteHistory = useMutation({
    mutationFn: (id: number) => analysisService.deleteHistory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['analysis', 'me'] }),
  })

  if (isLoading) return <div className="text-slate-400 text-sm py-8 text-center">불러오는 중…</div>
  if (!history?.length) return <div className="text-slate-400 text-sm py-8 text-center">분석 이력이 없습니다</div>

  return (
    <>
      <div className="space-y-2">
        {history.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
            <div>
              <div className="text-sm font-medium text-slate-800">{item.audioFilename ?? '알 수 없는 파일'}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {new Date(item.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPresetTargetId(item.id)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 px-2 py-1 rounded-lg"
              >
                프리셋 저장
              </button>
              <button
                onClick={() => setConfirmId(item.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={confirmId !== null}
        message="이 분석 이력을 삭제할까요?"
        onConfirm={() => { deleteHistory.mutate(confirmId!); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
      <InputDialog
        open={presetTargetId !== null}
        message="프리셋 이름을 입력하세요"
        placeholder="프리셋 이름"
        onConfirm={(name) => { createPreset.mutate({ name, analysisResultId: presetTargetId! }); setPresetTargetId(null) }}
        onCancel={() => setPresetTargetId(null)}
      />
    </>
  )
}

function PresetsTab() {
  const queryClient = useQueryClient()
  const [selectedPreset, setSelectedPreset] = useState<PresetResponse | null>(null)
  const [parsedResult, setParsedResult] = useState<ToneResult | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const { data: presets, isLoading } = useQuery({
    queryKey: ['presets'],
    queryFn: presetService.getAll,
  })

  const deletePreset = useMutation({
    mutationFn: (id: number) => presetService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['presets'] }),
  })

  const handleView = (preset: PresetResponse) => {
    if (!preset.toneCharacteristicsJson) {
      alert('분석 결과 데이터가 없습니다.')
      return
    }
    try {
      const result = JSON.parse(preset.toneCharacteristicsJson) as ToneResult
      setParsedResult(result)
      setSelectedPreset(preset)
    } catch {
      alert('결과 데이터를 불러올 수 없습니다.')
    }
  }

  const handleClose = () => {
    setSelectedPreset(null)
    setParsedResult(null)
  }

  if (isLoading) return <div className="text-slate-400 text-sm py-8 text-center">불러오는 중…</div>
  if (!presets?.length) return <div className="text-slate-400 text-sm py-8 text-center">저장된 프리셋이 없습니다</div>

  return (
    <>
      <div className="space-y-2">
        {presets.map((preset) => (
          <div key={preset.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-4">
            <div>
              <div className="text-sm font-medium text-slate-800">{preset.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {new Date(preset.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleView(preset)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium border border-teal-200 px-2 py-1 rounded-lg"
              >
                보기
              </button>
              <button
                onClick={() => setConfirmId(preset.id)}
                className="text-xs text-rose-500 hover:text-rose-700 font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!selectedPreset && !!parsedResult}
        onClose={handleClose}
        title={selectedPreset?.name ?? ''}
      >
        {parsedResult && (
          <div className="space-y-4">
            <ToneCharCard tc={parsedResult.toneCharacteristics} />
            <AmpPanel amp={parsedResult.ampSettings} amplifier={parsedResult.recommendedGear.amplifier} />
            {parsedResult.effectorSettings.length > 0 && parsedResult.effectorSettings.map(e => (
              <EffectorCard key={e.name} effector={e} />
            ))}
            <SignalChainView chain={parsedResult.signalChain} />
            <GearCard gear={parsedResult.recommendedGear} />
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={confirmId !== null}
        message="이 프리셋을 삭제할까요?"
        onConfirm={() => { deletePreset.mutate(confirmId!); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  )
}

function SettingsTab() {
  const { user, updateMe } = useAuth()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleNickname = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null); setError(null)
    try {
      await updateMe({ nickname })
      setMessage('닉네임이 변경되었습니다.')
    } catch {
      setError('닉네임 변경에 실패했습니다.')
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null); setError(null)
    if (newPassword.length < 8) { setError('새 비밀번호는 8자 이상이어야 합니다.'); return }
    try {
      await updateMe({ currentPassword, newPassword })
      setMessage('비밀번호가 변경되었습니다.')
      setCurrentPassword(''); setNewPassword('')
    } catch {
      setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.')
    }
  }

  return (
    <div className="space-y-6">
      {message && <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">{message}</div>}
      {error && <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-lg">{error}</div>}

      <form onSubmit={handleNickname} className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">닉네임 변경</h3>
        <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <button type="submit" className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
          변경
        </button>
      </form>

      <hr className="border-slate-200" />

      <form onSubmit={handlePassword} className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">비밀번호 변경</h3>
        <input type="password" placeholder="현재 비밀번호" value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <input type="password" placeholder="새 비밀번호 (8자 이상)" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} required
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <button type="submit" className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
          변경
        </button>
      </form>
    </div>
  )
}

export default function MyPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('history')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'history', label: '분석 이력' },
    { key: 'presets', label: '프리셋' },
    { key: 'settings', label: '회원정보 수정' },
  ]

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">마이페이지</h2>
        <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
      </div>

      <div className="flex border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'history' && <HistoryTab />}
        {tab === 'presets' && <PresetsTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}
