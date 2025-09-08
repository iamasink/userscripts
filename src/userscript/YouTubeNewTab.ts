// ==UserScript==
// @name        YouTube New Tab
// @namespace   https://userscripts.iamas.ink
// @version     1.1
// @description Always open youtube homepage links in new tab. The homepage takes forever to (properly) load, so just leave it open!
// @match       https://www.youtube.com/*
// @grant       none
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeNewTab.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeNewTab.user.js
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

	///////

	const selector = 'a[href*="youtube.com/watch"], a[href*="youtu.be"], a[href^="/watch"]'

	// run on page load
	document.addEventListener('click', interceptClick, true)
	log('Click interceptor attached')

	// intercept click events
	function interceptClick(e: any) {
		if (window.location.pathname !== '/') {
			log('not on homepage; ignoring click')
			return
		}

		const link = e.target.closest(selector)
		if (!link) {
			log('no link found')
			return
		};

		// Allow modifier keys for user preference
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
			log('ignoring modifier key click')
			return
		}

		// prevent youtubes default navigation
		e.preventDefault()
		e.stopImmediatePropagation()
		e.stopPropagation()
		log('Intercepted click:', link.href)

		// open in new tab
		window.open(link.href, '_blank', 'noopener')
	}

})()
