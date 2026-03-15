import { useEffect, useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { Save } from '@/assets/Save'
import { Trash } from '@/assets/Trash'
import type { RecordType } from '@/db/schema'
import { deleteRecord, updateRecord, useRecords } from '@/hooks/records'
import { Loading } from '../comp/Loading'
import { Modal } from './Modal'
import { RecordView } from './RecordView'

export function Home() {
	const { trigger: haptics } = useWebHaptics()

	const { records, isLoading } = useRecords()
	const [recordIndex, setRecordIndex] = useState(0)
	const [recordViewOpen, setRecordViewOpen] = useState(false)
	const [updatedSides, setUpdatedSides] = useState<RecordType['sides']>([])
	const [IDToIndexMap, setIDToIndexMap] = useState<Map<number, number>>(
		new Map(),
	)
	const { triggerDeletion, isDeleting } = deleteRecord(() => {
		setRecordViewOpen(false)
		setRecordIndex(0)
	})
	const { triggerUpdate, isUpdating } = updateRecord(() => {
		setRecordViewOpen(false)
		setRecordIndex(0)
	})
	useEffect(() => {
		if (records[recordIndex])
			setUpdatedSides([...records[recordIndex].sides])
	}, [records, recordIndex])

	useEffect(() => {
		if (!isLoading && !isDeleting && !isUpdating && records) {
			setIDToIndexMap(
				new Map(records.map((e, index) => [e.discogs_id, index])),
			)
		}
	}, [records, isLoading, isDeleting, isUpdating])
	if (isLoading || isDeleting || isUpdating) return <Loading />

	function updateColor(
		event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
		side: string,
	) {
		const side_index = updatedSides.findIndex((e) => e.label === side)
		if (side_index === -1) {
			// should not happen
			setUpdatedSides([
				...updatedSides,
				{
					label: side,
					color: event.target.value.replace('#', ''),
					tracks: [],
				},
			])
		} else {
			setUpdatedSides([
				...updatedSides.map((e, index) =>
					index !== side_index
						? e
						: {
								label: side,
								color: event.target.value.replace('#', ''),
								tracks: updatedSides[side_index]?.tracks ?? [],
							},
				),
			])
		}
	}
	return (
		<div>
			<Modal
				modalState={{
					isOpen: recordViewOpen,
					setOpen: setRecordViewOpen,
				}}
				onClose={() => {
					setRecordViewOpen(false)
					setRecordIndex(0)
				}}>
				<RecordView
					updateColor={updateColor}
					controlledSides={updatedSides}
					record={records[recordIndex] as RecordType}>
					<div className='w-full mt-2 flex items-center justify-center gap-2'>
						<button
							className={
								'p-2 bg-red-600/45 border-red-600 text-red-600 flex  items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
							}
							type='button'
							onClick={() => {
								triggerDeletion(
									records[recordIndex]?.discogs_id ?? -1,
								)
								haptics('success')
							}}>
							<Trash />
							DELETE!
						</button>
						<button
							className={
								'p-2  bg-green-600/45 border-green-600 text-green-600 flex  items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
							}
							type='button'
							onClick={() => {
								if (records[recordIndex]) {
									for (const updated of updatedSides) {
										const index = records[
											recordIndex
										].sides.findIndex(
											(e) => updated.label === e.label,
										)
										if (
											index !== -1 &&
											records[recordIndex].sides[index]
										) {
											records[recordIndex].sides[
												index
											].color = updated.color
										}
									}
									triggerUpdate({
										record_id:
											records[recordIndex]?.discogs_id ??
											-1,
										data: records[recordIndex],
									})
									haptics('success')
								}
							}}>
							<Save />
							<span className='pl-1'>SAVE!</span>
						</button>
					</div>
				</RecordView>
			</Modal>
			{records
				.toSorted(
					(e1, e2) =>
						(e1.artist_sort ?? e1.artist).charCodeAt(0) -
						(e2.artist_sort ?? e2.artist).charCodeAt(0),
				) // til webkit uses powersort for arrays of length > 8
				.reduce(
					(accumulator, e) => {
						const accLen = accumulator.length
						if (accLen > 0) {
							const last_group = accumulator[accLen - 1] ?? []
							// console.log(last_group)
							if (last_group.length > 0) {
								// always true: an empty group cannot be pushed
								if (last_group[0]) {
									const last_name =
										last_group[0].artist_sort ??
										last_group[0].artist
									if (
										last_name ===
										(e.artist_sort ?? e.artist)
									) {
										accumulator[accLen - 1]?.push(e)
									} else {
										// new group
										accumulator.push([e])
									}
								}
							}
						} else {
							// first element
							accumulator.push([e])
						}
						return accumulator
					},
					[] as Array<RecordType[]>,
				)
				.map((recordsGroup) => {
					return (
						<>
							<div className='flex justify-center text-[0.5rem] items-center'>
								<div className='border border-black/40 h-0 grow ml-6' />
								<div className=' px-2 text-black/40 text-center font-mono'>
									{recordsGroup[0]?.artist
										.split('')
										.map((a) => `${a.toUpperCase()} `)}
								</div>
								<div className='border border-black/40 h-0 grow mr-6' />
							</div>
							{recordsGroup
								.toSorted((e1, e2) => -e1.year + e2.year)
								.map((record) => {
									if (!record || !record.title) return
									const title = record.title ?? ''
									const cover = record.master_cover ?? ''
									const sides = record.sides ?? []

									return (
										<div
											key={title}
											className='flex flex-row bg-[#E5E5EA] p-2 pb-2 rounded-2xl border border-white w-full'>
											<button
												className='min-w-20 flex items-center justify-center max-w-20'
												onClick={() => {
													haptics('success')
												}}
												type='button'>
												<img
													src={cover}
													alt='record cover'
													className='shadow-lg shadow-black/30 active:shadow-none transition ease-in-out duration-100 rounded-sm'
												/>
											</button>

											<button
												onClick={() => {
													setRecordIndex(
														IDToIndexMap.get(
															record.discogs_id,
														) ?? -1,
													)
													setRecordViewOpen(true)
													haptics('heavy')
												}}
												type='button'
												className='ring-0  flex justify- flex-col pl-2'>
												<span className='text-lg text-start font-bold'>
													{record.title}
												</span>
												<div className='text-start'>
													<span>
														{record.styles.map(
															(g) => (
																<span key={g}>
																	{g} &bull;{' '}
																</span>
															),
														)}
														<span className='italic'>
															{record.year}
														</span>
													</span>
												</div>
											</button>
											<div
												style={{
													gridTemplateColumns: `repeat(${Math.floor(sides.length / 2)}, minmax(0, 1fr))`,
													minWidth:
														Math.floor(
															sides.length / 2,
														) *
															2.5 +
														'rem',
												}}
												className={
													'self-end grid gap-1 ml-auto '
												} // i love js
											>
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
														onClick={() =>
															haptics('success')
														}>
														<span>
															{side.label.toLowerCase()}
														</span>
													</button>
												))}
											</div>
										</div>
									)
								})}
						</>
					)
				})}
		</div>
	)
}
