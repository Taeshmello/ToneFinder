import { useState } from 'react'
import AudioUploader from '../components/audio/AudioUploader'
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer'
import { useSSE } from '../hooks/useSSE'
import { uploadAudio } from '../services/audioService'
import { presetService } from '../services/presetService'
import { useAuth } from '../hooks/useAuth'
import type { AudioFeatures, UploadResponse } from '../types/audio'
import AmpPanel from '../components/tone/AmpPanel'
import EffectorCard from '../components/tone/EffectorCard'
import SignalChainView from '../components/tone/SignalChainView'
import ToneCharCard from '../components/tone/ToneCharCard'
import GearCard from '../components/tone/GearCard'

function fmt(n: number, decimals = 1) {
  return n.toFixed(decimals)
}

type SaveState = 'idle' | 'inputting' | 'saving' | 'saved' | 'error'

export default function AnalysisPage() {
  const { analyze } = useAudioAnalyzer()
  const { rawText, result, isStreaming, error: sseError, startStream } = useSSE()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [features, setFeatures] = useState<AudioFeatures | null>(null)
  const [upload, setUpload] = useState<UploadResponse | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [presetName, setPresetName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setLoading(true)
    setError(null)
    setFeatures(null)
    setUpload(null)
    setFileName(file.name)
    setSaveState('idle')
    setPresetName('')
    setSaveError(null)
    try {
      const [feat, up] = await Promise.all([analyze(file), uploadAudio(file)])
      setFeatures(feat)
      setUpload(up)
      startStream(up.id, feat)
    } catch (e) {
      setError('처리 중 오류가 발생하였습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!upload || !presetName.trim()) return
    setSaveState('saving')
    setSaveError(null)
    try {
      await presetService.create({ name: presetName.trim(), analysisResultId: upload.id })
      setSaveState('saved')
    } catch {
      setSaveState('error')
      setSaveError('저장에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">음원 분석</h2>
        <p className="text-sm text-slate-500 mt-1">
          오디오 파일을 업로드하면 FFT + AI 톤 분석 결과를 보여드립니다
        </p>
      </div>

      <AudioUploader onFileSelected={handleFile} disabled={loading || isStreaming} />

      {loading && (
        <div className="text-center text-sm text-slate-500 animate-pulse">
          {fileName} 업로드 중…
        </div>
      )}

      {(error || sseError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          처리 중 오류가 발생하였습니다.
        </div>
      )}

      {features && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">FFT 분석 결과</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['샘플레이트', `${features.sampleRate.toLocaleString()} Hz`],
              ['재생 길이', `${fmt(features.duration)} 초`],
              ['피크 주파수', `${fmt(features.peakFrequency)} Hz`],
              ['다이내믹 레인지', `${fmt(features.dynamicRange)} dB`],
              ['스펙트럴 센트로이드', `${fmt(features.spectralCentroid)} Hz`],
            ].map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-400 mb-0.5">{label}</div>
                <div className="font-medium text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upload && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">업로드 결과</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">ID</span>
              <span className="font-medium">#{upload.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hash</span>
              <span className="font-mono text-xs text-slate-700">{upload.audioHash.slice(0, 12)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">캐시</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                upload.cached ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {upload.cached ? '캐시 HIT' : '신규 저장'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isStreaming && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="text-xs font-medium text-teal-600 mb-2 animate-pulse">AI 톤 분석 중…</div>
          {rawText && (
            <pre className="text-xs text-teal-800 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-hidden">
              {rawText}<span className="animate-pulse">▋</span>
            </pre>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <ToneCharCard tc={result.toneCharacteristics} />
          <AmpPanel amp={result.ampSettings} amplifier={result.recommendedGear.amplifier} />
          {result.effectorSettings.length > 0 && (
            <div className="space-y-3">
              {result.effectorSettings.map(e => (
                <EffectorCard key={e.name} effector={e} />
              ))}
            </div>
          )}
          <SignalChainView chain={result.signalChain} />
          <GearCard gear={result.recommendedGear} />

          {user && (
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              {saveState === 'idle' && (
                <button
                  onClick={() => setSaveState('inputting')}
                  className="w-full text-sm font-medium text-teal-600 hover:text-teal-700 border border-teal-200 hover:border-teal-300 rounded-lg py-2 transition-colors"
                >
                  프리셋 저장
                </button>
              )}
              {saveState === 'inputting' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="프리셋 이름"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    autoFocus
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={!presetName.trim()}
                      className="flex-1 text-sm font-medium bg-teal-600 text-white rounded-lg py-2 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => { setSaveState('idle'); setPresetName('') }}
                      className="flex-1 text-sm font-medium border border-slate-300 text-slate-600 rounded-lg py-2 hover:bg-slate-50"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
              {saveState === 'saving' && (
                <div className="text-center text-sm text-slate-500 animate-pulse py-1">저장 중…</div>
              )}
              {saveState === 'saved' && (
                <div className="text-center text-sm font-medium text-emerald-600 py-1">저장됨 ✓</div>
              )}
              {saveState === 'error' && (
                <div className="space-y-2">
                  <div className="text-sm text-rose-600">{saveError}</div>
                  <button
                    onClick={() => setSaveState('inputting')}
                    className="text-xs text-teal-600 hover:underline"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
