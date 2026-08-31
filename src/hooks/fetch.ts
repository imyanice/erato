import useSWR from 'swr'

import type { RecordType } from '@/db/schema'

const fetcher = (...args: Parameters<typeof fetch>) => fetch(...args).then((res) => res.json())

export function useFetch(recordID: number) {
	const { data, error, isLoading } = useSWR<RecordType, Error>(`/api/fetch/${recordID}`, fetcher)
	return { record: data, error, isLoading }
}
