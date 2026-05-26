import { api } from './api'
import type { CreatePresetRequest, PresetResponse } from '../types/preset'

export const presetService = {
  getAll: () =>
    api.get<PresetResponse[]>('/presets').then((r) => r.data),

  create: (req: CreatePresetRequest) =>
    api.post<PresetResponse>('/presets', req).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/presets/${id}`),
}
