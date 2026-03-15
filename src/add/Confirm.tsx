import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useState,
} from 'react'
import { useWebHaptics } from 'web-haptics/react'
import { ArrowLeft, ArrowRight } from '@/assets/Arrow'
import { Loading } from '@/comp/Loading'
import { RecordView } from '@/comp/RecordView'
import { useFetch } from '@/hooks/fetch'
import { mutateRecords } from '@/hooks/records'
import { Stage } from '../AddRecord'

export function Confirm({
	record_id,
	setStage,
}: {
	record_id: number
	setStage: Dispatch<SetStateAction<Stage>>
}) {
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
		trigger('success')
		for (const updated of updatedSides) {
			const index = record.sides.findIndex(
				(e) => updated.label === e.label,
			)
			if (index !== -1 && record.sides[index]) {
				record.sides[index].color = updated.color
			}
		}
		save(record)
	}
	useEffect(() => {
		if (record) setUpdatedSides([...record.sides])
	}, [record])
	if (!record || isLoading) return <Loading />

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
		<div className='w-full'>
			<RecordView
				record={record}
				updateColor={updateColor}
				controlledSides={updatedSides}>
				<div className='mt-2 flex w-full'>
					<button
						className={
							'p-2 bg-red-600/45 border-red-600 text-red-600 flex mr-auto  items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
						}
						type='button'
						onClick={() => {
							setStage(Stage.LIST)
							trigger('success')
						}}>
						<ArrowLeft />
						{'Cancel'}
					</button>
					<button
						className={
							'p-2 flex bg-green-600/45 border-green-600 text-green-600 items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl'
						}
						type='button'
						onClick={saveButton}>
						{'Save'}
						<ArrowRight />
					</button>
				</div>
			</RecordView>
		</div>
	)
}
