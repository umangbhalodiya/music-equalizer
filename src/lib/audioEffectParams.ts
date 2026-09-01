// Shared between the live Tone.js engine (toneAudioEngine.ts) and the
// offline renderer used for downloads (offlineRender.ts), so a downloaded
// file always matches what's audible during live playback.

export const BASS_FREQUENCY = 120
export const BASS_MAX_GAIN_DB = 12

export const LOFI_CUTOFF_MAX = 20000
export const LOFI_CUTOFF_MIN = 2000
export const LOFI_BITS_MAX = 16
export const LOFI_BITS_MIN = 6
export const LOFI_WET_MAX = 0.55

export const REVERB_DECAY = 2.5
export const REVERB_PRE_DELAY = 0.01

export function bassGainDb(bassBoostPercent: number) {
  return (bassBoostPercent / 100) * BASS_MAX_GAIN_DB
}

export function loFiCutoffHz(loFiPercent: number) {
  const t = loFiPercent / 100
  return LOFI_CUTOFF_MAX - t * (LOFI_CUTOFF_MAX - LOFI_CUTOFF_MIN)
}

export function loFiBits(loFiPercent: number) {
  const t = loFiPercent / 100
  return LOFI_BITS_MAX - t * (LOFI_BITS_MAX - LOFI_BITS_MIN)
}

export function loFiWet(loFiPercent: number) {
  return (loFiPercent / 100) * LOFI_WET_MAX
}
