// ==UserScript==
// @name        YouTube Popup Player
// @namespace   https://userscripts.iamas.ink
// @version     1.15
// @description Show a popup player when scrolling down to read the comments like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/*
// @grant       GM_getValue
// @grant       GM_setValue
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMiniPlayer.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeMiniPlayer.user.js
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

  // src/lib/util.ts
  function waitForElement(selector, interval = 100, timeout = 1e3) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);
        if (Date.now() - start > timeout) return resolve(null);
        setTimeout(check, interval);
      };
      check();
    });
  }

  // src/lib/settingsMenu.ts
  var SHARED_POPUP_ID = "sinkusoption-popup";
  var SHARED_CONTAINER_ID = "sinkusoption-container";
  var SHARED_COG_ID = "sinkusoption-cog";
  function addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME = SCRIPT_SHORTNAME, options, ownerElement = "#owner", location = "below") {
    function getGmKey(label) {
      return `sinkusoption-${SCRIPT_SHORTNAME}-${label.toLowerCase().replace(/\s+/g, "-")}`;
    }
    async function ensureOptionsMenu() {
      let popup = await waitForElement("#sinkusoption-popup", 100, 1e3);
      if (popup) return popup;
      const owner = await waitForElement(ownerElement, 100, 5e3);
      if (!owner) return null;
      let container = document.getElementById(SHARED_CONTAINER_ID);
      if (!container) {
        container = document.createElement("div");
        container.id = SHARED_CONTAINER_ID;
        container.style.margin = "auto";
        container.style.position = "relative";
        owner.appendChild(container);
        const cog = document.createElement("button");
        cog.id = SHARED_COG_ID;
        cog.textContent = "\u2699";
        Object.assign(cog.style, {
          fontSize: "16px",
          padding: "4px 8px",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "40px",
          height: "36px",
          marginRight: "8px",
          marginLeft: "8px"
        });
        container.appendChild(cog);
        popup = document.createElement("div");
        popup.id = SHARED_POPUP_ID;
        Object.assign(popup.style, {
          display: "none",
          position: "absolute",
          left: "0",
          marginTop: "4px",
          padding: "12px",
          background: "rgba(0,0,0,0.95)",
          color: "#fff",
          borderRadius: "6px",
          minWidth: "260px",
          fontSize: "14px",
          boxShadow: "0 0 8px rgba(0,0,0,0.7)",
          zIndex: "9999"
        });
        switch (location) {
          case "below": {
            Object.assign(popup.style, {
              top: "100%"
            });
            break;
          }
          case "above": {
            Object.assign(popup.style, {
              bottom: "100%"
            });
            break;
          }
        }
        container.appendChild(popup);
        const closebutton = document.createElement("button");
        closebutton.textContent = "x";
        Object.assign(closebutton.style, {
          fontSize: "14px",
          padding: "4px 8px",
          color: "#fff",
          background: "rgba(0,0,0,0.6)",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          position: "absolute",
          top: "6px",
          right: "6px"
        });
        popup.appendChild(closebutton);
        closebutton.addEventListener("click", (e) => {
          popup.style.display = "none";
          e.preventDefault();
          e.stopImmediatePropagation();
        });
        const info = document.createElement("p");
        info.textContent = `sinkussettings-${SCRIPT_SHORTNAME}`;
        Object.assign(info.style, {
          color: "#66666680"
        });
        popup.appendChild(info);
        cog.addEventListener("click", (e) => {
          popup.style.display = popup.style.display === "none" ? "block" : "none";
          e.preventDefault();
          e.stopImmediatePropagation();
        });
        popup.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      }
      return popup;
    }
    async function ensureScriptSection() {
      const popup = await ensureOptionsMenu();
      if (!popup) return null;
      const sectionId = `sinkusoption-section-${SCRIPT_SHORTNAME}`;
      const existing = document.getElementById(sectionId);
      if (existing) return existing;
      const hr = document.createElement("hr");
      Object.assign(hr.style, { border: "none", borderTop: "1px solid rgba(255,255,255,0.08)", margin: "8px 0" });
      popup.appendChild(hr);
      const section = document.createElement("div");
      section.id = sectionId;
      section.style.marginBottom = "6px";
      const header = document.createElement("h4");
      header.textContent = SCRIPT_NAME;
      Object.assign(header.style, { margin: "0 0 6px 0", fontSize: "15px" });
      section.appendChild(header);
      const content = document.createElement("div");
      content.className = `sinkusoption-section-content-${SCRIPT_SHORTNAME}`;
      section.appendChild(content);
      const existingSections = Array.from(popup.querySelectorAll('div[id^="sinkusoption-section-"]'));
      const insertBefore = existingSections.find((s) => {
        const h = s.querySelector("h4")?.textContent ?? "";
        return SCRIPT_NAME.localeCompare(h, void 0, { sensitivity: "base" }) < 0;
      });
      if (insertBefore) {
        popup.insertBefore(section, insertBefore);
      } else {
        popup.appendChild(section);
      }
      const allSections = Array.from(popup.querySelectorAll('div[id^="sinkusoption-section-"]'));
      allSections.forEach((sec, i) => {
        if (i === 0) sec.style.borderTop = "none";
        else sec.style.borderTop = "1px solid rgba(255,255,255,0.08)";
        sec.style.paddingTop = "8px";
      });
      return section;
    }
    async function addOption(opt) {
      const section = await ensureScriptSection();
      if (!section) return;
      const content = section.querySelector(`.sinkusoption-section-content-${SCRIPT_SHORTNAME}`);
      if (opt.type === "spacer") {
        const spacer = document.createElement("div");
        spacer.style.height = "10px";
        content.appendChild(spacer);
        return;
      }
      const gmKey = getGmKey(opt.label);
      let value = opt.defaultValue;
      if (opt.type === "checkbox") value = GM_getValue(gmKey, opt.defaultValue);
      else if (opt.type === "number") value = parseFloat(GM_getValue(gmKey, opt.defaultValue.toString()));
      else value = GM_getValue(gmKey, opt.defaultValue);
      const wrapper = document.createElement("label");
      wrapper.style.display = "block";
      wrapper.style.marginBottom = "6px";
      let input;
      if (opt.type === "checkbox") {
        input = document.createElement("input");
        input.type = "checkbox";
        input.checked = value;
      } else if (opt.type === "number") {
        input = document.createElement("input");
        input.type = "number";
        input.value = value.toString();
        input.style.width = "70px";
        if (opt.step !== void 0) input.step = String(opt.step);
        if (opt.min !== void 0) input.min = String(opt.min);
        if (opt.max !== void 0) input.max = String(opt.max);
      } else if (opt.type === "text") {
        input = document.createElement("input");
        input.type = "text";
        input.value = value.toString();
        input.style.width = "100%";
      } else if (opt.type === "select") {
        const select = document.createElement("select");
        opt.choices.forEach((choice) => {
          const optionEl = document.createElement("option");
          optionEl.value = choice;
          optionEl.textContent = choice;
          if (choice === value) optionEl.selected = true;
          select.appendChild(optionEl);
        });
        input = select;
        input.style.minWidth = "120px";
      } else {
        const unknownOpt = opt;
        console.error(`[iamasink userscript settings] unknown opt.type ${unknownOpt.type} !!`);
        return;
      }
      input.addEventListener("change", (e) => {
        let newVal;
        if (opt.type === "checkbox") newVal = e.target.checked;
        else if (opt.type === "number") newVal = parseFloat(e.target.value);
        else newVal = e.target.value;
        GM_setValue(gmKey, newVal);
        if (opt.onChange) {
          opt.onChange(newVal);
        }
      });
      wrapper.appendChild(input);
      wrapper.append(" " + opt.label);
      content.appendChild(wrapper);
    }
    function getSetting(label) {
      const opt = options.find((o) => "label" in o && o.label === label);
      if (!opt || opt.type === "spacer") {
        console.warn(`[iamasink userscript settings] getSetting: no setting found with label "${label}"`);
        return void 0;
      }
      const gmKey = getGmKey(opt.label);
      try {
        if (opt.type === "number") return parseFloat(GM_getValue(gmKey, opt.defaultValue.toString()));
        return GM_getValue(gmKey, opt.defaultValue);
      } catch {
        return opt.defaultValue;
      }
    }
    function setSetting(label, value) {
      const opt = options.find((o) => "label" in o && o.label === label);
      if (!opt || opt.type === "spacer") {
        console.warn(`[iamasink userscript settings] setSetting: no setting found with label "${label}"`);
        return;
      }
      GM_setValue(getGmKey(label), value);
      const section = document.getElementById(`sinkusoption-section-${SCRIPT_SHORTNAME}`);
      if (!section) return;
      const content = section.querySelector(`.sinkusoption-section-content-${SCRIPT_SHORTNAME}`);
      if (!content) return;
      const labels = Array.from(content.querySelectorAll("label"));
      const wrapper = labels.find((l) => l.textContent?.trim().endsWith(label));
      if (!wrapper) return;
      const input = wrapper.querySelector("input, select");
      if (!input) return;
      if (input instanceof HTMLInputElement && input.type === "checkbox") {
        input.checked = value;
      } else {
        input.value = String(value);
      }
    }
    if (!document.getElementById(`sinkusoption-section-${SCRIPT_SHORTNAME}`)) {
      options.forEach(addOption);
    }
    return { getSetting, setSetting };
  }

  // src/userscript/YouTubeMiniPlayer.ts
  (function() {
    const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({});
    const shortnameLower = SCRIPT_SHORTNAME.toLowerCase();
    const STYLE_ID = `${shortnameLower}-miniplayer-style`;
    const MINI_CLASS = `${shortnameLower}-miniplayer`;
    const MINI_POS_CLASS_PREFIX = `${shortnameLower}-miniplayerpos`;
    const MINI_SIZE_CLASS_PREFIX = `${shortnameLower}-miniplayersize`;
    const CTRLS_CLASS = `${shortnameLower}-miniplayer-ctrls`;
    let listenersAdded = false;
    let ticking = false;
    let playerEl = null;
    let active = false;
    let closed = false;
    let triggerY = 500;
    const POSITIONS = ["top-right", "top-left", "bottom-left", "bottom-right"];
    const SIZES = {
      "400x225": { width: "400px", height: "225px" },
      "560x315": { width: "560px", height: "315px" },
      "720x405": { width: "720px", height: "405px" },
      "800x450": { width: "800px", height: "450px" },
      "880x495": { width: "880px", height: "495px" },
      "1040x585": { width: "1040px", height: "585px" },
      "1120x630": { width: "1120px", height: "630px" },
      "1200x675": { width: "1200px", height: "675px" },
      "1280x720": { width: "1280px", height: "720px" }
    };
    const sizeClassesCSS = Object.entries(SIZES).map(([key, val]) => `.${MINI_CLASS}.${MINI_SIZE_CLASS_PREFIX}-${key}{width:${val.width} !important;height:${val.height} !important;}`).join("\n");
    let sm;
    function addGlobalListeners() {
      if (listenersAdded) return;
      sm = addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, [
        { label: "Miniplayer Position", type: "select", choices: POSITIONS, defaultValue: "top-left" },
        { label: "Miniplayer Size", type: "select", choices: Object.keys(SIZES), defaultValue: "400x225" }
      ]);
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("yt-navigate-finish", onNavigate);
      listenersAdded = true;
      log("Global listeners added");
    }
    function onNavigate() {
      closed = false;
      playerEl = null;
      main();
    }
    function injectCSS() {
      if (document.getElementById(STYLE_ID)) return;
      const s = document.createElement("style");
      s.id = STYLE_ID;
      s.textContent = `
.${MINI_CLASS} {
	position: fixed !important;
	z-index: 2006 !important;
	box-shadow: 0 4px 24px rgba(0,0,0,0.9) !important;
	transform: none !important;
	background: #350000;


	top: 0 !important;
	left: 0 !important;
	max-width: 100vw !important;
	max-height: calc(100vh - var(--it-header-size)) !important;
	will-change: transform, width, height !important;
}

.${MINI_CLASS} video {
	top: 0 !important;
	left: 0 !important;
	width: 100% !important;
	height: 100% !important;
}
.${MINI_CLASS} .html5-video-container {
	height: 100% !important;
}

${sizeClassesCSS}

/* Miniplayer positions */
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-top-right {
	top: 50px !important;
	right: 20px !important;
	bottom: auto !important;
	left: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-top-left {
	top: 50px !important;
	left: 20px !important;
	bottom: auto !important;
	right: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-bottom-left {
	bottom: 20px !important;
	left: 20px !important;
	top: auto !important;
	right: auto !important;
}
.${MINI_CLASS}.${MINI_POS_CLASS_PREFIX}-bottom-right {
	bottom: 20px !important;
	right: 20px !important;
	top: auto !important;
	left: auto !important;
}
.${CTRLS_CLASS} {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,0.6);
    color: #fff;
    cursor: pointer;
    z-index: 10000;
    font-size: 16px;
    line-height: 24px;
    text-align: center;
    padding: 0;
}
`;
      document.head.appendChild(s);
    }
    function findPlayer() {
      const player = document.getElementById("movie_player");
      log("found player", player);
      return player;
    }
    let playerParent = null;
    let playerNextSibling = null;
    function activate(target) {
      log("activating");
      if (!target || closed || target.classList.contains(MINI_CLASS)) {
        return;
      }
      const pos = sm.getSetting("Miniplayer Position");
      Object.keys(SIZES).forEach((k) => target.classList.remove(`${MINI_SIZE_CLASS_PREFIX}-${k}`));
      const size = sm.getSetting("Miniplayer Size");
      for (let i = 0, len = POSITIONS.length; i < len; i++) {
        target.classList.remove(`${MINI_POS_CLASS_PREFIX}-${POSITIONS[i]}`);
      }
      playerParent = target.parentElement;
      playerNextSibling = target.nextSibling;
      document.body.appendChild(target);
      target.classList.add(MINI_CLASS);
      target.classList.add(`${MINI_POS_CLASS_PREFIX}-${pos}`);
      target.classList.add(`${MINI_SIZE_CLASS_PREFIX}-${size}`);
      window.dispatchEvent(new Event("resize"));
      if (!target.querySelector("." + CTRLS_CLASS)) {
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "x";
        closeBtn.className = CTRLS_CLASS;
        closeBtn.addEventListener("click", () => {
          closed = true;
          restore(target);
        });
        target.appendChild(closeBtn);
      }
      active = true;
      playerEl = target;
    }
    function restore(target) {
      log("restoring");
      if (!target) {
        log("no target");
        return;
      }
      target.classList.remove(MINI_CLASS);
      const closeBtn = target.querySelector("." + CTRLS_CLASS);
      if (closeBtn) closeBtn.remove();
      if (playerParent) {
        playerParent.insertBefore(target, playerNextSibling);
        playerParent = null;
        playerNextSibling = null;
      }
      window.dispatchEvent(new Event("resize"));
      if (playerEl === target) playerEl = null;
      active = false;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (!playerEl) playerEl = findPlayer();
        if (!playerEl) return;
        if (window.location.pathname != "/watch") {
          if (active) {
            restore(playerEl);
          }
          return;
        }
        if (window.scrollY >= triggerY && !active) {
          activate(playerEl);
          return;
        } else if (window.scrollY < triggerY) {
          closed = false;
          if (active) {
            restore(playerEl);
            return;
          }
        }
      });
    }
    function main() {
      injectCSS();
      addGlobalListeners();
      playerEl = findPlayer();
      if (!playerEl) {
        log("No player found");
        return;
      }
      onScroll();
    }
    main();
  })();
})();
