/**
 * Bundled for Capacitor WebView only (public_web/vendor/axis-native.mjs).
 */
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";
import { Share } from "@capacitor/share";
import { LocalNotifications } from "@capacitor/local-notifications";
import { CapacitorHealthkit, SampleNames } from "@perfood/capacitor-healthkit";

const AXIS_SHELL_BG = "#080d18";
const AXIS_DAILY_REMINDER_ID = 1;
const AXIS_DAILY_REMINDER_KEY = "axis_daily_reminder";

let appListenerHandle = null;
let networkListenerHandle = null;

export function isNative() {
  return Capacitor.isNativePlatform();
}

function dispatchAppState(isActive) {
  try {
    window.dispatchEvent(
      new CustomEvent(isActive ? "axis-app-foreground" : "axis-app-background")
    );
  } catch (_e) {}
}

function dispatchNetwork(online) {
  try {
    window.dispatchEvent(
      new CustomEvent(online ? "axis-network-online" : "axis-network-offline")
    );
  } catch (_e) {}
}

async function setupAppStateListeners() {
  if (appListenerHandle) return;
  try {
    appListenerHandle = await App.addListener("appStateChange", ({ isActive }) => {
      dispatchAppState(!!isActive);
    });
  } catch (_e) {}
}

async function setupNetworkListeners() {
  try {
    const status = await Network.getStatus();
    dispatchNetwork(!!status.connected);
  } catch (_e) {
    dispatchNetwork(typeof navigator !== "undefined" ? !!navigator.onLine : true);
  }
  if (networkListenerHandle) return;
  try {
    networkListenerHandle = await Network.addListener("networkStatusChange", (status) => {
      dispatchNetwork(!!status.connected);
    });
  } catch (_e) {}
}

/** Mirror Preferences → localStorage; migrate any local-only keys into Preferences. */
export async function prefsHydrate() {
  if (!isNative()) return;
  try {
    const { keys } = await Preferences.keys();
    for (const key of keys) {
      const { value } = await Preferences.get({ key });
      if (value != null) {
        try {
          localStorage.setItem(key, value);
        } catch (_e) {}
      }
    }
    const toMigrate = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key);
      if (val == null) continue;
      if (!keys.includes(key)) toMigrate.push([key, val]);
    }
    for (const [key, val] of toMigrate) {
      await Preferences.set({ key, value: val });
    }
  } catch (_e) {}
}

export async function prefsSet(key, rawValue) {
  if (!isNative()) return;
  try {
    await Preferences.set({ key, value: rawValue });
  } catch (_e) {}
}

export async function prefsRemove(key) {
  if (!isNative()) return;
  try {
    await Preferences.remove({ key });
  } catch (_e) {}
}

export async function getNetworkOnline() {
  if (!isNative()) return typeof navigator !== "undefined" ? navigator.onLine : true;
  try {
    const status = await Network.getStatus();
    return !!status.connected;
  } catch (_e) {
    return true;
  }
}

export async function shareText({ title = "AXIS", text = "", url = "" }) {
  if (!isNative()) return false;
  try {
    await Share.share({
      title,
      text,
      url: url || undefined,
      dialogTitle: title,
    });
    return true;
  } catch (_e) {
    return false;
  }
}

function readReminderEnabled() {
  try {
    const raw = localStorage.getItem(AXIS_DAILY_REMINDER_KEY);
    if (raw === null) return false;
    return JSON.parse(raw) === true;
  } catch (_e) {
    return false;
  }
}

export async function scheduleDailyReminder() {
  if (!isNative()) return false;
  try {
    const perm = await LocalNotifications.requestPermissions();
    if (!perm.display || perm.display === "denied") return false;
    await LocalNotifications.cancel({ notifications: [{ id: AXIS_DAILY_REMINDER_ID }] });
    await LocalNotifications.schedule({
      notifications: [
        {
          id: AXIS_DAILY_REMINDER_ID,
          title: "AXIS",
          body: "Time for your practice — a few minutes goes a long way.",
          schedule: {
            on: { hour: 9, minute: 0 },
            repeats: true,
            allowWhileIdle: true,
          },
        },
      ],
    });
    return true;
  } catch (_e) {
    return false;
  }
}

export async function cancelDailyReminder() {
  if (!isNative()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: AXIS_DAILY_REMINDER_ID }] });
  } catch (_e) {}
}

async function syncDailyReminderFromStorage() {
  if (!isNative()) return;
  if (readReminderEnabled()) await scheduleDailyReminder();
  else await cancelDailyReminder();
}

const KG_TO_LBS = 2.2046226218;

function healthWeightToLbs(row) {
  const value = Number(row && row.value);
  if (!Number.isFinite(value) || value <= 0) return 0;
  const unit = String((row && row.unitName) || "").toLowerCase();
  if (unit.includes("pound") || unit === "lb") return value;
  return value * KG_TO_LBS;
}

function axisHealthIsoDate(d) {
  return d.toISOString().replace(/\.\d{3}Z$/, ".000Z");
}

