import React, { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { useWebHaptics } from 'web-haptics/react'

import { ArrowLeft, ArrowRight } from '@/assets/Arrow'
import { RecordView } from '@/components/list/RecordView'
import { Loading } from '@/components/misc/Loading'
import { useFetch } from '@/hooks/fetch'
import { mutateRecords } from '@/hooks/records'

import { Stage } from '../../routeLike/AddRecord'
import { StyledButton } from '../misc/StyledButton'

export function Confirm({ record_id, setStage }: { record_id: number; setStage: Dispatch<SetStateAction<Stage>> }) {
	const { trigger } = useWebHaptics()
	const { trigger: save } = mutateRecords(() => setStage(Stage.DONE))
	const { record, isLoading } = useFetch(record_id)
	const [updatedSides, setUpdatedSides] = useState<
		{
			label: string
			color: string
			tracks: { position: string; name: string }[]
		}[]
	>([])

	function saveButton() {
		if (!record) return
		void trigger('success')
		for (const updated of updatedSides) {
			const index = record.sides.findIndex((e) => updated.label === e.label)
			if (index !== -1 && record.sides[index]) {
				record.sides[index].color = updated.color
			}
		}
		void save(record)
	}
	useEffect(() => {
		if (record) setUpdatedSides([...record.sides])
	}, [record])
	if (!record || isLoading) return <Loading />

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
	return (
		<div className='w-full'>
			<RecordView record={record} updateColor={updateColor} controlledSides={updatedSides}>
				<div className='mt-2 flex w-full'>
					<StyledButton
						color='#DC2626'
						className='mr-auto'
						onClick={() => {
							setStage(Stage.LIST)
							void trigger('success')
						}}>
						<ArrowLeft />
						{'Cancel'}
					</StyledButton>
					<StyledButton onClick={saveButton} color='#16A34A'>
						{'Save'}
						<ArrowRight />
					</StyledButton>
				</div>
			</RecordView>
		</div>
	)
}
