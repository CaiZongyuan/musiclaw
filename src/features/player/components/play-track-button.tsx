import type { NeteaseTrack } from '#/features/music/api/types'
import {
  buildPlayerQueueFromTracks,
  mapNeteaseTrackToPlayerTrack,
} from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

interface PlayTrackButtonProps {
  track: NeteaseTrack
  queue: NeteaseTrack[]
  className?: string
  label?: string
  nextLabel?: string
  showPlayNext?: boolean
}

export default function PlayTrackButton({
  track,
  queue,
  className,
  label = '播放',
  nextLabel = '下一首',
  showPlayNext = false,
}: PlayTrackButtonProps) {
  const enqueueToPlayNext = usePlayerStore((state) => state.enqueueToPlayNext)
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)

  if (showPlayNext) {
    return (
      <div className="play-track-button-group">
        <button
          type="button"
          onClick={() => loadQueueAndPlay(buildPlayerQueueFromTracks(queue), track.id)}
          disabled={track.playable === false}
          className={className}
        >
          {label}
        </button>
        <button
          type="button"
          onClick={() => enqueueToPlayNext(mapNeteaseTrackToPlayerTrack(track))}
          disabled={track.playable === false}
          className={className}
        >
          {nextLabel}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => loadQueueAndPlay(buildPlayerQueueFromTracks(queue), track.id)}
      disabled={track.playable === false}
      className={className}
    >
      {label}
    </button>
  )
}
