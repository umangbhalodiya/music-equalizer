import * as Tone from 'tone'
import {
  BASS_FREQUENCY,
  LOFI_CUTOFF_MAX,
  REVERB_DECAY,
  REVERB_PRE_DELAY,
  bassGainDb,
  loFiBits,
  loFiCutoffHz,
  loFiWet,
} from './audioEffectParams'
import type { EqualizerSettings } from './soundPresets'

// Time constant for parameter ramps: long enough to avoid clicks/pops,
// short enough that a knob still feels responsive while dragging.
const RAMP_TIME = 0.08

interface VendorPrefixedMediaElement extends HTMLAudioElement {
  mozPreservesPitch?: boolean
  webkitPreservesPitch?: boolean
}

/**
 * Wraps a single existing <audio> element with a persistent Tone.js effects
 * chain (Bass filter -> Lo-Fi filter/crusher -> Reverb).
 * Nodes are created once and reused for the lifetime of the engine; every
 * settings update only touches existing node parameters, never rebuilds
 * the graph, so playback is never interrupted.
 */
export class ToneEqualizerEngine {
  private bassFilter: Tone.Filter
  private loFiFilter: Tone.Filter
  private bitCrusher: Tone.BitCrusher
  private reverb: Tone.Reverb
  private mediaSource: MediaElementAudioSourceNode | null = null
  private connectedElement: HTMLAudioElement | null = null
  private connectPromise: Promise<void> | null = null

  constructor() {
    this.bassFilter = new Tone.Filter({ type: 'lowshelf', frequency: BASS_FREQUENCY, gain: 0 })
    this.loFiFilter = new Tone.Filter({ type: 'lowpass', frequency: LOFI_CUTOFF_MAX, Q: 0.7 })

    this.bitCrusher = new Tone.BitCrusher({ bits: loFiBits(0) })
    this.bitCrusher.wet.value = 0

    this.reverb = new Tone.Reverb({ decay: REVERB_DECAY, preDelay: REVERB_PRE_DELAY, wet: 0 })

    Tone.connectSeries(this.bassFilter, this.loFiFilter, this.bitCrusher, this.reverb, Tone.getDestination())
  }

  get isConnected() {
    return this.connectedElement !== null
  }

  /**
   * Taps the given <audio> element into the Tone graph. Idempotent per
   * element, and safe against concurrent/duplicate calls (e.g. React
   * StrictMode double-invoking a handler) — createMediaElementSource can
   * only ever be called once per element, so re-entrant calls share the
   * same in-flight promise instead of racing each other.
   */
  connect(audioElement: HTMLAudioElement): Promise<void> {
    if (this.connectedElement === audioElement) return Promise.resolve()
    if (this.connectedElement) {
      return Promise.reject(
        new Error('ToneEqualizerEngine is already connected to a different audio element'),
      )
    }
    if (!this.connectPromise) {
      this.connectPromise = this.performConnect(audioElement)
    }
    return this.connectPromise
  }

  private async performConnect(audioElement: HTMLAudioElement) {
    await Tone.start()

    const vendorElement = audioElement as VendorPrefixedMediaElement
    audioElement.preservesPitch = false
    vendorElement.mozPreservesPitch = false
    vendorElement.webkitPreservesPitch = false

    const rawContext = Tone.getContext().rawContext as AudioContext
    this.mediaSource = rawContext.createMediaElementSource(audioElement)
    Tone.connect(this.mediaSource, this.bassFilter)
    this.connectedElement = audioElement
  }

  applySettings(settings: EqualizerSettings) {
    if (this.connectedElement) {
      this.connectedElement.playbackRate = settings.speedPitch / 100
    }

    this.bassFilter.gain.rampTo(bassGainDb(settings.bassBoost), RAMP_TIME)

    this.loFiFilter.frequency.rampTo(loFiCutoffHz(settings.loFi), RAMP_TIME)
    this.bitCrusher.bits.rampTo(loFiBits(settings.loFi), RAMP_TIME)
    this.bitCrusher.wet.rampTo(loFiWet(settings.loFi), RAMP_TIME)

    this.reverb.wet.rampTo(settings.reverb / 100, RAMP_TIME)
  }

  dispose() {
    this.mediaSource?.disconnect()
    this.mediaSource = null
    this.connectedElement = null
    this.bassFilter.dispose()
    this.loFiFilter.dispose()
    this.bitCrusher.dispose()
    this.reverb.dispose()
  }
}
