import { type ChangeEvent, useRef, useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import type { RecordType } from '@/db/schema'

/**
 * updatecolor is a function that should update the sides color
 * if updatedSides is null no color picker will be displayed
 */
export function RecordView({
	record,
	children,
	updateColor,
	controlledSides = null,
}: {
	record: RecordType
	children: React.ReactNode
	updateColor: (
		event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
		label: string,
	) => void
	controlledSides: RecordType['sides'] | null
}) {
	const { trigger: haptics } = useWebHaptics()
	const readOnlyColors = controlledSides === null
	const sides = controlledSides ?? record.sides
	const covers = [record.master_cover, record.cover]
	const [currentCover, setCurrentCover] = useState(0)
	return (
		<>
			<div className='flex flex-col items-center w-full'>
				<button
					type='button'
					onClick={() => {
						setCurrentCover((currentCover + 1) % 2)
						haptics('light')
					}}>
					<img
						className='h-60 rounded-lg shadow-lg shadow-black/30 '
						src={covers[currentCover]}
						alt={'album cover'}
					/>
				</button>

				<div className='flex pt-3 items-center flex-col'>
					<span className='text-3xl font-bold'>{record.title}</span>
					<span className='text-2xl italic'>{record.artist}</span>
				</div>
				<div>
					<span>
						{record.year} &bull; {record.genres.join(' \u2022 ')}{' '}
						&bull; {record.styles.join(' \u2022 ')}
					</span>
				</div>
			</div>
			<div className='w-full'>
				{sides.map((side) => {
					return (
						<div key={side.label}>
							<div className='w-full text-start rounded-2xl block p-2 my-2 pt-0'>
								<ButtonInputColor
									enabled={!readOnlyColors}
									onChange={(event) => {
										updateColor(event, side.label)
									}}
									data={side.color}>
									{side.label} Side
								</ButtonInputColor>
								<div className='ml-4 font-mono text-md'>
									{side.tracks.map((track) => {
										return (
											<div key={track.position}>
												<span>{track.position}</span>
												{` - ${track.name}`}
											</div>
										)
									})}
								</div>
							</div>
						</div>
					)
				})}
			</div>
			{children}
		</>
	)
}

function ButtonInputColor({
	onChange,
	children,
	enabled,
	data,
}: {
	onChange: (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
	children: React.ReactNode
	enabled: boolean
	data: string
}) {
	const { trigger: haptics } = useWebHaptics()
	const inputRef = useRef<HTMLInputElement>(null)
	if (enabled)
		return (
			<button
				style={{
					backgroundColor: `#${data}2D`,
					borderColor: `#${data}`,
					color: `#${data}`,
				}}
				type='button'
				onClick={() => {
					haptics('light')
				}}
				className={
					'text-2xl w-full p-2 flex items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
				}>
				<input
					ref={inputRef}
					className='fixed opacity-0 h-10 w-[90%]'
					onChange={onChange}
					type='color'
					defaultValue={`#${data}`}
				/>
				{children}
			</button>
		)
	return (
		<span
			className={
				'text-2xl p-2 mb-2 flex items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
			}>
			{children}
		</span>
	)
}
