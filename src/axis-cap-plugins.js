/**
 * Bundled for the Capacitor web layer: haptics, keep-awake, native audio preload.
 * Build: npx esbuild src/axis-cap-plugins.js --bundle --format=iife --platform=browser --outfile=public_web/axis-cap-plugins.js
 */
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { NativeAudio } from "@capacitor-community/native-audio";

function impactLight() {
  return Haptics.impact({ style: ImpactStyle.Light }).catch(function () {});
}

function notificationSuccess() {
  return Haptics.notification({ type: NotificationType.Success }).catch(function () {});
}

function keepAwakeOn() {
  return KeepAwake.keepAwake().catch(function () {});
}

function keepAwakeOff() {
  return KeepAwake.allowSleep().catch(function () {});
}

/** Relative to web root (public_web/) after cap sync. Add MP3s under public_web/cues/ */
var WORKOUT_CUE_PRELOADS = [
  { assetId: "cue_countdown_321_go", assetPath: "cues/countdown_321_go.mp3" },
  { assetId: "cue_count_3", assetPath: "cues/count_3.mp3" },
  { assetId: "cue_count_2", assetPath: "cues/count_2.mp3" },
  { assetId: "cue_count_1", assetPath: "cues/count_1.mp3" },
  { assetId: "cue_go", assetPath: "cues/go.mp3" }
];

function preloadWorkoutCues() {
  return Promise.all(
    WORKOUT_CUE_PRELOADS.map(function (entry) {
      return NativeAudio.preload({
        assetId: entry.assetId,
        assetPath: entry.assetPath,
        audioChannelNum: 1,
        isUrl: false
      }).catch(function (err) {
        console.warn("[AXIS] workout cue preload skipped:", entry.assetId, err && err.message ? err.message : err);
      });
    })
  );
}

window.AXISCap = {
  impactLight: impactLight,
  notificationSuccess: notificationSuccess,
  keepAwakeOn: keepAwakeOn,
  keepAwakeOff: keepAwakeOff,
  preloadWorkoutCues: preloadWorkoutCues,
  NativeAudio: NativeAudio,
  WORKOUT_CUE_IDS: WORKOUT_CUE_PRELOADS.map(function (e) {
    return e.assetId;
  })
};

if (typeof document !== "undefined") {
  var runPreload = function () {
    preloadWorkoutCues();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPreload);
  } else {
    setTimeout(runPreload, 0);
  }
}
