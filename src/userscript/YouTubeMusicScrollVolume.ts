// ==UserScript==
// @name        YouTube Music Scroll volume change
// @namespace   https://userscripts.iamas.ink
// @version     1.1.0
// @description Use scroll wheel to change volume anywhere on YouTube Music
// @match       https://music.youtube.com/*
// @grant       none
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMusicScrollVolume.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMusicScrollVolume.user.js
// @tag         youtube
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==

import { init } from "../lib/init"


(function () {
	/////// options ///////
	const LOGGING_ENABLED = false


	///////         ///////

	const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({})

	////////////////

	let volumeSliderTimeout: number | undefined

	addEventListener("wheel", (e) => {
		log(e)

		// ignore other keys (zoom, other extensions, etc idk)
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
		// ignore if there are clicks
		if (e.buttons > 0) return

		// ignore if over scrollable element
		if (isInsideScrollable(e.target)) return

		const player = document.querySelector('#movie_player') as any
		if (!player) {
			logWarn("no player. is the page still loading?")
			return
		}

		const delta = Math.sign(-e.deltaY)
		const step = 2

		try {
			const currentVol = player.getVolume()
			const newVol = Math.min(100, Math.max(0, currentVol + (step * delta)))
			if (player.isMuted() && newVol > 0) player.unMute()
			player.setVolume(newVol)

			// update volume slider
			const volumeSlider = document.querySelector('tp-yt-paper-slider#volume-slider') as any
			if (volumeSlider) {
				volumeSlider.value = newVol
				volumeSlider.classList.add("on-hover")

				// remove hover after timeout (hide slider)
				clearTimeout(volumeSliderTimeout)
				volumeSliderTimeout = setTimeout(() => {
					volumeSlider.classList.remove("on-hover")
				}, 1000)
			}

			log(`changed volume: ${newVol}`)

		} catch (e) {
			logWarn("couldn't get/set volume. is the page still loading?", e)
		}
	}, { passive: true })

	function isInsideScrollable(el: any) {
		while (el && el !== document.body) {
			const style = getComputedStyle(el)
			const scrollY = el.scrollHeight > el.clientHeight
			const scrollX = el.scrollWidth > el.clientWidth
			const overflow = style.overflow + style.overflowY + style.overflowX
			if ((scrollY || scrollX) && /auto|scroll/.test(overflow)) return true
			// prevent on playlist page
			if (el.id === "contents") return true
			// prevent when hovering volume slider (own implementation)
			if (el.id === "volume-slider") return true
			el = el.parentElement
		}
		return false
	}

})()
