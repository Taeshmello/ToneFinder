export interface ToneCharacteristics {
  brightness: number
  warmth: number
  gain: number
  type: 'clean' | 'crunch' | 'overdrive' | 'distortion' | 'fuzz'
  description: string
}

export interface AmpSettings {
  bass: number
  middle: number
  treble: number
  presence: number
  gain: number
  master: number
}

export interface EffectorSetting {
  name: string
  knobs: { name: string; value: number }[]
}

export interface ToneResult {
  toneCharacteristics: ToneCharacteristics
  recommendedGear: {
    guitar: string
    amplifier: { name: string; brand: string }
  }
  ampSettings: AmpSettings
  effectorSettings: EffectorSetting[]
  signalChain: string[]
}
