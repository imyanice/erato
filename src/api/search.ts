import type { SearchResponse } from '@/types/api'
import { CONSTANTS } from '..'
import type * as Discogs from '../types/discogs/search'

export async function GET({
	params: { barcode },
}: Bun.BunRequest<'/api/search/:barcode'>) {
	const search_results = (await (
		await fetch(
			`https://api.discogs.com/database/search?barcode=${barcode}&token=${CONSTANTS.discogs}`,
		)
	).json()) as { results: Discogs.SearchResult[] }
	const res: SearchResponse[] = search_results.results.map((e) => ({
		country: e.country,
		year: e.year,
		genres: e.genre,
		styles: e.style,
		cover: e.cover_image,
		discogs_id: e.id,
		title: e.title,
	}))
	return Response.json(res)
}
