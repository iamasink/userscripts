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

  // src/userscript/YouTubeNewTab.ts
  (function() {
    const LOGGING_ENABLED = false;
    const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({});
    const selector = 'a[href*="youtube.com/watch"], a[href*="youtu.be"], a[href^="/watch"]';
    document.addEventListener("click", interceptClick, true);
    log("Click interceptor attached");
    function interceptClick(e) {
      if (window.location.pathname !== "/") {
        log("not on homepage; ignoring click");
        return;
      }
      const link = e.target.closest(selector);
      if (!link) {
        log("no link found");
        return;
      }
      ;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        log("ignoring modifier key click");
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
      log("Intercepted click:", link.href);
      window.open(link.href, "_blank", "noopener");
    }
  })();
})();
