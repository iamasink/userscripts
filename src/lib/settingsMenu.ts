import { waitForElement } from "./util"

type BaseOption<T> = {
	label: string
	defaultValue: T
	onChange?: (newValue: T) => void
}

export type SettingOption =
	| (BaseOption<boolean> & { type: 'checkbox' })
	| (BaseOption<number> & { type: 'number'; step?: number; min?: number; max?: number })
	| (BaseOption<string> & { type: 'text' })
	| (BaseOption<string> & { type: 'select'; choices: string[] })
	| { type: 'spacer' }

const SHARED_POPUP_ID = 'sinkusoption-popup'
const SHARED_CONTAINER_ID = 'sinkusoption-container'
const SHARED_COG_ID = 'sinkusoption-cog'


export function addSettingsMenu(
	SCRIPT_SHORTNAME: string,
	SCRIPT_NAME = SCRIPT_SHORTNAME,
	options: SettingOption[],
	ownerElement: string = '#owner',
	location: "above" | "below" = "below",
) {

	function getGmKey(label: string) {
		return `sinkusoption-${SCRIPT_SHORTNAME}-${label.toLowerCase().replace(/\s+/g, '-')}`
	}

	async function ensureOptionsMenu(): Promise<HTMLElement | null> {
		// maybe scuffed i do not care
		let popup = await waitForElement('#sinkusoption-popup', 100, 1000)
		if (popup) return popup

		const owner = (await waitForElement(ownerElement, 100, 5000))
		if (!owner) return null

		let container = document.getElementById(SHARED_CONTAINER_ID)
		if (!container) {
			container = document.createElement('div')
			container.id = SHARED_CONTAINER_ID
			container.style.margin = 'auto'
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
				marginRight: '8px',
				marginLeft: '8px'
			})
			container.appendChild(cog)

			popup = document.createElement('div')
			popup.id = SHARED_POPUP_ID
			Object.assign(popup.style, {
				display: 'none',
				position: 'absolute',
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

			switch (location) {
				case "below": {
					Object.assign(popup.style, {
						top: '100%',

					})
					break
				}
				case "above": {
					Object.assign(popup.style, {
						bottom: '100%',

					})
					break
				}
			}
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
			closebutton.addEventListener('click', (e) => {
				popup!.style.display = 'none'
				e.preventDefault()
				e.stopImmediatePropagation()
			})

			const info = document.createElement("p")
			info.textContent = `sinkussettings-${SCRIPT_SHORTNAME}`
			Object.assign(info.style, {
				color: "#66666680"
			})
			popup.appendChild(info)


			cog.addEventListener('click', (e) => {
				popup!.style.display = popup!.style.display === 'none' ? 'block' : 'none'
				e.preventDefault()
				e.stopImmediatePropagation()
			})
			popup.addEventListener("click", (e) => {
				// prevent interaction with the page
				e.stopPropagation()
			})
		}

		return popup as HTMLElement | null
	}

	async function ensureScriptSection(): Promise<HTMLElement | null> {
		const popup = await ensureOptionsMenu()
		if (!popup) return null

		const sectionId = `sinkusoption-section-${SCRIPT_SHORTNAME}`
		const existing = document.getElementById(sectionId)
		if (existing) return existing

		const hr = document.createElement('hr')
		Object.assign(hr.style, { border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' })
		popup.appendChild(hr)

		const section = document.createElement('div')
		section.id = sectionId
		section.style.marginBottom = '6px'

		const header = document.createElement('h4')
		header.textContent = SCRIPT_NAME
		Object.assign(header.style, { margin: '0 0 6px 0', fontSize: '15px' })
		section.appendChild(header)

		const content = document.createElement('div')
		content.className = `sinkusoption-section-content-${SCRIPT_SHORTNAME}`
		section.appendChild(content)

		// alphabetica
		const existingSections = Array.from(popup.querySelectorAll<HTMLElement>('div[id^="sinkusoption-section-"]'))
		const insertBefore = existingSections.find(s => {
			const h = s.querySelector('h4')?.textContent ?? ''
			return SCRIPT_NAME.localeCompare(h, undefined, { sensitivity: 'base' }) < 0
		})

		if (insertBefore) {
			popup.insertBefore(section, insertBefore)
		} else {
			popup.appendChild(section)
		}

		const allSections = Array.from(popup.querySelectorAll<HTMLElement>('div[id^="sinkusoption-section-"]'))
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

		const content = section.querySelector<HTMLElement>(`.sinkusoption-section-content-${SCRIPT_SHORTNAME}`)!

		if (opt.type === 'spacer') {
			const spacer = document.createElement('div')
			spacer.style.height = '10px'
			content.appendChild(spacer)
			return
		}

		const gmKey = getGmKey(opt.label)
		let value: boolean | number | string = opt.defaultValue
		if (opt.type === 'checkbox') value = GM_getValue(gmKey, (opt as any).defaultValue)
		else if (opt.type === 'number') value = parseFloat(GM_getValue(gmKey, (opt as any).defaultValue.toString()))
		else value = GM_getValue(gmKey, (opt as any).defaultValue)

		const wrapper = document.createElement('label')
		wrapper.style.display = 'block'
		wrapper.style.marginBottom = '6px'

		let input: HTMLInputElement | HTMLSelectElement
		if (opt.type === 'checkbox') {
			input = document.createElement('input') as HTMLInputElement
			input.type = 'checkbox';
			input.checked = value as boolean
		} else if (opt.type === 'number') {
			input = document.createElement('input') as HTMLInputElement
			input.type = 'number';
			input.value = value.toString()
			input.style.width = '70px'
			if (opt.step !== undefined) input.step = String(opt.step)
			if (opt.min !== undefined) input.min = String(opt.min)
			if (opt.max !== undefined) input.max = String(opt.max)
		} else if (opt.type === 'text') {
			input = document.createElement('input') as HTMLInputElement
			input.type = 'text';
			input.value = value.toString()
			input.style.width = '100%'
		} else if (opt.type === "select") {
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
		} else {
			//unknown
			const unknownOpt = opt as { type?: unknown }
			console.error(`[iamasink userscript settings] unknown opt.type ${unknownOpt.type} !!`)
			return
		}

		input.addEventListener('change', (e) => {
			let newVal: boolean | number | string
			if (opt.type === 'checkbox') newVal = (e.target as HTMLInputElement).checked
			else if (opt.type === 'number') newVal = parseFloat((e.target as HTMLInputElement).value)
			else newVal = (e.target as HTMLInputElement | HTMLSelectElement).value
			GM_setValue(gmKey, newVal)

			if (opt.onChange) {
				(opt.onChange as (value: any) => void)(newVal)
			}
		})

		wrapper.appendChild(input)
		wrapper.append(' ' + opt.label)
		content.appendChild(wrapper)
	}

	function getSetting(label: string): boolean | number | string | undefined {
		const opt = options.find(o => 'label' in o && o.label === label)
		if (!opt || opt.type === 'spacer') {
			console.warn(`[iamasink userscript settings] getSetting: no setting found with label "${label}"`)
			return undefined
		}
		const gmKey = getGmKey(opt.label)
		try {
			// if (opt.type === 'checkbox') return GM_getValue(gmKey, opt.defaultValue)
			if (opt.type === 'number') return parseFloat(GM_getValue(gmKey, opt.defaultValue.toString()))
			return GM_getValue(gmKey, opt.defaultValue)
		} catch {
			return opt.defaultValue
		}
	}

	function setSetting(label: string, value: boolean | number | string): void {
		const opt = options.find(o => 'label' in o && o.label === label)
		if (!opt || opt.type === 'spacer') {
			console.warn(`[iamasink userscript settings] setSetting: no setting found with label "${label}"`)
			return
		}
		GM_setValue(getGmKey(label), value)

		const section = document.getElementById(`sinkusoption-section-${SCRIPT_SHORTNAME}`)
		if (!section) return
		const content = section.querySelector<HTMLElement>(`.sinkusoption-section-content-${SCRIPT_SHORTNAME}`)
		if (!content) return

		const labels = Array.from(content.querySelectorAll('label'))
		const wrapper = labels.find(l => l.textContent?.trim().endsWith(label))
		if (!wrapper) return

		const input = wrapper.querySelector<HTMLInputElement | HTMLSelectElement>('input, select')
		if (!input) return

		if (input instanceof HTMLInputElement && input.type === 'checkbox') {
			input.checked = value as boolean
		} else {
			input.value = String(value)
		}
	}

	if (!document.getElementById(`sinkusoption-section-${SCRIPT_SHORTNAME}`)) {
		options.forEach(addOption)
	}

	return { getSetting, setSetting }
}