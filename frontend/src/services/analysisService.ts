import { api } from './api'

export interface AnalysisHistory {
  id: number
  audioHash: string
  audioFilename: string | null
  createdAt: string
}

export const analysisService = {
  getMyHistory: () =>
    api.get<AnalysisHistory[]>('/analysis/me').then((r) => r.data),

  deleteHistory: (id: number) =>
    api.delete(`/analysis/${id}`),
}
