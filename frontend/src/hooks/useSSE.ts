import { useState, useRef, useCallback } from 'react'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import type { ToneResult } from '../types/tone'
import type { AudioFeatures } from '../types/audio'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1'

export function useSSE() {
  const [rawText, setRawText] = useState('')
  const [result, setResult] = useState<ToneResult | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const startStream = useCallback((analysisResultId: number, features: AudioFeatures) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setRawText('')
    setResult(null)
    setError(null)
    setIsStreaming(true)

    const token = localStorage.getItem('tf_token')

    fetchEventSource(`${BASE_URL}/analysis/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        analysisResultId,
        sampleRate: features.sampleRate,
        duration: features.duration,
        peakFrequency: features.peakFrequency,
        dynamicRange: features.dynamicRange,
        spectralCentroid: features.spectralCentroid,
      }),
      signal: ctrl.signal,
      onmessage(ev) {
        if (ev.event === 'chunk') {
          setRawText((prev) => prev + ev.data)
        } else if (ev.event === 'complete') {
          setIsStreaming(false)
          try {
            setResult(JSON.parse(ev.data))
          } catch {
            setError('분석 결과 파싱에 실패했습니다.')
          }
        } else if (ev.event === 'error') {
          setError(ev.data || '분석 중 오류가 발생했습니다.')
          setIsStreaming(false)
        }
      },
      onerror(err) {
        if ((err as Error).name === 'AbortError') return
        setError('서버 연결에 실패했습니다.')
        setIsStreaming(false)
        throw err
      },
    })
  }, [])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { rawText, result, isStreaming, error, startStream, stopStream }
}
