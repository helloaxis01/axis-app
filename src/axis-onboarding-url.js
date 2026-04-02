/** Resolves onboarding.html next to the current document (http, capacitor, or file). */
export function axisOnboardingUrl() {
  if (typeof window === "undefined") return "./onboarding.html";
  if (window.location.protocol === "file:") return "./onboarding.html";
  if (typeof window.axisOnboardingHref === "function") return window.axisOnboardingHref();
  try {
    const p = window.location.pathname || "/";
    let dir = p.replace(/[^/]*$/, "");
    if (dir.slice(-1) !== "/") dir += "/";
    return window.location.origin + dir + "onboarding.html";
  } catch (e) {
    return "./onboarding.html";
  }
}
