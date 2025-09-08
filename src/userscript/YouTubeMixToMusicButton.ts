// ==UserScript==
// @name        YouTube Mix to YT Music
// @namespace   https://userscripts.iamas.ink
// @version     1.0.1
// @description Add a button to open current YouTube Mix in YouTube Music
// @match       https://www.youtube.com/*
// @grant       window.close
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMixToMusicButton.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMixToMusicButton.user.js
// @tag         youtube
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==


(function () {
	/////// options ///////
	const LOGGING_ENABLED = false

	let LOADTIME_MS = 500
	let PREFETCHTIME_MS = 100

	///////         ///////

	// script full name from @name
	const SCRIPT_NAME = GM_info.script.name
	// script short name from updateurl filename
	const SCRIPT_SHORTNAME = GM_info.script.updateURL!.split("/").slice(-1)[0].split(".").slice(0, -2).join(".")
	// script version
	const SCRIPT_VERSION = GM_info.script.version

	const LOG_PREFIX = `[${SCRIPT_SHORTNAME}]`
	const log = (...args: any) => LOGGING_ENABLED && console.log(LOG_PREFIX, ...args)
	const logWarn = (...args: any) => console.warn(LOG_PREFIX, ...args)
	const logError = (...args: any) => console.error(LOG_PREFIX, ...args)

	console.log(`[${SCRIPT_SHORTNAME}] ${SCRIPT_NAME} v${SCRIPT_VERSION} by iamasink loaded`)


	const observer = new MutationObserver(addButton)
	observer.observe(document.body, { childList: true, subtree: true })

	addButton()

	function addButton() {

		if (!location.href.includes('list=RD')) {
			// log("not a mix")
			return
		}

		// Avoid duplicates
		if (document.getElementById('yt-music-button')) {
			// log("already exists")
			return
		}

		const container = document.querySelector('div#owner.item.style-scope.ytd-watch-metadata')
		if (!container) {
			log("no container")
			return
		}

		const btn = document.createElement('button')
		btn.id = 'yt-music-button'
		btn.textContent = 'Open in YT Music'
		btn.style.marginLeft = '10px'
		btn.style.padding = '6px'
		btn.style.fontSize = '14px'
		btn.style.cursor = 'pointer'

		const url = new URL(location.href)
		url.hostname = 'music.youtube.com'

		// if "start_radio", we are on the first video of the mix. just go to this mix on ytm
		// otherwise, remove the "list" param
		if (!url.searchParams.get('start_radio')) {
			url.searchParams.delete('list')
		}

		url.searchParams.set("start_radio", "1")
		url.searchParams.delete('index')


		btn.onclick = () => {
			// get video progress
			const video = document.querySelector('video')
			if (video) {
				const currentTime = video.currentTime
				log("currentTime = ", currentTime)
				const totalLoadTime = LOADTIME_MS + PREFETCHTIME_MS
				const newtime = Math.ceil(currentTime + (totalLoadTime / 1000)).toString()
				url.searchParams.set('t', newtime)
				log("newtime = ", newtime)
			}
			url.searchParams.set('autoplay', '1');;
			// window.location.href = url.toString()

			// prefetch

			log("prefetch");;
			['https://music.youtube.com', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com']
				.forEach(h => {
					const l1 = document.createElement('link')
					l1.rel = 'preconnect'; l1.href = h; document.head.appendChild(l1)
					const l2 = document.createElement('link')
					l2.rel = 'dns-prefetch'; l2.href = h; document.head.appendChild(l2)
				})

			const pf = document.createElement('link')
			pf.rel = 'prefetch'; pf.href = url.toString()
			document.head.appendChild(pf)


			log("timeout start")

			setTimeout(() => {
				log('Opening Music URL:', url.toString())
				const newTab = window.open(url.toString(), '_blank')

				setTimeout(() => {
					window.close()
					log("close!")
				}, LOADTIME_MS)
			}, PREFETCHTIME_MS)
		}
		container.appendChild(btn)
	}






})()
