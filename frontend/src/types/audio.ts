export interface AudioFeatures {
  sampleRate: number
  duration: number
  peakFrequency: number
  dynamicRange: number
  spectralCentroid: number
  topFrequencies: { frequency: number; magnitudeDb: number }[]
}

export interface UploadResponse {
  id: number
  audioHash: string
  audioFilename: string | null
  cached: boolean
}
