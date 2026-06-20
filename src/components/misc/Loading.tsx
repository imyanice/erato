import RecordImage from '../../assets/record.png'
export function Loading() {
	return (
		<div className="h-full w-full flex items-center justify-center">
			<img className="animate-spin h-32" alt="spinning record" src={RecordImage} />
		</div>
	)
}
