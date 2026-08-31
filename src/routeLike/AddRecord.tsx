import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { Confirm } from '../components/add/Confirm'
import { List } from '../components/add/List'
import { Modal } from '../components/Modal'

export enum Stage {
	LIST,
	CONFIRM,
	DONE,
}
export default function AddRecord({
	addOpen,
	setAddOpen,
	search,
}: {
	addOpen: boolean
	setAddOpen: Dispatch<SetStateAction<boolean>>
	search: ['barcode' | 'release', string]
}) {
	const [currentRecordID, setCurrentRecordID] = useState(-1)
	const [stage, setStage] = useState<Stage>(Stage.LIST)

	useEffect(() => {
		if (currentRecordID < 0) return
		setStage(Stage.CONFIRM)
	}, [currentRecordID])
	// biome-ignore lint/correctness/useExhaustiveDependencies(setAddOpen): setAddOpen is not a value
	useEffect(() => {
		if (stage === Stage.DONE) {
			setCurrentRecordID(-1)
			setAddOpen(false)
			setStage(Stage.LIST)
		}
	}, [stage])
	return (
		<Modal
			modalState={{ isOpen: addOpen, setOpen: setAddOpen }}
			onClose={() => {
				setAddOpen(false)
				setCurrentRecordID(-1)
				setStage(Stage.LIST)
			}}>
			{stage === Stage.LIST && <List search={search} setCurrentRecordID={setCurrentRecordID} />}
			{stage === Stage.CONFIRM && <Confirm setStage={setStage} record_id={currentRecordID} />}
		</Modal>
	)
}
