import mongoose from 'mongoose'
import { Record } from '@/db/schema'
import { groupSortRecords } from '@/processors/recordsList'

mongoose
	.connect(process.env.MONGO ?? '')
	.then(() => console.log('mongo connected'))

console.log(JSON.stringify(groupSortRecords(await Record.find()), null, 2))
mongoose.disconnect()
