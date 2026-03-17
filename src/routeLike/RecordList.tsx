import { useEffect, useState } from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { Save } from '@/assets/Save'
import { Trash } from '@/assets/Trash'
import { RecordCard } from '@/components/list/RecordCard'
import { StyledButton } from '@/components/misc/StyledButton'
import type { RecordType } from '@/db/schema'
import { deleteRecord, updateRecord, useRecords } from '@/hooks/records'
import { groupSortRecords } from '@/processors/recordsList'
import { RecordView } from '../components/list/RecordView'
import { Modal } from '../components/Modal'
import { Loading } from '../components/misc/Loading'

export function RecordList() {
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
	function requestRecordUpdate(rIndex: number) {
		if (records[rIndex]) {
			for (const updated of updatedSides) {
				const index = records[rIndex].sides.findIndex(
					(e) => updated.label === e.label,
				)
				if (index !== -1 && records[rIndex].sides[index]) {
					records[rIndex].sides[index].color = updated.color
				}
			}
			triggerUpdate({
				record_id: records[rIndex]?.discogs_id ?? -1,
				data: records[rIndex],
			})
			haptics('success')
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
						<StyledButton
							color='#DC2626'
							onClick={() => {
								triggerDeletion(
									records[recordIndex]?.discogs_id ?? -1,
								)
								haptics('success')
							}}>
							<Trash />
							DELETE!
						</StyledButton>
						<StyledButton
							color='#16A34A'
							onClick={() => requestRecordUpdate(recordIndex)}>
							<Save />
							<span className='pl-1'>SAVE!</span>
						</StyledButton>
					</div>
				</RecordView>
			</Modal>
			{groupSortRecords(records).map((recordsGroup) => {
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
						{recordsGroup.map((record) => (
							<RecordCard
								key={record.discogs_id}
								record={record}
								onInfoClick={() => {
									setRecordIndex(
										IDToIndexMap.get(record.discogs_id) ??
											-1,
									)
									setRecordViewOpen(true)
									haptics('heavy')
								}}
							/>
						))}
					</>
				)
			})}
		</div>
	)
}
