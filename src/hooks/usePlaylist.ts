import { useCallback, useEffect, useRef, useState } from 'react'
import { extractEmbeddedCoverArt } from '../lib/id3'
import { clearTrackFiles, saveTrackFile } from '../lib/trackFileStore'

export interface Track {
  id: string
  file: File
  audioUrl: string
  coverUrl: string | null
  extractingCover: boolean
}

/** What to play after a track ends naturally. Null means "stop". */
export function getAutoAdvanceIndex(current: number, count: number): number | null {
  if (count === 0) return null
  const next = current + 1
  return next < count ? next : null
}

/** What to play for a manual Next(+1)/Previous(-1) button press. Always wraps. */
export function getManualStepIndex(current: number, count: number, direction: 1 | -1): number | null {
  if (count === 0) return null
  return (current + direction + count) % count
}

function revokeTrackUrls(track: Track) {
  URL.revokeObjectURL(track.audioUrl)
  if (track.coverUrl) URL.revokeObjectURL(track.coverUrl)
}

function buildTrack(id: string, file: File): Track {
  return {
    id,
    file,
    audioUrl: URL.createObjectURL(file),
    coverUrl: null,
    extractingCover: true,
  }
}

export function usePlaylist() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)

  // Read via a ref inside callbacks so they don't need `tracks` in their
  // dependency arrays (and thus don't churn identity on every list change).
  const tracksRef = useRef<Track[]>(tracks)
  useEffect(() => {
    tracksRef.current = tracks
  }, [tracks])

  useEffect(() => {
    return () => {
      tracksRef.current.forEach(revokeTrackUrls)
    }
  }, [])

  const extractCoverFor = useCallback((track: Track) => {
    extractEmbeddedCoverArt(track.file)
      .then((art) => {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === track.id ? { ...t, coverUrl: art?.url ?? null, extractingCover: false } : t,
          ),
        )
      })
      .catch(() => {
        setTracks((prev) => prev.map((t) => (t.id === track.id ? { ...t, extractingCover: false } : t)))
      })
  }, [])

  const loadFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return

      tracksRef.current.forEach(revokeTrackUrls)
      // Replacing the whole playlist — drop whatever was persisted for the
      // old one and persist the new selection instead.
      void clearTrackFiles()

      const newTracks = files.map((file) => buildTrack(crypto.randomUUID(), file))

      setTracks(newTracks)
      setCurrentIndex(0)

      for (const track of newTracks) {
        void saveTrackFile(track.id, track.file)
        extractCoverFor(track)
      }
    },
    [extractCoverFor],
  )

  /**
   * Rebuilds the playlist from files already recovered from IndexedDB (see
   * lib/trackFileStore.ts) — used to restore the playlist after a reload
   * without the user re-picking anything. Reuses the same ids so playback
   * position / current-track matching keeps working.
   */
  const restoreTracks = useCallback(
    (entries: Array<{ id: string; file: File }>, initialIndex: number) => {
      if (entries.length === 0) return

      const restored = entries.map(({ id, file }) => buildTrack(id, file))
      setTracks(restored)
      setCurrentIndex(Math.min(Math.max(initialIndex, 0), restored.length - 1))

      for (const track of restored) {
        extractCoverFor(track)
      }
    },
    [extractCoverFor],
  )

  const selectTrack = useCallback((index: number) => {
    setCurrentIndex((prev) => {
      if (index < 0 || index >= tracksRef.current.length) return prev
      return index
    })
  }, [])

  const stepTrack = useCallback((direction: 1 | -1) => {
    setCurrentIndex((prev) => {
      if (prev === null) return prev
      const next = getManualStepIndex(prev, tracksRef.current.length, direction)
      return next ?? prev
    })
  }, [])

  /** Call from the player's onEnded — advances to the next track, or stops at the end of the playlist. */
  const advanceAfterEnded = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev === null) return prev
      const next = getAutoAdvanceIndex(prev, tracksRef.current.length)
      return next === null ? prev : next
    })
  }, [])

  const currentTrack = currentIndex !== null ? (tracks[currentIndex] ?? null) : null

  return {
    tracks,
    currentIndex,
    currentTrack,
    loadFiles,
    restoreTracks,
    selectTrack,
    stepTrack,
    advanceAfterEnded,
  }
}
