export type SettingOption =
	| { label: string; type: 'checkbox'; defaultValue: boolean }
	| { label: string; type: 'number'; defaultValue: number; step?: number; min?: number; max?: number }
	| { label: string; type: 'text'; defaultValue: string }
	| { label: string; type: 'select'; defaultValue: string; choices: string[] }
	| { type: 'spacer' }

export function addSettingsMenu(
	SCRIPT_SHORTNAME: string,
	SCRIPT_NAME = SCRIPT_SHORTNAME,
	options: SettingOption[]
) {
	function ensureOptionsMenu(): HTMLElement | null {
		let popup = document.getElementById('sinkusoption-popup')
		if (popup) return popup

		const owner = document.getElementById('owner')
		if (!owner) return null

		const container = document.createElement('div')
		container.style.marginTop = '8px'
		container.style.position = 'relative'
		owner.appendChild(container)

		const cog = document.createElement('button')
		cog.textContent = '⚙'
		Object.assign(cog.style, {
			fontSize: '16px',
			padding: '4px 8px',
			background: 'rgba(0,0,0,0.8)',
			color: '#fff',
			border: 'none',
			borderRadius: '4px',
			cursor: 'pointer',
			width: "40px",
			height: "36px",
			marginRight: "8px",
		})

		container.appendChild(cog)

		popup = document.createElement('div')
		popup.id = 'sinkusoption-popup'
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
			minWidth: '220px',
			fontSize: '14px',
			boxShadow: '0 0 8px rgba(0,0,0,0.7)',
			zIndex: '9999',
		})
		container.appendChild(popup)

		const closebutton = document.createElement('button')
		closebutton.textContent = 'x'
		Object.assign(closebutton.style, {
			fontSize: '16px',
			padding: '4px 8px',
			color: '#fff',
			background: 'rgba(0,0,0,0.6)',
			border: 'none',
			borderRadius: '4px',
			cursor: 'pointer',
			position: 'absolute',
			top: '4px',
			right: '4px'
		})

		popup.appendChild(closebutton)
		closebutton.addEventListener('click', () => {
			popup!.style.display = 'none'
		})

		const header = document.createElement('h3')
		header.textContent = SCRIPT_NAME
		header.style.margin = '0 0 6px 0'
		header.style.fontSize = '16px'
		popup.appendChild(header)

		cog.addEventListener('click', () => {
			popup!.style.display = popup!.style.display === 'none' ? 'block' : 'none'
		})

		return popup
	}

	function addOption(opt: SettingOption) {
		const popup = ensureOptionsMenu()
		if (!popup) return
		if (opt.type === 'spacer') {
			const spacer = document.createElement('div')
			spacer.style.height = '12px'
			popup.appendChild(spacer)
			return
		}

		const gmKey = `sg-${opt.label.toLowerCase().replace(/\s+/g, '-')}`

		let value: boolean | number | string = opt.defaultValue
		// load saved value
		if (opt.type === 'checkbox') value = GM_getValue(gmKey, opt.defaultValue)
		else if (opt.type === 'number') value = parseFloat(GM_getValue(gmKey, opt.defaultValue.toString()))
		else value = GM_getValue(gmKey, opt.defaultValue)

		const wrapper = document.createElement('label')
		wrapper.style.display = 'block'

		let input: HTMLInputElement | HTMLSelectElement
		switch (opt.type) {
			case 'checkbox':
				input = document.createElement('input')
				input.type = 'checkbox'
				input.checked = value as boolean
				break
			case 'number':
				input = document.createElement('input')
				input.type = 'number'
				input.value = (value as number).toString()
				input.style.width = '60px'
				if ('step' in opt && opt.step !== undefined) input.step = opt.step.toString()
				if ('min' in opt && opt.min !== undefined) input.min = opt.min.toString()
				if ('max' in opt && opt.max !== undefined) input.max = opt.max.toString()
				break
			case 'text':
				input = document.createElement('input')
				input.type = 'text'
				input.value = value as string
				input.style.width = '100%'
				break
			case 'select':
				const select = document.createElement('select')
				opt.choices.forEach(choice => {
					const optionEl = document.createElement('option')
					optionEl.value = choice
					optionEl.textContent = choice
					if (choice === value) optionEl.selected = true
					select.appendChild(optionEl)
				})
				input = select
				break
		}

		input.id = `sinkusoption-${gmKey}`
		input.addEventListener('change', e => {
			let newVal: boolean | number | string
			if (opt.type === 'checkbox') newVal = (e.target as HTMLInputElement).checked
			else if (opt.type === 'number') newVal = parseFloat((e.target as HTMLInputElement).value)
			else newVal = (e.target as HTMLInputElement | HTMLSelectElement).value
			GM_setValue(gmKey, newVal)
		})

		wrapper.appendChild(input)
		wrapper.append(' ' + opt.label)
		popup.appendChild(wrapper)
	}

	options.forEach(addOption)

	function getSetting(label: string): boolean | number | string | undefined {
		const gmKey = `sg-${label.toLowerCase().replace(/\s+/g, '-')}`
		const opt = options.find(o => 'label' in o && o.label === label) as SettingOption | undefined
		if (!opt) throw new Error(`Setting not found: ${label}`)
		if (opt.type === 'checkbox') return GM_getValue(gmKey, opt.defaultValue)
		if (opt.type === 'number') return parseFloat(GM_getValue(gmKey, opt.defaultValue.toString()))
		if (opt.type != 'spacer') {
			return GM_getValue(gmKey, opt.defaultValue)
		}
	}

	return { getSetting }
}
