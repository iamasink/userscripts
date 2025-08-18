// ==UserScript==
// @name         Steam Hide Login Name
// @namespace    Violentmonkey Scripts
// @version      0.1.1
// @description  Hide your Steam sign-in name (kinda)
// @match        https://*.steamcommunity.com/*
// @match        https://*.steampowered.com/*
// @grant        none
// @author       iamasink
// @homepage     https://github.com/iamasink/userscripts
// @supportURL   https://github.com/iamasink/userscripts/issues
// @downloadURL  https://raw.githubusercontent.com/iamasink/userscripts/main/dist/SteamHideUser.user.js
// @updateURL    https://raw.githubusercontent.com/iamasink/userscripts/main/dist/SteamHideUser.user.js
// @tag          steam
// @icon         https://steamcommunity.com/favicon.ico
// @license      MIT
// ==/UserScript==


"use strict";
(() => {
  // src/userscript/SteamHideUser.ts
  (function() {
    "use strict";
    const HIDE_SELECTOR = [
      "h2.pageheader.youraccount_pageheader",
      "h2.addfunds_pageheader",
      ".page_header_ctn.account_management > .page_content > h2.pageheader",
      "#help_home_block .help_intro_text"
    ].join(", ");
    function hideUsername() {
      document.querySelectorAll(HIDE_SELECTOR).forEach((el) => {
        el.style.color = "transparent";
        el.style.opacity = "255";
        el.textContent = "hidden";
      });
      document.querySelectorAll(".account_name").forEach((el) => {
        el.textContent = "";
      });
    }
    hideUsername();
  })();
})();
