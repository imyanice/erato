import { useState } from 'react'
import { Cats } from '@/assets/cats/Cats'

export function EmptyRecords() {
	const [currentCatPic, setCurrrentCatPic] = useState(Math.floor(Math.random() * 8))
	return (
		<button
			type="button"
			className="h-full w-full flex items-center flex-col justify-center"
			onClick={() => setCurrrentCatPic(currentCatPic + 1)}
		>
			<Cats className="mt-4 h-60" cat={Math.floor(Math.random() * 8)} />
			<div className="mt-4 text-xl">No records added yet!</div>
			<div className="italic">Enjoy these cat pics while you wait...</div>
		</button>
	)
}