export async function healthRequestPermissions(opts) {
  if (!isNative() || Capacitor.getPlatform() !== "ios") {
    return { granted: false, reason: "ios_only" };
  }
  try {
    await CapacitorHealthkit.isAvailable();
    const read = [];
    const want = opts && Array.isArray(opts.read) ? opts.read : ["weight", "steps"];
    if (want.includes("steps")) read.push("steps");
    if (want.includes("weight")) read.push("weight");
    if (want.includes("activity")) read.push("activity");
    if (want.includes("workout")) read.push("workout");
    if (!read.length) read.push("steps", "weight");
    const write = [];
    const wantWrite = opts && Array.isArray(opts.write) ? opts.write : [];
    if (wantWrite.includes("activity")) write.push("activity");
    if (wantWrite.includes("workout")) write.push("workout");
    await CapacitorHealthkit.requestAuthorization({ read, write, all: [] });
    return { granted: true };
  } catch (e) {
    return { granted: false, reason: e && e.message ? e.message : String(e) };
  }
}

export async function healthSaveWorkout({ title = "AXIS Session", startDate, endDate } = {}) {
  if (!isNative() || Capacitor.getPlatform() !== "ios") {
    return { saved: false, reason: "ios_only" };
  }
  try {
    await CapacitorHealthkit.isAvailable();
    await CapacitorHealthkit.requestAuthorization({ read: [], write: ["workout"], all: [] });
    const result = await CapacitorHealthkit.saveWorkout({ title, startDate, endDate });
    return { saved: true, ...(result || {}) };
  } catch (e) {
    return { saved: false, reason: e && e.message ? e.message : String(e) };
  }
}

export async function healthFetchWeightSamples() {
  if (!isNative() || Capacitor.getPlatform() !== "ios") return [];
  try {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const out = await CapacitorHealthkit.queryHKitSampleType({
      sampleName: SampleNames.WEIGHT,
      startDate: axisHealthIsoDate(start),
      endDate: axisHealthIsoDate(end),
      limit: 0,
    });
    return (out && out.resultData ? out.resultData : [])
      .map((row) => {
        const lbs = healthWeightToLbs(row);
        const ts = Date.parse(row.startDate || row.endDate) || 0;
        return { ts, lbs: Math.round(lbs * 10) / 10, source: "health" };
      })
      .filter((x) => x.ts > 0 && x.lbs > 0);
  } catch (_e) {
    return [];
  }
}

export async function healthFetchTodaySteps() {
  if (!isNative() || Capacitor.getPlatform() !== "ios") return null;
  try {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const out = await CapacitorHealthkit.queryHKitSampleType({
      sampleName: SampleNames.STEP_COUNT,
      startDate: axisHealthIsoDate(start),
      endDate: axisHealthIsoDate(end),
      limit: 0,
    });
    const total = (out && out.resultData ? out.resultData : []).reduce(
      (sum, row) => sum + (Number(row && row.value) || 0),
      0
    );
    return Math.max(0, Math.floor(total));
  } catch (_e) {
    return null;
  }
}

function setupHealthBridge() {
  if (!isNative() || Capacitor.getPlatform() !== "ios") return;
  try {
    window.axisHealthRequestPermissions = healthRequestPermissions;
    window.axisFetchHealthWeightSamples = healthFetchWeightSamples;
    window.axisFetchTodayStepCount = healthFetchTodaySteps;
    window.axisSaveHealthWorkout = healthSaveWorkout;
  } catch (_e) {}
}

/** Boot native shell: storage, portrait, status bar, splash, network, reminders. */
export async function init() {
  if (!isNative()) return false;
  try {
    document.documentElement.classList.add("axis-native-shell");
  } catch (_e) {}

  try {
    await SplashScreen.hide();
  } catch (_e) {}

  await prefsHydrate();

  try {
    await ScreenOrientation.lock({ orientation: "portrait" });
  } catch (_e) {}

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: AXIS_SHELL_BG });
    }
  } catch (_e) {}

  await setupAppStateListeners();
  await setupNetworkListeners();
  setupHealthBridge();
  void syncDailyReminderFromStorage();

  try {
    await SplashScreen.hide();
  } catch (_e) {}

  return true;
}

export async function setKeepAwake(enabled) {
  if (!isNative()) return;
  try {
    if (enabled) await KeepAwake.keepAwake();
    else await KeepAwake.allowSleep();
  } catch (_e) {}
}

function patternToImpact(pattern) {
  if (typeof pattern === "number") {
    if (pattern >= 100) return ImpactStyle.Heavy;
    if (pattern >= 70) return ImpactStyle.Medium;
    return ImpactStyle.Light;
  }
  return ImpactStyle.Light;
}

export async function vibratePattern(pattern) {
  if (!isNative()) return;
  try {
    if (Array.isArray(pattern)) {
      if (pattern.length >= 3) {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      }
      if (pattern.length === 2) {
        await Haptics.impact({ style: ImpactStyle.Medium });
        await new Promise((r) => setTimeout(r, pattern[1] || 80));
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      }
    }
    await Haptics.impact({ style: patternToImpact(pattern) });
  } catch (_e) {}
}

export async function tick() {
  if (!isNative()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch (_e) {}
}

export async function success() {
  if (!isNative()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (_e) {}
}
