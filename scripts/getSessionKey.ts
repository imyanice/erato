import { MD5 } from 'bun'

/**
 * This script gets a Last.FM session key
 * This key has an indefinitate expiry
 * I have not implemented a login portal inside of Erato itself since
 * for a single user self-hosted application it makes no sense.
 *
 * Adding support shouldn't be that difficult tho
 */
const key = process.env.LASTFM_KEY
const secret = process.env.LASTFM_SECRET

const api_root = 'http://ws.audioscrobbler.com/2.0'
if (!key || !secret) {
	console.log('please set the correct env')
	process.exit(1)
}
console.log(
	`GO TO: http://www.last.fm/api/auth/?api_key=${key}&cb=http://localhost:3000/`,
)
Bun.serve({
	hostname: '0.0.0.0',
	routes: {
		'/*': async (req) => {
			const urlobj = new URL(req.url)
			const queries = new URLSearchParams(urlobj.search)
			if (queries.has('token')) {
				const sig = Buffer.from(
					MD5.hash(
						`api_key${key}methodauth.getSessiontoken${queries.get('token')}${secret}`,
					).buffer,
				).toHex()
				const sk_res = await fetch(
					`${api_root}/?method=auth.getSession&api_key=${key}&format=json&token=${queries.get('token')}&api_sig=${sig.toString()}`,
				)
				if (sk_res.ok) {
					const sk = await sk_res.json()
					console.log('authentificated as', sk.session.name)
					console.log(`LASFTM_SK=${sk.session.key}`)
					process.exit(0)
				} else {
					console.log('somthing went wrong', await sk_res.text())
				}
			}
			return Response.json({ meoww: 'car :3' })
		},
	},
})
