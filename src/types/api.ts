import type { RecordType } from '@/db/schema'

export type FetchRecordResponse = RecordType
//   {
// 	discogs_master_id: number
// 	discogs_id: number
// 	cover: string
// 	master_cover: string
// 	artist_sort: string
// 	artist: string
// 	title: string
// 	genres: string[]
// 	styles: string[]
// 	sides: {
// 		color: string
// 		label: string
// 		tracks: {
// 			position: string
// 			name: string
// 		}[]
// 	}[]
// 	year: number
// }
/**
 * This type corresponds to the /api/search endpoint and is NOT a RecordType
 */
export type SearchResponse = {
	country: string
	year: number
	genres: string[]
	styles: string[]
	cover: string
	discogs_id: number
	title: string
}
