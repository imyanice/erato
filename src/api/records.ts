import { Record } from '@/db/schema'

export async function GET() {
	return Response.json(await Record.find())
}
export async function POST(req: Bun.BunRequest<'/api/records'>) {
	const new_record = new Record(await req.json())
	try {
		await new_record.save()
	} catch {} // should only error on duplicate documents
	return await GET()
}
export async function DELETE({
	params: { release_id },
}: Bun.BunRequest<'/api/records/:release_id'>) {
	await Record.deleteOne({
		discogs_id: new Number(release_id),
	})

	return await GET()
}
export async function PATCH(req: Bun.BunRequest<'/api/records/:release_id'>) {
	await Record.updateOne(
		{
			discogs_id: new Number(req.params.release_id),
		},
		await req.json(),
	)

	return await GET()
}
