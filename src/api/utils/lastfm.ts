import { MD5 } from 'bun'

export function build_sig(secret: string, params: [string, string | number][]) {
	let acc = ''
	for (const [key, val] of params) {
		acc = `${acc}${key}${val}`
	}
	acc = acc + secret
	return Buffer.from(MD5.hash(acc).buffer).toHex()
}
