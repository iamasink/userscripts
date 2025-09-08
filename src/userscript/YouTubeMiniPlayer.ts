// ==UserScript==
// @name        YouTube Popup Player
// @namespace   https://userscripts.iamas.ink
// @version     1.10
// @description Show a popup player when scrolling down to read the comments like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/*
// @grant       GM_getValue
// @grant       GM_setValue
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMiniPlayer.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMiniPlayer.user.js
// @tag         tags
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==

import { init } from "../lib/init"
import { addSettingsMenu } from '../lib/settingsMenu'
import type { SettingOption } from '../lib/settingsMenu'

(function () {
	const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({})
	const shortnameLower = SCRIPT_SHORTNAME.toLowerCase()
	const STYLE_ID = `${shortnameLower}-miniplayer-style`
	const MINI_CLASS = `${shortnameLower}-miniplayer`
	const MINI_POS_CLASS_PREFIX = `${shortnameLower}-miniplayerpos`
	const MINI_SIZE_CLASS_PREFIX = `${shortnameLower}-miniplayersize`
	const CTRLS_CLASS = `${shortnameLower}-miniplayer-ctrls`
	let listenersAdded = false
	let ticking = false
	let playerEl: HTMLElement | null = null
	let active = false
	let closed = false
	let triggerY = 500

	let sm: any

	const POSITIONS = ["top-right", "top-left", "bottom-left", "bottom-right"]
	const SIZES = {
		"400x225": { width: '400px', height: '225px' },
		"560x315": { width: '560px', height: '315px' },
		"720x405": { width: '720px', height: '405px' },
		"800x450": { width: '800px', height: '450px' },
		"880x495": { width: '880px', height: '495px' },
		"1040x585": { width: '1040px', height: '585px' },
		"1120x630": { width: '1120px', height: '630px' },
		"1200x675": { width: '1200px', height: '675px' },
		"1280x720": { width: '1280px', height: '720px' },
	}

	const sizeClassesCSS = Object.entries(SIZES)
		.map(([key, val]) => `.${MINI_CLASS}.${MINI_SIZE_CLASS_PREFIX}-${key}{width:${val.width} !important;height:${val.height} !important;}`)
		.join("\n")
	log(sizeClassesCSS)


	function addGlobalListeners() {
		if (listenersAdded) return

		sm = addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, [
			{ label: 'Miniplayer Position', type: 'select', choices: POSITIONS, defaultValue: "top-right" },
			{ label: "Miniplayer Size", type: "select", choices: Object.keys(SIZES), defaultValue: "360x200" }
		])
		window.addEventListener('scroll', onScroll, { passive: true })
		// window.addEventListener('resize', onResize, { passive: true })
		window.addEventListener('yt-navigate-finish', onNavigate)

		listenersAdded = true
		log("Global listeners added")
	}

	function onNavigate() {
		main()
	}
	function onResize() {
		log("resize")
	}


	function injectCSS() {
		if (!document.getElementById(STYLE_ID)) {
			const s = document.createElement('style')
			s.id = STYLE_ID
			s.textContent = `
.${MINI_CLASS} {
	position: fixed !important;
	z-index: 9999 !important;
	box-shadow: 0 0 24px rgba(0,0,0,0.6) !important;
	transform: none !important;
}

${sizeClassesCSS}

/* Miniplayer positions */
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-top-right {
	top: 20px !important;
	right: 20px !important;
	bottom: auto !important;
	left: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-top-left {
	top: 20px !important;
	left: 20px !important;
	bottom: auto !important;
	right: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-bottom-left {
	bottom: 20px !important;
	left: 20px !important;
	top: auto !important;
	right: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-bottom-right {
	bottom: 20px !important;
	right: 20px !important;
	top: auto !important;
	left: auto !important;
}
.${CTRLS_CLASS} {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    color: #fff;
    cursor: pointer;
    z-index: 10000;
    font-size: 16px;
    line-height: 24px;
    text-align: center;
    padding: 0;
}
`
			document.head.appendChild(s)
		}
	}

	function findPlayer() {
		const player = document.getElementById('movie_player')
		log("found player", player)
		return player
	}

	function activate(target: HTMLElement) {
		log("activating")
		if (!target || closed || target.classList.contains(MINI_CLASS)) {
			log("no")
			return
		}
		const pos = sm.getSetting("Miniplayer Position")
		log("pos", pos)

		Object.keys(SIZES).forEach(k => target.classList.remove(`${MINI_SIZE_CLASS_PREFIX}-${k}`))
		const size = sm.getSetting("Miniplayer Size") as keyof typeof SIZES
		log("size", size)

		for (let i = 0, len = POSITIONS.length; i < len; i++) {
			target.classList.remove(`${MINI_POS_CLASS_PREFIX}-${POSITIONS[i]}`)
		}

		target.classList.add(MINI_CLASS)
		target.classList.add(`${MINI_POS_CLASS_PREFIX}-${pos}`)
		target.classList.add(`${MINI_SIZE_CLASS_PREFIX}-${size}`)

		// trigger youtube's resize logic
		window.dispatchEvent(new Event("resize"))

		let closeBtn = target.querySelector("." + CTRLS_CLASS) as HTMLElement
		if (!closeBtn) {
			closeBtn = document.createElement('button')
			closeBtn.textContent = 'x'
			closeBtn.className = CTRLS_CLASS
			closeBtn.addEventListener('click', () => {
				closed = true
				restore(target)
			})
			target.appendChild(closeBtn)
		}

		active = true
		playerEl = target
	}

	function restore(target: HTMLElement) {
		log("restoring")
		if (!target) {
			log("no target")
			return
		}

		target.classList.remove(MINI_CLASS)

		const closeBtn = target.querySelector("." + CTRLS_CLASS)
		if (closeBtn) closeBtn.remove()

		// trigger youtube's resize logic to resize the video player
		window.dispatchEvent(new Event("resize"))


		if (playerEl === target) playerEl = null
		active = false
	}


	function onScroll() {
		log("scroll")
		if (ticking) return
		ticking = true
		requestAnimationFrame(() => {
			// log("raf")
			ticking = false
			if (!playerEl) playerEl = findPlayer()
			if (!playerEl) return

			// log("scrollY pos:", window.scrollY)
			// log("triggery:", triggerY)
			// log("active:", active)
			// log("closed:", closed)

			if (window.scrollY >= triggerY && !active) {
				activate(playerEl)
				return
			}
			if (window.scrollY < triggerY) {
				closed = false
				if (active) {
					restore(playerEl)
					return
				}
			}
		})
	}


	function main() {
		log("main() called")

		injectCSS()

		addGlobalListeners()

		playerEl = findPlayer()
		if (!playerEl) {
			log("No player found")
			return
		}

		onScroll()
	}

	main()
})()