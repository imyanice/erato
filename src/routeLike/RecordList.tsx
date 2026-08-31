import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useWebHaptics } from 'web-haptics/react'

import { Save } from '@/assets/Save'
import { Trash } from '@/assets/Trash'
import { RecordCard } from '@/components/list/RecordCard'
import { EmptyRecords } from '@/components/misc/EmptyRecords'
import { StyledButton } from '@/components/misc/StyledButton'
import { deleteRecord, updateRecord, useRecords } from '@/hooks/records'
import { useScrobbler } from '@/hooks/scrobble'
import { groupSortRecords } from '@/processors/recordsList'
import type { RecordType } from '@/db/schema'
import type { ScrobblingRequest } from '@/types/api'

import { RecordView } from '../components/list/RecordView'
import { Loading } from '../components/misc/Loading'
import { Modal } from '../components/Modal'

export function RecordList({
	titleClicked,
	setSpecialText,
}: {
	titleClicked: boolean
	setSpecialText: Dispatch<SetStateAction<boolean>>
}) {
	const { trigger: haptics } = useWebHaptics()

	const [recordIndex, setRecordIndex] = useState(0)
	const [recordViewOpen, setRecordViewOpen] = useState(false)
	const [updatedSides, setUpdatedSides] = useState<RecordType['sides']>([])
	const [selectedScrobbles, setSelectedScrobbles] = useState<ScrobblingRequest>([])

	const [IDToIndexMap, setIDToIndexMap] = useState<Map<number, number>>(new Map())
	const { records, isLoading } = useRecords()
	const { scrobble } = useScrobbler(() => {
		setSpecialText(false)
		void haptics('success')
		setSelectedScrobbles([])
	})
	const { triggerDeletion, isDeleting } = deleteRecord(() => {
		setRecordViewOpen(false)
		setRecordIndex(0)
	})
	const { triggerUpdate, isUpdating } = updateRecord(() => {
		setRecordViewOpen(false)
		setRecordIndex(0)
	})
	useEffect(() => {
		if (records[recordIndex]) setUpdatedSides([...records[recordIndex].sides])
	}, [records, recordIndex])


	useEffect(() => {
		if (selectedScrobbles.length > 0) {
			void scrobble(selectedScrobbles)
		}
	}, [titleClicked])
	useEffect(() => {
		if (selectedScrobbles.length > 0) setSpecialText(true)
		else setSpecialText(false)
	}, [selectedScrobbles.length])
	useEffect(() => {
		if (!isLoading && !isDeleting && !isUpdating && records) {
			setIDToIndexMap(new Map(records.map((e, index) => [e.discogs_id, index])))
		}
	}, [records, isLoading, isDeleting, isUpdating])

	if (isLoading || isDeleting || isUpdating) return <Loading />
	if (records.length === 0) return <EmptyRecords />
	function updateColor(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>, side: string) {
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
				const index = records[rIndex].sides.findIndex((e) => updated.label === e.label)
				if (index !== -1 && records[rIndex].sides[index]) {
					records[rIndex].sides[index].color = updated.color
				}
			}
			void triggerUpdate({
				record_id: records[rIndex]?.discogs_id ?? -1,
				data: records[rIndex],
			})
			void haptics('success')
		}
	}
	function updateSelectedScrobbles(scrobble: ScrobblingRequest[number]) {
		const oldIndex = selectedScrobbles.findIndex((e) => e.discogs_id === scrobble.discogs_id)
		if (oldIndex === -1) {
			setSelectedScrobbles([...selectedScrobbles, scrobble])
		} else {
			const old = selectedScrobbles[oldIndex] as ScrobblingRequest[number] // positive search
			let newSides: string[] = []
			if (scrobble.sides.length > 1) {
				if (scrobble.sides.length !== old.sides.length) {
					// same length: toggling the album: remove everything
					// or the album cover was clicked: concatenate without dupes
					newSides = Array.from(new Set(scrobble.sides).union(new Set(old.sides)))
				}
			} else {
				// it's a singleton meaning: toggle (add/remove)
				newSides = old.sides.filter((e) => e !== scrobble.sides[0])
			}
			if (newSides.length === old.sides.length) newSides.push(scrobble.sides[0] as string)

			const toPush = [...selectedScrobbles.filter((_, i) => i !== oldIndex)]
			if (newSides.length > 0)
				toPush.push({
					discogs_id: scrobble.discogs_id,
					sides: newSides,
				})
			setSelectedScrobbles(toPush)
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
							onClick={async () => {
								void triggerDeletion(records[recordIndex]?.discogs_id ?? -1)
								void haptics('success')
							}}>
							<Trash />
							DELETE!
						</StyledButton>
						<StyledButton color='#16A34A' onClick={() => requestRecordUpdate(recordIndex)}>
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
							<div className='px-2 text-black/40 text-center font-mono'>
								{recordsGroup[0]?.artist.split('').map((a) => `${a.toUpperCase()} `)}
							</div>
							<div className='border border-black/40 h-0 grow mr-6' />
						</div>
						{recordsGroup.map((record) => (
							<RecordCard
								onScrobblableClick={updateSelectedScrobbles}
								key={record.discogs_id}
								record={record}
								onInfoClick={() => {
									setRecordIndex(IDToIndexMap.get(record.discogs_id) ?? -1)
									setRecordViewOpen(true)
									void haptics('heavy')
								}}
							/>
						))}
					</>
				)
			})}
		</div>
	)
}
