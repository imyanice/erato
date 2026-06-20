import type { SearchResponse } from '@/types/api'
import { CONSTANTS } from '..'
import type * as Discogs from '../types/discogs/search'

export async function GET({ params: { type }, url }: Bun.BunRequest<'/api/search/:type'>) {
	let search_results: { results: Discogs.SearchResult[] } = {
		results: [],
	}
	const search_params = new URL(url).searchParams
	if (search_params.has('q')) {
		if (type === 'barcode') {
			search_results = (await (
				await fetch(
					`https://api.discogs.com/database/search?barcode=${search_params.get('q')}&token=${CONSTANTS.discogs}`,
				)
			).json()) as { results: Discogs.SearchResult[] }
		} else if (type === 'release') {
			search_results = (await (
				await fetch(
					`https://api.discogs.com/database/search?q=${search_params.get('q')}&token=${CONSTANTS.discogs}&format=vinyl&type=release`,
				)
			).json()) as { results: Discogs.SearchResult[] }
		} else {
			return Response.json({
				error: 'invalid type, must be one of: barcode, name with q search params',
			})
		}
	} else {
		return Response.json({
			error: 'invalid type, must be one of: barcode, name with q search params',
		})
	}

	const res: SearchResponse[] = search_results.results.map((e) => ({
		country: e.country,
		year: e.year,
		genres: e.genre,
		styles: e.style,
		cover: e.cover_image ?? '',
		discogs_id: e.id,
		title: e.title,
	}))
	return Response.json(res)
}
