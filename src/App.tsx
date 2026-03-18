import './index.css'

import { BarcodeDetector } from 'barcode-detector'
import { type ChangeEvent, useRef, useState } from 'react'
import AddRecord from './routeLike/AddRecord'
import { RecordList } from './routeLike/RecordList'

export function App() {
	const [addOpen, setAddOpen] = useState(false)
	const [currentBarCode, setCurrentBarCode] = useState('')
	// we need a way to notify to the user that there is queued tracks to be scrobbled
	// i personnally don't care about a recap panel and just need a quick way to know if it succeeded
	// otherwise we could include a small modal that just maps record to record title and sides
	// i have no use for it tho
	const [titleClicked, setTitleClicked] = useState(false)
	const [titleUnderline, setTitleUnderline] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const openFilePicker = () => {
		fileInputRef.current?.click()
	}
	const handleFileUpload = async (
		event: ChangeEvent<HTMLInputElement, HTMLInputElement>,
	) => {
		const barc = new BarcodeDetector()
		if (event.target.files?.[0]) {
			const b = await barc.detect(event.target.files[0])

			if (b.length !== 1) {
				alert('Please input exactly 1 barcode!')
			} else {
				const code = b[0]
				setCurrentBarCode(code?.rawValue ?? '')
				setAddOpen(true)
			}
		}
		event.target.value = ''
	}
	return (
		<div className='max-w-7xl mx-auto px-2 bg-card mb-10'>
			<div className='text-5xl font-bold my-4 leading-tight flex flex-row items-center '>
				<button
					className='mr-auto'
					type='submit'
					onClick={() => setTitleClicked(!titleClicked)}>
					Erat
					<span className=''>{`${!titleUnderline ? 'o' : 'o*'}`}</span>
				</button>
				<div
					className='font-normal flex flex-row text-3xl' /*onClick={() => setAddOpen(true)}*/
				>
					<input
						type='file'
						className='opacity-0 fixed top-0'
						ref={fileInputRef}
						onChange={handleFileUpload}
					/>
					<button
						className='inline'
						type='button'
						onClick={openFilePicker}>
						+
					</button>
				</div>
				<AddRecord
					setAddOpen={setAddOpen}
					addOpen={addOpen}
					barcode={currentBarCode}
				/>
			</div>
			<RecordList
				titleClicked={titleClicked}
				setSpecialText={setTitleUnderline}
			/>
		</div>
	)
}
