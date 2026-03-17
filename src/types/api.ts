/** This type corresponds to the `/api/search` endpoint and is NOT a RecordType. */
export type SearchResponse = {
	country: string
	year: number
	genres: string[]
	styles: string[]
	cover: string
	discogs_id: number
	title: string
}
