import mongoose from 'mongoose'

mongoose
	.connect(process.env.MONGO ?? '')
	.then(() => console.log('mongo connected'))

mongoose.disconnect()
