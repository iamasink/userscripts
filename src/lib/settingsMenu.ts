import { waitForElement } from "./util"

export type SettingOption =
	| { label: string; type: 'checkbox'; defaultValue: boolean }
	| { label: string; type: 'number'; defaultValue: number; step?: number; min?: number; max?: number }
	| { label: string; type: 'text'; defaultValue: string }
	| { label: string; type: 'select'; defaultValue: string; choices: string[] }
	| { type: 'spacer' }

const SHARED_POPUP_ID = 'sinkusoption-popup'
const SHARED_CONTAINER_ID = 'sinkusoption-container'
const SHARED_COG_ID = 'sinkusoption-cog'


export function addSettingsMenu(
	SCRIPT_SHORTNAME: string,
	SCRIPT_NAME = SCRIPT_SHORTNAME,
	options: SettingOption[],
	ownerElement: string = '#owner'
) {
	async function ensureOptionsMenu(): Promise<HTMLElement | null> {
		// maybe scuffed i do not care
		let popup = await waitForElement('#sinkusoption-popup', 100, 5000)
		if (popup) return popup

		const owner = (await waitForElement(ownerElement))
		if (!owner) return null

		let container = document.getElementById(SHARED_CONTAINER_ID)
		if (!container) {
			container = document.createElement('div')
			container.id = SHARED_CONTAINER_ID
			container.style.marginTop = '8px'
			container.style.position = 'relative'
			owner.appendChild(container)

			const cog = document.createElement('button')
			cog.id = SHARED_COG_ID
			cog.textContent = '⚙'
			Object.assign(cog.style, {
				fontSize: '16px',
				padding: '4px 8px',
				background: 'rgba(0,0,0,0.8)',
				color: '#fff',
				border: 'none',
				borderRadius: '4px',
				cursor: 'pointer',
				width: '40px',
				height: '36px',
				marginRight: '8px'
			})
			container.appendChild(cog)

			popup = document.createElement('div')
			popup.id = SHARED_POPUP_ID
			Object.assign(popup.style, {
				display: 'none',
				position: 'absolute',
				top: '100%',
				left: '0',
				marginTop: '4px',
				padding: '12px',
				background: 'rgba(0,0,0,0.95)',
				color: '#fff',
				borderRadius: '6px',
				minWidth: '260px',
				fontSize: '14px',
				boxShadow: '0 0 8px rgba(0,0,0,0.7)',
				zIndex: '9999',
			})
			container.appendChild(popup)

			const closebutton = document.createElement('button')
			closebutton.textContent = 'x'
			Object.assign(closebutton.style, {
				fontSize: '14px',
				padding: '4px 8px',
				color: '#fff',
				background: 'rgba(0,0,0,0.6)',
				border: 'none',
				borderRadius: '4px',
				cursor: 'pointer',
				position: 'absolute',
				top: '6px',
				right: '6px'
			})
			popup.appendChild(closebutton)
			closebutton.addEventListener('click', () => { popup!.style.display = 'none' })

			cog.addEventListener('click', () => {
				popup!.style.display = popup!.style.display === 'none' ? 'block' : 'none'
			})
		}

		return popup as HTMLElement | null
	}

	async function ensureScriptSection(): Promise<HTMLElement | null> {
		const popup = await ensureOptionsMenu()
		if (!popup) return null

		const sectionId = `sinkusoption-section-${SCRIPT_SHORTNAME}`
		let section = document.getElementById(sectionId)
		if (section) return section

		const hr = document.createElement('hr')
		Object.assign(hr.style, { border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' })
		popup.appendChild(hr)

		section = document.createElement('div')
		section.id = sectionId
		section.style.marginBottom = '6px'

		const header = document.createElement('h4')
		header.textContent = SCRIPT_NAME
		Object.assign(header.style, { margin: '0 0 6px 0', fontSize: '15px' })
		section.appendChild(header)

		const content = document.createElement('div')
		content.className = `sinkusoption-section-content-${SCRIPT_SHORTNAME}`
		section.appendChild(content)

		const existingSections = Array.from(popup.querySelectorAll<HTMLElement>('div[id^="sinkus-section-"]'))
		const index = existingSections.findIndex(s => {
			const h = s.querySelector('h4')?.textContent ?? ''
			return h.localeCompare(SCRIPT_NAME, undefined, { sensitivity: 'base' }) > 0
		})

		if (index === -1) {
			popup.appendChild(section)
		} else {
			popup.insertBefore(section, existingSections[index])
		}

		const allSections = Array.from(popup.querySelectorAll<HTMLElement>('div[id^="sinkus-section-"]'))
		allSections.forEach((sec, i) => {
			if (i === 0) sec.style.borderTop = 'none'
			else sec.style.borderTop = '1px solid rgba(255,255,255,0.08)'
			sec.style.paddingTop = '8px'
		})
		return section
	}

	async function addOption(opt: SettingOption) {
		const section = await ensureScriptSection()
		if (!section) return
		if (opt.type === 'spacer') {
			const spacer = document.createElement('div')
			spacer.style.height = '10px'
			section.querySelector('div')!.appendChild(spacer)
			return
		}

		const gmKey = `sinkusoption-${SCRIPT_SHORTNAME}-${opt.label.toLowerCase().replace(/\s+/g, '-')}`

		let value: boolean | number | string = (opt as any).defaultValue
		if (opt.type === 'checkbox') value = GM_getValue(gmKey, (opt as any).defaultValue)
		else if (opt.type === 'number') value = parseFloat(GM_getValue(gmKey, (opt as any).defaultValue.toString()))
		else value = GM_getValue(gmKey, (opt as any).defaultValue)

		const wrapper = document.createElement('label')
		wrapper.style.display = 'block'
		wrapper.style.marginBottom = '6px'

		let input: HTMLInputElement | HTMLSelectElement
		if (opt.type === 'checkbox') {
			input = document.createElement('input')
			input.type = 'checkbox';
			(input as HTMLInputElement).checked = value as boolean
		} else if (opt.type === 'number') {
			input = document.createElement('input')
			input.type = 'number';
			(input as HTMLInputElement).value = (value as number).toString()
			input.style.width = '70px'
			if ('step' in opt && opt.step !== undefined) (input as HTMLInputElement).step = String(opt.step)
			if ('min' in opt && opt.min !== undefined) (input as HTMLInputElement).min = String(opt.min)
			if ('max' in opt && opt.max !== undefined) (input as HTMLInputElement).max = String(opt.max)
		} else if (opt.type === 'text') {
			input = document.createElement('input')
			input.type = 'text';
			(input as HTMLInputElement).value = String(value)
			input.style.width = '100%'
		} else { // select
			const select = document.createElement('select')
			opt.choices.forEach(choice => {
				const optionEl = document.createElement('option')
				optionEl.value = choice
				optionEl.textContent = choice
				if (choice === value) optionEl.selected = true
				select.appendChild(optionEl)
			})
			input = select
			input.style.minWidth = '120px'
		}

		input.addEventListener('change', (e) => {
			let newVal: boolean | number | string
			if (opt.type === 'checkbox') newVal = (e.target as HTMLInputElement).checked
			else if (opt.type === 'number') newVal = parseFloat((e.target as HTMLInputElement).value)
			else newVal = (e.target as HTMLInputElement | HTMLSelectElement).value
			GM_setValue(gmKey, newVal)
		})

		const content = section.querySelector('div')!
		wrapper.appendChild(input)
		wrapper.append(' ' + opt.label)
		content.appendChild(wrapper)
	}

	options.forEach(addOption)

	function getSetting(label: string): boolean | number | string | undefined {
		const gmKey = `sinkusoption-${SCRIPT_SHORTNAME}-${label.toLowerCase().replace(/\s+/g, '-')}`
		const opt = options.find(o => 'label' in o && (o as any).label === label) as SettingOption | undefined
		if (!opt) throw new Error(`Setting not found: ${label}`)
		try {
			if (opt.type === 'checkbox') return GM_getValue(gmKey, (opt as any).defaultValue)
			if (opt.type === 'number') return parseFloat(GM_getValue(gmKey, (opt as any).defaultValue.toString()))
			return GM_getValue(gmKey, (opt as any).defaultValue)
		} catch {
			return (opt as any).defaultValue
		}
	}

	return { getSetting }
}
