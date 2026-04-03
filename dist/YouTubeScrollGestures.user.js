// ==UserScript==
// @name        YouTube Scroll Gestures
// @namespace   https://userscripts.iamas.ink
// @version     1.14
// @description Adds scroll gestures for Speed (ctrl+scroll) and Volume (rclick+scroll) like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/*
// @match       https://music.youtube.com/*
// @grant       GM_getValue
// @grant       GM_setValue
// @author      iamasink
// @homepage    https://github.com/iamasink/userscripts
// @supportURL  https://github.com/iamasink/userscripts/issues
// @downloadURL https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeScrollGestures.user.js
// @updateURL   https://raw.githubusercontent.com/iamasink/userscripts/main/dist/YouTubeScrollGestures.user.js
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

  // src/userscript/YouTubeScrollGestures.ts
  (function() {
    const { SCRIPT_NAME, SCRIPT_SHORTNAME, SCRIPT_VERSION, log, logWarn, logError } = init({});
    let listenersAdded = false;
    let rightMouseDown = false;
    let wheelUsed = false;
    let sm = null;
    const SETTINGS = [
      { label: "Reverse Scroll Direction", type: "checkbox", defaultValue: false },
      { type: "spacer" },
      { label: "Enable Volume Scroll", type: "checkbox", defaultValue: true },
      { label: "Volume Requires RClick", type: "checkbox", defaultValue: true },
      { label: "Volume Step", type: "number", defaultValue: 2, step: 1, min: 1, max: 25 },
      { type: "spacer" },
      { label: "Enable Speed Scroll", type: "checkbox", defaultValue: true },
      { label: "Speed Requires RClick", type: "checkbox", defaultValue: false },
      { label: "Speed Step", type: "number", defaultValue: 0.05, step: 0.05, min: 0.05, max: 5 }
    ];
    function addGlobalListeners() {
      if (listenersAdded) return;
      if (new URL(window.location.href).hostname === "music.youtube.com") {
        sm = addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, SETTINGS, "#left-controls", "above");
      } else {
        sm = addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, SETTINGS, "#owner", "below");
      }
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("wheel", onWheel, { passive: false });
      document.addEventListener("contextmenu", onContextMenu, true);
      window.addEventListener("yt-navigate-finish", onNavigate);
      listenersAdded = true;
      log("Global listeners added");
    }
    function onMouseDown(e) {
      if (e.button === 2) {
        rightMouseDown = true;
        wheelUsed = false;
      } else if (e.button === 1) {
        wheelUsed = true;
        if (!(rightMouseDown || e.ctrlKey)) return;
        const player = document.querySelector("#movie_player");
        if (!player) return;
        e.preventDefault();
        if (rightMouseDown) {
          if (player.isMuted()) {
            showOverlay("Volume", "Unmuted");
            player.unMute();
          } else {
            showOverlay("Volume", "Mute");
            player.mute();
          }
        } else if (e.ctrlKey) {
          showOverlay("Speed", "1.00x");
          player.setPlaybackRate(1);
        }
      }
    }
    function onMouseUp(e) {
      if (e.button === 2) {
        rightMouseDown = false;
      }
    }
    function onWheel(e) {
      if (!sm) return;
      const VOLUME_REQUIRES_RCLICK = sm.getSetting("Volume Requires RClick");
      const ENABLE_VOLUME_SCROLL = sm.getSetting("Enable Volume Scroll");
      const VOLUME_STEP = sm.getSetting("Volume Step");
      const ENABLE_SPEED_SCROLL = sm.getSetting("Enable Speed Scroll");
      const SPEED_REQUIRES_RCLICK = sm.getSetting("Speed Requires RClick");
      const SPEED_STEP = sm.getSetting("Speed Step");
      const REVERSE_SCROLL_DIRECTION = sm.getSetting("Reverse Scroll Direction") ? -1 : 1;
      const player = document.querySelector("#movie_player");
      const video = document.querySelector("video");
      if (!player) {
        logError("no #movie_player");
        return;
      }
      if (!video) {
        logError("no video element");
        return;
      }
      if (!e.ctrlKey && (rightMouseDown || !VOLUME_REQUIRES_RCLICK && e.target == video)) {
        if (!ENABLE_VOLUME_SCROLL) return;
        e.preventDefault();
        wheelUsed = true;
        const currVol = player.getVolume();
        const delta = Math.sign(e.deltaY) * REVERSE_SCROLL_DIRECTION;
        const nextVol = delta < 0 ? Math.min(currVol + VOLUME_STEP, 100) : Math.max(currVol - VOLUME_STEP, 0);
        player.unMute();
        player.setVolume(nextVol);
        showOverlay("Volume", `${nextVol}%`);
      } else if (e.ctrlKey) {
        if (!ENABLE_SPEED_SCROLL) return;
        if (SPEED_REQUIRES_RCLICK && !rightMouseDown) return;
        log(e.target);
        if (e.target !== video && !SPEED_REQUIRES_RCLICK) {
          return;
        }
        e.preventDefault();
        wheelUsed = true;
        const currSpeedPlayer = player.getPlaybackRate();
        const currSpeedVideo = video.playbackRate;
        let currSpeed;
        if (currSpeedVideo != 1) {
          currSpeed = currSpeedVideo;
        } else if (currSpeedPlayer != 1) {
          currSpeed = currSpeedPlayer;
        } else {
          currSpeed = 1;
        }
        log("curr", currSpeed);
        const delta = Math.sign(e.deltaY) * REVERSE_SCROLL_DIRECTION;
        let nextSpeed = currSpeed + (delta < 0 ? SPEED_STEP : -SPEED_STEP);
        nextSpeed = Math.max(0.1, Math.min(nextSpeed, 5));
        if (nextSpeed < 0.25) {
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
        showOverlay("Speed", `${nextSpeed.toFixed(2)}x`);
      }
    }
    function onContextMenu(e) {
      if (wheelUsed) {
        e.preventDefault();
        e.stopImmediatePropagation();
        wheelUsed = false;
      }
    }
    function onNavigate() {
      log("Navigation detected");
      rightMouseDown = false;
      wheelUsed = false;
      setTimeout(() => main(), 100);
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
    function main() {
      log("main() called");
      addGlobalListeners();
      log("ready :)");
    }
    main();
  })();
})();
