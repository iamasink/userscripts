// ==UserScript==
// @name        YouTube Scroll Gestures
// @namespace   Violentmonkey Scripts
// @version     1.5
// @description Adds scroll gestures for Speed (ctrl+scroll) and Volume (rclick+scroll) like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/watch*
// @grant       GM_getValue
// @grant       GM_setValue
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeScrollGestures.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeScrollGestures.user.js
// @tag         youtube
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==

import { init } from '../lib/init'
import { addSettingsMenu } from '../lib/ytSettingsMenu'
import type { SettingOption } from '../lib/ytSettingsMenu'

(function () {
	/////// options ///////
	const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({})

	// Load saved settings or defaults
	const SETTINGS: SettingOption[] = [
		{ label: 'Reverse Scroll Direction', type: 'checkbox', defaultValue: false },
		{ type: 'spacer' },
		{ label: 'Enable Volume Scroll', type: 'checkbox', defaultValue: true },
		{ label: 'Volume Requires RClick', type: 'checkbox', defaultValue: true },
		{ label: 'Volume Step', type: 'number', defaultValue: 2, step: 1, min: 1, max: 25 },
		{ type: 'spacer' },
		{ label: 'Enable Speed Scroll', type: 'checkbox', defaultValue: true },
		{ label: 'Speed Requires RClick', type: 'checkbox', defaultValue: false },
		{ label: 'Speed Step', type: 'number', defaultValue: 0.05, step: 0.05, min: 0.05, max: 5 },
	]

	const sm = addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, SETTINGS)

	///////

	let rightMouseDown = false
	let wheelUsed = false

	document.addEventListener('mousedown', e => {
		if (e.button === 2) {
			// rightclick
			rightMouseDown = true
			wheelUsed = false

		} else if (e.button === 1) {
			const player: any = document.querySelector('#movie_player')!
			// middleclick
			wheelUsed = false
			if (rightMouseDown) {
				e.preventDefault()
				if (player.isMuted()) {
					showOverlay('Volume', `Unmuted`)
					player.unMute()
				} else {
					showOverlay('Volume', `Mute`)
					player.mute()
				}
			} else if (e.ctrlKey) {
				e.preventDefault()
				showOverlay('Speed', `1.00x`)
				player.setPlaybackRate(1)
			}
		}
	})
	document.addEventListener('mouseup', e => {
		if (e.button === 2) {
			rightMouseDown = false
		}
	})



	document.addEventListener('wheel', e => {
		const VOLUME_REQUIRES_RCLICK = sm.getSetting("Volume Requires RClick") as boolean
		const ENABLE_VOLUME_SCROLL = sm.getSetting("Enable Volume Scroll") as boolean
		const VOLUME_STEP = sm.getSetting("Volume Step") as number
		const ENABLE_SPEED_SCROLL = sm.getSetting("Enable Speed Scroll") as boolean
		const SPEED_REQUIRES_RCLICK = sm.getSetting("Speed Requires RClick") as boolean
		const SPEED_STEP = sm.getSetting("Speed Step") as number

		const REVERSE_SCROLL_DIRECTION = (sm.getSetting("Reverse Scroll Direction") as boolean) ? -1 : 1

		const player: any = document.querySelector('#movie_player')
		const video = document.querySelector('video')!
		if (!player) {
			logError("no #movie_player")
		}
		if (!video) {
			logError("no video element")
		}

		if (!e.ctrlKey && (rightMouseDown || (!VOLUME_REQUIRES_RCLICK && e.target == video))) {
			if (!ENABLE_VOLUME_SCROLL) return
			e.preventDefault()
			wheelUsed = true

			const currVol = player.getVolume()
			const delta = Math.sign(e.deltaY) * REVERSE_SCROLL_DIRECTION
			const nextVol = delta < 0 ? Math.min(currVol + VOLUME_STEP, 100) : Math.max(currVol - VOLUME_STEP, 0)
			player.unMute()
			player.setVolume(nextVol)
			showOverlay('Volume', `${nextVol}%`)

		}
		else if (e.ctrlKey) {
			if (!ENABLE_SPEED_SCROLL) return
			if (SPEED_REQUIRES_RCLICK && !rightMouseDown) return

			log(e.target)
			if (e.target !== video && !SPEED_REQUIRES_RCLICK) {
				return
			}

			e.preventDefault()
			wheelUsed = true


			// the speed from youtube player api
			const currSpeedPlayer = player.getPlaybackRate()
			// the speed from the video element itself (higher supported range)
			const currSpeedVideo = video.playbackRate

			let currSpeed

			if (currSpeedVideo != 1) {
				currSpeed = currSpeedVideo
			}
			else if (currSpeedPlayer != 1) {
				currSpeed = currSpeedPlayer
			} else {
				currSpeed = 1
			}

			log("curr", currSpeed)


			const delta = Math.sign(e.deltaY) * REVERSE_SCROLL_DIRECTION
			let nextSpeed = currSpeed + (delta < 0 ? SPEED_STEP : -SPEED_STEP)
			nextSpeed = Math.max(0.1, Math.min(nextSpeed, 5))

			if (nextSpeed < 0.25) {
				// first set the yt player's rate to closest supported
				player.setPlaybackRate(0.25)
				video.playbackRate = nextSpeed
			} else if (nextSpeed > 2) {
				player.setPlaybackRate(2)
				video.playbackRate = nextSpeed
			} else {
				video.playbackRate = nextSpeed
				player.setPlaybackRate(nextSpeed)
			}
			log("next", nextSpeed)
			showOverlay('Speed', `${nextSpeed.toFixed(2)}x`)
		}
	}, { passive: false })

	document.addEventListener('contextmenu', e => {
		if (wheelUsed) {
			e.preventDefault()
			e.stopImmediatePropagation()
			wheelUsed = false
		}
	}, true)

	function showOverlay(type: string, text: string) {

		const id = 'scrollgesture-overlay'
		let overlay = document.getElementById(id) as any
		if (!overlay) {
			overlay = document.createElement('div')
			overlay.id = id
			Object.assign(overlay.style, {
				position: 'fixed',
				top: '10%',
				left: '50%',
				transform: 'translateX(-50%)',
				padding: '8px 16px',
				background: 'rgba(0,0,0,0.7)',
				color: '#fff',
				fontSize: '16px',
				borderRadius: '4px',
				zIndex: '9999',
				pointerEvents: 'none',
			})
			document.body.appendChild(overlay)
		}
		overlay.textContent = `${type}: ${text}`
		overlay.style.display = 'block'

		clearTimeout(overlay.hideTimer)
		overlay.hideTimer = setTimeout(() => overlay.style.display = 'none', 1000)
	}

	const observer = new MutationObserver(() => {
		const owner = document.getElementById('owner')
		if (!owner) return

		addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, SETTINGS)
		observer.disconnect()
	})
	observer.observe(document.body, { childList: true, subtree: true })
})()
