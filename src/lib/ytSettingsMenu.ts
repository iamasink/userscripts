export type SettingOption =
	| { label: string; type: 'checkbox'; defaultValue: boolean; onChange: (val: boolean) => void }
	| { label: string; type: 'number'; defaultValue: number; onChange: (val: number) => void }
	| { label: string; type: 'text'; defaultValue: string; onChange: (val: string) => void }
	| { label: string; type: 'select'; defaultValue: string; choices: string[]; onChange: (val: string) => void }
	| { type: 'spacer' }

export function addSettingsMenu(SCRIPT_SHORTNAME: string, SCRIPT_NAME = SCRIPT_SHORTNAME, options: SettingOption[],) {
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
			cursor: 'pointer'
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
			zIndex: '9999'
		})
		container.appendChild(popup)

		// Add script header
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

		const id = 'sinkusoption-' + SCRIPT_SHORTNAME.toLowerCase() + opt.label.toLowerCase().replace(/\s+/g, '-')
		if (document.getElementById(id)) return

		const wrapper = document.createElement('label')
		wrapper.style.display = 'block'

		let input: HTMLInputElement | HTMLSelectElement
		switch (opt.type) {
			case 'checkbox':
				{
					input = document.createElement('input')
					input.type = 'checkbox'
					input.checked = opt.defaultValue
					break

				}
			case 'number':
				{
					input = document.createElement('input')
					input.type = 'number'
					input.value = opt.defaultValue.toString()
					input.style.width = '50px'
					break

				}
			case 'text':
				{
					input = document.createElement('input')
					input.type = 'text'
					input.value = opt.defaultValue
					input.style.width = '100%'
					break

				}
			case 'select':
				{
					const select = document.createElement('select')
					opt.choices.forEach(choice => {
						const optionEl = document.createElement('option')
						optionEl.value = choice
						optionEl.textContent = choice
						if (choice === opt.defaultValue) optionEl.selected = true
						select.appendChild(optionEl)
					})
					input = select
					break

				}
		}

		input.id = id
		input.addEventListener('change', e => {
			let val: boolean | number | string
			if (opt.type === 'checkbox') val = (e.target as HTMLInputElement).checked
			else if (opt.type === 'number') val = parseFloat((e.target as HTMLInputElement).value)
			else val = (e.target as HTMLInputElement | HTMLSelectElement).value
			opt.onChange(val as never)
		})

		wrapper.appendChild(input)
		if ('label' in opt) wrapper.append(' ' + opt.label)
		popup.appendChild(wrapper)
	}

	options.forEach(addOption)
}
