export type ReleaseType = {
	master_id: number
	id: number
	thumb: string
	artists_sort: string
	artists: { name: string }[]
	title: string
	genres: string[]
	country: string
	styles: string[]
	tracklist: (IndexTracks | StandardTracks)[]
}
export type StandardTracks = {
	position: string
	type_: 'heading' | 'track' /* let's assume there's no other track type */
	title: string
	duration: string
}
export type IndexTracks = {
	position: string
	type_: 'index'
	title: string
	duration: string
	sub_tracks: StandardTracks[]
}
/** discogs' master release but loosely typed */
export type MasterReleaseType = Omit<Omit<Omit<Omit<ReleaseType, 'master_id'>, 'thumb'>, 'artists_sort'>, 'country'> & {
	year: number
	images: { type: 'primary' | 'secondary'; uri: string }[]
}
