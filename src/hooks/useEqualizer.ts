import { useCallback, useEffect, useRef, useState } from 'react'
import { ToneEqualizerEngine } from '../lib/toneAudioEngine'
import {
  findMatchingPreset,
  SOUND_PRESETS,
  type EqualizerSettings,
  type SoundPresetKey,
} from '../lib/soundPresets'

const ORIGINAL_SETTINGS = SOUND_PRESETS.original.settings

export interface UseEqualizerInitial {
  settings?: EqualizerSettings
  activePreset?: SoundPresetKey | 'custom'
}

export function useEqualizer(
  getAudioElement: () => HTMLAudioElement | null,
  initial?: UseEqualizerInitial,
) {
  const engineRef = useRef<ToneEqualizerEngine | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  // Lazy initializers: only read `initial` once at mount (e.g. from
  // persisted Redux state), so later re-renders of the caller don't stomp
  // on live user changes.
  const [settings, setSettings] = useState<EqualizerSettings>(() => initial?.settings ?? ORIGINAL_SETTINGS)
  const [activePreset, setActivePreset] = useState<SoundPresetKey | 'custom'>(
    () => initial?.activePreset ?? 'original',
  )

  // Read via a ref inside `connect` so its identity stays stable across
  // knob/preset changes — it should only ever re-run when the audio
  // element itself changes, not on every settings update.
  const settingsRef = useRef(settings)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    return () => {
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [])

  const connect = useCallback(async () => {
    const audioElement = getAudioElement()
    if (!audioElement) return

    if (!engineRef.current) {
      engineRef.current = new ToneEqualizerEngine()
    }
    const engine = engineRef.current
    if (engine.isConnected) return

    setIsConnecting(true)
    try {
      await engine.connect(audioElement)
      engine.applySettings(settingsRef.current)
    } finally {
      setIsConnecting(false)
    }
  }, [getAudioElement])

  const setKnobValue = useCallback((key: keyof EqualizerSettings, value: number) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      engineRef.current?.applySettings(next)
      setActivePreset(findMatchingPreset(next) ?? 'custom')
      return next
    })
  }, [])

  const selectPreset = useCallback((key: SoundPresetKey) => {
    const preset = SOUND_PRESETS[key].settings
    setSettings(preset)
    setActivePreset(key)
    engineRef.current?.applySettings(preset)
  }, [])

  return {
    isConnecting,
    settings,
    activePreset,
    setKnobValue,
    selectPreset,
    connect,
  }
}
