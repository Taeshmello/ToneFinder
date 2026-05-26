import { api } from './api'
import type { UploadResponse } from '../types/audio'

export async function uploadAudio(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post<UploadResponse>('/audio/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}
