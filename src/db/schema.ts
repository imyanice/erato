import { model, Schema } from 'mongoose'

export interface RecordType {
	title: string
	artist: string
	artist_sort?: string
	cover: string
	master_cover: string
	/** expects year to be the release year of the master record */
	year: number
	genres: string[]
	country: string
	styles: string[]
	discogs_id: number
	discogs_master_id: number
	sides: {
		label: string
		color: string
		tracks: { position: string; name: string }[]
	}[]
}

const record_schema = new Schema<RecordType>({
	title: { type: String, required: true },
	artist: { type: String, required: true },
	artist_sort: String,
	cover: { type: String, required: true },
	master_cover: { type: String, required: true },
	/** expects year to be the release year of the master record */
	year: Number,
	genres: [{ type: String, required: true }],
	country: String,
	styles: [{ type: String, required: true }],
	discogs_id: { type: Number, unique: true, required: true },
	discogs_master_id: { type: Number, unique: true, required: true },
	sides: [
		{
			label: { type: String, required: true },
			color: { type: String, default: '' },
			tracks: [{ position: String, name: String }],
		},
	],
})

// export type RecordType = InferSchemaType<typeof record_schema>
export const Record = model('Record', record_schema)
