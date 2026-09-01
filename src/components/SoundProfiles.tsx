import {
  SOUND_PRESET_ORDER,
  SOUND_PRESETS,
  type SoundPresetKey,
} from "../lib/soundPresets";

interface SoundProfilesProps {
  activePreset: SoundPresetKey | "custom";
  onSelect: (key: SoundPresetKey) => void;
}

function SoundProfiles({ activePreset, onSelect }: SoundProfilesProps) {
  return (
    <div>
      <h3
        className="mb-3 text-sm font-semibold tracking-wide uppercase"
        style={{ color: "var(--yt-text-secondary)" }}
      >
        Sound Profiles
      </h3>
      <div className="columns-2 gap-2 sm:columns-3 md:columns-2">
        {SOUND_PRESET_ORDER.map((key) => {
          const isActive = activePreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={isActive}
              className={`eq-profile-chip mb-2 block w-full cursor-pointer rounded-full px-4 py-1.5 text-center text-sm font-medium break-inside-avoid ${
                isActive
                  ? "bg-[var(--yt-chip-bg-active)] text-[var(--yt-chip-text-active)]"
                  : "bg-[var(--yt-chip-bg)] text-[var(--yt-text-primary)] hover:bg-[var(--yt-surface-pressed)]"
              }`}
            >
              {SOUND_PRESETS[key].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SoundProfiles;
