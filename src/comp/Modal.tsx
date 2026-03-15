import { Dialog, DialogPanel, TransitionChild } from '@headlessui/react'
import type { Dispatch, SetStateAction } from 'react'

export function Modal({
	children,
	onClose,
	modalState: { isOpen },
}: {
	children: React.ReactNode
	onClose: () => void
	modalState: { isOpen: boolean; setOpen: Dispatch<SetStateAction<boolean>> }
}) {
	return (
		<Dialog
			open={isOpen}
			transition
			className='relative z-10 focus:outline-none'
			onClose={onClose}>
			<div className='fixed inset-0 z-10 w-screen overflow-y-auto pt-40 p-2 pb-0'>
				<TransitionChild>
					<div className='flex min-h-full w-full pt-10 p-4 bg-[#f5f5f4] border rounded-4xl shadow-all-xl shadow-black/20 border-white border-b-0 rounded-b-none transition ease-out duration-300 data-closed:translate-y-full data-closed:opacity-0 will-change-transform'>
						<DialogPanel className='w-full rounded-xl'>
							<div className='w-full flex flex-wrap items-center'>
								{children}
							</div>
						</DialogPanel>
					</div>
				</TransitionChild>
			</div>
		</Dialog>
	)
}
