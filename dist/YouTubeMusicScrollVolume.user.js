// ==UserScript==
// @name        YouTube Music Scroll volume change
// @namespace   https://userscripts.iamas.ink
// @version     1.3
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


"use strict";
(() => {
  // src/lib/init.ts
  function init({ LOGGING_ENABLED = false ? true : false } = {}) {
    const SCRIPT_NAME = GM_info.script.name;
    const SCRIPT_SHORTNAME = GM_info.script.downloadURL.split("/").slice(-1)[0].split(".").slice(0, -2).join(".").trim() || SCRIPT_NAME.replace(" ", "").trim();
    const SCRIPT_VERSION = GM_info.script.version;
    const LOG_PREFIX = `[${SCRIPT_SHORTNAME}]`;
    const log = (...args) => LOGGING_ENABLED && console.log(LOG_PREFIX, ...args);
    const logWarn = (...args) => console.warn(LOG_PREFIX, ...args);
    const logError = (...args) => console.error(LOG_PREFIX, ...args);
    console.log(`[${SCRIPT_SHORTNAME}] ${SCRIPT_NAME} v${SCRIPT_VERSION} by iamasink loaded`);
    return { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError };
  }

  // src/userscript/YouTubeMusicScrollVolume.ts
  (function() {
    const LOGGING_ENABLED = false;
    const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({});
    let volumeSliderTimeout;
    addEventListener("wheel", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.buttons > 0) return;
      if (isInsideScrollable(e.target)) return;
      const player = document.querySelector("#movie_player");
      if (!player) {
        logWarn("no player. is the page still loading?");
        return;
      }
      const delta = Math.sign(-e.deltaY);
      const step = 2;
      try {
        const currentVol = player.getVolume();
        const newVol = Math.min(100, Math.max(0, currentVol + step * delta));
        if (player.isMuted() && newVol > 0) player.unMute();
        player.setVolume(newVol);
        const volumeSlider = document.querySelector("tp-yt-paper-slider#volume-slider");
        if (volumeSlider) {
          volumeSlider.value = newVol;
          volumeSlider.classList.add("on-hover");
          clearTimeout(volumeSliderTimeout);
          volumeSliderTimeout = setTimeout(() => {
            volumeSlider.classList.remove("on-hover");
          }, 1e3);
        }
        showOverlay("Volume", `${newVol}%`);
        log(`changed volume: ${newVol}%`);
      } catch (e2) {
        logWarn("couldn't get/set volume. is the page still loading?", e2);
      }
    }, { passive: true });
    function isInsideScrollable(el) {
      while (el && el !== document.body) {
        const style = getComputedStyle(el);
        const scrollY = el.scrollHeight > el.clientHeight;
        const scrollX = el.scrollWidth > el.clientWidth;
        const overflow = style.overflow + style.overflowY + style.overflowX;
        if ((scrollY || scrollX) && /auto|scroll/.test(overflow)) return true;
        if (el.id === "contents") return true;
        if (el.id === "volume-slider") return true;
        el = el.parentElement;
      }
      return false;
    }
    function showOverlay(type, text) {
      const id = "scrollgesture-overlay";
      let overlay = document.getElementById(id);
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = id;
        Object.assign(overlay.style, {
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          fontSize: "16px",
          borderRadius: "4px",
          zIndex: "9999",
          pointerEvents: "none"
        });
        document.body.appendChild(overlay);
      }
      overlay.textContent = `${type}: ${text}`;
      overlay.style.display = "block";
      clearTimeout(overlay.hideTimer);
      overlay.hideTimer = setTimeout(() => overlay.style.display = "none", 1e3);
    }
  })();
})();
