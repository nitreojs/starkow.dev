export interface Lyric {
  time: number
  lyric: string
}

export interface TrackDataAlbum {
  name: string
  image: string
}

export interface TrackArtist {
  name: string
  url: string
}

export interface TrackData {
  id: string
  album: TrackDataAlbum
  artists: TrackArtist[]
  name: string
  url: string
  playing: boolean

  progress: number // ms
  total: number // ms

  lyrics: Lyric[] | null
}
