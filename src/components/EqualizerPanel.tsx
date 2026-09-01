import {
  EQUALIZER_RANGES,
  type EqualizerSettings,
  type SoundPresetKey,
} from "../lib/soundPresets";
import VerticalRangeSlider from "./VerticalRangeSlider";
import SoundProfiles from "./SoundProfiles";

interface EqualizerPanelProps {
  settings: EqualizerSettings;
  activePreset: SoundPresetKey | "custom";
  onKnobChange: (key: keyof EqualizerSettings, value: number) => void;
  onPresetSelect: (key: SoundPresetKey) => void;
}

function formatSpeedPitch(value: number) {
  return `${value}%`;
}

function formatPercentOrOff(value: number) {
  return value === 0 ? "Off" : `${value}%`;
}

function EqualizerPanel({
  settings,
  activePreset,
  onKnobChange,
  onPresetSelect,
}: EqualizerPanelProps) {
  return (
    <div
      id="equalizer-panel"
      className="rounded-xl p-6"
      style={{
        background: "var(--yt-surface-raised)",
        fontFamily: "var(--yt-font)",
      }}
    >
      <h2
        className="mb-4 text-center text-lg font-semibold"
        style={{ color: "var(--yt-text-primary)" }}
      >
        Equalizer
      </h2>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="md:flex-1">
          <SoundProfiles
            activePreset={activePreset}
            onSelect={onPresetSelect}
          />
        </div>

        <div className="md:flex-1">
          <h3
            className="mb-4 text-center text-sm font-semibold tracking-wide uppercase md:text-left"
            style={{ color: "var(--yt-text-secondary)" }}
          >
            Sound Controls
          </h3>

          <div className="grid grid-cols-2 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
            <VerticalRangeSlider
              label="Speed + Pitch"
              value={settings.speedPitch}
              min={EQUALIZER_RANGES.speedPitch.min}
              max={EQUALIZER_RANGES.speedPitch.max}
              step={EQUALIZER_RANGES.speedPitch.step}
              formatter={formatSpeedPitch}
              onChange={(v) => onKnobChange("speedPitch", v)}
            />
            <VerticalRangeSlider
              label="Reverb"
              value={settings.reverb}
              min={EQUALIZER_RANGES.reverb.min}
              max={EQUALIZER_RANGES.reverb.max}
              step={EQUALIZER_RANGES.reverb.step}
              formatter={formatPercentOrOff}
              onChange={(v) => onKnobChange("reverb", v)}
            />
            <VerticalRangeSlider
              label="Bass Boost"
              value={settings.bassBoost}
              min={EQUALIZER_RANGES.bassBoost.min}
              max={EQUALIZER_RANGES.bassBoost.max}
              step={EQUALIZER_RANGES.bassBoost.step}
              formatter={formatPercentOrOff}
              onChange={(v) => onKnobChange("bassBoost", v)}
            />
            <VerticalRangeSlider
              label="Lo-Fi"
              value={settings.loFi}
              min={EQUALIZER_RANGES.loFi.min}
              max={EQUALIZER_RANGES.loFi.max}
              step={EQUALIZER_RANGES.loFi.step}
              formatter={formatPercentOrOff}
              onChange={(v) => onKnobChange("loFi", v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EqualizerPanel;
