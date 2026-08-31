import './index.css'
import './thingy.css'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BarcodeDetector } from 'barcode-detector'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { Keyboard } from './assets/Keyboard'
import { UploadImage } from './assets/UploadImage'
import AddRecord from './routeLike/AddRecord'
import { RecordList } from './routeLike/RecordList'

export function App() {
	const [addOpen, setAddOpen] = useState(false)
	const [currentSearch, setCurrentSearch] = useState<['barcode' | 'release', string]>(['barcode', ''])
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
	const handleFileUpload = async (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
		const barc = new BarcodeDetector()
		if (event.target.files?.[0]) {
			const b = await barc.detect(event.target.files[0])

			if (b.length !== 1) {
				alert('Please input exactly 1 barcode!')
			} else {
				const code = b[0]
				setCurrentSearch(['barcode', code?.rawValue ?? ''])
				setAddOpen(true)
			}
		}
		event.target.value = ''
	}
	return (
		<div className='max-w-7xl mx-auto px-2 bg-card mb-10'>
			<input type='file' className='opacity-0 fixed top-0' ref={fileInputRef} onChange={handleFileUpload} />
			<div className='text-5xl font-bold my-4 leading-tight flex flex-row items-center '>
				<button className='mr-auto' type='submit' onClick={() => setTitleClicked(!titleClicked)}>
					Erat
					<span className=''>{!titleUnderline ? 'o' : 'o*'}</span>
				</button>
				<Menu>
					<MenuButton className={'outline-0'}>
						<div className='font-normal flex flex-row text-3xl' /*onClick={() => setAddOpen(true)}*/>+</div>
					</MenuButton>
					<MenuItems
						transition
						anchor='bottom end'
						className={
							'outline-0 flex flex-col bg-[#E5E5EA] py-2 shadow-lg shadow-black/30 ease-in-out transition duration-200 data-closed:opacity-0 rounded-2xl border border-white '
						}>
						<MenuItem as='div' className={'px-2'}>
							<div className='flex flex-row'>
								<UploadImage />
								<button className='ml-2 inline' type='button' onClick={openFilePicker}>
									Upload Image
								</button>
							</div>
						</MenuItem>
						<div className='w-full border-white border my-2'></div>
						<MenuItem as='div' className={'px-2'}>
							<button
								type='button'
								className='flex flex-row'
								onClick={() => {
									const res = prompt('Record to search for')
									if (res) {
										setCurrentSearch(['release', res])
										setAddOpen(true)
									}
								}}>
								<Keyboard />
								<span className='ml-2'>Search Name</span>
							</button>
						</MenuItem>
					</MenuItems>
				</Menu>

				<AddRecord setAddOpen={setAddOpen} addOpen={addOpen} search={currentSearch} />
			</div>
			<RecordList titleClicked={titleClicked} setSpecialText={setTitleUnderline} />
		</div>
	)
}
