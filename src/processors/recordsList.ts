import type { RecordType } from '@/db/schema'

function sortRecords(e1: RecordType, e2: RecordType) {
	const s1 = e1.artist_sort ?? e1.artist
	const s2 = e2.artist_sort ?? e2.artist
	if (s1 < s2) return -1
	if (s1 > s2) return 1
	if (e1.year < e2.year) return 1
	if (e1.year > e2.year) return -1
	return 0
}
export function groupSortRecords(records: RecordType[]) {
	return records.toSorted(sortRecords).reduce(
		(accumulator, e) => {
			const accLen = accumulator.length
			if (accLen > 0) {
				const last_group = accumulator[accLen - 1] ?? []
				if (last_group.length > 0) {
					// always true: an empty group cannot be pushed
					if (last_group[0]) {
						const last_name =
							last_group[0].artist_sort ?? last_group[0].artist
						if (last_name === (e.artist_sort ?? e.artist)) {
							accumulator[accLen - 1]?.push(e)
						} else {
							// new group
							accumulator.push([e])
						}
					}
				}
			} else {
				// first element
				accumulator.push([e])
			}
			return accumulator
		},
		[] as Array<RecordType[]>,
	)
}
