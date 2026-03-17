import './index.css'

import { BarcodeDetector } from 'barcode-detector'
import { type ChangeEvent, useRef, useState } from 'react'
import AddRecord from './routeLike/AddRecord'
import { RecordList } from './routeLike/RecordList'

export function App() {
	const [addOpen, setAddOpen] = useState(false)
	const [currentBarCode, setCurrentBarCode] = useState('')
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
			<div className='text-5xl font-bold my-4 leading-tight flex flex-row items-center'>
				<span className='mr-auto'>Erato</span>
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
			<RecordList />
		</div>
	)
}
