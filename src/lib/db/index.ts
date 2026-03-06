import Dexie, { type Table } from 'dexie'

export interface CachedTrackSourceRecord {
  id: number
  source: ArrayBuffer
  bitrate?: number
  origin?: string
  name?: string
  artist?: string
  createdAt: number
}

export interface CachedTrackDetailRecord {
  id: number
  detail: Record<string, unknown>
  privileges?: unknown
  updatedAt: number
}

export interface CachedLyricRecord {
  id: number
  lyrics: string
  updatedAt: number
}

export interface CachedAlbumRecord {
  id: number
  album: Record<string, unknown>
  updatedAt: number
}

export interface PlayerSnapshotRecord {
  key: string
  snapshot: Record<string, unknown>
  updatedAt: number
}

class MusicClawDatabase extends Dexie {
  trackSources!: Table<CachedTrackSourceRecord, number>
  trackDetails!: Table<CachedTrackDetailRecord, number>
  lyrics!: Table<CachedLyricRecord, number>
  albums!: Table<CachedAlbumRecord, number>
  playerSnapshots!: Table<PlayerSnapshotRecord, string>

  constructor() {
    super('music-claw')

    this.version(1).stores({
      trackSources: '&id, createdAt',
      trackDetails: '&id, updatedAt',
      lyrics: '&id, updatedAt',
      albums: '&id, updatedAt',
      playerSnapshots: '&key, updatedAt',
    })
  }
}

let database: MusicClawDatabase | null = null

export function isIndexedDbAvailable() {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

export function getMusicClawDb() {
  if (!isIndexedDbAvailable()) {
    throw new Error('IndexedDB is only available in the browser runtime')
  }

  if (!database) {
    database = new MusicClawDatabase()
  }

  return database
}

export async function clearApplicationCache() {
  const db = getMusicClawDb()
  await Promise.all(db.tables.map((table) => table.clear()))
}

export async function getTrackSourceCacheSummary() {
  const db = getMusicClawDb()
  let totalBytes = 0
  let totalItems = 0

  await db.trackSources.each((record) => {
    totalBytes += record.source.byteLength
    totalItems += 1
  })

  return {
    totalBytes,
    totalItems,
  }
}
