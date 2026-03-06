import type { NeteaseTrack } from '#/features/music/api/types'
import { buildPlayerQueueFromTracks } from '#/features/player/lib/player-track'
import { usePlayerStore } from '#/features/player/stores/player-store'

interface PlayTrackButtonProps {
  track: NeteaseTrack
  queue: NeteaseTrack[]
  className?: string
  label?: string
}

export default function PlayTrackButton({
  track,
  queue,
  className,
  label = '播放',
}: PlayTrackButtonProps) {
  const loadQueueAndPlay = usePlayerStore((state) => state.loadQueueAndPlay)

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
