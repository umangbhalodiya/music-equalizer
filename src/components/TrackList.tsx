import { Accordion } from 'rizzui'
import type { Track } from '../hooks/usePlaylist'
import { stripExtension } from '../lib/format'
import { ChevronDownIcon, DownloadIcon, PlayIcon } from './icons'

interface TrackListProps {
  tracks: Track[]
  currentIndex: number | null
  onSelect: (index: number) => void
  onDownload: (track: Track) => void
  downloadingTrackIds: Set<string>
}

function TrackList({ tracks, currentIndex, onSelect, onDownload, downloadingTrackIds }: TrackListProps) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: 'var(--yt-surface-raised)', fontFamily: 'var(--yt-font)' }}
    >
      <Accordion defaultOpen>
        <Accordion.Header className="flex w-full items-center justify-between px-4 py-3">
          {({ open }) => (
            <>
              <span className="text-sm font-semibold" style={{ color: 'var(--yt-text-primary)' }}>
                Playlist · {tracks.length} tracks
              </span>
              <span
                style={{
                  color: 'var(--yt-text-secondary)',
                  display: 'inline-flex',
                  transform: open ? 'rotate(180deg)' : undefined,
                  transition: 'transform 150ms ease',
                }}
              >
                <ChevronDownIcon size={18} />
              </span>
            </>
          )}
        </Accordion.Header>

        <Accordion.Body as="ul" className="flex flex-col gap-1 px-2 pb-2">
          {tracks.map((track, index) => {
            const isActive = index === currentIndex
            const isDownloading = downloadingTrackIds.has(track.id)
            return (
              <li key={track.id} className="flex items-center gap-1 rounded-lg hover:bg-[var(--yt-surface-pressed)]">
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-2 py-2.5 text-left"
                >
                  <span
                    className="flex w-5 shrink-0 items-center justify-center text-xs"
                    style={{ color: isActive ? 'var(--eq-knob-accent)' : 'var(--yt-text-secondary)' }}
                  >
                    {isActive ? <PlayIcon size={14} /> : index + 1}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-sm"
                    style={{
                      color: isActive ? 'var(--yt-text-primary)' : 'var(--yt-text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {stripExtension(track.file.name)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onDownload(track)}
                  disabled={isDownloading}
                  aria-label={`Download ${track.file.name}`}
                  className="group flex shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-[var(--yt-surface-pressed)] disabled:opacity-50"
                  style={{ width: 40, height: 40, color: 'var(--yt-icon)', marginRight: 4 }}
                >
                  <DownloadIcon
                    size={20}
                    className={`transition-transform group-hover:scale-110 group-hover:text-[var(--yt-accent)] ${isDownloading ? 'animate-pulse' : ''}`}
                  />
                </button>
              </li>
            )
          })}
        </Accordion.Body>
      </Accordion>
    </div>
  )
}

export default TrackList
