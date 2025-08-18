// ==UserScript==
// @name        YouTube Scroll Gestures
// @namespace   Violentmonkey Scripts
// @version     1.1
// @description Adds scroll gestures for Speed (ctrl+scroll) and Volume (rclick+scroll) like from "Enhancer for YouTube™"
// @match       https://www.youtube.com/watch*
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
  // src/lib/ytSettingsMenu.ts
  function addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME = SCRIPT_SHORTNAME, options) {
    function ensureOptionsMenu() {
      let popup = document.getElementById("sinkusoption-popup");
      if (popup) return popup;
      const owner = document.getElementById("owner");
      if (!owner) return null;
      const container = document.createElement("div");
      container.style.marginTop = "8px";
      container.style.position = "relative";
      owner.appendChild(container);
      const cog = document.createElement("button");
      cog.textContent = "\u2699";
      Object.assign(cog.style, {
        fontSize: "16px",
        padding: "4px 8px",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      });
      container.appendChild(cog);
      popup = document.createElement("div");
      popup.id = "sinkusoption-popup";
      Object.assign(popup.style, {
        display: "none",
        position: "absolute",
        top: "100%",
        left: "0",
        marginTop: "4px",
        padding: "12px",
        background: "rgba(0,0,0,0.95)",
        color: "#fff",
        borderRadius: "6px",
        minWidth: "220px",
        fontSize: "14px",
        boxShadow: "0 0 8px rgba(0,0,0,0.7)",
        zIndex: "9999"
      });
      container.appendChild(popup);
      const header = document.createElement("h3");
      header.textContent = SCRIPT_NAME;
      header.style.margin = "0 0 6px 0";
      header.style.fontSize = "16px";
      popup.appendChild(header);
      cog.addEventListener("click", () => {
        popup.style.display = popup.style.display === "none" ? "block" : "none";
      });
      return popup;
    }
    function addOption(opt) {
      const popup = ensureOptionsMenu();
      if (!popup) return;
      if (opt.type === "spacer") {
        const spacer = document.createElement("div");
        spacer.style.height = "12px";
        popup.appendChild(spacer);
        return;
      }
      const id = "sinkusoption-" + SCRIPT_SHORTNAME.toLowerCase() + opt.label.toLowerCase().replace(/\s+/g, "-");
      if (document.getElementById(id)) return;
      const wrapper = document.createElement("label");
      wrapper.style.display = "block";
      let input;
      switch (opt.type) {
        case "checkbox": {
          input = document.createElement("input");
          input.type = "checkbox";
          input.checked = opt.defaultValue;
          break;
        }
        case "number": {
          input = document.createElement("input");
          input.type = "number";
          input.value = opt.defaultValue.toString();
          input.style.width = "60px";
          if (opt.step !== void 0) input.step = opt.step.toString();
          if (opt.min !== void 0) input.min = opt.min.toString();
          if (opt.max !== void 0) input.max = opt.max.toString();
          break;
        }
        case "text": {
          input = document.createElement("input");
          input.type = "text";
          input.value = opt.defaultValue;
          input.style.width = "100%";
          break;
        }
        case "select": {
          const select = document.createElement("select");
          opt.choices.forEach((choice) => {
            const optionEl = document.createElement("option");
            optionEl.value = choice;
            optionEl.textContent = choice;
            if (choice === opt.defaultValue) optionEl.selected = true;
            select.appendChild(optionEl);
          });
          input = select;
          break;
        }
      }
      input.id = id;
      input.addEventListener("change", (e) => {
        let val;
        if (opt.type === "checkbox") val = e.target.checked;
        else if (opt.type === "number") val = parseFloat(e.target.value);
        else val = e.target.value;
        opt.onChange(val);
      });
      wrapper.appendChild(input);
      if ("label" in opt) wrapper.append(" " + opt.label);
      popup.appendChild(wrapper);
    }
    options.forEach(addOption);
  }

  // src/userscript/YouTubeScrollGestures.ts
  (function() {
    const LOGGING_ENABLED = true;
    let ENABLE_SPEED_SCROLL = GM_getValue("sg-speed-enabled", true);
    let SPEED_STEP = parseFloat(GM_getValue("sg-speed-step", "0.05"));
    let SPEED_REQUIRES_RCLICK = GM_getValue("sg-speed-rclick", false);
    let ENABLE_VOLUME_SCROLL = GM_getValue("sg-volume-enabled", true);
    let VOLUME_STEP = parseFloat(GM_getValue("sg-volume-step", "2"));
    let VOLUME_REQUIRES_RCLICK = GM_getValue("sg-volume-rclick", true);
    const SETTINGS = [
      {
        label: "Enable Volume Scroll",
        type: "checkbox",
        defaultValue: true,
        onChange: (val) => {
          ENABLE_VOLUME_SCROLL = val;
          GM_setValue("sg-volume-enabled", val);
        }
      },
      {
        label: "Volume Step",
        type: "number",
        defaultValue: VOLUME_STEP,
        onChange: (val) => {
          VOLUME_STEP = val;
          GM_setValue("sg-volume-step", val);
        },
        step: 1,
        min: 1,
        max: 25
      },
      {
        label: "Volume Requires Right-Click",
        type: "checkbox",
        defaultValue: VOLUME_REQUIRES_RCLICK,
        onChange: (val) => {
          VOLUME_REQUIRES_RCLICK = val;
          GM_setValue("sg-volume-rclick", val);
        }
      },
      { type: "spacer" },
      {
        label: "Enable Speed Scroll",
        type: "checkbox",
        defaultValue: true,
        onChange: (val) => {
          ENABLE_SPEED_SCROLL = val;
          GM_setValue("sg-speed-enabled", val);
        }
      },
      {
        label: "Speed Step",
        type: "number",
        defaultValue: SPEED_STEP,
        onChange: (val) => {
          SPEED_STEP = val;
          GM_setValue("sg-speed-step", val);
        },
        step: 0.05,
        min: 0.05,
        max: 5
      },
      {
        label: "Speed Requires Right-Click",
        type: "checkbox",
        defaultValue: SPEED_REQUIRES_RCLICK,
        onChange: (val) => {
          SPEED_REQUIRES_RCLICK = val;
          GM_setValue("sg-speed-rclick", val);
        }
      }
    ];
    const SCRIPT_NAME = GM_info.script.name;
    const SCRIPT_SHORTNAME = GM_info.script.downloadURL.split("/").slice(-1)[0].split(".").slice(0, -2).join(".").trim() || SCRIPT_NAME.replace(" ", "").trim();
    const SCRIPT_VERSION = GM_info.script.version;
    const LOG_PREFIX = `[${SCRIPT_SHORTNAME}]`;
    const log = (...args) => LOGGING_ENABLED && console.log(LOG_PREFIX, ...args);
    const logWarn = (...args) => console.warn(LOG_PREFIX, ...args);
    const logError = (...args) => console.error(LOG_PREFIX, ...args);
    console.log(`[${SCRIPT_SHORTNAME}] ${SCRIPT_NAME} v${SCRIPT_VERSION} by iamasink loaded`);
    let rightMouseDown = false;
    let wheelUsed = false;
    document.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        rightMouseDown = true;
        wheelUsed = false;
      } else if (e.button === 1) {
        const player = document.querySelector("#movie_player");
        wheelUsed = false;
        e.preventDefault();
        if (rightMouseDown) {
          if (player.isMuted()) {
            showOverlay("Volume", `Unmuted`);
            player.unMute();
          } else {
            showOverlay("Volume", `Mute`);
            player.mute();
          }
        } else if (e.ctrlKey) {
          showOverlay("Speed", `1.00x`);
          player.setPlaybackRate(1);
        }
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (e.button === 2) {
        rightMouseDown = false;
      }
    });
    document.addEventListener("wheel", (e) => {
      const player = document.querySelector("#movie_player");
      const video = document.querySelector("video");
      if (!player) {
        logError("no #movie_player");
      }
      if (!video) {
        logError("no video element");
      }
      if (!e.ctrlKey && (rightMouseDown || !VOLUME_REQUIRES_RCLICK && e.target == video)) {
        if (!ENABLE_VOLUME_SCROLL) return;
        e.preventDefault();
        wheelUsed = true;
        const currVol = player.getVolume();
        const delta = Math.sign(e.deltaY);
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
        const delta = Math.sign(e.deltaY);
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
    }, { passive: false });
    document.addEventListener("contextmenu", (e) => {
      if (wheelUsed) {
        e.preventDefault();
        e.stopImmediatePropagation();
        wheelUsed = false;
      }
    }, true);
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
    const observer = new MutationObserver(() => {
      const owner = document.getElementById("owner");
      if (!owner) return;
      addSettingsMenu(SCRIPT_SHORTNAME, SCRIPT_NAME, SETTINGS);
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  })();
})();
