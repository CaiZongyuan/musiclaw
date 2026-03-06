/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NETEASE_API_URL?: string
  readonly VITE_NETEASE_API_URL?: string
  readonly VITE_REAL_IP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'howler' {
  export class Howl {
    constructor(options: Record<string, unknown>)
    play(spriteOrId?: string | number): number
    pause(id?: number): Howl
    unload(): void
    duration(id?: number): number
    seek(seek?: number, id?: number): number | Howl
    volume(volume?: number, id?: number): number | Howl
    playing(id?: number): boolean
  }
}
