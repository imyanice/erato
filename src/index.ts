import { fetch, serve } from 'bun'
import * as mongoose from 'mongoose'
import { Record, type RecordType } from './db/schema'
import index from './index.html'
import type { FetchRecordResponse, SearchResponse } from './types/api'

const MINUTE = 1000 * 60
/*
 * This is how scroblling is going to work:
 * A user clicks on the scrobble button
 * Sends discogs_id and sides labels (if full album empty array)
 * Add the tracks to a list built this way: [A1,A2,A3,A4,B1,B2,B3,B4] (stack)
 *
 * cron job every 5 mins that scrobbles in batch starting from the last track
 * last track played at t-t_duration
 * next one at t-(t1_duration+t_duration)
 * ...
 *
 * EVEN BETTER!
 * The tracks to be scrobbled are kept on client as a state
 * The client will decide to send the tracks upon validation
 * Allowing for a review
 *
 *
 * {
 *  artist: 'name',
 *  track: 'track_name',
 *  timestamp: the client still sends this field with the duration in ms of the track
 *    the server will then replace this value by the correct one
 *  album: "name",
 *  choseByUser:1
 * }[]
 *  api_key
 * sk
 * api_sig
 * }
 */

mongoose
	.connect(process.env.MONGO ?? '')
	.then(() => console.log('mongo connected'))
type StandardTracks = {
	position: string
	type_: 'heading' | 'track' /* let's assume there's no other track type */
	title: string
	duration: string
}
type IndexTracks = {
	position: string
	type_: 'index'
	title: string
	duration: string
	sub_tracks: StandardTracks[]
}

const server = serve({
	hostname: '0.0.0.0',
	routes: {
		// Serve index.html for all unmatched routes.
		'/*': index,

		'/api/search/:barcode': async (req) => {
			const barcode = req.params.barcode
			const discogs_res = await fetch(
				`https://api.discogs.com/database/search?barcode=${barcode}&token=${process.env.DISCOGS_TOKEN}`,
			)
			const search_results = await discogs_res.json()
			const res: SearchResponse[] = search_results.results.map(
				(e: any) => ({
					country: e.country,
					year: e.year,
					genres: e.genre,
					styles: e.style,
					cover: e.cover_image,
					discogs_id: e.id,
					title: e.title,
				}),
			)
			return Response.json(res)
		},
		'/api/fetch/:id': async (req) => {
			const id = req.params.id
			const discogs_res = await fetch(
				`https://api.discogs.com/releases/${id}?token=${process.env.DISCOGS_TOKEN}`,
			)
			if (!discogs_res.ok) {
				console.log(discogs_res)
				return Response.error()
			}
			const fetch_results = (await discogs_res.json()) as {
				master_id: number
				id: number
				thumb: string
				artists_sort: string
				artists: { name: string }[]
				title: string
				genres: string[]
				country: string
				styles: string[]
				tracklist: (IndexTracks | StandardTracks)[]
			}
			const res: FetchRecordResponse = {
				discogs_master_id: fetch_results.master_id,
				discogs_id: fetch_results.id,
				cover: fetch_results.thumb,
				master_cover: '',
				country: fetch_results.country,
				artist_sort: fetch_results.artists_sort,
				artist: fetch_results.artists
					.map((artist: { name: string }) => artist.name)
					.join(', '),
				title: fetch_results.title,
				genres: fetch_results.genres,
				styles: fetch_results.styles,
				sides: [] as unknown as RecordType['sides'],
				year: 1984,
			}
			const sides: RecordType['sides'] =
				[] as unknown as RecordType['sides']
			for (const track of fetch_results.tracklist) {
				if (track.type_ === 'track') {
					if (track.position.length < 1) continue
					const side_label = track.position[0] as string // eg: A2 + will never fail sinc elength >= 1
					const side_pos = sides.findIndex(
						(side) => side.label === side_label,
					)
					if (side_pos === -1) {
						sides.push({
							color: '',
							label: side_label,
							tracks: [
								{ position: track.position, name: track.title },
							],
						})
					} else {
						sides[side_pos]?.tracks.push({
							position: track.position,
							name: track.title,
						})
					}
				}
				if (track.type_ === 'index') {
					for (const subtrack of track.sub_tracks) {
						if (subtrack.position.length < 1) continue
						const side_label = subtrack.position[0] as string // eg: A2 + will never fail sinc elength >= 1
						const side_pos = sides.findIndex(
							(side) => side.label === side_label,
						)
						if (side_pos === -1) {
							sides.push({
								color: '',
								label: side_label,
								tracks: [
									{
										position: subtrack.position, // we go through the subtracks array and find the first one with a position not empty, then we just add the main track to the side and its position is the first correct subtrack, we do NOT go throught the entire subtrack array
										name: track.title,
									},
								],
							})
						} else {
							sides[side_pos]?.tracks.push({
								position: subtrack.position,
								name: track.title,
							})
						}
						break // exit since we added the maintrack in the corect side
					}
				}
			}
			res.sides = sides as unknown as RecordType['sides']
			//we are done with the standard version , now let's get the master version for cover and year of release
			if (res.discogs_master_id) {
				const discogs_master_res = await fetch(
					`https://api.discogs.com/masters/${res.discogs_master_id}?token=${process.env.DISCOGS_TOKEN}`,
				)
				if (discogs_master_res.ok) {
					const master_fetch_results = await discogs_master_res.json()
					res.year = master_fetch_results.year
					let cover = ''
					if (master_fetch_results.images.length > 0) {
						cover =
							(
								master_fetch_results.images as {
									type: 'primary' | 'secondary'
									uri: string
								}[]
							).find((e) => e.type === 'primary')?.uri ??
							master_fetch_results.images[0].uri // fallback to first element
					}
					res.master_cover = cover
				}
			}
			return Response.json(res)
		},
		'/api/records': {
			POST: async (req) => {
				const new_record = new Record(await req.json())
				await new_record.save()
				const b = await Record.find()
				return Response.json(b)
			},
			GET: async () => {
				const b = await Record.find()
				return Response.json(b)
			},
		},
		'/api/records/:release_id': {
			DELETE: async (req) => {
				await Record.deleteOne({
					discogs_id: new Number(req.params.release_id),
				})
				const b = await Record.find()
				return Response.json(b)
			},
			PATCH: async (req) => {
				await Record.updateOne(
					{
						discogs_id: new Number(req.params.release_id),
					},
					await req.json(),
				)
				const b = await Record.find()
				return Response.json(b)
			},
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
