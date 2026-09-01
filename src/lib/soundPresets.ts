export interface EqualizerSettings {
  speedPitch: number
  reverb: number
  bassBoost: number
  loFi: number
}

interface KnobRange {
  min: number
  max: number
  step: number
  default: number
}

export const EQUALIZER_RANGES: Record<keyof EqualizerSettings, KnobRange> = {
  speedPitch: { min: 50, max: 150, step: 1, default: 100 },
  reverb: { min: 0, max: 100, step: 1, default: 0 },
  bassBoost: { min: 0, max: 100, step: 1, default: 0 },
  loFi: { min: 0, max: 100, step: 1, default: 0 },
}

export type SoundPresetKey =
  | 'original'
  | 'rock'
  | 'pop'
  | 'hipHop'
  | 'classic'
  | 'dance'
  | 'concertHall'
  | 'jazz'
  | 'acoustic'
  | 'vocal'
  | 'party'
  | 'reverb'
  | 'bassBoost'
  | 'loFi'

export interface SoundPreset {
  label: string
  settings: EqualizerSettings
}

export const SOUND_PRESETS: Record<SoundPresetKey, SoundPreset> = {
  original: {
    label: 'Original',
    settings: { speedPitch: 100, reverb: 0, bassBoost: 0, loFi: 0 },
  },
  rock: {
    label: 'Rock',
    settings: { speedPitch: 100, reverb: 15, bassBoost: 65, loFi: 0 },
  },
  pop: {
    label: 'Pop',
    settings: { speedPitch: 100, reverb: 20, bassBoost: 40, loFi: 0 },
  },
  hipHop: {
    label: 'Hip Hop',
    settings: { speedPitch: 100, reverb: 15, bassBoost: 80, loFi: 5 },
  },
  classic: {
    label: 'Classic',
    settings: { speedPitch: 100, reverb: 35, bassBoost: 15, loFi: 0 },
  },
  dance: {
    label: 'Dance',
    settings: { speedPitch: 105, reverb: 25, bassBoost: 70, loFi: 0 },
  },
  concertHall: {
    label: 'Concert Hall',
    settings: { speedPitch: 100, reverb: 80, bassBoost: 10, loFi: 0 },
  },
  jazz: {
    label: 'Jazz',
    settings: { speedPitch: 100, reverb: 30, bassBoost: 25, loFi: 0 },
  },
  acoustic: {
    label: 'Acoustic',
    settings: { speedPitch: 100, reverb: 40, bassBoost: 10, loFi: 0 },
  },
  vocal: {
    label: 'Vocal',
    settings: { speedPitch: 100, reverb: 20, bassBoost: 5, loFi: 0 },
  },
  party: {
    label: 'Party',
    settings: { speedPitch: 103, reverb: 20, bassBoost: 75, loFi: 0 },
  },
  reverb: {
    label: 'Reverb',
    settings: { speedPitch: 100, reverb: 70, bassBoost: 0, loFi: 0 },
  },
  bassBoost: {
    label: 'Bass Boost',
    settings: { speedPitch: 100, reverb: 5, bassBoost: 100, loFi: 0 },
  },
  loFi: {
    label: 'Lo-Fi',
    settings: { speedPitch: 98, reverb: 10, bassBoost: 20, loFi: 70 },
  },
}

export const SOUND_PRESET_ORDER: SoundPresetKey[] = [
  'original',
  'rock',
  'pop',
  'hipHop',
  'classic',
  'dance',
  'concertHall',
  'jazz',
  'acoustic',
  'vocal',
  'party',
  'reverb',
  'bassBoost',
  'loFi',
]

export function findMatchingPreset(settings: EqualizerSettings): SoundPresetKey | null {
  for (const key of SOUND_PRESET_ORDER) {
    const preset = SOUND_PRESETS[key].settings
    if (
      preset.speedPitch === settings.speedPitch &&
      preset.reverb === settings.reverb &&
      preset.bassBoost === settings.bassBoost &&
      preset.loFi === settings.loFi
    ) {
      return key
    }
  }
  return null
}
