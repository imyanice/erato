if (
	!process.env.LASTFM_KEY ||
	!process.env.LASTFM_SK ||
	!process.env.LASTFM_SECRET ||
	!process.env.MONGO_URL ||
	!process.env.DISCOGS_KEY
) {
	console.log('invalid envs >3')
	process.exit(1)
}

import { serve } from 'bun'
import * as mongoose from 'mongoose'
import * as discogsFetchHandler from './api/fetch'
import * as recordsHandler from './api/records'
import * as scrobblingHandler from './api/scrobblingHandler'
import * as discogsSearchHandler from './api/search'
import index from './index.html'

export const CONSTANTS = {
	lastfm: {
		key: process.env.LASTFM_KEY,
		sk: process.env.LASTFM_SK,
		secret: process.env.LASTFM_SECRET,
		url: 'http://ws.audioscrobbler.com/2.0/',
	},
	mongo: process.env.MONGO_URL,
	discogs: process.env.DISCOGS_KEY,
} as const
mongoose.connect(CONSTANTS.mongo).then(() => console.log('mongo connected'))

const server = serve({
	hostname: '0.0.0.0',
	routes: {
		// Serve index.html for all unmatched routes.
		'/*': index,

		'/api/search/:type': discogsSearchHandler.GET,
		'/api/fetch/:id': discogsFetchHandler.GET,
		'/api/records': {
			POST: recordsHandler.POST,
			GET: recordsHandler.GET,
		},
		'/api/records/:release_id': {
			DELETE: recordsHandler.DELETE,
			PATCH: recordsHandler.PATCH,
		},
		'/api/scrobble': {
			POST: scrobblingHandler.POST,
		},
	},

	development: process.env.NODE_ENV !== 'production' && {
		// Enable browser hot reloading in development
		hmr: true,

		// Echo console logs from the browser to the server
		console: true,
	},
})

console.log(`erato is live @ ${server.url}`)
