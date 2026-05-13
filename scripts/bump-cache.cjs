"use strict";
/**
 * Bump shared onboarding / axis_ob cache token in public_web HTML.
 * Run manually: npm run bump-cache (same token string is also used for app.js?cb= in index.html).
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "public_web", "index.html");
const onboardingPath = path.join(root, "public_web", "onboarding.html");
const loginPath = path.join(root, "public_web", "login.html");
const onboardingIndexPath = path.join(root, "public_web", "onboarding", "index.html");

function extractBumpToken(html) {
  const ond = html.match(/var OND = "([^"]+)"/);
  if (ond) return ond[1];
  const ob = html.match(/window\.AXIS_ONBOARD_BUILD\s*=\s*"([^"]+)"/);
  if (ob) return ob[1];
  const v = html.match(/var V='([^']+)'/);
  if (v) return v[1];
  return null;
}

/** Replace every distinct old token (longest first) so substrings do not corrupt longer tokens. */
function bumpFile(filePath, oldTokens, newToken) {
  let s = fs.readFileSync(filePath, "utf8");
  let total = 0;
  for (const tok of oldTokens) {
    if (tok === newToken) continue;
    const parts = s.split(tok);
    total += parts.length - 1;
    s = parts.join(newToken);
  }
  if (total > 0) fs.writeFileSync(filePath, s, "utf8");
  return total;
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
const onboardingHtml = fs.readFileSync(onboardingPath, "utf8");
const primary =
  extractBumpToken(indexHtml) || extractBumpToken(onboardingHtml);
if (!primary) {
  console.error(
    "bump-cache: could not find cache token (var OND / AXIS_ONBOARD_BUILD / var V) in index.html or onboarding.html"
  );
  process.exit(1);
}

const tokenSet = new Set([primary]);
if (fs.existsSync(loginPath)) {
  const t = extractBumpToken(fs.readFileSync(loginPath, "utf8"));
  if (t) tokenSet.add(t);
}
if (fs.existsSync(onboardingIndexPath)) {
  const t = extractBumpToken(fs.readFileSync(onboardingIndexPath, "utf8"));
  if (t) tokenSet.add(t);
}

const oldTokens = [...tokenSet].sort((a, b) => b.length - a.length);
const newToken = Date.now().toString(36);
if (oldTokens.some((t) => t === newToken)) {
  console.error("bump-cache: new token collided with old; try again.");
  process.exit(1);
}

const paths = [indexPath, onboardingPath];
if (fs.existsSync(loginPath)) paths.push(loginPath);
if (fs.existsSync(onboardingIndexPath)) paths.push(onboardingIndexPath);

const counts = {};
for (const p of paths) {
  const key = path.relative(path.join(root, "public_web"), p);
  counts[key] = bumpFile(p, oldTokens, newToken);
}

const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (total === 0) {
  console.warn("bump-cache: no replacements (token already absent?)");
} else {
  const label =
    oldTokens.length === 1
      ? JSON.stringify(oldTokens[0])
      : JSON.stringify(oldTokens);
  console.log("bump-cache:", label, "->", JSON.stringify(newToken), "|", counts);
}
