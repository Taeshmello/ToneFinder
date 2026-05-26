import type { AudioFeatures } from '../types/audio'

function findPeakFrequency(freqData: Float32Array, sampleRate: number): number {
  let maxDb = -Infinity
  let maxIdx = 0
  for (let i = 0; i < freqData.length; i++) {
    if (freqData[i] > maxDb) {
      maxDb = freqData[i]
      maxIdx = i
    }
  }
  return (maxIdx * sampleRate) / (freqData.length * 2)
}

function calculateDynamicRange(audioBuffer: AudioBuffer): number {
  const data = audioBuffer.getChannelData(0)
  let max = 0
  let min = Infinity
  for (let i = 0; i < data.length; i++) {
    const abs = Math.abs(data[i])
    if (abs > max) max = abs
    if (abs < min && abs > 0) min = abs
  }
  if (min === Infinity || max === 0) return 0
  return 20 * Math.log10(max / min)
}

function calculateSpectralCentroid(freqData: Float32Array, sampleRate: number): number {
  const binHz = sampleRate / (freqData.length * 2)
  let weightedSum = 0
  let totalMag = 0
  for (let i = 0; i < freqData.length; i++) {
    const mag = Math.pow(10, freqData[i] / 20)
    const freq = i * binHz
    weightedSum += freq * mag
    totalMag += mag
  }
  return totalMag > 0 ? weightedSum / totalMag : 0
}

function extractTopFrequencies(
  freqData: Float32Array,
  sampleRate: number,
  n = 20,
): { frequency: number; magnitudeDb: number }[] {
  const binHz = sampleRate / (freqData.length * 2)
  return Array.from(freqData)
    .map((db, i) => ({ frequency: i * binHz, magnitudeDb: db }))
    .filter((b) => b.magnitudeDb > -Infinity)
    .sort((a, b) => b.magnitudeDb - a.magnitudeDb)
    .slice(0, n)
}

export function useAudioAnalyzer() {
  const analyze = async (file: File): Promise<AudioFeatures> => {
    const arrayBuffer = await file.arrayBuffer()
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    await audioContext.close()

    const offlineCtx = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate,
    )

    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer

    const analyser = offlineCtx.createAnalyser()
    analyser.fftSize = 2048
    source.connect(analyser)
    analyser.connect(offlineCtx.destination)
    source.start()

    await offlineCtx.startRendering()

    const freqData = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(freqData)

    return {
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
      peakFrequency: findPeakFrequency(freqData, audioBuffer.sampleRate),
      dynamicRange: calculateDynamicRange(audioBuffer),
      spectralCentroid: calculateSpectralCentroid(freqData, audioBuffer.sampleRate),
      topFrequencies: extractTopFrequencies(freqData, audioBuffer.sampleRate),
    }
  }

  return { analyze }
}
