import { Record } from '@/db/schema'

import { CONSTANTS } from '..'
import { build_sig } from './utils/lastfm'

const MINUTE = 1000 * 60

export async function POST(request: Bun.BunRequest<'/api/scrobble'>) {
	const json: {
		discogs_id: number
		sides: string[]
	}[] = await request.json()
	let params: [string, string][] = []
	let i = 0
	for (const record_json of json) {
		const record_query = Record.findOne({
			discogs_id: record_json.discogs_id,
		}).lean()
		const record = await record_query.exec()
		if (!record) continue
		for (const side of record.sides) {
			if (record_json.sides.includes(side.label)) {
				for (const track of side.tracks) {
					params.push([`track[${i}]`, track.name])
					params.push([`artist[${i}]`, record.artist])
					params.push([`timestamp[${i}]`, Math.floor(Date.now() / 1000).toString()])
					params.push([`chosenByUser[${i}]`, '1'])
					params.push([`album[${i}]`, record.title])
					i++
				}
			}
		}
	}
	if (i > 50) {
		return Response.json({ message: "that's too many tracks~" }, { status: 413 })
	}

	//let's assume each tracks lasts 4 mins
	let played_at = Date.now() - 4 * MINUTE * i
	params = params.map((e) => {
		if (e[0].includes('timestamp')) {
			const to_return: [string, string] = [e[0], Math.floor(played_at / 1000).toString()]
			played_at += 4 * MINUTE
			return to_return
		}
		return e
	})

	params.push(['method', 'track.scrobble'], ['api_key', CONSTANTS.lastfm.key], ['sk', CONSTANTS.lastfm.sk])
	params.sort((e1, e2) => (e1[0] < e2[0] ? -1 : e1[0] === e2[0] ? 0 : 1))

	const sig = build_sig(CONSTANTS.lastfm.secret, params)
	params.push(['api_sig', sig])
	params.push(['format', 'json'])

	await fetch(CONSTANTS.lastfm.url, {
		method: 'POST',
		body: new URLSearchParams(params),
	})
	return Response.json({ helllo: ':3' })
}
