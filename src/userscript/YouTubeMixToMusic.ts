// ==UserScript==
// @name        YouTube Mix to YT Music 2
// @namespace   Violentmonkey Scripts
// @version     1.0
// @description Redirect to youtube music if youtube will put us into a mix playlist
// @match       https://www.youtube.com/*
// @grant       window.close
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


(function () {
	/////// options ///////
	const LOGGING_ENABLED = false

	let LOADTIME_MS = 500
	let PREFETCHTIME_MS = 100

	///////         ///////

	const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({})


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

	function setupVideoListener() {
		if (location.hostname == "music.youtube.com") return
		const video = document.querySelector<HTMLVideoElement>("video")
		if (!video) {
			return
		}

		video.addEventListener("ended", () => {
			const upNext = getUpNextUrl()
			if (upNext && isMixUrl(upNext)) {
				const newUrl = upNext.replace("www.youtube.com", "music.youtube.com")
				let url = new URL(newUrl)
				url.searchParams.delete("index")
				url.searchParams.delete("list")
				log("Redirecting to YouTube Music:", url)
				window.location.href = url.toString()
			} else {
				log("next is not a mix")
			}
		})

		log("Video listener attached")
	}


	setupVideoListener()

	let lastUrl = location.href
	new MutationObserver(() => {
		if (location.href !== lastUrl) {
			lastUrl = location.href
			setTimeout(() => {
				setupVideoListener()
			}, 5000)
		}
	}).observe(document.body, { childList: true, subtree: true })
})()