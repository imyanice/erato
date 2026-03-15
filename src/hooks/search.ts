import useSWR from 'swr'
import type { SearchResponse } from '@/types/api'

const fetcher = (...args: Parameters<typeof fetch>) =>
	fetch(...args).then((res) => res.json())

export function useSearch(barcordID: string) {
	const { data, error, isLoading } = useSWR<SearchResponse[], Error>(
		`/api/search/${barcordID}`,
		fetcher,
	)
	return { results: data ?? [], error, isLoading }
}
