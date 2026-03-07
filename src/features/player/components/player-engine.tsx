import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { useShallow } from 'zustand/react/shallow'
import { fetchTrackSourceClient } from '#/features/track/api/track-api'
import { usePlayerStore } from '#/features/player/stores/player-store'

const PROGRESS_SYNC_INTERVAL = 250
const SEEK_SYNC_THRESHOLD = 1.25

export default function PlayerEngine() {
  const {
    currentTrackId,
    durationSeconds,
    isPlaying,
    progressSeconds,
    queue,
    setDurationSeconds,
    setProgressSeconds,
    setTrackSource,
    skipToNext,
    volume,
  } = usePlayerStore(
    useShallow((state) => ({
      currentTrackId: state.currentTrackId,
      durationSeconds: state.durationSeconds,
      isPlaying: state.isPlaying,
      progressSeconds: state.progressSeconds,
      queue: state.queue,
      setDurationSeconds: state.setDurationSeconds,
      setProgressSeconds: state.setProgressSeconds,
      setTrackSource: state.setTrackSource,
      skipToNext: state.skipToNext,
      volume: state.volume,
    })),
  )

  const currentTrack =
    queue.find((track) => track.id === currentTrackId) ?? null
  const howlRef = useRef<Howl | null>(null)
  const playbackSignatureRef = useRef<string | null>(null)
  const isTickingRef = useRef(false)

  useEffect(() => {
    if (!currentTrack || currentTrack.sourceUrl) {
      return
    }

    let isCancelled = false

    void fetchTrackSourceClient(currentTrack.id).then((source) => {
      if (isCancelled) {
        return
      }

      if (source.url && source.freeTrialInfo == null) {
        setTrackSource(currentTrack.id, source.url)
        return
      }

      skipToNext()
    })

    return () => {
      isCancelled = true
    }
  }, [currentTrack, setTrackSource, skipToNext])

  useEffect(() => {
    const signature = currentTrack?.sourceUrl
      ? `${currentTrack.id}:${currentTrack.sourceUrl}`
      : null

    if (!currentTrack || !currentTrack.sourceUrl) {
      playbackSignatureRef.current = null
      howlRef.current?.unload()
      howlRef.current = null
      return
    }

    if (playbackSignatureRef.current === signature) {
      return
    }

    const nextHowl = new Howl({
      src: [currentTrack.sourceUrl],
      html5: true,
      volume,
      onload: () => {
        const duration = nextHowl.duration()
        if (Number.isFinite(duration) && duration > 0) {
          setDurationSeconds(duration)
        }
      },
      onplay: () => {
        const duration = nextHowl.duration()
        if (Number.isFinite(duration) && duration > 0) {
          setDurationSeconds(duration)
        }
      },
      onend: () => {
        skipToNext()
      },
      onloaderror: () => {
        skipToNext()
      },
      onplayerror: () => {
        skipToNext()
      },
    })

    howlRef.current?.unload()
    howlRef.current = nextHowl
    playbackSignatureRef.current = signature

    if (isPlaying) {
      void nextHowl.play()
    }

    return () => {
      nextHowl.unload()
      if (howlRef.current === nextHowl) {
        howlRef.current = null
      }
      if (playbackSignatureRef.current === signature) {
        playbackSignatureRef.current = null
      }
    }
  }, [currentTrack?.id, currentTrack?.sourceUrl, setDurationSeconds, skipToNext])

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) {
      return
    }

    howl.volume(volume)
  }, [volume])

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) {
      return
    }

    if (isPlaying) {
      if (!howl.playing()) {
        void howl.play()
      }
      return
    }

    if (howl.playing()) {
      howl.pause()
    }
  }, [isPlaying, currentTrackId])

  useEffect(() => {
    const howl = howlRef.current
    if (!howl) {
      return
    }

    const currentSeek = howl.seek()
    if (typeof currentSeek !== 'number' || isTickingRef.current) {
      return
    }

    if (Math.abs(currentSeek - progressSeconds) >= SEEK_SYNC_THRESHOLD) {
      howl.seek(progressSeconds)
    }
  }, [progressSeconds, currentTrackId])

  useEffect(() => {
    if (!isPlaying || currentTrackId === null) {
      return
    }

    const timer = window.setInterval(() => {
      const howl = howlRef.current
      if (!howl || !howl.playing()) {
        return
      }

      const nextProgress = howl.seek()
      if (typeof nextProgress !== 'number') {
        return
      }

      isTickingRef.current = true
      setProgressSeconds(nextProgress)
      isTickingRef.current = false

      const nextDuration = howl.duration()
      if (
        Number.isFinite(nextDuration) &&
        nextDuration > 0 &&
        Math.abs(nextDuration - durationSeconds) > 0.5
      ) {
        setDurationSeconds(nextDuration)
      }
    }, PROGRESS_SYNC_INTERVAL)

    return () => {
      window.clearInterval(timer)
    }
  }, [currentTrackId, durationSeconds, isPlaying, setDurationSeconds, setProgressSeconds])

  return null
}
