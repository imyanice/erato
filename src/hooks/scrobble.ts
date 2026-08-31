import useSWRMutation from 'swr/mutation'

import type { ScrobblingRequest } from '@/types/api'

export function useScrobbler(fn: () => void) {
	async function sendPost(url: Parameters<typeof fetch>[0], { arg }: { arg: ScrobblingRequest }) {
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(arg),
		}).then((r) => r.json())
	}
	const { trigger, isMutating, error } = useSWRMutation('/api/scrobble', sendPost, {
		populateCache: false,
		onSuccess: fn,
	})
	return { scrobble: trigger, isScrobbling: isMutating, error }
}
