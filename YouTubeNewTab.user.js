// ==UserScript==
// @name        YouTube New Tab
// @namespace   Violentmonkey Scripts
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.0
// @author      iamasink
// @description Always open youtube homepage links in new tab. The homepage takes forever to (properly) load, so just leave it open!
// ==/UserScript==


(function () {

	const version = GM_info.script.version;

	const LOGGING_ENABLED = true;
	function log(...data) {
		if (!LOGGING_ENABLED) return;
		console.log('[YouTubeNewTab]', ...data);
	}

	const selector = 'a[href*="youtube.com/watch"], a[href*="youtu.be"], a[href^="/watch"]';

	// run on page load
	log(`YouTubeNewTab v${version} by iamasink loaded`);
	document.addEventListener('click', interceptClick, true);
	log('Click interceptor attached');

	// intercept click events
	function interceptClick(e) {
		if (window.location.pathname !== '/') {
			log('not on homepage; ignoring click');
			return;
		}

		const link = e.target.closest(selector);
		if (!link) {
			log('no link found');
			return;
		};

		// Allow modifier keys for user preference
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
			log('ignoring modifier key click');
			return;
		}

		// prevent youtubes default navigation
		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
		log('Intercepted click:', link.href);

		// open in new tab
		window.open(link.href, '_blank', 'noopener');
	}

})();
