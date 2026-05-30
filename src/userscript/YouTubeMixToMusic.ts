// ==UserScript==
// @name        YouTube Mix to YT Music
// @namespace   https://userscripts.iamas.ink
// @version     1.3.2
// @description Redirect to YouTube music if next up is a Mix
// @match       https://www.youtube.com/*
// @match       https://music.youtube.com/*
// @grant       window.close
// @grant       GM.getValue
// @grant       GM.setValue
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMixToMusic.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMixToMusic.user.js
// @tag         youtube
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==

import { init } from "../lib/init"
declare const GM: any

(function () {
	const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logInfo, logWarn, logError } = init({})

	function isMixUrl(url: string): boolean {
		try {
			const u = new URL(url, window.location.origin)
			const list = u.searchParams.get("list")
			log(url, list)
			return !!list && list.startsWith("RD") // Mix playlists
		} catch {
			return false
		}
	}

	function getUpNextUrl() {
		const upNextLink = document.querySelector<HTMLAnchorElement>(
			"a.ytp-next-button"
		)
		return upNextLink ? upNextLink.href : null
	}

	async function setupVideoListener() {

		const video = document.querySelector<HTMLVideoElement>("video")
		const player: any = document.querySelector('#movie_player')

		if (!player) {
			log("no player")
			return false
		}
		// log("got video", video)
		log("got player", player)

		if (location.hostname === "music.youtube.com") {
			log("hi music")
			const savedVol: number = await GM.getValue("ytVolume")
			log("saved volume is ", savedVol)
			if (savedVol) player.setVolume(savedVol)
			GM.setValue("ytVolume", null)

			return true
		}

		if (!video) {
			log("no video")
			return false
		}

		video.addEventListener("ended", () => {
			if (document.visibilityState === "visible" && document.hasFocus()) {
				log("video ended, but tab focused, not redirecting")
				return
			}
			const upNext = getUpNextUrl()
			if (!upNext || !isMixUrl(upNext)) {
				log("next is not a mix")
				return
			}

			const newUrl = upNext.replace("www.youtube.com", "music.youtube.com")
			let url = new URL(newUrl)
			let volume = player.getVolume()
			log("volume is ", volume)
			GM.setValue("ytVolume", volume)
			// url.searchParams.delete("index")
			// const index = Number.parseInt(url.searchParams.get("index")??"0")
			// url.searchParams.set("index", (index+1).toString())
			// url.searchParams.delete("list")
			logInfo("Redirecting to YouTube Music:", url)
			logInfo("see you there !")
			window.location.href = url.toString()
		})

		return true
	}


	function trySetupVideoListener() {
		log(new URL(location.href).pathname)
		if (new URL(location.href).pathname !== "/watch") return

		const attempt = async () => {
			try {
				const success = await setupVideoListener()
				if (success) {
					clearInterval(interval)
					log("Video listener successfully attached.")
				} else {
					log("Retrying setupVideoListener...")
				}
			} catch (err) {
				console.error("setupVideoListener failed:", err)
			}
		}

		const interval = setInterval(attempt, 250)
		attempt()
	}

	trySetupVideoListener()

	let lastUrl = location.href
	new MutationObserver(() => {
		if (location.href !== lastUrl) {
			lastUrl = location.href
			trySetupVideoListener()
		}
	}).observe(document.body, { childList: true, subtree: true })
})()