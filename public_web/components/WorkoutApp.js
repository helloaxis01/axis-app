import {
  AXIS_EVER_BOOKMARKED_EXERCISE_KEY,
  AXIS_METRICS_PAIN_KEY,
  AXIS_METRICS_WEIGHT_KEY,
  AXIS_PAIN_ARCHIVE_KEY,
  AXIS_PAIN_LOG_KEY,
  AXIS_SESSION_GUIDED_DONE_KEY,
  AXIS_SESSION_LIST_DONE_KEY,
  AXIS_WEIGHT_ARCHIVE_KEY,
  AxisChevronCaret,
  AxisFirstBookmarkSavedTip,
  AxisThinArrowRight,
  CIRCADIAN_THEMES,
  DashboardHeader,
  ExRow,
  GuidedOverlay,
  HAPTIC_LIGHT_TAP,
  HOME_CATEGORY_FILTERS,
  HOME_TRACK_GROUPS,
  MetricsArchivedDataModal,
  MetricsPainCard,
  MetricsWeightCard,
  MomentumMap,
  React,
  ReactDOM,
  SettingsAccountRows,
  TRACKS,
  TRACKS_DATA_FALLBACK,
  TRACK_CATEGORY_BY_ID,
  TabBar,
  Timer,
  TimerView,
  applyCircadianTheme,
  axisActiveUidForStorage,
  axisCelebrationFadeMs,
  axisCelebrationScopedKey,
  axisDateFromHistoryEntry,
  axisExerciseListParenDirectionDisplayName,
  axisExerciseNameForHistoryEntry,
  axisExerciseTargetMetaLine,
  axisFormatDurationMinUpper,
  axisFormatSessionHeaderDuration,
  axisFormatLastSessionDayUpper,
  axisHapticTick,
  axisHealthFetchTodayStepsNative,
  axisHealthFetchWeightSamplesNative,
  axisHealthRequestReadPermissions,
  axisHistoryForDailyTotals,
  axisLatestHistoryEntryForTrack,
  axisLatestHistoryEntryGlobal,
  axisLoadSessionGuidedDone,
  axisLoadSessionListDone,
  axisLocalDateKey,
  axisMetricsApplyRetention,
  axisMetricsFormatSessionDurationShort,
  axisMetricsMergePainArchive,
  axisMetricsMergeWeightArchive,
  axisMetricsMergeWeightByTs,
  axisMetricsMigratePainMap,
  axisMetricsNormalizeWeightList,
  axisMetricsPainEntriesDescending,
  axisMovementStreakDays,
  axisPrefersReducedMotion,
  axisRelativeDayLabel,
  axisResolveMoodPeriod,
  axisResolveTrackIdFromHistoryEntry,
  axisSessionDoneClearTrack,
  axisSessionDoneLookup,
  axisSessionDoneMergeTrack,
  axisSessionDoneSlice,
  axisSnapWeeklyGoalMinutes,
  axisSumMinutesOnLocalDay,
  axisTrackCardSubtitleDisplay,
  axisWeekMomentumFromHistory,
  axisWelcomeDisplayNameFromStorage,
  beep,
  getAll,
  getCircadianPeriod,
  getSections,
  primeAudio,
  storageGet,
  storageSet,
  triggerHaptic,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from '../app.js';

function EolMarker() {
  const [showTag, setShowTag] = useState(false);
  const holdRef = useRef(null);
  const timerRef = useRef(null);

  const startPress = () => {
    holdRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(10);
      setShowTag(true);
      timerRef.current = setTimeout(() => setShowTag(false), 2000);
    }, 600);
  };
  const endPress = () => {clearTimeout(holdRef.current);};

  return (/*#__PURE__*/
    React.createElement("div", {
      className: "eol-marker" + (showTag ? " show-tag" : ""),
      onMouseDown: startPress, onMouseUp: endPress, onMouseLeave: endPress,
      onTouchStart: startPress, onTouchEnd: endPress }, /*#__PURE__*/

    React.createElement("span", { className: "eol-xs" }, "X X X X"), /*#__PURE__*/
    React.createElement("span", { className: "eol-tag" }, "X MOVE X MEND X MAINTAIN X")
    ));

}

