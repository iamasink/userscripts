// ==UserScript==
// @name        YouTube Scroll Gestures
// @namespace   Violentmonkey Scripts
// @version     1.0
// @description Adds scroll gestures for Speed (ctrl+scroll) and Volume (rclick+scroll) like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/watch*
// @grant       none
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/YouTubeScrollGestures.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/YouTubeScrollGestures.user.js
// @tag         youtube
// @icon        https://www.google.com/s2/favicons?domain=youtube.com
// @license     MIT
// ==/UserScript==

(function () {

	/////// options ///////
	const LOGGING_ENABLED = true;

	const SPEED_STEP = 0.05;
	const SPEED_REQUIRES_RCLICK = false;

	const VOLUME_STEP = 2;
	const VOLUME_REQUIRES_RCLICK = true;

	///////         ///////

	// script full name from @name
	const SCRIPT_NAME = GM_info.script.name;
	// script short name from downloadURL filename
	const SCRIPT_SHORTNAME = GM_info.script.downloadURL.split("/").slice(-1)[0].split(".").slice(0, -2).join(".").trim() || SCRIPT_NAME.replace(" ", "").trim();
	// script version
	const SCRIPT_VERSION = GM_info.script.version;

	const LOG_PREFIX = `[${SCRIPT_SHORTNAME}]`;
	const log = (...args) => LOGGING_ENABLED && console.log(LOG_PREFIX, ...args);
	const logWarn = (...args) => console.warn(LOG_PREFIX, ...args);
	const logError = (...args) => console.error(LOG_PREFIX, ...args);

	console.log(`[${SCRIPT_SHORTNAME}] ${SCRIPT_NAME} v${SCRIPT_VERSION} by iamasink loaded`);

	///////

	let rightMouseDown = false;
	let wheelUsed = false;

	document.addEventListener('mousedown', e => {
		if (e.button === 2) {
			// rightclick
			rightMouseDown = true;
			wheelUsed = false;

		} else if (e.button === 1) {
			const player = document.querySelector('#movie_player');
			// middleclick
			wheelUsed = false;
			e.preventDefault();
			if (rightMouseDown) {
				if (player.isMuted()) {
					showOverlay('Volume', `Unmuted`);
					player.unMute();
				} else {
					showOverlay('Volume', `Mute`);
					player.mute();
				}
			} else if (e.ctrlKey) {
				showOverlay('Speed', `1.00x`);
				player.setPlaybackRate(1);
			}
		}
	});
	document.addEventListener('mouseup', e => {
		if (e.button === 2) {
			rightMouseDown = false;
		}
	});



	document.addEventListener('wheel', e => {
		const player = document.querySelector('#movie_player');
		const video = document.querySelector('video');
		if (!player) {
			logError("no #movie_player");
		}
		if (!video) {
			logError("no video element");
		}

		if (!e.ctrlKey && (rightMouseDown || (!VOLUME_REQUIRES_RCLICK && e.target == video))) {
			e.preventDefault();
			wheelUsed = true;

			const currVol = player.getVolume();
			const delta = Math.sign(e.deltaY);
			const nextVol = delta < 0 ? Math.min(currVol + VOLUME_STEP, 100) : Math.max(currVol - VOLUME_STEP, 0);
			player.unMute();
			player.setVolume(nextVol);
			showOverlay('Volume', `${nextVol}%`);

		}
		else if (e.ctrlKey) {
			if (SPEED_REQUIRES_RCLICK && !rightMouseDown) return;

			log(e.target);
			if (e.target !== video && !SPEED_REQUIRES_RCLICK) {
				return;
			}

			e.preventDefault();
			wheelUsed = true;


			// the speed from youtube player api
			const currSpeedPlayer = player.getPlaybackRate();
			// the speed from the video element itself (higher supported range)
			const currSpeedVideo = video.playbackRate;

			let currSpeed;

			if (currSpeedVideo != 1) {
				currSpeed = currSpeedVideo;
			}
			else if (currSpeedPlayer != 1) {
				currSpeed = currSpeedPlayer;
			} else {
				currSpeed = 1;
			}

			log("curr", currSpeed);


			const delta = Math.sign(e.deltaY);
			let nextSpeed = currSpeed + (delta < 0 ? SPEED_STEP : -SPEED_STEP);
			nextSpeed = Math.max(0.1, Math.min(nextSpeed, 5));

			if (nextSpeed < 0.25) {
				// first set the yt player's rate to closest supported
				player.setPlaybackRate(0.25);
				video.playbackRate = nextSpeed;
			} else if (nextSpeed > 2) {
				player.setPlaybackRate(2);
				video.playbackRate = nextSpeed;
			} else {
				video.playbackRate = nextSpeed;
				player.setPlaybackRate(nextSpeed);
			}
			log("next", nextSpeed);
			showOverlay('Speed', `${nextSpeed.toFixed(2)}x`);
		}
	}, { passive: false });

	document.addEventListener('contextmenu', e => {
		if (wheelUsed) {
			e.preventDefault();
			e.stopImmediatePropagation();
			wheelUsed = false;
		}
	}, true);

	function showOverlay(type, text) {

		const id = 'scrollgesture-overlay';
		let overlay = document.getElementById(id);
		if (!overlay) {
			overlay = document.createElement('div');
			overlay.id = id;
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
			});
			document.body.appendChild(overlay);
		}
		overlay.textContent = `${type}: ${text}`;
		overlay.style.display = 'block';

		clearTimeout(overlay.hideTimer);
		overlay.hideTimer = setTimeout(() => overlay.style.display = 'none', 1000);
	}
})();