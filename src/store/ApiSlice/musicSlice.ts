import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  EqualizerSettings,
  SoundPresetKey,
} from "../../lib/soundPresets";

// The actual audio bytes live in IndexedDB (see lib/trackFileStore.ts) —
// this is just enough metadata to know what to restore and in what order.
export interface PersistedTrackInfo {
  id: string;
  name: string;
  size: number;
  type: string;
}

export interface MusicState {
  playlist: PersistedTrackInfo[];
  currentTrackId: string | null;
  currentPreset: SoundPresetKey | "custom" | null;
  equalizerSettings: EqualizerSettings | null;
  playbackTime: number;
}

// Exported so callers can normalize whatever redux-persist rehydrates —
// it does a shallow/wholesale replace of this slice's state, not a
// field-by-field merge, so state persisted under an older shape of
// MusicState (missing fields we've since added) comes back as-is rather
// than filled in. Spreading this first guards against that permanently.
export const initialState: MusicState = {
  playlist: [],
  currentTrackId: null,
  currentPreset: null,
  equalizerSettings: null,
  playbackTime: 0,
};

export const musicSlice = createSlice({
  name: "music",
  initialState,
  reducers: {
    setMusicStates: (state, action: PayloadAction<Partial<MusicState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setMusicStates } = musicSlice.actions;
export default musicSlice.reducer;