function axisExportAxisLocalData() {
  const nowIso = new Date().toISOString();
  const weightLog = axisMetricsNormalizeWeightList(storageGet(AXIS_METRICS_WEIGHT_KEY, []));
  const weightArchive = axisMetricsMergeWeightArchive([], storageGet(AXIS_WEIGHT_ARCHIVE_KEY, []));
  const painLogMap = axisMetricsMigratePainMap(storageGet(AXIS_METRICS_PAIN_KEY, storageGet(AXIS_PAIN_LOG_KEY, {})));
  const painLog = axisMetricsPainEntriesDescending(painLogMap).map((e) => ({ dateKey: e.dateKey, level: e.level, note: e.note || "" })).reverse();
  const painArchive = axisMetricsMergePainArchive([], storageGet(AXIS_PAIN_ARCHIVE_KEY, []));
  const pack = {
    exportedAt: nowIso,
    user: storageGet("axis_user_email", null),
    weightLog,
    weightArchive,
    painLog,
    painArchive,
    goals: {
      dailyMinutes: storageGet("axis_daily_goal_minutes", 30),
      weeklyMinutes: storageGet("axis_weekly_goal_minutes", null),
      weeklyFollowsDaily: storageGet("axis_weekly_follows_daily", true)
    },
    preferences: {
      theme: storageGet("axis_theme", "dark"),
      nightMode: storageGet("axis_night", false),
      moodPeriod: storageGet("axis_period", null),
      exerciseDuration: storageGet("axis_exercise_duration", 45),
      showStreak: storageGet("axis_show_streak", true),
      showTimer: storageGet("axis_show_timer", true),
      showPct: storageGet("axis_show_pct", true)
    }
  };
  try {
    if (typeof localStorage !== "undefined" && !pack.user) pack.user = localStorage.getItem("axisUserEmail") || localStorage.getItem("axisUserName");
  } catch (e) {}
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `axis-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function WorkoutApp({ theme, toggleTheme, nightMode = false, toggleNight = () => {}, onGuidedOpen }) {
  const AXIS_APP_ICON_BLANK = "data:image/svg+xml," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"180\" height=\"180\" viewBox=\"0 0 180 180\"><rect width=\"180\" height=\"180\" fill=\"#080d18\"/></svg>");
  const APP_ICON_OPTIONS = [
  { id: "wordmark", label: "Wordmark", src: "./axis-icon.png" },
  { id: "classic", label: "Classic", src: AXIS_APP_ICON_BLANK },
  { id: "light", label: "Light", src: AXIS_APP_ICON_BLANK },
  { id: "dark", label: "Dark", src: AXIS_APP_ICON_BLANK }];

  const [view, setView] = useState("home");
  /** system tab: Mood is default; Settings opens from bottom control on Mood or full settings panel */
  const [systemPanel, setSystemPanel] = useState("mood");
  const [favoritesSegment, setFavoritesSegment] = useState("tracks");
  const APP_VERSION_DISPLAY = "v1.0.0";
  const [metricsFactsCycle, setMetricsFactsCycle] = useState(-1);
  const [activePeriod, setActivePeriod] = useState(() => storageGet("axis_period", null)); // null = auto
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showStreak, setShowStreak] = useState(() => storageGet("axis_show_streak", true));
  const [showTimer, setShowTimer] = useState(() => storageGet("axis_show_timer", true));
  const [showPct, setShowPct] = useState(() => storageGet("axis_show_pct", true));
  const [exerciseDuration, setExerciseDuration] = useState(() => {
    const v = Number(storageGet("axis_exercise_duration", 45));
    if (!Number.isFinite(v)) return 45;
    return Math.min(300, Math.max(1, Math.round(v)));
  });
  const [track, setTrack] = useState("daily");
  const prevViewRef = useRef(null);
  const [fi, setFi] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [resting, setResting] = useState(false);
  const [guidedActive, setGuidedActive] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [listDone, setListDone] = useState(() => axisLoadSessionListDone());
  const [guidedDone, setGuidedDone] = useState(() => axisLoadSessionGuidedDone());
  const [skipped, setSkipped] = useState(() => storageGet("axis_skipped", {}));
  const [favs, setFavs] = useState(() => storageGet("axis_favs", {}));
  const [notes, setNotes] = useState(() => storageGet("axis_notes", {}));
  const [sessionSecs, setSessionSecs] = useState(0);
  const [streak, setStreak] = useState(() => storageGet("axis_streak", 0));
  const [history, setHistory] = useState(() => storageGet("axis_history", []));
  const sessionContentRef = useRef(null);
  const sessionFirstPurposeRef = useRef(null);
  const listScrollRef = useRef(0);
  const [guidedTimelineExpanded, setGuidedTimelineExpanded] = useState(false);
  const [purposeOpenBySection, setPurposeOpenBySection] = useState(() => ({}));
  const [homeTrackCategory, setHomeTrackCategory] = useState("all");
  const [homeSection, setHomeSection] = useState(() => {
    const v = storageGet("axis_home_section", null);
    if (v === "routine" || v === "explore") return v;
    const legacy = storageGet("axis_home_pivot", null);
    if (legacy === "explore") return "explore";
    if (legacy === "routine") return "routine";
    return "explore";
  });
  const [favoriteTrackIds, setFavoriteTrackIds] = useState(() => {
    const raw = storageGet("axis_favorite_tracks", []);
    if (!Array.isArray(raw)) return [];
    return raw.filter((id) => typeof id === "string" && TRACKS && TRACKS[id]).slice(0, 24);
  });
  /** Prevents double-counting if an exercise is toggled off/on in one session; cleared in beginTrack */
  const sessionExerciseLoggedRef = useRef(/* @__PURE__ */ new Set());
  const [recentTracks, setRecentTracks] = useState(() => {
    const raw = storageGet("axis_recent_tracks", []);
    let arr = Array.isArray(raw) ? raw.filter((id) => typeof id === "string").slice(0, 4) : [];
    let resolved = arr.filter((id) => TRACKS && TRACKS[id]);
    if (resolved.length > 0) return resolved;
    const hist = storageGet("axis_history", []);
    if (Array.isArray(hist)) {
      const fromHist = [];
      const seen = /* @__PURE__ */ new Set();
      for (let i = 0; i < hist.length && fromHist.length < 4; i++) {
        const tid = hist[i] && hist[i].trackId;
        if (typeof tid === "string" && TRACKS && TRACKS[tid] && !seen.has(tid)) {
          seen.add(tid);
          fromHist.push(tid);
        }
      }
      if (fromHist.length > 0) return fromHist;
    }
    return arr;
  });
  const [selectedAppIcon, setSelectedAppIcon] = useState(() => {
    const fallback = "./axis-icon.png";
    const removedFive = { "./app-icons/icon-ultra.png": 1, "/app-icons/icon-ultra.png": 1, "./app-icons/icon-rise.png": 1, "/app-icons/icon-rise.png": 1, "./app-icons/icon-midday.png": 1, "/app-icons/icon-midday.png": 1, "./app-icons/icon-prime.png": 1, "/app-icons/icon-prime.png": 1, "./app-icons/icon-rest.png": 1, "/app-icons/icon-rest.png": 1 };
    try {
      const v = storageGet("axis_app_icon", fallback);
      if (!v) return fallback;
      if (removedFive[v]) return fallback;
      if (v === "./app-icons/icon-classic.png" || v === "/app-icons/icon-classic.png") return AXIS_APP_ICON_BLANK;
      if (v === "./app-icons/icon-light.png" || v === "/app-icons/icon-light.png") return AXIS_APP_ICON_BLANK;
      if (v === "./app-icons/icon-dark.png" || v === "/app-icons/icon-dark.png") return AXIS_APP_ICON_BLANK;
      return v || fallback;
    } catch (e) {
      return fallback;
    }
  });
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(() => {
    const v = Number(storageGet("axis_daily_goal_minutes", 30));
    return Math.min(90, Math.max(1, Number.isFinite(v) ? v : 30));
  });
  const [weeklyFollowsDaily, setWeeklyFollowsDaily] = useState(() => {
    const rawWeekly = storageGet("axis_weekly_goal_minutes", null);
    const storedFollows = storageGet("axis_weekly_follows_daily", null);
    if (storedFollows === false) return false;
    if (storedFollows === true) return true;
    return rawWeekly == null || rawWeekly === "";
  });
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(() => {
    const v = Number(storageGet("axis_daily_goal_minutes", 30));
    const daily = Math.min(90, Math.max(1, Number.isFinite(v) ? v : 30));
    const rawWeekly = storageGet("axis_weekly_goal_minutes", null);
    const storedFollows = storageGet("axis_weekly_follows_daily", null);
    const follows = storedFollows === false ? false : storedFollows === true ? true : (rawWeekly == null || rawWeekly === "");
    if (follows) return axisSnapWeeklyGoalMinutes(daily * 7);
    if (rawWeekly != null && rawWeekly !== "") {
      const w = Number(rawWeekly);
      if (Number.isFinite(w)) return axisSnapWeeklyGoalMinutes(w);
    }
    return axisSnapWeeklyGoalMinutes(daily * 7);
  });
  const [summaryRecentExpanded, setSummaryRecentExpanded] = useState(false);
  const [summaryRecentOpen, setSummaryRecentOpen] = useState(false);
  const [last7DaysInfoOpen, setLast7DaysInfoOpen] = useState(false);
  const [goalsInfoOpen, setGoalsInfoOpen] = useState(false);
  const [metricsWeightSamples, setMetricsWeightSamples] = useState(() => axisMetricsNormalizeWeightList(storageGet(AXIS_METRICS_WEIGHT_KEY, [])));
  const [metricsPainByDay, setMetricsPainByDay] = useState(() => {
    const o = storageGet(AXIS_METRICS_PAIN_KEY, storageGet(AXIS_PAIN_LOG_KEY, {}));
    const raw = o && typeof o === "object" && !Array.isArray(o) ? o : {};
    return axisMetricsMigratePainMap(raw);
  });
  const [metricsWeightArchive, setMetricsWeightArchive] = useState(() => axisMetricsMergeWeightArchive([], storageGet(AXIS_WEIGHT_ARCHIVE_KEY, [])));
  const [metricsPainArchive, setMetricsPainArchive] = useState(() => axisMetricsMergePainArchive([], storageGet(AXIS_PAIN_ARCHIVE_KEY, [])));
  const [archivedDataOpen, setArchivedDataOpen] = useState(false);
  const [privacyPolicyOpen, setPrivacyPolicyOpen] = useState(false);
  const [settingsHealthOpen, setSettingsHealthOpen] = useState(true);
  const [settingsDataOpen, setSettingsDataOpen] = useState(true);
  const [settingsAboutOpen, setSettingsAboutOpen] = useState(true);
  const [settingsAccountOpen, setSettingsAccountOpen] = useState(true);
  const [metricsStepsToday, setMetricsStepsToday] = useState(null);
  const [metricsHealthHint, setMetricsHealthHint] = useState("");
  const [healthConnectSyncMsg, setHealthConnectSyncMsg] = useState("");
  const [welcomeName, setWelcomeName] = useState(() => axisWelcomeDisplayNameFromStorage());
  const manifestBlobUrlRef = useRef(null);
  const prevMoodBgRef = useRef(null);
  const moodXfadeTimerRef = useRef(null);
  const prevTodayMinutesForGoalRef = useRef(null);
  const pendingDailyGoalCelebrationRef = useRef(false);
  const dailyGoalCelebrationTimersRef = useRef([]);
  const [listFirstSessionCelebration, setListFirstSessionCelebration] = useState(false);
  const [guidedFirstSessionCelebration, setGuidedFirstSessionCelebration] = useState(false);
  const [dailyGoalCelebrationNonce, setDailyGoalCelebrationNonce] = useState(0);
  const [dailyGoalHeroPulse, setDailyGoalHeroPulse] = useState(false);
  const [dailyGoalEyebrowGoalHit, setDailyGoalEyebrowGoalHit] = useState(false);
  const [dailyGoalEyebrowMovementOpaque, setDailyGoalEyebrowMovementOpaque] = useState(true);
  const [dailyGoalInsightMounted, setDailyGoalInsightMounted] = useState(false);
  const [dailyGoalInsightOpaque, setDailyGoalInsightOpaque] = useState(false);
  const [bookmarkTooltipExerciseId, setBookmarkTooltipExerciseId] = useState(null);
  const [bookmarkTooltipTrackId, setBookmarkTooltipTrackId] = useState(null);

  useLayoutEffect(() => {
    try {
      if (typeof sessionStorage === "undefined" || sessionStorage.getItem("axis_boot_home") !== "1") return;
      sessionStorage.removeItem("axis_boot_home");
      setView("home");
      setHomeSection("explore");
      setSystemPanel("mood");
      setHasActiveSession(false);
    } catch (e) {}
  }, []);

  const applySelectedAppIcon = async (iconHref) => {
    if (typeof document === "undefined" || !iconHref) return;
    const upsertLink = (selector, rel, href, type) => {
      let link = document.querySelector(selector);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      if (type) link.setAttribute("type", type);
      link.setAttribute("href", href);
    };

    // Live favicon + iOS home icon updates (tab favicon uses SVG when the install/touch asset is axis-icon.png).
    upsertLink("link[rel='apple-touch-icon']", "apple-touch-icon", iconHref);
    const raw = String(iconHref);
    const base = raw.split("?")[0].split("#")[0];
    let favHref = raw;
    let favType = "image/png";
    if (/axis-icon\.png$/i.test(base)) {
      favHref = raw.replace(/axis-icon\.png/i, "axis-icon.svg");
      favType = "image/svg+xml";
    } else if (/^data:image\/svg\+xml/i.test(raw)) {
      favHref = raw;
      favType = "image/svg+xml";
    }
    upsertLink("link[rel='icon']", "icon", favHref, favType);

    // Best-effort manifest icon remap (PWA install often requires re-adding to homescreen).
    const manifestLink = document.querySelector("link[rel='manifest']");
    if (!manifestLink) return;
    const manifestHref = manifestLink.getAttribute("href");
    if (!manifestHref) return;
    try {
      const manifestUrl = new URL(manifestHref, window.location.href).href;
      const res = await fetch(manifestUrl, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const next = { ...json };
      if (Array.isArray(next.icons) && next.icons.length > 0) {
        next.icons = next.icons.map((icon) => ({ ...icon, src: iconHref }));
      } else {
        next.icons = [{ src: iconHref, sizes: "192x192", type: "image/png" }, { src: iconHref, sizes: "512x512", type: "image/png" }];
      }
      const blob = new Blob([JSON.stringify(next)], { type: "application/json" });
      const blobUrl = URL.createObjectURL(blob);
      if (manifestBlobUrlRef.current) URL.revokeObjectURL(manifestBlobUrlRef.current);
      manifestBlobUrlRef.current = blobUrl;
      manifestLink.setAttribute("href", blobUrl);
    } catch (e) {}
  };

  useEffect(() => {
    storageSet("axis_app_icon", selectedAppIcon);
    void applySelectedAppIcon(selectedAppIcon);
  }, [selectedAppIcon]);
  useEffect(() => {
    storageSet("axis_daily_goal_minutes", dailyGoalMinutes);
  }, [dailyGoalMinutes]);
  useEffect(() => {
    storageSet("axis_weekly_goal_minutes", weeklyGoalMinutes);
  }, [weeklyGoalMinutes]);
  useEffect(() => {
    storageSet("axis_weekly_follows_daily", weeklyFollowsDaily);
  }, [weeklyFollowsDaily]);
  useEffect(() => {
    setWelcomeName(axisWelcomeDisplayNameFromStorage());
  }, [view]);

  useEffect(() => {
    storageSet(AXIS_METRICS_WEIGHT_KEY, metricsWeightSamples);
  }, [metricsWeightSamples]);
  useEffect(() => {
    storageSet(AXIS_METRICS_PAIN_KEY, metricsPainByDay);
    storageSet(AXIS_PAIN_LOG_KEY, metricsPainByDay);
  }, [metricsPainByDay]);
  useEffect(() => {
    storageSet(AXIS_WEIGHT_ARCHIVE_KEY, metricsWeightArchive);
  }, [metricsWeightArchive]);
  useEffect(() => {
    storageSet(AXIS_PAIN_ARCHIVE_KEY, metricsPainArchive);
  }, [metricsPainArchive]);
  useEffect(() => {
    const retained = axisMetricsApplyRetention(metricsWeightSamples, metricsPainByDay);
    if (retained.hadPurge) {
      setMetricsWeightSamples(retained.keepWeight);
      setMetricsPainByDay(retained.keepPain);
      setMetricsWeightArchive(retained.mergedWeightArchive);
      setMetricsPainArchive(retained.mergedPainArchive);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await axisHealthRequestReadPermissions();
      const imported = await axisHealthFetchWeightSamplesNative();
      const steps = await axisHealthFetchTodayStepsNative();
      if (cancelled) return;
      setMetricsStepsToday(steps);
      if (imported.length > 0) {
        setMetricsWeightSamples((prev) => axisMetricsMergeWeightByTs(axisMetricsNormalizeWeightList(prev), imported));
        setMetricsHealthHint("Synced from Apple Health / Health Connect");
      } else {
        setMetricsHealthHint(typeof window.axisFetchHealthWeightSamples === "function" ? "" : "No health data yet, use Log Weight on Metrics or Connect & sync in Settings.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    if (manifestBlobUrlRef.current) URL.revokeObjectURL(manifestBlobUrlRef.current);
  }, []);

  useEffect(() => {
    if (!guidedActive) {setSessionComplete(false);return;}
    if (sessionComplete) return;
    setSessionSecs(0);
    const t = setInterval(() => setSessionSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [guidedActive, sessionComplete]);

  // Paint gradient on body + apply circadian theme (useLayoutEffect to avoid flash on tab switch)
  useLayoutEffect(() => {
    if (moodXfadeTimerRef.current) {
      clearTimeout(moodXfadeTimerRef.current);
      moodXfadeTimerRef.current = null;
    }
    const isDark = theme === "dark";
    const period = axisResolveMoodPeriod(activePeriod);
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const circadian = nightMode ? { bg: "#000000" } : applyCircadianTheme(isDark, period);
    const fallback = isDark ?
    "radial-gradient(ellipse at 50% 40%, #0f1f35 0%, #0a1525 45%, #080d18 100%)" :
    "linear-gradient(145deg, #c8d8e8 0%, #d0dcea 35%, #dce4ec 70%, #e8eef4 100%)";
    const newBg = (circadian && circadian.bg) || fallback;
    document.body.style.width = "100%";
    document.documentElement.style.width = "100%";
    document.body.style.minHeight = "100vh";

    if (reduced) {
      document.documentElement.classList.remove("axis-mood-xfade--b-top");
      document.documentElement.style.removeProperty("--bg-app-a");
      document.documentElement.style.removeProperty("--bg-app-b");
      document.body.style.transition = "none";
      if (theme !== "light") document.body.style.background = newBg;
      else document.body.style.background = "";
      prevMoodBgRef.current = newBg;
      return () => {document.body.style.background = "";};
    }

    document.body.style.transition = "background var(--motion-slow)";

    if (nightMode) {
      document.documentElement.classList.remove("axis-mood-xfade--b-top");
      document.documentElement.style.removeProperty("--bg-app-a");
      document.documentElement.style.removeProperty("--bg-app-b");
      if (theme !== "light") document.body.style.background = newBg;
      else document.body.style.background = "";
      prevMoodBgRef.current = newBg;
      return () => {document.body.style.background = "";};
    }

    const oldBg = prevMoodBgRef.current;
    if (oldBg != null && oldBg !== newBg) {
      document.documentElement.style.setProperty("--bg-app-a", oldBg);
      document.documentElement.style.setProperty("--bg-app-b", newBg);
      document.documentElement.classList.remove("axis-mood-xfade--b-top");
      void document.documentElement.offsetHeight;
      requestAnimationFrame(() => {
        document.documentElement.classList.add("axis-mood-xfade--b-top");
      });
      moodXfadeTimerRef.current = setTimeout(() => {
        document.documentElement.style.setProperty("--bg-app-a", newBg);
        document.documentElement.classList.remove("axis-mood-xfade--b-top");
        prevMoodBgRef.current = newBg;
        moodXfadeTimerRef.current = null;
      }, 800);
    } else {
      document.documentElement.style.setProperty("--bg-app-a", newBg);
      document.documentElement.style.setProperty("--bg-app-b", newBg);
      prevMoodBgRef.current = newBg;
    }

    if (theme !== "light") document.body.style.background = newBg;
    else document.body.style.background = "";
    return () => {
      document.body.style.background = "";
      if (moodXfadeTimerRef.current) {
        clearTimeout(moodXfadeTimerRef.current);
        moodXfadeTimerRef.current = null;
      }
    };
  }, [theme, activePeriod, nightMode, view]);
  useEffect(() => {storageSet("axis_show_streak", showStreak);}, [showStreak]);
  useEffect(() => {
    const merged = axisHistoryForDailyTotals(history);
    const n = axisMovementStreakDays(merged);
    setStreak(n);
    storageSet("axis_streak", n);
  }, [history]);
  useEffect(() => {storageSet("axis_show_timer", showTimer);}, [showTimer]);
  useEffect(() => {storageSet("axis_show_pct", showPct);}, [showPct]);
  useEffect(() => {storageSet("axis_exercise_duration", exerciseDuration);}, [exerciseDuration]);
  useEffect(() => {
    const prev = prevViewRef.current;
    if (view === "metrics" && prev !== "metrics") {
      setMetricsFactsCycle((n) => n + 1);
    }
    if (view === "home" && prev !== null && prev !== "home") {
      setHomeSection("explore");
    }
    prevViewRef.current = view;
  }, [view, hasActiveSession]);
  useEffect(() => {
    if (view === "system" && systemPanel === "settings") {
      setSettingsHealthOpen(true);
      setSettingsDataOpen(true);
      setSettingsAboutOpen(true);
      setSettingsAccountOpen(true);
    }
  }, [view, systemPanel]);
  useEffect(() => {storageSet(AXIS_SESSION_LIST_DONE_KEY, listDone);}, [listDone]);
  useEffect(() => {storageSet(AXIS_SESSION_GUIDED_DONE_KEY, guidedDone);}, [guidedDone]);
  useEffect(() => {storageSet("axis_skipped", skipped);}, [skipped]);
  useEffect(() => {storageSet("axis_favs", favs);}, [favs]);
  useEffect(() => {storageSet("axis_notes", notes);}, [notes]);
  useEffect(() => {storageSet("axis_recent_tracks", recentTracks);}, [recentTracks]);
  useEffect(() => {storageSet("axis_home_section", homeSection);}, [homeSection]);
  useEffect(() => {storageSet("axis_favorite_tracks", favoriteTrackIds);}, [favoriteTrackIds]);
  useEffect(() => {
    if (Object.values(favs).some((v) => v)) {
      storageSet(AXIS_EVER_BOOKMARKED_EXERCISE_KEY, true);
    }
  }, [favs]);

  useEffect(() => {
    if (!bookmarkTooltipExerciseId && !bookmarkTooltipTrackId) return;
    const totalMs = axisCelebrationFadeMs(200) + 1800 + axisCelebrationFadeMs(200);
    const id = window.setTimeout(() => {
      setBookmarkTooltipExerciseId(null);
      setBookmarkTooltipTrackId(null);
    }, totalMs);
    return () => clearTimeout(id);
  }, [bookmarkTooltipExerciseId, bookmarkTooltipTrackId]);

  useEffect(() => {
    if (view !== "home" || !hasActiveSession) {
      setListFirstSessionCelebration(false);
      return;
    }
    const ALL = getAll(track);
    const activeAll = ALL.filter((e) => !skipped[e.id]);
    const T = activeAll.length;
    const doneC = activeAll.filter((e) => axisSessionDoneLookup(listDone, track, e.id)).length;
    if (T === 0 || doneC !== T) {
      setListFirstSessionCelebration(false);
      return;
    }
    const k = axisCelebrationScopedKey("axis_first_session_complete");
    if (storageGet(k, false)) return;
    storageSet(k, true);
    setListFirstSessionCelebration(true);
  }, [view, hasActiveSession, track, skipped, listDone]);

  useEffect(() => {
    const goalMin = Math.max(0, Number(dailyGoalMinutes) || 0);
    const todayStr = new Date().toDateString();
    const todayTot = axisSumMinutesOnLocalDay(axisHistoryForDailyTotals(history), todayStr);
    const prev = prevTodayMinutesForGoalRef.current;
    prevTodayMinutesForGoalRef.current = todayTot;
    if (prev === null) return;
    if (goalMin <= 0) return;
    const celebKey = `axis_daily_goal_celebrated_${todayStr}`;
    if (storageGet(celebKey, false)) return;
    if (prev >= goalMin || todayTot < goalMin) return;
    storageSet(celebKey, true);
    pendingDailyGoalCelebrationRef.current = true;
    setDailyGoalCelebrationNonce((n) => n + 1);
  }, [history, dailyGoalMinutes]);

  useEffect(() => {
    if (view !== "metrics") return;
    if (!pendingDailyGoalCelebrationRef.current) return;
    pendingDailyGoalCelebrationRef.current = false;
    dailyGoalCelebrationTimersRef.current.forEach(clearTimeout);
    dailyGoalCelebrationTimersRef.current = [];
    const reduced = axisPrefersReducedMotion();
    const fade150 = axisCelebrationFadeMs(150);
    const fade300 = axisCelebrationFadeMs(300);
    const holdGoalLbl = reduced ? 1250 : 2500;
    const insightHold = reduced ? 1200 : 2400;

    const schedule = (fn, ms) => {
      const tid = window.setTimeout(fn, ms);
      dailyGoalCelebrationTimersRef.current.push(tid);
    };

    setDailyGoalEyebrowMovementOpaque(true);
    setDailyGoalEyebrowGoalHit(false);
    setDailyGoalInsightMounted(true);
    setDailyGoalInsightOpaque(false);

    setDailyGoalHeroPulse(true);
    schedule(() => setDailyGoalHeroPulse(false), reduced ? 1 : 300);

    schedule(() => setDailyGoalEyebrowMovementOpaque(false), fade150);
    schedule(() => setDailyGoalEyebrowGoalHit(true), fade150 * 2);
    schedule(() => setDailyGoalEyebrowGoalHit(false), fade150 * 2 + holdGoalLbl + fade150);
    schedule(() => setDailyGoalEyebrowMovementOpaque(true), fade150 * 2 + holdGoalLbl + fade150 * 2);

    schedule(() => setDailyGoalInsightOpaque(true), fade300);
    schedule(() => setDailyGoalInsightOpaque(false), fade300 + insightHold);
    schedule(() => setDailyGoalInsightMounted(false), fade300 + insightHold + fade300);

    return () => {
      dailyGoalCelebrationTimersRef.current.forEach(clearTimeout);
      dailyGoalCelebrationTimersRef.current = [];
    };
  }, [view, dailyGoalCelebrationNonce]);

  const SECTIONS = getSections(track);
  const ALL = getAll(track);
  const activeAll = ALL.filter((e) => !skipped[e.id]);
  const filteredAll = activeAll;
  const TOTAL = activeAll.length;
  const listDoneSlice = axisSessionDoneSlice(listDone, track);
  const guidedDoneSlice = axisSessionDoneSlice(guidedDone, track);
  const listTotalDone = activeAll.filter((e) => listDoneSlice[e.id]).length;
  const guidedTotalDone = activeAll.filter((e) => guidedDoneSlice[e.id]).length;
  const totalDone = listTotalDone;
  const perMoveSeconds = exerciseDuration || 45;
  const activeCount = filteredAll.length;
  const sessionSeconds = activeCount * perMoveSeconds;
  const sessionMinutes = Math.round(sessionSeconds / 60) || 0;
  const sessionDurationLabel = axisFormatSessionHeaderDuration(sessionMinutes, perMoveSeconds);
  const pct = TOTAL > 0 ? Math.round(totalDone / TOTAL * 100) : 0;
  const cur = activeAll[Math.min(fi, activeAll.length - 1)];
  const showSessionBookmarkExerciseHint = !storageGet(AXIS_EVER_BOOKMARKED_EXERCISE_KEY, false) && !Object.values(favs).some((v) => v);

  const applySessionDoneToggle = (setStore, id) => {
    setStore((store) => {
      const slice = axisSessionDoneSlice(store, track);
      const wasDone = !!slice[id];
      const nextSlice = { ...slice };
      if (wasDone) delete nextSlice[id];
      else nextSlice[id] = true;
      if (nextSlice[id] && !wasDone && !sessionExerciseLoggedRef.current.has(id)) {
        sessionExerciseLoggedRef.current.add(id);
        const today = new Date().toDateString();
        const perMoveSec = exerciseDuration || 45;
        const durationMins = Math.max(1, Math.round(perMoveSec / 60));
        const newEntry = { date: today, loggedAt: Date.now(), track: TRACKS[track] && TRACKS[track].label || track, trackId: track, duration: durationMins, exerciseId: id };
        setHistory((prev) => {
          const newHistory = [newEntry, ...prev].slice(0, 30);
          storageSet("axis_history", newHistory);
          return newHistory;
        });
      }
      return axisSessionDoneMergeTrack(store, track, nextSlice);
    });
  };

  const resetSessionTabProgress = () => {
    axisHapticTick();
    const trackExIds = (getAll(track) || []).map((e) => e.id);
    setListDone((store) => {
      const next = axisSessionDoneClearTrack(store, track);
      storageSet(AXIS_SESSION_LIST_DONE_KEY, next);
      return next;
    });
    setGuidedDone((store) => {
      const next = axisSessionDoneClearTrack(store, track);
      storageSet(AXIS_SESSION_GUIDED_DONE_KEY, next);
      return next;
    });
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem("axis_done");
    } catch (e) {}
    setListFirstSessionCelebration(false);
    for (const exId of trackExIds) sessionExerciseLoggedRef.current.delete(exId);
    setOpenId(null);
  };
  const startGuidedSession = () => {
    if (filteredAll.length === 0) return;
    primeAudio();
    setGuidedActive(true);
  };
  const scrollToOwnPathExercises = () => {
    axisHapticTick();
    requestAnimationFrame(() => {
      const target = sessionFirstPurposeRef.current ||
      sessionContentRef.current?.querySelector(".session-list-preview .purpose-note--guided") ||
      sessionContentRef.current?.querySelector(".session-list-preview .sg-section-label");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };
  const toggleList = (id) => applySessionDoneToggle(setListDone, id);
  const toggleGuided = (id) => applySessionDoneToggle(setGuidedDone, id);

  const toggleSkip = (id) => setSkipped((s) => ({ ...s, [id]: !s[id] }));
  const toggleFav = (id) => {
    setFavs((f) => {
      const was = !!f[id];
      const nextOn = !was;
      if (nextOn) {
        const k = axisCelebrationScopedKey("axis_first_bookmark");
        if (!storageGet(k, false)) {
          storageSet(k, true);
          window.setTimeout(() => setBookmarkTooltipExerciseId(id), 0);
        }
      }
      return { ...f, [id]: nextOn };
    });
  };
  const toggleFavoriteTrack = (trackId) => {
    if (!trackId || !TRACKS[trackId]) return;
    setFavoriteTrackIds((prev) => {
      const idx = prev.indexOf(trackId);
      if (idx !== -1) return prev.filter((id) => id !== trackId);
      const k = axisCelebrationScopedKey("axis_first_bookmark");
      if (!storageGet(k, false)) {
        storageSet(k, true);
        window.setTimeout(() => setBookmarkTooltipTrackId(trackId), 0);
      }
      return [trackId, ...prev.filter((id) => id !== trackId)].slice(0, 24);
    });
  };
  const getTrackDisplayDurationForFavorites = (trackId) => {
    const sections = getSections(trackId);
    const perMove = exerciseDuration || 45;
    const activeCount = (sections || []).reduce((n, sec) => n + (sec.exercises || []).filter((e) => !skipped[e.id]).length, 0);
    const sessionSecs = activeCount * perMove;
    const mins = Math.round(sessionSecs / 60) || 0;
    return axisFormatDurationMinUpper(mins);
  };
  const setNote = (id, val) => setNotes((n) => ({ ...n, [id]: val }));
  const switchTrack = (t) => {setTrack(t);setFi(0);setOpenId(null);};
  const openTrackDetail = (tid) => {
    if (!tid || !(TRACKS && TRACKS[tid])) return;
    triggerHaptic(HAPTIC_LIGHT_TAP);
    switchTrack(tid);
    setHasActiveSession(true);
    setView("home");
  };
  const beginTrack = (t) => {
    sessionExerciseLoggedRef.current.clear();
    if (typeof t === "string" && t) {
      setRecentTracks((prev) => [t, ...prev.filter((id) => id !== t)].slice(0, 4));
    }
    switchTrack(t);setHasActiveSession(true);setView("home");
  };
  const goHome = () => {setHasActiveSession(false);setHomeSection("explore");setView("home");};
  const playBeep = (freq = 880) => beep(freq);
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const weekMomentumWindow = axisWeekMomentumFromHistory(history);
  const weekDateKeySet = new Set(weekMomentumWindow.dates);
  const weekWindowEntries = (history || []).filter((e) => weekDateKeySet.has(axisLocalDateKey(e.date)));
  const weeklyGoalBarMinutesCurrent = weekWindowEntries.reduce((a, e) => a + (Number(e.duration) || 0), 0);
  const weekSessionCountForWindow = weekWindowEntries.length;
  const avgSessionMinutesRounded = weekSessionCountForWindow > 0 ? Math.round(weeklyGoalBarMinutesCurrent / weekSessionCountForWindow) : 0;
  const activeDays7Count = weekMomentumWindow.active.filter(Boolean).length;
  const todayDateStr = new Date().toDateString();
  const todayMinutesTotal = axisSumMinutesOnLocalDay(axisHistoryForDailyTotals(history), todayDateStr);
  const goalMin = Math.max(0, Number(dailyGoalMinutes) || 0);
  const weeklyTargetMin = Math.max(0, Number(weeklyGoalMinutes) || 0);
  const dailyGoalDisplayPct = goalMin > 0 ? Math.round(todayMinutesTotal / goalMin * 100) : 0;
  const dailyBarFillPct = goalMin > 0 ? Math.min(100, todayMinutesTotal / goalMin * 100) : 0;
  const dailyBarOverdrive = goalMin > 0 && todayMinutesTotal > goalMin;
  const weeklyGoalDisplayPct = weeklyTargetMin > 0 ? Math.round(weeklyGoalBarMinutesCurrent / weeklyTargetMin * 100) : 0;
  const weeklyBarFillPct = weeklyTargetMin > 0 ? Math.min(100, weeklyGoalBarMinutesCurrent / weeklyTargetMin * 100) : 0;
  const weeklyBarOverdrive = weeklyTargetMin > 0 && weeklyGoalBarMinutesCurrent > weeklyTargetMin;
  const dashboardHeaderEl = /*#__PURE__*/React.createElement(DashboardHeader, { progressFillPct: dailyBarFillPct, progressOverdrive: dailyBarOverdrive, history: history });
  const goSystemGateway = () => {
    setView("system");
    setSystemPanel("mood");
  };
  const systemGatewayBackNight = nightMode;
  const systemGatewayBackDark = systemGatewayBackNight || theme === "dark";
  const systemGatewayBackPeriod = axisResolveMoodPeriod(activePeriod);
  const systemGatewayBackCt = systemGatewayBackNight ? null : CIRCADIAN_THEMES[systemGatewayBackPeriod][systemGatewayBackDark ? "dark" : "light"];
  const systemGatewayBackIconColor = systemGatewayBackNight ? "#FF3B30" : systemGatewayBackCt && systemGatewayBackCt.textPrimary || (systemGatewayBackDark ? "var(--axis-white)" : "#0f1020");
  const systemGatewayBackBorderColor = systemGatewayBackNight ? "#FF3B30" : systemGatewayBackDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.2)";
  const renderSystemSubTitleRow = (titleText, extraTitleClass = "") => /*#__PURE__*/React.createElement("div", { className: "system-sub-panel-head__row" }, /*#__PURE__*/React.createElement("button", { type: "button", className: "back-btn", onClick: () => {axisHapticTick();setSystemPanel("mood");}, "aria-label": "Back to Mood", style: { border: `1px solid ${systemGatewayBackBorderColor}`, color: systemGatewayBackIconColor, WebkitTapHighlightColor: "transparent" } }, /*#__PURE__*/React.createElement("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("path", { d: "M19 12H5M12 5l-7 7 7 7" }))), /*#__PURE__*/React.createElement("div", { className: ("app-screen-title system-sub-panel-head__title " + extraTitleClass).trim() }, titleText));
  const visibleSections = SECTIONS.map((s) => ({ ...s, exercises: s.exercises })).filter((s) => s.exercises.length > 0);
  const firstPurposeSectionLabel = visibleSections.find((s) => s.purpose)?.label ?? null;
  const SunIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "5" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "4" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "22" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), /*#__PURE__*/React.createElement("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), /*#__PURE__*/React.createElement("line", { x1: "2", y1: "12", x2: "4", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "20", y1: "12", x2: "22", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), /*#__PURE__*/React.createElement("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" }));
  const MoonIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }));
  const GearIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "3" }), /*#__PURE__*/React.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }));

  // SETTINGS
  // TIMER VIEW (key forces fresh mount to avoid blank on first open)
  if (view === "timer") {
    return /*#__PURE__*/React.createElement(TimerView, { key: "timer", theme: theme, view: view, setView: setView, onSystemTab: goSystemGateway, activePeriod: activePeriod, nightMode: nightMode, dashboardHeader: dashboardHeaderEl });
  }
  if (view === "system" && systemPanel === "settings") {
    const hasHealthData = Boolean(metricsHealthHint && /synced|updated|connected/i.test(metricsHealthHint + " " + healthConnectSyncMsg));
    const RowChevron = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("polyline", { points: "9 6 15 12 9 18" }));
    const DisclosureChevron = ({ open }) => /*#__PURE__*/React.createElement("svg", { className: "settings-ios-disclosure-chevron" + (open ? " is-open" : ""), width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("polyline", { points: "6 9 12 15 18 9" }));
    const MailIcon = () => /*#__PURE__*/React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/React.createElement("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }), /*#__PURE__*/React.createElement("polyline", { points: "22,6 12,13 2,6" }));
    const Toggle = ({ on, setOn }) => /*#__PURE__*/React.createElement("button", { onClick: () => {axisHapticTick();setOn((v) => !v);}, style: { flexShrink: 0, width: 44, height: 26, border: "1px solid", borderColor: on ? "var(--mood-color)" : "var(--glass-border-strong)", borderRadius: 13, background: on ? "var(--mood-color)" : "var(--glass-bg)", cursor: "pointer", position: "relative", transition: "all 0.2s" } }, /*#__PURE__*/React.createElement("div", { style: { position: "absolute", top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: nightMode ? "#000000" : "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } }));
    return (/*#__PURE__*/
      React.createElement("div", { key: "settings", className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body app-body--settings-pad settings-density" }, /*#__PURE__*/
      dashboardHeaderEl, /*#__PURE__*/
      React.createElement("div", { className: "settings-page-rail settings-ios-page" }, /*#__PURE__*/
      React.createElement("div", { className: "app-page-header" }, /*#__PURE__*/renderSystemSubTitleRow("Settings")), /*#__PURE__*/

      React.createElement("div", { className: "settings-ios-section-title" }, "Goals"), /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-group" }, /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-row" }, /*#__PURE__*/React.createElement("span", { className: "settings-ios-label" }, "Daily Goal"), /*#__PURE__*/React.createElement("div", { className: "settings-ios-goal-stepper" }, /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-goal-step", "aria-label": "Decrease daily goal", onClick: () => {axisHapticTick();setDailyGoalMinutes((n) => {const x = Math.max(1, n - 1);setWeeklyFollowsDaily(true);setWeeklyGoalMinutes(axisSnapWeeklyGoalMinutes(x * 7));return x;});} }, "\u2212"), /*#__PURE__*/React.createElement("span", { className: "settings-ios-goal-val axis-duration-label" }, axisFormatDurationMinUpper(dailyGoalMinutes)), /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-goal-step", "aria-label": "Increase daily goal", onClick: () => {axisHapticTick();setDailyGoalMinutes((n) => {const x = Math.min(90, n + 1);setWeeklyFollowsDaily(true);setWeeklyGoalMinutes(axisSnapWeeklyGoalMinutes(x * 7));return x;});} }, "+"))), /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-row" }, /*#__PURE__*/React.createElement("span", { className: "settings-ios-label" }, "Weekly Goal"), /*#__PURE__*/React.createElement("div", { className: "settings-ios-goal-stepper" }, /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-goal-step", "aria-label": "Decrease weekly goal", onClick: () => {axisHapticTick();setWeeklyFollowsDaily(false);setWeeklyGoalMinutes((w) => axisSnapWeeklyGoalMinutes(Math.max(5, w - 5)));} }, "\u2212"), /*#__PURE__*/React.createElement("span", { className: "settings-ios-goal-val axis-duration-label" }, axisFormatDurationMinUpper(weeklyGoalMinutes)), /*#__PURE__*/React.createElement("button", { type: "button", className: "settings-ios-goal-step", "aria-label": "Increase weekly goal", onClick: () => {axisHapticTick();setWeeklyFollowsDaily(false);setWeeklyGoalMinutes((w) => axisSnapWeeklyGoalMinutes(Math.min(500, w + 5)));} }, "+")))), /*#__PURE__*/

      React.createElement("div", { className: "settings-ios-section-title" }, "Session"), /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-group" }, /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-row" }, /*#__PURE__*/
      React.createElement("span", { className: "settings-ios-label" }, "Progress % (List / Guided)"), /*#__PURE__*/
      React.createElement(Toggle, { on: showPct, setOn: setShowPct })), /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-row settings-ios-row--stack" }, /*#__PURE__*/
      React.createElement("span", { className: "settings-ios-label" }, "Timer Length per Exercise"), /*#__PURE__*/
      React.createElement("div", { className: "settings-ios-segment" },
      [30, 45, 60].map((sec) => /*#__PURE__*/React.createElement("button", { key: sec, type: "button", onClick: () => {axisHapticTick();setExerciseDuration(sec);}, className: "settings-ios-segment-btn" + (exerciseDuration === sec ? " settings-ios-segment-btn--active" : "") }, sec === 60 ? "1 min" : `${sec}s`)), /*#__PURE__*/
      React.createElement("button", { type: "button", onClick: () => {axisHapticTick();setExerciseDuration(90);}, className: "settings-ios-segment-btn" + (![30, 45, 60].includes(exerciseDuration) ? " settings-ios-segment-btn--active" : "") }, "Custom"))))), /*#__PURE__*/

      React.createElement("details", { className: "settings-ios-disclosure-group", open: true },
      React.createElement("summary", { className: "settings-ios-disclosure", onClick: () => {axisHapticTick();} }, React.createElement("span", { className: "settings-ios-section-title settings-ios-section-title--button" }, "Health"), React.createElement(DisclosureChevron, null)),
      React.createElement("div", { className: "settings-ios-group" },
      React.createElement("button", { type: "button", className: "settings-ios-row", onClick: async () => {
        axisHapticTick();
        setHealthConnectSyncMsg("Syncing…");
        try {
          await axisHealthRequestReadPermissions();
          const imported = await axisHealthFetchWeightSamplesNative();
          const steps = await axisHealthFetchTodayStepsNative();
          setMetricsStepsToday(steps);
          if (imported.length > 0) {
            setMetricsWeightSamples((prev) => axisMetricsMergeWeightByTs(axisMetricsNormalizeWeightList(prev), imported));
            setMetricsHealthHint("Connected");
            setHealthConnectSyncMsg("Connected");
          } else {
            setHealthConnectSyncMsg("Not connected");
          }
        } catch (e) {
          setHealthConnectSyncMsg("Not connected");
        }
      } }, React.createElement("span", { className: "settings-ios-label" }, "Connect Apple Health"), React.createElement("span", { className: "settings-ios-right" }, React.createElement("span", { className: "settings-ios-meta" }, hasHealthData ? "Connected" : "Not connected"), React.createElement(RowChevron, null))))),

      React.createElement("details", { className: "settings-ios-disclosure-group", open: true },
      React.createElement("summary", { className: "settings-ios-disclosure", onClick: () => {axisHapticTick();} }, React.createElement("span", { className: "settings-ios-section-title settings-ios-section-title--button" }, "Data"), React.createElement(DisclosureChevron, null)),
      React.createElement("div", { className: "settings-ios-group" },
      React.createElement("button", { type: "button", className: "settings-ios-row", onClick: () => {axisHapticTick();axisExportAxisLocalData();} }, React.createElement("span", { className: "settings-ios-label" }, "Export My Data"), React.createElement("span", { className: "settings-ios-right" }, React.createElement(RowChevron, null))),
      React.createElement("button", { type: "button", className: "settings-ios-row", onClick: () => {axisHapticTick();setArchivedDataOpen(true);} }, React.createElement("span", { className: "settings-ios-label" }, "View Archived Data"), React.createElement("span", { className: "settings-ios-right" }, React.createElement(RowChevron, null))),
      React.createElement("button", { type: "button", className: "settings-ios-row", onClick: () => {axisHapticTick();setPrivacyPolicyOpen(true);} }, React.createElement("span", { className: "settings-ios-label" }, "Privacy Policy"), React.createElement("span", { className: "settings-ios-right" }, React.createElement(RowChevron, null))))),

      React.createElement("details", { className: "settings-ios-disclosure-group", open: true },
      React.createElement("summary", { className: "settings-ios-disclosure", onClick: () => {axisHapticTick();} }, React.createElement("span", { className: "settings-ios-section-title settings-ios-section-title--button" }, "About"), React.createElement(DisclosureChevron, null)),
      React.createElement("div", { className: "settings-ios-group" },
      React.createElement("a", { href: (typeof window !== "undefined" && typeof window.axisOnboardingHref === "function") ? window.axisOnboardingHref() : "./onboarding", className: "settings-ios-row settings-ios-link-row", onClick: () => { try { axisHapticTick(); } catch (e) {} try { const uid = axisActiveUidForStorage(); if (uid) storageSet("axis_onboarded:" + uid, false); else storageSet("axis_onboarded", false); } catch (e) {} try { localStorage.setItem("hasCompletedOnboarding", "false"); } catch (e) {} } }, React.createElement("span", { className: "settings-ios-label" }, "Replay Onboarding"), React.createElement("span", { className: "settings-ios-right" }, React.createElement(RowChevron, null))),
      React.createElement("a", { href: "mailto:hello@adamlorber.com", className: "settings-ios-row settings-ios-link-row" }, React.createElement("span", { className: "settings-ios-label" }, "Send Feedback"), React.createElement("span", { className: "settings-ios-right" }, React.createElement(MailIcon, null), React.createElement(RowChevron, null))),
      React.createElement("div", { className: "settings-ios-row" }, React.createElement("span", { className: "settings-ios-label" }, "App Version"), React.createElement("span", { className: "settings-ios-meta" }, APP_VERSION_DISPLAY)),
      React.createElement("div", { className: "settings-ios-row settings-ios-row--stack", style: { alignItems: "stretch" } },
      React.createElement("div", { style: { display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap", marginBottom: 8 } }, /*#__PURE__*/
      React.createElement("span", { className: "settings-ios-label", style: { marginBottom: 0 } }, "Custom App Icon"), /*#__PURE__*/
      React.createElement("span", { style: { fontSize: 11, fontStyle: "italic", fontWeight: 400, color: "var(--text-secondary)", opacity: 0.75 } }, "Coming Soon")),
      React.createElement("div", { className: "ultra-icon-grid", style: { display: "grid", width: "100%", maxWidth: "100%", boxSizing: "border-box", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 } },
      APP_ICON_OPTIONS.map(function axisComingSoonAppIcon(opt) {
        return /*#__PURE__*/React.createElement("button", {
          key: opt.id,
          type: "button",
          className: (nightMode ? "ultra-icon-slot " : "") + "settings-app-icon-slot settings-app-icon-slot--coming-soon",
          disabled: true,
          style: { position: "relative", borderRadius: "var(--border-radius-md)", border: nightMode ? "1px solid rgba(255, 59, 48, 0.22)" : "1px solid var(--glass-border)", background: nightMode ? "#000000" : "var(--glass-bg)", padding: 6, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible", opacity: 0.42, filter: "grayscale(1)", WebkitFilter: "grayscale(1)", pointerEvents: "none" },
          "aria-label": opt.label + " app icon (coming soon)",
          "aria-disabled": "true"
        }, opt.id === "wordmark" ? /*#__PURE__*/React.createElement("img", { src: opt.src, alt: "", style: { width: "100%", aspectRatio: "1 / 1", borderRadius: 10, display: "block", objectFit: "cover", opacity: 0.95 } }) : /*#__PURE__*/React.createElement("div", { "aria-hidden": "true", style: { width: "100%", aspectRatio: "1 / 1", borderRadius: 10, display: "block", background: "#080d18", boxSizing: "border-box" } }));
      })
      ))),

      React.createElement("details", { className: "settings-ios-disclosure-group", open: true },
      React.createElement("summary", { className: "settings-ios-disclosure", onClick: () => {axisHapticTick();} }, React.createElement("span", { className: "settings-ios-section-title settings-ios-section-title--button" }, "Account"), React.createElement(DisclosureChevron, null)),
      React.createElement("div", { className: "settings-ios-group" },
      React.createElement(SettingsAccountRows, null)))), /*#__PURE__*/

      React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--settings" })), /*#__PURE__*/
      privacyPolicyOpen && /*#__PURE__*/React.createElement("div", { className: "metrics-archive-backdrop", onClick: () => setPrivacyPolicyOpen(false) }, /*#__PURE__*/React.createElement("div", { className: "metrics-archive-modal", role: "dialog", "aria-modal": "true", onClick: (e) => e.stopPropagation() }, /*#__PURE__*/React.createElement("div", { className: "metrics-archive-header" }, /*#__PURE__*/React.createElement("h3", { className: "metrics-archive-title" }, "Privacy Policy"), /*#__PURE__*/React.createElement("button", { type: "button", className: "metrics-archive-close", onClick: () => setPrivacyPolicyOpen(false), "aria-label": "Close privacy policy" }, "\u00d7")), /*#__PURE__*/React.createElement("div", { className: "metrics-archive-body", style: { display: "flex", flexDirection: "column", gap: 10 } }, /*#__PURE__*/React.createElement("p", null, "Your workout history, goals, and preferences are stored on this device. We do not sell or profile your data."), /*#__PURE__*/React.createElement("p", null, "Account login uses Firebase Authentication. Local records are retained and older entries are archived automatically."), /*#__PURE__*/React.createElement("p", null, "You can export data any time from Data > Export My Data.")))), /*#__PURE__*/
      React.createElement(MetricsArchivedDataModal, {
        open: archivedDataOpen,
        onClose: () => setArchivedDataOpen(false),
        weightArchive: metricsWeightArchive,
        painArchive: metricsPainArchive
      }), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
      ));
  }


  // MOOD
  if (view === "system" && systemPanel === "mood") {
    const MOOD_PERIODS = [
    { p: "dawn", label: "Rise", time: "5–11am", desc: "Warm amber. Morning energy.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M4 16 A 8 8 0 0 1 20 16" }), /*#__PURE__*/React.createElement("line", { x1: "0", y1: "16", x2: "24", y2: "16" })) },
    { p: "midday", label: "Midday", time: "11am–5pm", desc: "Cool mint. Crisp and focused.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("circle", { cx: "12", cy: "12", r: "4" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "2", x2: "12", y2: "5" }), /*#__PURE__*/React.createElement("line", { x1: "12", y1: "19", x2: "12", y2: "22" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "4.22", x2: "6.34", y2: "6.34" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "17.66", x2: "19.78", y2: "19.78" }), /*#__PURE__*/React.createElement("line", { x1: "2", y1: "12", x2: "5", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "19", y1: "12", x2: "22", y2: "12" }), /*#__PURE__*/React.createElement("line", { x1: "4.22", y1: "19.78", x2: "6.34", y2: "17.66" }), /*#__PURE__*/React.createElement("line", { x1: "17.66", y1: "6.34", x2: "19.78", y2: "4.22" })) },
    { p: "prime", label: "Prime", time: "5–10pm", desc: "Deep blue. Winding down.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })) },
    { p: "rest", label: "Rest", time: "10pm–5am", desc: "Soft violet. Calm and dim.",
      icon: /*#__PURE__*/React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }, /*#__PURE__*/React.createElement("path", { d: "M12 3l1.5 5.5 6 .5-4.5 4 1.5 5.5L12 16l-4.5 2 1.5-5.5-4.5-4 6-.5L12 3z" })) }];

    const nowPeriod = getCircadianPeriod();
    // derive highlight color from circadian theme for Today's suggestion card (home)
    const highlightCt = CIRCADIAN_THEMES[nowPeriod][theme === "dark" ? "dark" : "light"];
    const highlight = highlightCt && highlightCt.accent ? highlightCt.accent : "var(--mood-color)";
    const hcSys = `${metricsHealthHint || ""} ${healthConnectSyncMsg || ""}`;
    const healthSyncAvailSys = /synced|updated|connected/i.test(hcSys);
    const warnSys = /error|fail|denied|unable/i.test(String(hcSys).toLowerCase()) && !healthSyncAvailSys;
    const effectivePeriodSys = activePeriod !== null ? activePeriod : nowPeriod;
    const currentMoodRow = MOOD_PERIODS.find((row) => row.p === effectivePeriodSys) || MOOD_PERIODS[0];
    const ctMoodHero = nightMode
      ? { accent: "#FF3B30" }
      : CIRCADIAN_THEMES[effectivePeriodSys][theme === "dark" ? "dark" : "light"];
    const moodHeroTitle = nightMode ? "Ultra" : currentMoodRow.label;
    const moodHeroDesc = nightMode ? "Pure black + bright red. Maximum contrast." : currentMoodRow.desc;
    const moodHeroMeta = nightMode ? "Circadian palette paused" : activePeriod === null ? `Auto · ${currentMoodRow.time}` : `Locked · ${currentMoodRow.time}`;
    const okSys = !warnSys;
    return (/*#__PURE__*/
      React.createElement("div", { className: "app app--nav-gap-tight", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body app-body--list-pad axis-app-scroll-root" }, /*#__PURE__*/
      dashboardHeaderEl, /*#__PURE__*/
      React.createElement("div", { className: "mood-page-rail" }, /*#__PURE__*/
      React.createElement("div", { className: "app-page-header app-page-header--system-mood" }, /*#__PURE__*/
      React.createElement("div", { className: "home-welcome metrics-page-title", id: "axis-system-welcome" }, "System"), /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__hdr" }, /*#__PURE__*/
      React.createElement("span", { className: "sys-dash__ver" }, APP_VERSION_DISPLAY), /*#__PURE__*/
      React.createElement("span", { className: "sys-dash__stat" + (okSys ? " sys-dash__stat--ok" : " sys-dash__stat--warn") }, okSys ? "STATUS: OPTIMAL" : "STATUS: CHECK SETTINGS"))), /*#__PURE__*/

      React.createElement("div", { className: "sys-dash__mood-hero", style: { marginBottom: 18 } }, /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__mood-card sys-dash__mood-card--prominent", role: "region", "aria-label": "Current mood" }, /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__mood-card-main" }, /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__eyebrow" }, "Current mood"), /*#__PURE__*/
      React.createElement("div", {
        className: "sys-dash__mood-name",
        style: nightMode ? { color: "#FF3B30", WebkitTextFillColor: "#FF3B30" } : { color: ctMoodHero.accent, WebkitTextFillColor: ctMoodHero.accent }
      }, moodHeroTitle), /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__mood-desc" }, moodHeroDesc), /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__mood-time" }, moodHeroMeta)
      ), /*#__PURE__*/
      React.createElement("div", {
        className: "sys-dash__mood-swatch",
        style: {
          background: ctMoodHero.accent,
          boxShadow: nightMode ? "0 4px 26px rgba(255, 59, 48, 0.42)" : `0 6px 28px color-mix(in srgb, ${ctMoodHero.accent} 50%, transparent)`
        },
        "aria-hidden": true
      })
      )
      ), /*#__PURE__*/

      React.createElement("div", { className: "axis-surface-tmt mood-auto-card" }, /*#__PURE__*/
      React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 } }, /*#__PURE__*/
      React.createElement("div", null, /*#__PURE__*/
      React.createElement("div", { className: "mood-auto-card__label", style: { color: activePeriod === null ? "var(--mood-color)" : "var(--text-white)" } }, "Auto"),
      activePeriod !== null ? /*#__PURE__*/React.createElement("div", { className: "mood-auto-card__meta" }, "Follows time of day") : null
      ), /*#__PURE__*/
      React.createElement("button", { onClick: nightMode ? undefined : () => {axisHapticTick();const n = activePeriod === null ? nowPeriod : null;setActivePeriod(n);storageSet("axis_period", n);}, style: { flexShrink: 0, width: 44, height: 26, border: "1px solid", borderColor: activePeriod === null ? "var(--mood-color)" : "var(--glass-border-strong)", borderRadius: 13, background: activePeriod === null ? "var(--mood-color)" : "var(--glass-bg)", cursor: nightMode ? "default" : "pointer", position: "relative", transition: "all 0.2s" } }, /*#__PURE__*/
      React.createElement("div", { style: { position: "absolute", top: 3, left: activePeriod === null ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: nightMode ? "#000000" : "rgba(255,255,255,0.95)", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" } })
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "mood-auto-card__caption" }, "Auto follows the time of day. Or lock it to match how you feel right now.")
      ), /*#__PURE__*/

      React.createElement("div", { style: { marginTop: 10, marginBottom: 12 } }, /*#__PURE__*/
      React.createElement("div", { className: "mood-base-theme__label", style: { marginBottom: 8 } }, "BASE THEME"), /*#__PURE__*/
      React.createElement("div", { className: "mood-base-theme__toggle mood-base-theme__toggle--full", style: nightMode ? { opacity: 0.45, pointerEvents: "none", transition: "opacity 0.2s ease" } : {} },
      [{ val: "dark", label: "Dark" }, { val: "light", label: "Light" }].map(({ val, label }) => /*#__PURE__*/
      React.createElement("button", { key: val, type: "button", onClick: nightMode ? undefined : () => {if (theme !== val) {axisHapticTick();toggleTheme();}}, className: "mood-base-theme-btn" + (theme === val ? " mood-base-theme-btn--active" : "") }, label)
      )
      )
      ), /*#__PURE__*/


      React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 } },
      MOOD_PERIODS.map(({ p, label, time, desc, icon }) => {
        const ct = nightMode
          ? { accent: "#FF3B30", accentDim: "rgba(211,47,47,0.25)", accentGlow: "rgba(211,47,47,0.4)", bg: "#000000" }
          : CIRCADIAN_THEMES[p][theme === "dark" ? "dark" : "light"];
        const useMoodGlass = !nightMode && theme === "light";
        const isSelected = activePeriod === p;
        const isNow = nowPeriod === p;
        return (/*#__PURE__*/
          React.createElement("button", { key: p, onClick: nightMode ? undefined : () => {axisHapticTick();setActivePeriod(p);storageSet("axis_period", p);}, style: {
              display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
              borderRadius: 16, cursor: nightMode ? "default" : "pointer", textAlign: "left", width: "100%", boxSizing: "border-box",
              border: isSelected ? "1.5px solid var(--mood-color)" : "1px solid var(--glass-border)",
              background: nightMode ? "#000000" : isSelected ? (useMoodGlass ? `color-mix(in srgb, ${ct.accentDim} 60%, rgba(255,255,255,0.88))` : ct.accentDim) : (useMoodGlass ? "rgba(255,255,255,0.82)" : "var(--glass-bg)"),
              backdropFilter: useMoodGlass ? "blur(20px)" : "none", WebkitBackdropFilter: useMoodGlass ? "blur(20px)" : "none",
              transition: "all 0.2s"
            } }, /*#__PURE__*/
          React.createElement("div", { style: {
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: nightMode ? "#000000" : ct.bg, border: `1px solid ${ct.accent}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: ct.accent, boxShadow: isSelected && !nightMode ? `0 0 16px ${ct.accentGlow}` : "none",
              transition: "box-shadow 0.2s"
            } }, icon), /*#__PURE__*/
          React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /*#__PURE__*/
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 3 } }, /*#__PURE__*/
          React.createElement("span", { style: { fontSize: "var(--text-base)", fontWeight: 600, color: isSelected ? ct.accent : "var(--text-white)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" } }, label), /*#__PURE__*/
          React.createElement("span", { style: { fontSize: "var(--text-xs)", color: nightMode ? ct.accent : "var(--text-dimmer)" } }, time),
          activePeriod === null && isNow && /*#__PURE__*/React.createElement("span", { className: "mood-period-badge", style: { background: ct.accent, color: nightMode ? "#000" : "#111" } }, "ACTIVE"),
          activePeriod !== null && isSelected && /*#__PURE__*/React.createElement("span", { className: "mood-period-badge mood-period-badge--locked" }, "LOCKED")
          ), /*#__PURE__*/
          React.createElement("div", { style: { fontSize: "var(--text-sm)", color: nightMode ? ct.accent : "var(--text-secondary)" } }, desc)
          )
          )
        );

      })
      ), /*#__PURE__*/


      React.createElement("div", { className: "sys-dash__ultra-block", role: "group", "aria-label": "Ultra mode" }, /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__ultra-copy" }, /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__ultra-lbl" }, "ULTRA MODE"), /*#__PURE__*/
      React.createElement("div", { className: "sys-dash__ultra-sub" }, "Pure black + bright red. Maximum contrast.")), /*#__PURE__*/
      React.createElement("button", { type: "button", role: "switch", className: "sys-dash__toggle-ios" + (nightMode ? " sys-dash__toggle-ios--on" : ""), "aria-checked": nightMode ? "true" : "false", onClick: () => {axisHapticTick();toggleNight();} }, /*#__PURE__*/React.createElement("span", { className: "sys-dash__toggle-knob" }))), /*#__PURE__*/
      React.createElement("button", { type: "button", className: "sys-settings-bottom-btn", onClick: () => {axisHapticTick();setSystemPanel("settings");}, style: { width: "100%", borderRadius: 16, border: "1px solid var(--glass-border)", background: "var(--glass-bg)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, cursor: "pointer", boxSizing: "border-box", marginTop: 18 } }, /*#__PURE__*/
      React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2, minWidth: 0 } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "var(--text-sm)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-white)" } }, "Settings"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: "var(--text-xs)", color: "var(--text-secondary)" } }, "Goals, timers, health sync, account")), /*#__PURE__*/
      React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, style: { flexShrink: 0, color: "var(--text-dimmer)", opacity: 1 } }, /*#__PURE__*/React.createElement("polyline", { points: "9 6 15 12 9 18" }))), /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--mood" })
      ))
      , /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
      ));

  }

  if (view === "favorites") {
    const favTracksResolved = favoriteTrackIds.filter((id) => TRACKS && TRACKS[id]);
    const pinnedExerciseRows = [];
    if (TRACKS) {
      for (const tid of Object.keys(TRACKS)) {
        const tlabel = TRACKS[tid].label || tid;
        for (const ex of getAll(tid)) {
          if (favs[ex.id]) pinnedExerciseRows.push({ ex, trackId: tid, trackLabel: tlabel });
        }
      }
    }
    const FAVORITES_SEG_WRAP = { flexShrink: 0, display: "flex", gap: 5, marginBottom: 16, padding: 3, minHeight: 40, alignItems: "center", boxSizing: "border-box", width: "100%", maxWidth: 380, marginLeft: "auto", marginRight: "auto", justifyContent: "center" };
    const favoritesEmptyTracksEl = /*#__PURE__*/React.createElement("div", { className: "favorites-empty" }, "No bookmarked tracks yet. Tap the bookmark on a track card on Home to add it.");
    const favoritesEmptyExEl = /*#__PURE__*/React.createElement("div", { className: "favorites-empty" }, "No bookmarked exercises yet. Tap the bookmark on an exercise in a session list on Home to add it.");
    const favoritesTracksPanelEl = favTracksResolved.length === 0 ? favoritesEmptyTracksEl : favTracksResolved.map((tid) => {
      const t = TRACKS[tid];
      const isFav = favoriteTrackIds.indexOf(t.id) !== -1;
      const footerDurLine = getTrackDisplayDurationForFavorites(t.id);
      const ariaDur = footerDurLine.replace(/\s+/g, " ").trim();
      return /*#__PURE__*/React.createElement("div", { className: "track-card session-card track-card--home-browse glass-card home-routine-track-card home-browse-card--favorites", key: "fav-tab-" + t.id, "data-category": TRACK_CATEGORY_BY_ID[tid] || "", onClick: () => {openTrackDetail(t.id);}, role: "button", tabIndex: 0, onKeyDown: (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();openTrackDetail(t.id);}}, "aria-label": `View workout, ${t.label}, ${ariaDur}` }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": "true" }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "track-card-left track-card-home-body" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-stack" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-row" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-name" }, t.label), /*#__PURE__*/
      React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
      React.createElement(AxisFirstBookmarkSavedTip, { active: bookmarkTooltipTrackId === t.id, preferBottom: typeof window !== "undefined" && window.innerWidth < 400 }), /*#__PURE__*/
      React.createElement("button", { type: "button", className: "home-track-bookmark-btn", "aria-pressed": isFav ? "true" : "false", "aria-label": isFav ? "Remove bookmark" : "Bookmark track", onClick: (e) => {e.stopPropagation();axisHapticTick();toggleFavoriteTrack(t.id);} }, /*#__PURE__*/
      React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, isFav ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }))
      ))), /*#__PURE__*/
      React.createElement("div", { className: "track-card-sub" }, /*#__PURE__*/React.createElement("span", { className: "glass-label" }, axisTrackCardSubtitleDisplay(t.subtitle))), /*#__PURE__*/
      React.createElement("div", { className: "track-card-purpose" }, t.purpose)), /*#__PURE__*/
      React.createElement("div", { className: "track-card-home-footer" }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-dur axis-duration-label" }, footerDurLine)
      )));
    });
    const favoritesExPanelEl = pinnedExerciseRows.length === 0 ? favoritesEmptyExEl : pinnedExerciseRows.map(({ ex, trackId, trackLabel }) => {
      const tline = axisExerciseTargetMetaLine(ex, "");
      const exBookmarked = !!favs[ex.id];
      const trackTitle = TRACKS && TRACKS[trackId] ? TRACKS[trackId].label || trackLabel : trackLabel;
      return /*#__PURE__*/React.createElement("div", {
        key: "fav-ex-" + trackId + "-" + ex.id,
        className: "track-card session-card track-card--home-browse glass-card home-routine-track-card home-browse-card--favorites",
        role: "button",
        tabIndex: 0,
        onClick: () => {openTrackDetail(trackId);},
        onKeyDown: (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();openTrackDetail(trackId);}},
        "aria-label": `Open workout, ${trackTitle}, ${ex.name}`
      }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": true }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "track-card-left track-card-home-body" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-stack" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-row" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-name" }, ex.name), /*#__PURE__*/
      React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
      React.createElement(AxisFirstBookmarkSavedTip, { active: bookmarkTooltipExerciseId === ex.id, preferBottom: typeof window !== "undefined" && window.innerWidth < 400 }), /*#__PURE__*/
      React.createElement("button", { type: "button", className: "home-track-bookmark-btn", "aria-pressed": exBookmarked ? "true" : "false", "aria-label": exBookmarked ? "Remove exercise bookmark" : "Bookmark exercise", onClick: (e) => {e.stopPropagation();axisHapticTick();toggleFav(ex.id);} }, /*#__PURE__*/
      React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, exBookmarked ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }))
      ))), /*#__PURE__*/
      tline ? /*#__PURE__*/React.createElement("div", { className: "track-card-sub" }, /*#__PURE__*/React.createElement("span", { className: "glass-label" }, axisTrackCardSubtitleDisplay(tline))) : null, /*#__PURE__*/
      ex.sub ? /*#__PURE__*/React.createElement("div", { className: "track-card-purpose" }, ex.sub) : null), /*#__PURE__*/
      React.createElement("div", { className: "track-card-home-footer" }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-dur axis-duration-label" }, trackTitle)
      )));
    });
    const favoritesCardsEl = favoritesSegment === "tracks" ? favoritesTracksPanelEl : favoritesExPanelEl;
    return (/*#__PURE__*/
      React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body axis-app-scroll-root" }, /*#__PURE__*/
      dashboardHeaderEl, /*#__PURE__*/
      React.createElement("div", { className: "home" }, /*#__PURE__*/
      React.createElement("div", { className: "track-cards-outer home-track-cards-outer--top" }, /*#__PURE__*/
      React.createElement("div", { className: "home-welcome metrics-page-title", id: "axis-favorites-welcome" }, "Favorites"), /*#__PURE__*/
      React.createElement("div", { className: "timer-mode-outer-pill timer-glass-wrap axis-seg-toggle-wrap", role: "tablist", "aria-label": "Favorites scope", style: FAVORITES_SEG_WRAP }, /*#__PURE__*/
      React.createElement("button", { type: "button", className: "timer-glass-toggle-btn" + (favoritesSegment === "tracks" ? " active" : ""), role: "tab", "aria-selected": favoritesSegment === "tracks" ? "true" : "false", onClick: () => {axisHapticTick();setFavoritesSegment("tracks");} }, "TRACKS"), /*#__PURE__*/
      React.createElement("button", { type: "button", className: "timer-glass-toggle-btn" + (favoritesSegment === "exercises" ? " active" : ""), role: "tab", "aria-selected": favoritesSegment === "exercises" ? "true" : "false", onClick: () => {axisHapticTick();setFavoritesSegment("exercises");} }, "EXERCISES")), /*#__PURE__*/
      React.createElement("div", { className: "track-cards" }, favoritesCardsEl)
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--today" })), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
      ));
  }

  // METRICS (activity + weight + pain)
  if (view === "metrics") {
    const summaryRecentLimit = summaryRecentExpanded ? 15 : 3;
    const summaryRecentRows = (history || []).slice(0, Math.min((history || []).length, summaryRecentLimit));
    const summaryHistoryGroups = [];
    for (const e of summaryRecentRows) {
      const dk = axisLocalDateKey(e.date);
      const last = summaryHistoryGroups[summaryHistoryGroups.length - 1];
      if (!last || last.dateKey !== dk) {
        summaryHistoryGroups.push({ dateKey: dk, rows: [e] });
      } else {
        last.rows.push(e);
      }
    }
    const nowPeriodMetrics = getCircadianPeriod();
    const periodForMetricsAccent = activePeriod || nowPeriodMetrics;
    const ctMetricsAccent = CIRCADIAN_THEMES[periodForMetricsAccent] && CIRCADIAN_THEMES[periodForMetricsAccent][theme === "dark" ? "dark" : "light"];
    const metricsSessionAccent = nightMode ? "#FF3B30" : (ctMetricsAccent && ctMetricsAccent.accent ? ctMetricsAccent.accent : "#4DA8FF");
    const movementStreakDays = axisMovementStreakDays(axisHistoryForDailyTotals(history));
    const heroLblFadeMs = axisCelebrationFadeMs(150);
    const heroInsightFadeMs = axisCelebrationFadeMs(300);
    return (/*#__PURE__*/
      React.createElement("div", { className: "app app--nav-gap-tight", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body axis-app-scroll-root app-body--metrics-fill" }, /*#__PURE__*/
      dashboardHeaderEl, /*#__PURE__*/
      React.createElement("div", { className: "home home--metrics-layout" }, /*#__PURE__*/
      React.createElement("div", { className: "track-cards-outer home-track-cards-outer--top home-track-cards-outer--summary" }, /*#__PURE__*/
      React.createElement("div", { className: "home-welcome metrics-page-title", id: "axis-metrics-welcome" }, "Metrics"), /*#__PURE__*/
      React.createElement("div", { className: "summary-main-stack summary-main-stack--metrics" }, /*#__PURE__*/
      React.createElement("div", { className: "summary-sunset-stack summary-sunset-stack--metrics" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__boxes" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-stat-feature metrics-quick-glance__unified-card axis-surface-tmt", role: "status", style: { "--metrics-session-accent": metricsSessionAccent } }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-grid" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-left-top" }, /*#__PURE__*/
      React.createElement("div", {
        className: "metrics-quick-glance__stat-title metrics-quick-glance__stat-title--movement metrics-quick-glance__dashboard-hero-label",
        style: { position: "relative", minHeight: "1.15em", alignSelf: "flex-start", width: "100%" }
      }, /*#__PURE__*/
      React.createElement("span", {
        className: "axis-metrics-hero-label-fade",
        style: {
          opacity: dailyGoalEyebrowMovementOpaque ? 1 : 0,
          transition: `opacity ${heroLblFadeMs}ms ease-out`,
          display: "inline-block"
        }
      }, "MOVEMENT TODAY"), /*#__PURE__*/
      React.createElement("span", {
        className: "axis-metrics-hero-label-fade",
        style: {
          position: "absolute",
          left: 0,
          top: 0,
          opacity: dailyGoalEyebrowGoalHit ? 1 : 0,
          transition: `opacity ${heroLblFadeMs}ms ease-out`,
          display: "inline-block"
        }
      }, "GOAL HIT.")
      ), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-hero-metric" }, /*#__PURE__*/
      React.createElement("span", { className: "metrics-quick-glance__dashboard-hero-num" + (dailyGoalHeroPulse ? " axis-celebration-daily-goal-pulse" : "") }, String(Math.max(0, Math.round(todayMinutesTotal)))), /*#__PURE__*/
      React.createElement("span", { className: "metrics-quick-glance__dashboard-hero-unit" }, "MIN")
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-right" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-stack" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-label" }, "STREAK"), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-num" }, String(movementStreakDays)), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-sub" }, "day streak")
      ), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-stack" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-label" }, "SESSIONS"), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-num" }, String(weekSessionCountForWindow)), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-side-sub" }, "this week")
      )
      ), /*#__PURE__*/
      React.createElement("hr", { className: "metrics-quick-glance__dashboard-divider", "aria-hidden": true }), /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__dashboard-left-bottom" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-quick-glance__hero-week-sub metrics-quick-glance__dashboard-week-line" }, `${Math.max(0, Math.round(weeklyGoalBarMinutesCurrent))} MIN THIS WEEK`)
      )
      )
      )
      ),
      dailyGoalInsightMounted ? /*#__PURE__*/React.createElement("div", {
        className: "metrics-daily-goal-insight",
        style: {
          opacity: dailyGoalInsightOpaque ? 1 : 0,
          transition: `opacity ${heroInsightFadeMs}ms ease-out`
        }
      }, "Daily goal reached. Well done.") : null,
      /*#__PURE__*/React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      React.createElement("div", { className: "metrics-goals-wrap metrics-section--goals" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-block" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-toolbar" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-last7days-heading metrics-quick-glance__sub metrics-goals-toolbar__heading" }, /*#__PURE__*/
      React.createElement("span", { role: "heading", "aria-level": "2" }, "GOALS"), /*#__PURE__*/
      React.createElement("button", {
        type: "button",
        className: "metrics-last7days-info-btn",
        "aria-label": "About movement goals and top bar progress rectangle",
        "aria-expanded": goalsInfoOpen ? "true" : "false",
        onClick: () => { axisHapticTick(); setGoalsInfoOpen((o) => !o); }
      }, "\u24D8")
      ),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "metrics-goals-toolbar__link",
        onClick: () => { if (navigator.vibrate) navigator.vibrate(10); axisHapticTick(); setView("system"); setSystemPanel("settings"); }
      }, "Adjust in Settings")
      ),
      goalsInfoOpen && /*#__PURE__*/React.createElement("div", {
        className: "metrics-goals-info-tooltip",
        role: "status",
        onClick: () => { setGoalsInfoOpen(false); }
      }, "Your daily and weekly movement targets. The rectangle in the top AXIS bar on the left side mirrors your current daily goal at a glance."),
      /*#__PURE__*/React.createElement("div", { className: "metrics-goals-compact" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-bar-row" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-bar-head" }, /*#__PURE__*/
      React.createElement("span", null, "Daily"),
      React.createElement("span", { className: "metrics-goals-bar-meta" }, todayMinutesTotal, " / ", goalMin > 0 ? goalMin : "\u2014", " MIN")
      ),
      React.createElement("div", {
        className: "prog-bar",
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(dailyBarFillPct),
        "aria-label": "Daily goal progress"
      }, /*#__PURE__*/React.createElement("div", { className: "prog-fill" + (dailyBarOverdrive ? " metrics-goals-bar-fill--over" : ""), style: { width: `${dailyBarFillPct}%` } }))
      ),
      React.createElement("div", { className: "metrics-goals-bar-row" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-bar-head" }, /*#__PURE__*/
      React.createElement("span", null, "Weekly"),
      React.createElement("span", { className: "metrics-goals-bar-meta" }, weeklyGoalBarMinutesCurrent, " / ", weeklyTargetMin > 0 ? weeklyTargetMin : "\u2014", " MIN")
      ),
      React.createElement("div", {
        className: "prog-bar",
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": Math.round(weeklyBarFillPct),
        "aria-label": "Weekly goal progress"
      }, /*#__PURE__*/React.createElement("div", { className: "prog-fill" + (weeklyBarOverdrive ? " metrics-goals-bar-fill--over" : ""), style: { width: `${weeklyBarFillPct}%` } }))
      )
      )
      )
      ),
      /*#__PURE__*/React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      /*#__PURE__*/React.createElement("div", { className: "metrics-last7days-heading metrics-quick-glance__sub metrics-goals-toolbar__heading" }, /*#__PURE__*/
      React.createElement("span", null, "7-Day Momentum"),
      /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "metrics-last7days-info-btn",
        "aria-label": "About 7-day momentum and top bar indicators",
        "aria-expanded": last7DaysInfoOpen ? "true" : "false",
        onClick: () => { axisHapticTick(); setLast7DaysInfoOpen((o) => !o); }
      }, "\u24D8")
      ),
      last7DaysInfoOpen && /*#__PURE__*/React.createElement("div", {
        className: "metrics-last7days-tooltip",
        role: "status",
        onClick: () => { setLast7DaysInfoOpen(false); }
      }, "Each square is a day with logged movement. The squares in the top AXIS bar mirror your current week at a glance, a quiet reminder of your momentum wherever you are in the app."),
      /*#__PURE__*/React.createElement(MomentumMap, { history: history, nightMode: nightMode, theme: theme, compact: true, metricsQuickGlance: true }), /*#__PURE__*/
      React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }), /*#__PURE__*/
      React.createElement("div", { className: "metrics-body-metrics-toolbar" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-goals-toolbar__heading", role: "heading", "aria-level": "2" }, "Body metrics")
      ), /*#__PURE__*/
      React.createElement("div", { className: "metrics-metric-panel axis-surface-tmt" }, /*#__PURE__*/
      React.createElement(MetricsWeightCard, {
        theme: theme,
        nightMode: nightMode,
        activePeriod: activePeriod,
        factsCycle: metricsFactsCycle,
        samples: metricsWeightSamples,
        stepsToday: metricsStepsToday,
        healthHint: metricsHealthHint,
        onLogWeight: (payload) => {
          const lbs = typeof payload === "number" ? payload : payload && Number(payload.lbs);
          const ts = typeof payload === "object" && payload && Number.isFinite(Number(payload.ts)) ? Number(payload.ts) : Date.now();
          if (!Number.isFinite(lbs) || lbs <= 0) return;
          setMetricsWeightSamples((prev) => axisMetricsMergeWeightByTs(axisMetricsNormalizeWeightList(prev), [{ ts, lbs, source: "manual" }]));
        },
        onEditWeightEntry: (ts, lbs) => {
          const n = Math.max(1, Math.min(800, Number(lbs)));
          if (!Number.isFinite(n)) return;
          setMetricsWeightSamples((prev) => axisMetricsNormalizeWeightList((prev || []).map((x) => x.ts === ts ? { ...x, lbs: n } : x)));
        },
        onDeleteWeightEntry: (ts) => {
          setMetricsWeightSamples((prev) => axisMetricsNormalizeWeightList((prev || []).filter((x) => x.ts !== ts)));
        }
      })
      )
      , /*#__PURE__*/
      React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }), /*#__PURE__*/
      React.createElement("div", { className: "metrics-metric-panel axis-surface-tmt" }, /*#__PURE__*/
      React.createElement(MetricsPainCard, {
        theme: theme,
        nightMode: nightMode,
        activePeriod: activePeriod,
        factsCycle: metricsFactsCycle,
        painByDay: metricsPainByDay,
        onLogPain: (payload) => {
          const dk = new Date().toDateString();
          const level = typeof payload === "number" ? payload : payload && payload.level;
          const note = typeof payload === "object" && payload && payload.note ? String(payload.note).slice(0, 48) : "";
          if (typeof level !== "number" || level < 1 || level > 10) return;
          setMetricsPainByDay((p) => {
            const next = { ...p, [dk]: note ? { level, note } : { level } };
            return next;
          });
        },
        onEditPainEntry: (dateKey, payload) => {
          const level = payload && typeof payload.level === "number" ? payload.level : NaN;
          const note = payload && payload.note ? String(payload.note).slice(0, 48) : "";
          if (typeof dateKey !== "string" || !Number.isFinite(level) || level < 1 || level > 10) return;
          setMetricsPainByDay((p) => {
            const next = { ...(p || {}) };
            next[dateKey] = note ? { level, note } : { level };
            return next;
          });
        },
        onDeletePainEntry: (dateKey) => {
          if (typeof dateKey !== "string") return;
          setMetricsPainByDay((p) => {
            const next = { ...(p || {}) };
            delete next[dateKey];
            return next;
          });
        }
      })
      )
      , /*#__PURE__*/
      /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      history.length > 0 && /*#__PURE__*/React.createElement("div", { className: "metrics-recent-section summary-panel history summary-panel--metrics-follow" + (summaryRecentOpen ? "" : " metrics-recent-section--collapsed"), style: { "--metrics-session-accent": metricsSessionAccent } }, /*#__PURE__*/
      React.createElement("button", {
        type: "button",
        className: "metrics-recent-header-btn",
        onClick: () => { axisHapticTick(); setSummaryRecentOpen((o) => !o); },
        "aria-expanded": summaryRecentOpen ? "true" : "false"
      }, /*#__PURE__*/
      React.createElement("span", { className: "metrics-recent-header-btn__label" }, "Recent sessions"),
      /*#__PURE__*/React.createElement("span", { className: "metrics-recent-header-btn__chev", "aria-hidden": true }, /*#__PURE__*/React.createElement(AxisChevronCaret, { expanded: summaryRecentOpen, className: "metrics-recent-header-btn__chev-svg" }))
      ),
      summaryRecentOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/
      React.createElement("div", { className: "summary-history-list-wrap" + (summaryRecentExpanded ? " summary-history-list-wrap--expanded" : "") },
      summaryHistoryGroups.map((g) => /*#__PURE__*/React.createElement(React.Fragment, { key: g.dateKey }, /*#__PURE__*/
      React.createElement("div", { className: "history-day-group-label metrics-recent-day-head" }, axisRelativeDayLabel(g.dateKey)),
      g.rows.map((e, ri) => {
        const exLabel = axisExerciseNameForHistoryEntry(e);
        const exLabelResolved = exLabel || (e && e.trackId && TRACKS[e.trackId] && TRACKS[e.trackId].label ? TRACKS[e.trackId].label : "Session");
        const trackUp = String(e.track || "").toUpperCase();
        return (/*#__PURE__*/React.createElement("div", { className: "metrics-recent-row history-row", key: `${g.dateKey}-${e.track}-${e.exerciseId != null ? e.exerciseId : ri}-${ri}` }, /*#__PURE__*/
        React.createElement("div", { className: "metrics-recent-row__main" }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", { className: "metrics-recent-row__exercise" }, exLabelResolved), /*#__PURE__*/React.createElement("div", { className: "metrics-recent-row__track" }, trackUp))),
        /*#__PURE__*/React.createElement("div", { className: "metrics-recent-row__dur axis-duration-label" }, axisMetricsFormatSessionDurationShort(e.duration))
        ));
      })
      ))
      ),
      (history || []).length > 3 && /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "summary-history-toggle summary-history-toggle--secondary",
        "aria-expanded": summaryRecentExpanded ? "true" : "false",
        onClick: () => {axisHapticTick();setSummaryRecentExpanded((x) => !x);}
      }, summaryRecentExpanded ? "Collapse" : "[SHOW MORE]")
      )
      ,
      React.createElement("button", {
        type: "button",
        className: "summary-history-bottom-toggle summary-history-bottom-toggle--secondary",
        "aria-expanded": summaryRecentOpen ? "true" : "false",
        onClick: () => {axisHapticTick();setSummaryRecentOpen((o) => !o);}
      }, /*#__PURE__*/
      /*#__PURE__*/React.createElement("span", { className: "summary-history-bottom-toggle__chev", "aria-hidden": true }, /*#__PURE__*/React.createElement(AxisChevronCaret, { expanded: summaryRecentOpen, className: "summary-history-bottom-toggle__chev-svg" })),
      summaryRecentOpen ? "Collapse" : "Expand"
      )
      ))
      ),
      history.length === 0 && /*#__PURE__*/
      React.createElement("div", { className: "metrics-recent-section metrics-empty-cta--flat" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-empty-history-copy" }, "Complete a session to see history here."),
      React.createElement("div", { className: "metrics-empty-home-wrap" }, /*#__PURE__*/
      React.createElement("button", {
        type: "button",
        className: "metrics-empty-home-link",
        onClick: () => {axisHapticTick();setView("home");}
      }, "Go to Home")
      )
      ),
      (track === "anxiety" || track === "stress") && (listTotalDone > 0 || guidedTotalDone > 0) && /*#__PURE__*/
      React.createElement("div", { style: { marginTop: 20, padding: "18px", borderRadius: 24, border: "1px solid var(--glass-border)", background: "var(--glass-bg)" } }, /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--mood-color)", marginBottom: 8 } }, "Continue the Reset"), /*#__PURE__*/
      React.createElement("div", { style: { fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.45 } },
      track === "anxiety" ? "Finish with 2 minutes of Box Breathing to ground the nervous system." : "Calm the heart with a Physiological Sigh."
      ), /*#__PURE__*/
      React.createElement("button", { onClick: () => {setView("timer");}, style: {
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--accent-dim)", border: "1px solid var(--mood-color)",
          fontFamily: "var(--font-display)", fontSize: "12px", letterSpacing: "0.14em",
          textTransform: "uppercase", color: "var(--mood-color)", cursor: "pointer",
          padding: "10px 18px", borderRadius: 10, transition: "all 0.18s"
        } },
      /*#__PURE__*/React.createElement(AxisThinArrowRight, { size: 14 }), track === "anxiety" ? "Box Breathing" : "Physiological Sigh"
      )
      ),
      /*#__PURE__*/React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      /*#__PURE__*/React.createElement("div", { className: "metrics-coaching-cta" }, /*#__PURE__*/
      React.createElement("div", { className: "metrics-coaching-cta__eyebrow" }, "1-on-1 coaching"),
      /*#__PURE__*/React.createElement("p", { className: "metrics-coaching-cta__body weight-section__context" }, "Book time to review your metrics or perfect your form in a 1-on-1, on camera session with a licensed Physical Literacy Coach."),
      /*#__PURE__*/React.createElement("a", {
        href: "./coaching.html",
        className: "metrics-coaching-cta__action",
        onClick: () => { axisHapticTick(); }
      }, /*#__PURE__*/React.createElement(AxisThinArrowRight, { size: 14 }), "Schedule a session")
      ),
      /*#__PURE__*/React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      /*#__PURE__*/React.createElement("div", { className: "metrics-cta-vertical-band" }, /*#__PURE__*/
      React.createElement("hr", { className: "metrics-rail__rule metrics-rail__rule--gap-md", "aria-hidden": true }),
      /*#__PURE__*/React.createElement("div", { className: "summary-cta summary-cta--metrics-flat", style: { "--metrics-session-accent": metricsSessionAccent } }, /*#__PURE__*/
      React.createElement("button", {
        className: "summary-cta-btn summary-cta-btn--metrics-mood ultra-filled-btn",
        onClick: () => {setView("home");} },
      "Start Another Session"
      )))
      )
      )
      )
      )
      , /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--today" })
      ), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
      ));
  }

  // TODAY (formerly Home)
  if (view === "home" && !hasActiveSession) {
    const nowPeriod = getCircadianPeriod();
    const perMove = exerciseDuration || 45;
    const getTrackDisplayDuration = (trackId) => {
      const sections = getSections(trackId);
      const activeCount = (sections || []).reduce((n, sec) => n + (sec.exercises || []).filter((e) => !skipped[e.id]).length, 0);
      const sessionSecs = activeCount * perMove;
      const mins = Math.round(sessionSecs / 60) || 0;
      return axisFormatDurationMinUpper(mins);
    };
    const TODAY_SUGGESTIONS = {
      dawn: { trackId: "morning", suggestion: "Start your morning with intention." },
      midday: { trackId: "desk", suggestion: "Reset your body at midday." },
      prime: { trackId: "stress", suggestion: "Wind down and decompress." },
      rest: { trackId: "prime", suggestion: "Relax your body before sleep." }
    };
    const periodKey = TODAY_SUGGESTIONS[nowPeriod] ? nowPeriod : "dawn";
    const todaySug = TODAY_SUGGESTIONS[periodKey] || TODAY_SUGGESTIONS.dawn;
    const todayTrackId = todaySug && TRACKS && TRACKS[todaySug.trackId] ? todaySug.trackId : "daily";
    const todayTrack = (TRACKS && (TRACKS[todayTrackId] || TRACKS.daily)) || TRACKS_DATA_FALLBACK.daily;
    const todaySuggestionText = todaySug && todayTrackId === todaySug.trackId ? todaySug.suggestion : (todayTrack && todayTrack.purpose) || (todaySug && todaySug.suggestion) || "";
    const HOURLY_PRACTICE_TRACK_ID = "hourly-practice";
    const hourlyPracticeTrack = TRACKS && TRACKS[HOURLY_PRACTICE_TRACK_ID];
    const launchHourlyPracticeGuided = () => {
      if (!hourlyPracticeTrack) return;
      axisHapticTick();
      beginTrack(HOURLY_PRACTICE_TRACK_ID);
      primeAudio();
      setGuidedActive(true);
    };

    const homeBrowseGroups = homeTrackCategory === "all" ?
    HOME_TRACK_GROUPS :
    HOME_TRACK_GROUPS.filter((g) => g.id === homeTrackCategory);
    const homeSectionIsRoutine = homeSection === "routine";
    const homeSectionIsExplore = homeSection === "explore";
    const recentResolvedHome = recentTracks.filter((id) => TRACKS && TRACKS[id]);
    const lastGlobalHist = axisLatestHistoryEntryGlobal(history);
    const lastMovementFromHist = axisResolveTrackIdFromHistoryEntry(lastGlobalHist);
    const lastMovementTrackId = lastMovementFromHist || (recentResolvedHome.length ? recentResolvedHome[0] : null);
    const lastMovementTrack = lastMovementTrackId && TRACKS ? TRACKS[lastMovementTrackId] : null;
    const lastMovementEntry = lastMovementFromHist ? lastGlobalHist : axisLatestHistoryEntryForTrack(lastMovementTrackId, history);
    const lastSessionLoggedDate = axisDateFromHistoryEntry(lastMovementEntry);
    const lastSessionDayUpper = lastSessionLoggedDate ? axisFormatLastSessionDayUpper(lastSessionLoggedDate) : "";
    const routineRecentsHome = recentResolvedHome.filter((id) => id !== lastMovementTrackId);
    const HOME_SECTION_SEG_WRAP = { flexShrink: 0, display: "flex", gap: 5, marginTop: 0, marginBottom: 8, padding: 3, minHeight: 40, alignItems: "center", boxSizing: "border-box", width: "100%", maxWidth: 380, marginLeft: "auto", marginRight: "auto", justifyContent: "center" };
    const lastSessionDurDateLine = lastMovementTrackId ?
    lastSessionDayUpper ?
    `${getTrackDisplayDuration(lastMovementTrackId)} \u00b7 ${lastSessionDayUpper}` :
    getTrackDisplayDuration(lastMovementTrackId) :
    "";
    const renderHomeBrowseTrackCard = (trackId, keyPrefix, mode) => {
      const t = TRACKS && TRACKS[trackId];
      if (!t) return null;
      const durShown = getTrackDisplayDuration(t.id);
      const isFav = favoriteTrackIds.indexOf(t.id) !== -1;
      const isRoutine = mode === "favorites" || mode === "recent";
      const isRecent = mode === "recent";
      const isFavorites = mode === "favorites";
      let recentHistDateUpper = "";
      if (isRecent) {
        const ent = axisLatestHistoryEntryForTrack(t.id, history);
        const d = axisDateFromHistoryEntry(ent);
        recentHistDateUpper = d ? axisFormatLastSessionDayUpper(d) : "";
      }
      const footerDurLine = isRecent && recentHistDateUpper ? `${durShown} \u00b7 ${recentHistDateUpper}` : durShown;
      let cardShellClass = "track-card session-card track-card--home-browse glass-card";
      if (isRoutine) cardShellClass += " home-routine-track-card";
      if (isFavorites) cardShellClass += " home-browse-card--favorites";
      if (isRecent) cardShellClass += " home-browse-card--recent";
      const ariaDur = footerDurLine.replace(/\u00b7/g, ",").replace(/\s+/g, " ").trim();
      return /*#__PURE__*/React.createElement("div", { className: cardShellClass, key: `${keyPrefix}-${t.id}`, "data-category": TRACK_CATEGORY_BY_ID[trackId] || "", onClick: () => {openTrackDetail(t.id);}, role: "button", tabIndex: 0, onKeyDown: (e) => {if (e.key === "Enter" || e.key === " ") {e.preventDefault();openTrackDetail(t.id);}}, "aria-label": `View workout, ${t.label}, ${ariaDur}` }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": "true" }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "track-card-left track-card-home-body" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-stack" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-title-row" }, /*#__PURE__*/
      React.createElement("div", { className: "track-card-name" }, t.label), /*#__PURE__*/
      React.createElement("div", { className: "axis-first-bookmark-tip-host" }, /*#__PURE__*/
      React.createElement(AxisFirstBookmarkSavedTip, { active: bookmarkTooltipTrackId === t.id, preferBottom: typeof window !== "undefined" && window.innerWidth < 400 }), /*#__PURE__*/
      React.createElement("button", { type: "button", className: "home-track-bookmark-btn", "aria-pressed": isFav ? "true" : "false", "aria-label": isFav ? "Remove bookmark" : "Bookmark track", onClick: (e) => {e.stopPropagation();axisHapticTick();toggleFavoriteTrack(t.id);} }, /*#__PURE__*/
      React.createElement("svg", { width: 18, height: 18, viewBox: "0 0 24 24", className: "axis-bookmark-glyph-svg", "aria-hidden": "true" }, isFav ? /*#__PURE__*/React.createElement("path", { fill: "currentColor", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }) : /*#__PURE__*/React.createElement("path", { fill: "none", stroke: "currentColor", strokeWidth: "1.6", strokeLinejoin: "round", d: "M6.25 6.95c0-.95.76-1.7 1.7-1.7h8.1c.94 0 1.7.75 1.7 1.7v12.92l-5.82-4-5.78 4V6.95Z" }))
      ))), /*#__PURE__*/
      React.createElement("div", { className: "track-card-sub" }, /*#__PURE__*/React.createElement("span", { className: "glass-label" }, axisTrackCardSubtitleDisplay(t.subtitle))), /*#__PURE__*/
      React.createElement("div", { className: "track-card-purpose" }, t.purpose)), /*#__PURE__*/
      React.createElement("div", { className: "track-card-home-footer" }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-dur axis-duration-label" }, footerDurLine)
      )));
    };

    const minsNow = new Date().getHours() * 60 + new Date().getMinutes();
    const nm = welcomeName.trim();
    const greetWithName = (phrase) => nm ? phrase + ", " + nm : phrase;
    let timeGreeting;
    if (minsNow >= 5 * 60 && minsNow < 11 * 60) {
      timeGreeting = greetWithName("Good Morning");
    } else if (minsNow >= 11 * 60 && minsNow < 17 * 60) {
      timeGreeting = greetWithName("Good Afternoon");
    } else if (minsNow >= 17 * 60 && minsNow < 21 * 60) {
      timeGreeting = greetWithName("Good Evening");
    } else {
      timeGreeting = greetWithName("Good Night");
    }

    return (/*#__PURE__*/
      React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
      React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
      React.createElement("div", { className: "app-body" }, /*#__PURE__*/
      dashboardHeaderEl, /*#__PURE__*/
      React.createElement("div", { className: "home" }, /*#__PURE__*/
      React.createElement("div", { className: "track-cards-outer home-track-cards-outer--top" }, /*#__PURE__*/
      React.createElement("div", { className: "home-header-lock" }, /*#__PURE__*/
      React.createElement("div", { className: "home-welcome home-greeting", id: "axis-home-welcome" }, timeGreeting), /*#__PURE__*/
      React.createElement("div", { className: "track-group start-here-group" }, /*#__PURE__*/
      React.createElement("div", {
        className: "home-smart-card home-smart-card--unified track-card session-card track-card--home-browse glass-card",
        role: "region",
        "aria-label": "Now and start last session",
        style: { marginBottom: hourlyPracticeTrack ? "var(--home-section-gap)" : "var(--home-block-gap)" }
      }, /*#__PURE__*/
      React.createElement("div", {
        className: "home-smart-card__hit home-smart-card__hit--now",
        role: "button",
        tabIndex: 0,
        "aria-label": `Now: ${todayTrack.label}, ${getTrackDisplayDuration(todayTrack.id)}`,
        onClick: () => {axisHapticTick();openTrackDetail(todayTrack.id);},
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            axisHapticTick();
            openTrackDetail(todayTrack.id);
          }
        }
      }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": "true" }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__body" }, /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__eyebrow" }, "NOW"), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__title-now" }, todayTrack.label), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__desc" }, todaySuggestionText), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__row-duration axis-duration-label" }, getTrackDisplayDuration(todayTrack.id)))
      ), /*#__PURE__*/
      React.createElement("hr", { className: "home-smart-card__rule", "aria-hidden": true }), /*#__PURE__*/
      lastMovementTrack ? /*#__PURE__*/React.createElement("div", {
        className: "home-smart-card__hit home-smart-card__hit--last",
        role: "button",
        tabIndex: 0,
        "aria-label": `Start last session, ${lastMovementTrack.label}, ${getTrackDisplayDuration(lastMovementTrackId)}${lastSessionDayUpper ? ", " + lastSessionDayUpper : ""}`,
        onClick: () => {axisHapticTick();openTrackDetail(lastMovementTrackId);},
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            axisHapticTick();
            openTrackDetail(lastMovementTrackId);
          }
        }
      }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": "true" }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__body" }, /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__eyebrow" }, "START LAST SESSION"), /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__last-main" }, /*#__PURE__*/
      React.createElement("span", { className: "home-smart-card__title-last" }, lastMovementTrack.label), /*#__PURE__*/
      React.createElement("span", { className: "home-smart-card__dur-date axis-duration-label" }, lastSessionDurDateLine)))
      ) : /*#__PURE__*/React.createElement("div", { className: "home-smart-card__hit home-smart-card__hit--last home-smart-card__hit--disabled" }, /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__body" }, /*#__PURE__*/
      React.createElement("div", { className: "home-smart-card__eyebrow" }, "START LAST SESSION"), /*#__PURE__*/
      React.createElement("p", { className: "home-smart-card__empty home-smart-card__empty--sessions" }, "No sessions yet. Start one below.")))
      )
      , hourlyPracticeTrack ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "home-hourly-practice-cta",
        "aria-label": `Start guided, ${hourlyPracticeTrack.label}, ${getTrackDisplayDuration(HOURLY_PRACTICE_TRACK_ID)}`,
        onClick: () => {launchHourlyPracticeGuided();},
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            launchHourlyPracticeGuided();
          }
        }
      }, /*#__PURE__*/
      React.createElement("span", { className: "track-card-home-chevron", "aria-hidden": "true" }, "\u203a"), /*#__PURE__*/
      React.createElement("div", { className: "home-hourly-practice-cta__body" }, /*#__PURE__*/
      React.createElement("div", { className: "home-hourly-practice-cta__head-row" }, /*#__PURE__*/
      React.createElement("span", { className: "home-hourly-practice-cta__kicker" }, "HOURLY PRACTICE"), /*#__PURE__*/
      React.createElement("span", { className: "home-hourly-practice-cta__dur" }, getTrackDisplayDuration(HOURLY_PRACTICE_TRACK_ID))), /*#__PURE__*/
      React.createElement("span", { className: "home-hourly-practice-cta__tagline home-smart-card__desc" }, "One tap into a quick guided full-body reset.")))
      : null
      ), /*#__PURE__*/
      React.createElement("div", { className: "timer-mode-outer-pill timer-glass-wrap axis-seg-toggle-wrap", role: "tablist", "aria-label": "Home content sections", style: HOME_SECTION_SEG_WRAP }, /*#__PURE__*/
      React.createElement("button", { type: "button", role: "tab", className: "timer-glass-toggle-btn" + (homeSectionIsExplore ? " active" : ""), "aria-selected": homeSectionIsExplore ? "true" : "false", onClick: () => {axisHapticTick();setHomeSection("explore");} }, "EXPLORE"), /*#__PURE__*/
      React.createElement("button", { type: "button", role: "tab", className: "timer-glass-toggle-btn" + (homeSectionIsRoutine ? " active" : ""), "aria-selected": homeSectionIsRoutine ? "true" : "false", onClick: () => {axisHapticTick();setHomeSection("routine");} }, "RECENTS")
      )
      ), /*#__PURE__*/
      React.createElement("div", { className: "home-slide-shell" }, /*#__PURE__*/
      React.createElement("div", { className: "home-slide-track" + (homeSectionIsExplore ? " home-slide-track--explore" : "") }, /*#__PURE__*/
      React.createElement("div", { className: "home-slide-view home-slide-view--routine" + (homeSectionIsRoutine ? " home-slide-view--active" : "") }, /*#__PURE__*/
      React.createElement("div", { className: "home-routine-section", role: "region", "aria-label": "Recent tracks" }, /*#__PURE__*/
      React.createElement("div", { className: "home-routine-tracks" }, /*#__PURE__*/
      React.createElement("div", { className: "track-cards" },
      routineRecentsHome.length ? routineRecentsHome.map((id) => renderHomeBrowseTrackCard(id, "recent", "recent")) : /*#__PURE__*/React.createElement("div", { className: "favorites-empty home-recents-empty" }, "Your recent sessions will appear here after you start a track.")
      )
      )
      )
      )
      , /*#__PURE__*/
      React.createElement("div", { className: "home-slide-view home-slide-view--explore" + (homeSectionIsExplore ? " home-slide-view--active" : "") }, /*#__PURE__*/
      React.createElement("div", { className: "home-explore-browse" }, /*#__PURE__*/
      React.createElement("div", { className: "home-category-strip-wrap" }, /*#__PURE__*/
      React.createElement("div", {
        className: "home-category-strip explore-filters",
        role: "tablist",
        "aria-label": "Filter tracks by category"
      }, /*#__PURE__*/
      React.createElement("div", {
        className: "home-category-tabs-inner"
      }, HOME_CATEGORY_FILTERS.map((cf) => /*#__PURE__*/
      React.createElement("div", {
        key: cf.id,
        role: "tab",
        tabIndex: 0,
        className: "home-category-tab filter-tab explore-filter-btn" + (homeTrackCategory === cf.id ? " active" : ""),
        "data-active": homeTrackCategory === cf.id ? "true" : "false",
        "aria-selected": homeTrackCategory === cf.id ? "true" : "false",
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (navigator.vibrate) navigator.vibrate(8);
            axisHapticTick();
            setHomeTrackCategory(cf.id);
          }
        },
        onClick: () => {
          if (navigator.vibrate) navigator.vibrate(8);
          axisHapticTick();
          setHomeTrackCategory(cf.id);
        }
      }, /*#__PURE__*/React.createElement("span", { className: "home-category-tab-label" }, cf.label))
      )))
      ), /*#__PURE__*/
      React.createElement("div", { className: "home-browse-scroll-mask" }, /*#__PURE__*/
      React.createElement("div", { className: "home-browse-results" }, /*#__PURE__*/
      homeBrowseGroups.map((g) => /*#__PURE__*/
      React.createElement("div", { className: "track-group", key: g.id }, /*#__PURE__*/
      homeTrackCategory === "all" && /*#__PURE__*/React.createElement("div", { className: "track-group-label" }, g.label), /*#__PURE__*/
      React.createElement("div", { className: "track-cards" },
      g.ids.filter((id) => TRACKS && TRACKS[id]).map((id) => renderHomeBrowseTrackCard(id, `ex-${g.id}`, "explore"))
      )
      )
      )
      )
      )
      )
      )
      )
      ), /*#__PURE__*/
      React.createElement(EolMarker, null)
      )
    , /*#__PURE__*/
      React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--today" })
    ), /*#__PURE__*/
      React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
      )));

  }

  if (view !== "home" || !hasActiveSession) return null;

  const sessionBackNight = nightMode;
  const sessionBackDark = sessionBackNight || theme === "dark";
  const sessionBackPeriod = axisResolveMoodPeriod(activePeriod);
  const sessionBackCt = sessionBackNight ? null : CIRCADIAN_THEMES[sessionBackPeriod][sessionBackDark ? "dark" : "light"];
  const sessionBackIconColor = sessionBackNight ? "#FF3B30" : sessionBackCt && sessionBackCt.textPrimary || (sessionBackDark ? "var(--axis-white)" : "#0f1020");
  const sessionBackBorderColor = sessionBackNight ? "#FF3B30" : sessionBackDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.2)";

  // SESSION — render Guided overlay via portal to document.body so position:fixed is viewport-relative (parent has transform)
  const guidedOverlayEl = guidedActive ? /*#__PURE__*/
  React.createElement(GuidedOverlay, {
    theme: theme, activePeriod: activePeriod, activeAll: filteredAll,
    onExit: () => {setGuidedActive(false);setSessionComplete(false);setGuidedFirstSessionCelebration(false);},
    onToggle: toggleGuided,
    onSkip: toggleSkip,
    formatTime: formatTime,
    trackLabel: TRACKS[track].label,
    trackDuration: TRACKS[track].duration,
    nightMode: nightMode,
    streak: streak,
    onSessionComplete: () => {
      setSessionComplete(true);
      const k = axisCelebrationScopedKey("axis_first_session_complete");
      if (!storageGet(k, false)) {
        storageSet(k, true);
        setGuidedFirstSessionCelebration(true);
      }
    },
    onExerciseDurationChange: (seconds) => setExerciseDuration(seconds),
    exerciseDurationSeconds: exerciseDuration || 45,
    activeTrackId: track,
    showFirstAxisSessionLine: guidedFirstSessionCelebration }
  ) :
  null;

  return (/*#__PURE__*/
    React.createElement(React.Fragment, null,
    guidedOverlayEl && typeof document !== "undefined" && document.body ?
    ReactDOM.createPortal(guidedOverlayEl, document.body) :
    null, /*#__PURE__*/
    React.createElement("div", { className: "app", "data-theme": theme, "data-night": nightMode ? "true" : "false" }, /*#__PURE__*/
    React.createElement("div", { className: "app-orbs", style: { background: "var(--orb1), var(--orb2), var(--orb3)", transition: "background 0.4s ease" } }), /*#__PURE__*/
    React.createElement("div", { className: "app-body" }, /*#__PURE__*/
    dashboardHeaderEl, /*#__PURE__*/
    React.createElement("div", { className: "hdr-wrap" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-session-head" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-session-toprow" }, /*#__PURE__*/
    React.createElement("button", { type: "button", className: "back-btn", onClick: goHome, "aria-label": "Back",
      style: {
        border: `1px solid ${sessionBackBorderColor}`,
        color: sessionBackIconColor,
        WebkitTapHighlightColor: "transparent"
      } }, /*#__PURE__*/
    React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, /*#__PURE__*/
    React.createElement("path", { d: "M19 12H5M12 5l-7 7 7 7" }))
    ), /*#__PURE__*/
    React.createElement("div", { className: "hdr-dur axis-duration-label", "aria-label": "Session length" }, sessionDurationLabel)
    ), /*#__PURE__*/
    React.createElement("div", { className: "hdr-left" }, /*#__PURE__*/
    React.createElement("div", { className: "hdr-title" }, TRACKS[track].label)
    ),
    /*#__PURE__*/React.createElement("div", { className: "hdr-session-progress" }, /*#__PURE__*/
    React.createElement("div", { className: "tab-prog-row" }, /*#__PURE__*/
    showSessionBookmarkExerciseHint ? /*#__PURE__*/React.createElement("span", { className: "tab-prog-row__bookmark-hint" }, "Bookmark exercises to save them.") : null, /*#__PURE__*/
    React.createElement("div", { className: "tab-prog-row__top" }, /*#__PURE__*/
    React.createElement("span", { className: "tab-prog-row__line", "aria-label": `${totalDone} of ${TOTAL} exercises completed` }, /*#__PURE__*/
    React.createElement("span", { className: "tab-prog-row__done" + (totalDone === 0 ? " tab-prog-row__done--zero" : "") }, totalDone), /*#__PURE__*/
    React.createElement("span", { className: "tab-prog-row__suffix" }, " / ", TOTAL)
    ), /*#__PURE__*/
    React.createElement("button", { type: "button", className: "fav-toggle reset-pill", onClick: resetSessionTabProgress }, "Reset")), /*#__PURE__*/
    React.createElement("div", {
      className: "prog-bar",
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": Math.max(1, TOTAL),
      "aria-valuenow": Math.min(Math.round(listTotalDone), Math.max(1, TOTAL)),
      "aria-label": "Session exercises completed"
    }, /*#__PURE__*/React.createElement("div", { className: "prog-fill", style: { width: `${pct}%` } })),
    TOTAL > 0 && listTotalDone === TOTAL ? /*#__PURE__*/React.createElement("div", { className: "list-session-complete-stack" },
      listFirstSessionCelebration ? /*#__PURE__*/React.createElement("div", { className: "axis-celebration-first-session axis-celebration-first-session--list" }, "Your first AXIS session.") : null,
      /*#__PURE__*/React.createElement("div", { className: "list-session-complete-title" }, "Session complete.")
    ) : null
    )
    )
    )
    ), /*#__PURE__*/

    React.createElement("div", { className: "content content--session content--session-list", ref: sessionContentRef, onScroll: (e) => {
        listScrollRef.current = e.currentTarget.scrollTop || 0;
      } }, /*#__PURE__*/
    React.createElement("div", { className: "session-entry-cta session-entry-stack session-entry-card" }, /*#__PURE__*/
    React.createElement("div", { className: "session-entry-section session-entry-section--guided" }, /*#__PURE__*/
    React.createElement("div", { className: "session-cta-pad session-cta-pad--guided session-cta-pad--list-top" }, /*#__PURE__*/
    React.createElement("button", {
      className: "fv-cta ultra-filled-btn axis-session-primary-cta axis-session-primary-cta--hero",
      disabled: filteredAll.length === 0,
      "aria-label": "Guided session",
      onClick: startGuidedSession }, /*#__PURE__*/
    React.createElement("div", { className: "axis-guided-start-row" }, /*#__PURE__*/
    React.createElement("span", { className: "session-entry-primary-label" }, "GUIDED SESSION"))
    )),
    React.createElement("div", { className: "session-entry-micro-wrap" }, /*#__PURE__*/
    React.createElement("p", { className: "session-guided-hint session-entry-microcopy" }, "Hands-free. Auto-timed. Rest included.")
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "session-entry-or", "aria-hidden": true }, /*#__PURE__*/
    React.createElement("span", { className: "session-entry-or__label" }, "OR")
    ), /*#__PURE__*/
    React.createElement("div", { className: "session-entry-section session-entry-section--own-path", "aria-label": "Self-paced session option" }, /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "session-entry-own-path-box",
      "aria-label": "Go at your own pace — scroll to exercises",
      onClick: scrollToOwnPathExercises,
      style: { WebkitTapHighlightColor: "transparent" }
    }, /*#__PURE__*/
    React.createElement("span", { className: "session-entry-primary-label session-entry-own-path-box__label" }, "GO AT YOUR OWN PACE")
    ), /*#__PURE__*/
    React.createElement("div", { className: "session-entry-micro-wrap" }, /*#__PURE__*/
    React.createElement("p", { className: "session-own-path__body session-entry-microcopy" }, "Pick moves. Control speed. Your timing.")
    )
    )
    ), /*#__PURE__*/
    React.createElement("div", { className: "session-list-preview", "aria-label": "Exercise list for session" },
    visibleSections.map((sec) => /*#__PURE__*/
    React.createElement("div", { className: "sg sg--session-sheet", key: sec.label }, /*#__PURE__*/
    React.createElement(React.Fragment, null, /*#__PURE__*/
    sec.purpose && /*#__PURE__*/
    React.createElement("div", {
      className: "purpose-note purpose-note--guided",
      ref: sec.label === firstPurposeSectionLabel ? sessionFirstPurposeRef : undefined
    }, /*#__PURE__*/
    React.createElement("div", { className: "purpose-note__rail purpose-note__rail--session" }, /*#__PURE__*/
    React.createElement("div", { className: "purpose-note__session-hit-band" }, /*#__PURE__*/
    React.createElement("button", {
      type: "button",
      className: "purpose-disclosure-hit purpose-disclosure-hit--session",
      "aria-expanded": purposeOpenBySection[sec.label] ? "true" : "false",
      onClick: (e) => {e.preventDefault();axisHapticTick();setPurposeOpenBySection((m) => ({ ...m, [sec.label]: !m[sec.label] }));}
    }, /*#__PURE__*/
    React.createElement("span", { className: "purpose-disclosure-hit__lbl" }, "PURPOSE"), /*#__PURE__*/
    React.createElement("span", { className: "purpose-disclosure-hit__chev" + (purposeOpenBySection[sec.label] ? " purpose-disclosure-hit__chev--open" : ""), "aria-hidden": true }, "\u203a"))),
    purposeOpenBySection[sec.label] ? /*#__PURE__*/React.createElement("div", { className: "purpose-text purpose-text--guided-body" }, sec.purpose) : null)),

    sec.exercises.flatMap((ex, idx) => {
      const nextEx = sec.exercises[idx + 1] || null;
      const secDone = sec.exercises.filter((e) => listDoneSlice[e.id]).length;
      const rowEl = /*#__PURE__*/React.createElement(ExRow, { key: ex.id, ex: ex,
        done: !!listDoneSlice[ex.id], onToggle: () => toggleList(ex.id),
        open: openId === ex.id, onExpand: () => setOpenId(openId === ex.id ? null : ex.id),
        skipped: !!skipped[ex.id], onSkip: () => toggleSkip(ex.id),
        faved: !!favs[ex.id], onFav: () => toggleFav(ex.id),
        firstBookmarkTooltip: bookmarkTooltipExerciseId === ex.id,
        note: notes[ex.id], onNote: (val) => setNote(ex.id, val),
        nextName: nextEx ? axisExerciseListParenDirectionDisplayName(nextEx.name) : null,
        exerciseDurationSeconds: exerciseDuration,
        theme: theme,
        ultraNight: nightMode,
        trackId: track,
        listRailLayout: true,
        listSectionLabel: sec.label });
      if (idx !== 0) return [rowEl];
      return [/*#__PURE__*/React.createElement("div", {
        key: `section-label-${sec.label}`,
        className: "sg-section-label",
        "aria-label": `${sec.label}, ${secDone} of ${sec.exercises.length} moves completed`
      }, /*#__PURE__*/
      React.createElement("span", { className: "sg-section-label__name" }, sec.label), /*#__PURE__*/
      React.createElement("span", { className: "sg-section-label__count" }, sec.exercises.length === 1 ? "1 move" : `${sec.exercises.length} moves`)
      ), rowEl];
    })
    )
    )
    )
    ),



    React.createElement("div", { className: "tab-bar-spacer tab-bar-spacer--session" })
    )
    ), /*#__PURE__*/
    React.createElement(TabBar, { view: view, setView: setView, theme: theme, nightMode: nightMode, onSystemTab: goSystemGateway })
    )
    )
    ));

}

