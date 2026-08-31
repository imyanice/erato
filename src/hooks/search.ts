import useSWR from 'swr'

import type { SearchResponse } from '@/types/api'

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json())

export function useSearch(search: ['barcode' | 'release', string]) {
	const { data, error, isLoading } = useSWR<SearchResponse[], Error>(
		`/api/search/${search[0]}?q=${encodeURIComponent(search[1])}`,
		fetcher,
	)
	return { results: data ?? [], error, isLoading }
}
