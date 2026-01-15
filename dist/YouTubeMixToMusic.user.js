// ==UserScript==
// @name        YouTube Mix to YT Music
// @namespace   https://userscripts.iamas.ink
// @version     1.3.1
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

  // src/userscript/YouTubeMixToMusic.ts
  (function() {
    const LOGGING_ENABLED = false;
    const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({});
    function isMixUrl(url) {
      try {
        const u = new URL(url, window.location.origin);
        const list = u.searchParams.get("list");
        log(url, list);
        return !!list && list.startsWith("RD");
      } catch {
        return false;
      }
    }
    function getUpNextUrl() {
      const upNextLink = document.querySelector(
        "a.ytp-next-button"
      );
      return upNextLink ? upNextLink.href : null;
    }
    async function setupVideoListener() {
      const video = document.querySelector("video");
      const player = document.querySelector("#movie_player");
      if (!player) {
        log("no player");
        return false;
      }
      log("got player", player);
      if (location.hostname === "music.youtube.com") {
        log("hi music");
        const savedVol = await GM.getValue("ytVolume");
        log("saved volume is ", savedVol);
        if (savedVol) player.setVolume(savedVol);
        GM.setValue("ytVolume", null);
        return true;
      }
      if (!video) {
        log("no video");
        return false;
      }
      video.addEventListener("ended", () => {
        const upNext = getUpNextUrl();
        if (upNext && isMixUrl(upNext)) {
          const newUrl = upNext.replace("www.youtube.com", "music.youtube.com");
          let url = new URL(newUrl);
          let volume = player.getVolume();
          log("volume is ", volume);
          GM.setValue("ytVolume", volume);
          log("Redirecting to YouTube Music:", url);
          log("see you there !");
          window.location.href = url.toString();
        } else {
          log("next is not a mix");
        }
      });
      log("Video listener attached");
      return true;
    }
    function trySetupVideoListener() {
      log(new URL(location.href).pathname);
      if (new URL(location.href).pathname !== "/watch") return;
      const interval = setInterval(async () => {
        const success = await setupVideoListener();
        if (success) {
          clearInterval(interval);
          log("Video listener successfully attached.");
        } else {
          log("Retrying setupVideoListener...");
        }
      }, 1e3);
    }
    trySetupVideoListener();
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        trySetupVideoListener();
      }
    }).observe(document.body, { childList: true, subtree: true });
  })();
})();
