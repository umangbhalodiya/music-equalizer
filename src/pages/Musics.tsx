import { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Button } from "rizzui/button";
import EqualizerPanel from "../components/EqualizerPanel";
import MarqueeText from "../components/MarqueeText";
import TrackList from "../components/TrackList";
import { DownloadIcon, MusicNoteIcon, UploadIcon } from "../components/icons";
import { useEqualizer } from "../hooks/useEqualizer";
import { usePlaylist, type Track } from "../hooks/usePlaylist";
import { formatDuration, stripExtension } from "../lib/format";
import { getTrackFile } from "../lib/trackFileStore";
import { downloadBlob, renderEqualizedAudio } from "../lib/offlineRender";
import store from "../store";
import { initialState as musicInitialState, setMusicStates } from "../store/ApiSlice/musicSlice";

function Musics() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playerRef = useRef<AudioPlayer>(null);
  const [downloadingTrackIds, setDownloadingTrackIds] = useState<Set<string>>(
    new Set(),
  );
  const dispatch = useDispatch();

  // Read the persisted slice once at mount to seed local state — by the
  // time this component renders, PersistGate has already rehydrated the
  // store, so this reflects whatever survived the last reload. A lazy
  // state initializer (not a ref) — its value is only ever read during
  // render, and it's never updated again after this first snapshot.
  // Spread over the slice's own defaults first: redux-persist replaces
  // this whole slice rather than merging field-by-field, so state saved
  // under an older MusicState shape (missing fields added since) would
  // otherwise come back with those fields simply undefined.
  const [persistedAtMount] = useState(() => ({
    ...musicInitialState,
    ...store.getState().music,
  }));
  const resumedTrackIdRef = useRef<string | null>(null);
  const [isRestoringPlaylist, setIsRestoringPlaylist] = useState(
    () => persistedAtMount.playlist.length > 0,
  );

  const playlist = usePlaylist();
  const { currentTrack, restoreTracks } = playlist;

  const getAudioElement = useCallback(
    () => playerRef.current?.audio.current ?? null,
    [],
  );
  const equalizer = useEqualizer(getAudioElement, {
    settings: persistedAtMount.equalizerSettings ?? undefined,
    activePreset: persistedAtMount.currentPreset ?? undefined,
  });
  const { connect: connectEqualizer } = equalizer;

  // Restore the playlist itself from IndexedDB on mount — the actual audio
  // bytes were saved there when each file was selected (see
  // lib/trackFileStore.ts), which is the only way a reload can bring the
  // playlist back without the user re-picking files.
  useEffect(() => {
    if (persistedAtMount.playlist.length === 0) return;
    let cancelled = false;

    (async () => {
      const restored: Array<{ id: string; file: File }> = [];
      for (const entry of persistedAtMount.playlist) {
        const file = await getTrackFile(entry.id).catch(() => null);
        if (file) restored.push({ id: entry.id, file });
      }
      if (cancelled || restored.length === 0) return;
      const initialIndex = Math.max(
        0,
        restored.findIndex((r) => r.id === persistedAtMount.currentTrackId),
      );
      restoreTracks(restored, initialIndex);
    })().finally(() => {
      if (!cancelled) setIsRestoringPlaylist(false);
    });

    return () => {
      cancelled = true;
    };
  }, [persistedAtMount, restoreTracks]);

  // Once a track's <audio> element exists, tap it into the Tone graph
  // automatically — the equalizer is shown by default, so there's no
  // button click left to gate the connection on. Reused for every
  // subsequent track too (idempotent — the same <audio> element persists).
  useEffect(() => {
    if (currentTrack) {
      void connectEqualizer();
    }
  }, [currentTrack, connectEqualizer]);

  // Persist the preset/equalizer settings so they survive a reload.
  useEffect(() => {
    dispatch(
      setMusicStates({
        equalizerSettings: equalizer.settings,
        currentPreset: equalizer.activePreset,
      }),
    );
  }, [dispatch, equalizer.settings, equalizer.activePreset]);

  // Persist the playlist (metadata only — actual bytes are saved to
  // IndexedDB by usePlaylist itself) and which track is current.
  useEffect(() => {
    if (isRestoringPlaylist) return;
    dispatch(
      setMusicStates({
        playlist: playlist.tracks.map((t) => ({
          id: t.id,
          name: t.file.name,
          size: t.file.size,
          type: t.file.type,
        })),
        currentTrackId: currentTrack?.id ?? null,
      }),
    );
  }, [dispatch, playlist.tracks, currentTrack, isRestoringPlaylist]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    playlist.loadFiles(files);
  };

  const handleChooseClick = () => fileInputRef.current?.click();

  const handleDownloadTrack = async (track: Track) => {
    setDownloadingTrackIds((prev) => new Set(prev).add(track.id));
    try {
      const blob = await renderEqualizedAudio(track.file, equalizer.settings);
      downloadBlob(blob, `${stripExtension(track.file.name)}-equalized.wav`);
    } catch {
      toast.error(`Could not render "${track.file.name}" for download.`);
    } finally {
      setDownloadingTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  // Once the newly-loaded track's duration is known, seek back to the
  // persisted position — but only for the track that was actually playing
  // when the page was last reloaded (exact id match against the snapshot
  // taken at mount, not the live store — the live currentTrackId updates
  // as soon as the user picks a different track, before its playbackTime
  // does, which would otherwise resume a manually-selected track from
  // whatever position the previous track was left at). Only once per track,
  // and only ever for that one track id, so manually selecting any other
  // track from the playlist always starts from the beginning.
  const handleLoadedMetaData = () => {
    if (!currentTrack || resumedTrackIdRef.current === currentTrack.id) return;
    resumedTrackIdRef.current = currentTrack.id;

    const audio = getAudioElement();
    if (
      audio &&
      persistedAtMount.playbackTime > 0 &&
      persistedAtMount.playbackTime < audio.duration &&
      currentTrack.id === persistedAtMount.currentTrackId
    ) {
      audio.currentTime = persistedAtMount.playbackTime;
    }
  };

  const handleListen = () => {
    const audio = getAudioElement();
    if (audio) {
      dispatch(setMusicStates({ playbackTime: audio.currentTime }));
    }
  };

  const hasMultipleTracks = playlist.tracks.length > 1;
  const isDownloadingCurrent = currentTrack
    ? downloadingTrackIds.has(currentTrack.id)
    : false;

  // Only relevant if restoring from IndexedDB failed (e.g. private
  // browsing, cleared site data) — in the normal case the playlist just
  // comes back on its own and this never renders.
  const unrecoveredTrackName =
    !isRestoringPlaylist && !currentTrack
      ? (persistedAtMount.playlist.find((t) => t.id === persistedAtMount.currentTrackId)
          ?.name ?? persistedAtMount.playlist[0]?.name)
      : undefined;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {isRestoringPlaylist ? (
        <div
          className="mx-auto flex flex-col items-center gap-3 rounded-xl py-24 text-center"
          style={{
            maxWidth: 640,
            background: "var(--yt-surface-raised)",
            fontFamily: "var(--yt-font)",
          }}
        >
          <MusicNoteIcon size={40} className="animate-pulse opacity-70" />
          <p
            className="text-sm"
            style={{ color: "var(--yt-text-secondary)" }}
          >
            Restoring your playlist…
          </p>
        </div>
      ) : !currentTrack ? (
        <div
          className="mx-auto flex flex-col items-center gap-4 rounded-xl py-24 text-center"
          style={{
            maxWidth: 640,
            background: "var(--yt-surface-raised)",
            fontFamily: "var(--yt-font)",
          }}
        >
          <MusicNoteIcon size={40} className="opacity-70" />
          <div>
            <h1
              className="text-lg font-semibold"
              style={{ color: "var(--yt-text-primary)" }}
            >
              No music selected
            </h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--yt-text-secondary)" }}
            >
              Choose one or more audio files from your device to start
              playing.
            </p>
            {unrecoveredTrackName && (
              <p
                className="mt-2 text-xs"
                style={{ color: "var(--yt-text-secondary)" }}
              >
                Last played "{stripExtension(unrecoveredTrackName)}" — choose
                it again to resume from{" "}
                {formatDuration(persistedAtMount.playbackTime)}.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleChooseClick}
            className="flex items-center gap-2 rounded-full px-4 font-medium"
            style={{
              height: 36,
              background: "var(--yt-accent)",
              color: "#fff",
              fontSize: 14,
            }}
          >
            <UploadIcon size={18} />
            Choose files
          </button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center gap-6"
          style={{ fontFamily: "var(--yt-font)" }}
        >
          <div
            className="mx-auto flex w-full flex-col items-center gap-6"
            style={{ maxWidth: 640 }}
          >
            <AudioPlayer
              ref={playerRef}
              src={currentTrack.audioUrl}
              autoPlayAfterSrcChange
              showJumpControls={false}
              showSkipControls={hasMultipleTracks}
              onClickNext={() => playlist.stepTrack(1)}
              onClickPrevious={() => playlist.stepTrack(-1)}
              onEnded={playlist.advanceAfterEnded}
              onLoadedMetaData={handleLoadedMetaData}
              onListen={handleListen}
              listenInterval={1000}
              className="yt-audio-player w-full"
              layout="stacked-reverse"
              header={
                <div className="mx-auto mb-3 flex flex-col items-center" style={{ width: 280 }}>
                  <div
                    className={`flex items-center justify-center overflow-hidden rounded-lg ${currentTrack.extractingCover ? "animate-pulse" : ""}`}
                    style={{
                      width: 140,
                      height: 140,
                      background: "var(--yt-surface-pressed)",
                    }}
                  >
                    {currentTrack.coverUrl ? (
                      <img
                        src={currentTrack.coverUrl}
                        alt="Album cover"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <MusicNoteIcon size={40} className="opacity-40" />
                    )}
                  </div>
                  <MarqueeText
                    key={currentTrack.id}
                    text={stripExtension(currentTrack.file.name)}
                    className="mt-2 text-sm font-semibold"
                    style={{ width: 260, color: "var(--yt-text-primary)" }}
                  />
                </div>
              }
            />

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" onClick={handleChooseClick}>
                Choose files
              </Button>
              {!hasMultipleTracks && (
                <Button
                  onClick={() => handleDownloadTrack(currentTrack)}
                  isLoading={isDownloadingCurrent}
                  className="flex items-center gap-2"
                >
                  <DownloadIcon size={18} />
                  Download
                </Button>
              )}
            </div>
          </div>

          {hasMultipleTracks && (
            <div className="w-full">
              <TrackList
                tracks={playlist.tracks}
                currentIndex={playlist.currentIndex}
                onSelect={playlist.selectTrack}
                onDownload={handleDownloadTrack}
                downloadingTrackIds={downloadingTrackIds}
              />
            </div>
          )}

          <div className="w-full">
            <EqualizerPanel
              settings={equalizer.settings}
              activePreset={equalizer.activePreset}
              onKnobChange={equalizer.setKnobValue}
              onPresetSelect={equalizer.selectPreset}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Musics;
