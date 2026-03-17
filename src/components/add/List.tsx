import type { Dispatch, SetStateAction } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { Loading } from '@/components/misc/Loading'
import { useSearch } from '@/hooks/search'

export function List({
	setCurrentRecordID,
	barcode,
}: {
	setCurrentRecordID: Dispatch<SetStateAction<number>>
	barcode: string
}) {
	const { results, isLoading } = useSearch(barcode)
	const { trigger: haptics } = useWebHaptics()
	if (isLoading) return <Loading />
	return (
		<>
			<div className='w-full text-2xl flex pb-2'>
				<span>{results.length} records matched:</span>
			</div>

			{results.map((result) => (
				<button
					type='button'
					key={result.discogs_id}
					onClick={() => {
						haptics('medium')
						setCurrentRecordID(result.discogs_id)
					}}
					className='bg-[#E5E5EA] w-full border border-white p-3 flex flex-row rounded-2xl mb-1'>
					<img
						alt={`${result.title}'s cover`}
						className='h-24 w-24 rounded-sm'
						src={result.cover}
					/>
					<div className='pl-2'>
						<div className='text-grow text-sm font-bold pb-1 justify-start flex'>
							{result.title}
						</div>
						<div className='flex gap-1 flex-wrap'>
							<div className='p-2 text-sm flex items-center justify-center h-8 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'>
								{result.year}
							</div>
							<div className='p-2 text-sm flex items-center justify-center h-8 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'>
								{result.country}
							</div>
							{result.genres.map((genre) => {
								if (genre.trim() === '') return
								return (
									<div
										key={genre}
										className='p-2 text-sm flex items-center justify-center h-8 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'>
										{genre}
									</div>
								)
							})}
						</div>
					</div>
				</button>
			))}
		</>
	)
}
