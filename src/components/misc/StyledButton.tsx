export function StyledButton({
	color,
	onClick,
	children,
	className = '',
}: {
	color: string
	onClick: () => void
	children: React.ReactNode
	className?: string
}) {
	return (
		<button
			style={{
				backgroundColor: `${color}2D`,
				borderColor: color,
				color: color,
			}}
			className={`p-2 flex items-center justify-center h-9 active:scale-z-80 border-b-5 border-2 active:border-b-2 rounded-xl ${className}`}
			type='button'
			onClick={onClick}>
			{children}
		</button>
	)
}
