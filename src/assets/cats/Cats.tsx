import Cat0 from './cat-0.JPG'
import Cat1 from './cat-1.JPG'
import Cat2 from './cat-2.JPG'
import Cat3 from './cat-3.JPG'
import Cat4 from './cat-4.JPG'
import Cat5 from './cat-5.JPG'
import Cat6 from './cat-6.JPG'
import Cat7 from './cat-7.JPG'
export function Cats({ cat, className }: { className: string; cat: number }) {
	const catss = [Cat0, Cat1, Cat2, Cat3, Cat4, Cat5, Cat6, Cat7]
	return <img className={className} src={catss[cat % catss.length]} alt="cat" />
}
