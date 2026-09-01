import * as Tone from 'tone'
import {
  BASS_FREQUENCY,
  REVERB_DECAY,
  REVERB_PRE_DELAY,
  bassGainDb,
  loFiBits,
  loFiCutoffHz,
  loFiWet,
} from './audioEffectParams'
import type { EqualizerSettings } from './soundPresets'

// Extra tail room so a reverb decay isn't abruptly cut off at the end of
// the rendered file.
const REVERB_TAIL_PADDING = 0.5

/**
 * A bit-depth-reduction transfer curve for a native WaveShaperNode. This is
 * the offline-safe equivalent of the live engine's Tone.BitCrusher: an
 * AudioWorklet node loads its processor module asynchronously with no way
 * to await that readiness from the outside, which makes it unreliable
 * inside a one-shot offline render. A WaveShaper curve achieves the same
 * "staircase" quantization distortion synchronously, with no worklet.
 */
function buildBitCrushCurve(bits: number): Float32Array {
  const levels = Math.pow(2, bits)
  const length = 2048
  const curve = new Float32Array(length)
  for (let i = 0; i < length; i++) {
    const x = (i / (length - 1)) * 2 - 1
    curve[i] = Math.round(x * levels) / levels
  }
  return curve
}

/**
 * Renders `file` through the same effects chain/parameter mapping as the
 * live ToneEqualizerEngine (see toneAudioEngine.ts + audioEffectParams.ts),
 * entirely offline (as fast as the machine can compute, not in real time),
 * and returns the result as a downloadable WAV Blob.
 */
export async function renderEqualizedAudio(
  file: File,
  settings: EqualizerSettings,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const rawContext = Tone.getContext().rawContext as AudioContext
  const originalBuffer = await rawContext.decodeAudioData(arrayBuffer.slice(0))

  const playbackRate = settings.speedPitch / 100
  const hasReverbTail = settings.reverb > 0
  const outputDuration =
    originalBuffer.duration / playbackRate +
    (hasReverbTail ? REVERB_DECAY + REVERB_TAIL_PADDING : 0)

  const bassDb = bassGainDb(settings.bassBoost)
  const loFiCutoff = loFiCutoffHz(settings.loFi)
  const crushBits = loFiBits(settings.loFi)
  const wetLoFi = loFiWet(settings.loFi)
  const wetReverb = settings.reverb / 100

  const rendered = await Tone.Offline(async () => {
    const player = new Tone.Player(originalBuffer)
    player.playbackRate = playbackRate

    const bassFilter = new Tone.Filter({ type: 'lowshelf', frequency: BASS_FREQUENCY, gain: bassDb })
    const loFiFilter = new Tone.Filter({ type: 'lowpass', frequency: loFiCutoff, Q: 0.7 })
    const crusherShaper = new Tone.WaveShaper(buildBitCrushCurve(crushBits))
    const loFiMix = new Tone.CrossFade(wetLoFi)
    const reverb = new Tone.Reverb({ decay: REVERB_DECAY, preDelay: REVERB_PRE_DELAY, wet: wetReverb })

    await reverb.ready

    player.connect(bassFilter)
    bassFilter.connect(loFiFilter)
    loFiFilter.connect(loFiMix.a)
    loFiFilter.connect(crusherShaper)
    crusherShaper.connect(loFiMix.b)
    loFiMix.connect(reverb)
    reverb.toDestination()

    player.start(0)
  }, outputDuration)

  return audioBufferToWavBlob(rendered.get()!)
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const numFrames = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = numFrames * blockAlign
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  const channelData: Float32Array[] = []
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch))

  let offset = 44
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
