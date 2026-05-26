export interface PresetResponse {
  id: number
  name: string
  analysisResultId: number | null
  isFavorite: boolean
  createdAt: string
  toneCharacteristicsJson: string | null
}

export interface CreatePresetRequest {
  name: string
  analysisResultId: number
}
