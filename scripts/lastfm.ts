import { MD5 } from 'bun'
import mongoose from 'mongoose'
import { Record } from '@/db/schema'

mongoose
	.connect(process.env.MONGO ?? '')
	.then(() => console.log('mongo connected'))
const MINUTE = 1000 * 60
const json: { discogs_id: number; sides: string[] }[] = [
	{ discogs_id: 14312150, sides: ['A', 'B'] },
	{ discogs_id: 29301598, sides: ['A', 'B'] },
]
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
				params.push([
					`timestamp[${i}]`,
					Math.floor(Date.now() / 1000).toString(),
				])
				params.push([`chosenByUser[${i}]`, '1'])
				params.push([`album[${i}]`, record.title])
				i++
			}
		}
	}
}
//let's assume each tracks lasts 4 mins
// and that the client sends a total of track < 50 (maximum accepted by last fm)
// shouldn't be a problem tho
let played_at = Date.now() - 4 * MINUTE * i
params = params.map((e) => {
	if (e[0].includes('timestamp')) {
		const to_return: [string, string] = [
			e[0],
			Math.floor(played_at / 1000).toString(),
		]
		played_at += 4 * MINUTE
		return to_return
	}
	return e
})
console.log(JSON.stringify(params, null, 2))

//negative value if the first argument is less than the second argument
// zero if they’re equal,
// and a positive value otherwise.

params.push(
	['method', 'track.scrobble'],
	['api_key', process.env.LASTFM_KEY!],
	['sk', process.env.LASFTM_SK_TEST!],
)
params.sort((e1, e2) => (e1[0] < e2[0] ? -1 : e1[0] === e2[0] ? 0 : 1))

function build_sig(secret: string, params: [string, string | number][]) {
	let acc = ''
	for (const [key, val] of params) {
		acc = `${acc}${key}${val}`
	}
	acc = acc + secret
	return Buffer.from(MD5.hash(acc).buffer).toHex()
}
const sig = build_sig(process.env.LASTFM_SECRET!, params)
params.push(['api_sig', sig])
params.push(['format', 'json'])

console.log(new URLSearchParams(params))
fetch('http://ws.audioscrobbler.com/2.0/', {
	method: 'POST',
	body: new URLSearchParams(params),
}).then(async (r) => console.log(await r.text()))

mongoose.disconnect()

/*
test_duration_building expected:
[
  {
    "track": "Don't Let Me Go",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773606615741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Kiss It Off Me",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773606855741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Heavenly",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773607095741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "You're The Only Good Thing In My Life",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773607335741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Touch",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773607575741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Hentai",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773607815741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Cry",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773608055741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Falling In Love",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773608295741,
    "album": "Cry",
    "chosenByUser": 1
  },
  {
    "track": "Pure",
    "artist": "Cigarettes After Sex",
    "timestamp": 1773608535741,
    "album": "Cry",
    "chosenByUser": 1
  }
]*/
/*
[
  [
    "album[0]",
    "Cry"
  ],
  [
    "album[1]",
    "Cry"
  ],
  [
    "album[2]",
    "Cry"
  ],
  [
    "album[3]",
    "Cry"
  ],
  [
    "album[4]",
    "Cry"
  ],
  [
    "album[5]",
    "Cry"
  ],
  [
    "album[6]",
    "Cry"
  ],
  [
    "album[7]",
    "Cry"
  ],
  [
    "album[8]",
    "Cry"
  ],
  [
    "api_key",
    "super_key"
  ],
  [
    "artist[0]",
    "Cigarettes After Sex"
  ],
  [
    "artist[1]",
    "Cigarettes After Sex"
  ],
  [
    "artist[2]",
    "Cigarettes After Sex"
  ],
  [
    "artist[3]",
    "Cigarettes After Sex"
  ],
  [
    "artist[4]",
    "Cigarettes After Sex"
  ],
  [
    "artist[5]",
    "Cigarettes After Sex"
  ],
  [
    "artist[6]",
    "Cigarettes After Sex"
  ],
  [
    "artist[7]",
    "Cigarettes After Sex"
  ],
  [
    "artist[8]",
    "Cigarettes After Sex"
  ],
  [
    "chosenByUser[0]",
    1
  ],
  [
    "chosenByUser[1]",
    1
  ],
  [
    "chosenByUser[2]",
    1
  ],
  [
    "chosenByUser[3]",
    1
  ],
  [
    "chosenByUser[4]",
    1
  ],
  [
    "chosenByUser[5]",
    1
  ],
  [
    "chosenByUser[6]",
    1
  ],
  [
    "chosenByUser[7]",
    1
  ],
  [
    "chosenByUser[8]",
    1
  ],
  [
    "method",
    "track.scrobble"
  ],
  [
    "sk",
    "session_key"
  ],
  [
    "timestamp[0]",
    1773608972340
  ],
  [
    "timestamp[1]",
    1773609212340
  ],
  [
    "timestamp[2]",
    1773609452340
  ],
  [
    "timestamp[3]",
    1773609692340
  ],
  [
    "timestamp[4]",
    1773609932340
  ],
  [
    "timestamp[5]",
    1773610172340
  ],
  [
    "timestamp[6]",
    1773610412340
  ],
  [
    "timestamp[7]",
    1773610652340
  ],
  [
    "timestamp[8]",
    1773610892340
  ],
  [
    "track[0]",
    "Don't Let Me Go"
  ],
  [
    "track[1]",
    "Kiss It Off Me"
  ],
  [
    "track[2]",
    "Heavenly"
  ],
  [
    "track[3]",
    "You're The Only Good Thing In My Life"
  ],
  [
    "track[4]",
    "Touch"
  ],
  [
    "track[5]",
    "Hentai"
  ],
  [
    "track[6]",
    "Cry"
  ],
  [
    "track[7]",
    "Falling In Love"
  ],
  [
    "track[8]",
    "Pure"
  ]
]
*/
