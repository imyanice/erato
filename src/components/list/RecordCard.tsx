import { useWebHaptics } from 'web-haptics/react'

import type { RecordType } from '@/db/schema'
import type { ScrobblingRequest } from '@/types/api'

export function RecordCard({
	record,
	onInfoClick,
	onScrobblableClick,
}: {
	record: RecordType
	onInfoClick: () => void
	onScrobblableClick: (scrobble: ScrobblingRequest[number]) => void
}) {
	const { trigger: haptics } = useWebHaptics()
	if (!record || !record.title) return
	const title = record.title ?? ''
	const cover = record.master_cover ?? ''
	const sides = record.sides ?? []

	return (
		<div key={title} className='flex flex-row bg-[#E5E5EA] p-2 pb-2 rounded-2xl border border-white w-full'>
			<button
				className='min-w-20 flex items-center justify-center max-w-20'
				onClick={() => {
					onScrobblableClick({
						discogs_id: record.discogs_id,
						sides: record.sides.map((e) => e.label),
					})
					void haptics('selection')
				}}
				type='button'>
				<img
					src={cover}
					alt='record cover'
					className='shadow-lg shadow-black/30 active:shadow-none transition ease-in-out duration-100 rounded-sm'
				/>
			</button>

			<button onClick={onInfoClick} type='button' className='ring-0  flex justify- flex-col pl-2'>
				<span className='text-lg text-start font-bold'>{record.title}</span>
				<div className='text-start'>
					<span>
						{record.styles.map((g) => (
							<span key={g}>{g} &bull; </span>
						))}
						<span className='italic'>{record.year}</span>
					</span>
				</div>
			</button>
			<div
				style={{
					gridTemplateColumns: `repeat(${Math.floor(sides.length / 2)}, minmax(0, 1fr))`,
					minWidth: `${Math.floor(sides.length / 2) * 2.5}rem`,
				}}
				className={'self-end grid gap-1 ml-auto '}>
				{(sides ?? []).map((side) => (
					<button
						key={side.label}
						style={{
							backgroundColor: `#${side.color}45`,
							borderColor: `#${side.color}`,
							color: `#${side.color}`,
						}}
						className={
							'p-2 w-9 flex items-center justify-center h-9 active:scale-z-80 transition duration-100 ease-in border-b-5 border-2 active:border-b-2 rounded-xl'
						}
						type='button'
						onClick={() => {
							onScrobblableClick({
								discogs_id: record.discogs_id,
								sides: [side.label],
							})
							void haptics('selection')
						}}>
						<span>{side.label.toLowerCase()}</span>
					</button>
				))}
			</div>
		</div>
	)
}
