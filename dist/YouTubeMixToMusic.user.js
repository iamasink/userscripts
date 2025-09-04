// ==UserScript==
// @name        YouTube Mix to YT Music
// @namespace   Violentmonkey Scripts
// @version     1.1
// @description Redirect to YouTube music if next up is a Mix
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
    let LOADTIME_MS = 500;
    let PREFETCHTIME_MS = 100;
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
    function setupVideoListener() {
      if (location.hostname == "music.youtube.com") return;
      const video = document.querySelector("video");
      if (!video) {
        return;
      }
      video.addEventListener("ended", () => {
        const upNext = getUpNextUrl();
        if (upNext && isMixUrl(upNext)) {
          const newUrl = upNext.replace("www.youtube.com", "music.youtube.com");
          let url = new URL(newUrl);
          url.searchParams.delete("index");
          url.searchParams.delete("list");
          log("Redirecting to YouTube Music:", url);
          window.location.href = url.toString();
        } else {
          log("next is not a mix");
        }
      });
      log("Video listener attached");
    }
    setupVideoListener();
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => {
          setupVideoListener();
        }, 5e3);
      }
    }).observe(document.body, { childList: true, subtree: true });
  })();
})();
