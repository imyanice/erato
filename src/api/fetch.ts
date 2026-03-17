import type { RecordType } from '@/db/schema'
import type * as Discogs from '@/types/discogs/releases'
import { CONSTANTS } from '..'

export async function GET({
	params: { id },
}: Bun.BunRequest<'/api/fetch/:id'>) {
	const discogs_res = await fetch(
		`https://api.discogs.com/releases/${id}?token=${CONSTANTS.discogs}`,
	)
	if (!discogs_res.ok) {
		console.log(discogs_res)
		return Response.error()
	}
	const fetch_results = (await discogs_res.json()) as Discogs.ReleaseType
	const res: RecordType = {
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
	const sides: RecordType['sides'] = [] as unknown as RecordType['sides']
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
					tracks: [{ position: track.position, name: track.title }],
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
	res.sides = sides
	//we are done with the standard version, now let's get the master version for cover and year of release
	if (res.discogs_master_id) {
		const discogs_master_res = await fetch(
			`https://api.discogs.com/masters/${res.discogs_master_id}?token=${process.env.DISCOGS_TOKEN}`,
		)
		if (discogs_master_res.ok) {
			const master_fetch_results =
				(await discogs_master_res.json()) as Discogs.MasterReleaseType
			res.year = master_fetch_results.year
			let cover = ''
			if (master_fetch_results.images.length > 0) {
				cover =
					master_fetch_results.images.find(
						(e) => e.type === 'primary',
					)?.uri ??
					master_fetch_results.images[0]?.uri ?? // fallback to first element
					`https://media.discordapp.net/attachments/1066756781319135264/
					1147481595931017266/367413930_2262289477294640_7133410966712318271_n.gif
					?ex=69ba8183&is=69b93003&hm=10f46758e9dbee148be3e9ebda04a11a47102bbebf06aef3790bae6245d6f657
					&=&width=1440&height=1080` // fallback to the fallback of the first element
			}
			res.master_cover = cover
		}
	}
	return Response.json(res)
}
