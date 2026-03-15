import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import type { RecordType } from '@/db/schema'

const fetcher = (...args: Parameters<typeof fetch>) =>
	fetch(...args).then((res) => res.json())
export function useRecords() {
	const { data, error, isLoading } = useSWR<RecordType[], Error>(
		'/api/records',
		fetcher,
	)
	return { records: data ?? [], error, isLoading }
}
export function mutateRecords(fn: () => void) {
	async function sendPost(
		url: Parameters<typeof fetch>[0],
		{ arg }: { arg: RecordType },
	): Promise<RecordType[]> {
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(arg),
		}).then((r) => r.json())
	}
	return useSWRMutation('/api/records', sendPost, {
		populateCache: true,
		onSuccess: fn,
	})
}

export function deleteRecord(fn: () => void) {
	async function sendDelete(
		url: Parameters<typeof fetch>[0],
		{ arg }: { arg: number },
	): Promise<RecordType[]> {
		return fetch(`${url.toString()}/${arg}`, {
			method: 'DELETE',
		}).then((r) => r.json())
	}
	const { trigger, isMutating, error } = useSWRMutation(
		'/api/records',
		sendDelete,
		{
			populateCache: true,
			onSuccess: fn,
		},
	)
	return { triggerDeletion: trigger, isDeleting: isMutating, error }
}

export function updateRecord(fn: () => void) {
	async function sendPatch(
		url: Parameters<typeof fetch>[0],
		{
			arg: { record_id, data },
		}: { arg: { record_id: number; data: RecordType } },
	): Promise<RecordType[]> {
		return fetch(`${url.toString()}/${record_id}`, {
			method: 'PATCH',
			body: JSON.stringify(data),
		}).then((r) => r.json())
	}
	const { trigger, isMutating, error } = useSWRMutation(
		'/api/records',
		sendPatch,
		{
			populateCache: true,
			onSuccess: fn,
		},
	)
	return { triggerUpdate: trigger, isUpdating: isMutating, error }
}
