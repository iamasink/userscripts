export function waitForElement(selector: string, interval = 100, timeout = 5000): Promise<HTMLElement | null> {
	return new Promise(resolve => {
		const start = Date.now()
		const check = () => {
			const el = document.querySelector<HTMLElement>(selector)
			if (el) return resolve(el)
			if (Date.now() - start > timeout) return resolve(null)
			setTimeout(check, interval)
		}
		check()
	})
}