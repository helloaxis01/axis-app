const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { Resvg } = require('@resvg/resvg-js');

const root = __dirname;
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// If an inline Babel script exists in index.html, transform it; otherwise preserve index.html as-is.
const openTag = '<script type=\"text/babel\" data-presets=\"react\">';
const closeTag = '</script>';

let builtHtml = html;
const startIdx = html.indexOf(openTag);
if (startIdx !== -1) {
  const contentStart = startIdx + openTag.length;
  const contentEnd = html.lastIndexOf(closeTag);
  const jsx = html.slice(contentStart, contentEnd).trim();

  const result = babel.transformSync(jsx, {
    presets: ['@babel/preset-react'],
    retainLines: true,
  });

  if (!result || !result.code) {
    console.error('Babel transform failed');
    process.exit(1);
  }

  // Inline the compiled script so we don't depend on /app.js (avoids rewrite/CORS issues on mobile)
  const safeCode = result.code.replace(/<\/script/gi, '<\\/script');
  const newScript = '<script>' + safeCode + '</script>';
  builtHtml = html.slice(0, startIdx) + newScript + html.slice(contentEnd + closeTag.length);
  builtHtml = builtHtml.replace(/<script src=\"[^\"]*babel[^\"]*\"[^>]*><\/script>\n?/i, '');
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');
} else {
  // No inline Babel script found — simply copy the HTML into dist for static hosting.
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(path.join(root, 'Logo - Vector'), path.join(dist, 'Logo - Vector'));

// Onboarding + brand assets for same-origin navigation (Settings → onboarding.html, Capacitor dist/)
const publicDir = path.join(root, 'public');
function copyPublicToDist(name) {
  const src = path.join(publicDir, name);
  const dest = path.join(dist, name);
  if (fs.existsSync(src)) fs.copyFileSync(src, dest);
}
['onboarding.html', 'onboarding.css', 'AXIS_Branding_DarkMode_Outlined.svg', 'AXIS_Branding_LightMode_Outlined.svg', 'axis_data.json'].forEach(copyPublicToDist);
// Single app icon only: navy PNG in Logo - Vector → axis-icon.png (no old filenames, no SVG fallback)
const iconPngRoot = path.join(root, 'Logo - Vector', 'AXIS_Branding_Navy.png');
const iconPngDist = path.join(dist, 'axis-icon.png');
if (fs.existsSync(iconPngRoot)) {
  fs.copyFileSync(iconPngRoot, iconPngDist);
  // One icon link only; strip any other apple-touch-icon links
  builtHtml = builtHtml.replace(/<link rel="apple-touch-icon"[^>]*>\s*/gi, '');
  const iconLink = '<link rel="apple-touch-icon" href="/axis-icon.png" sizes="180x180" />';
  builtHtml = builtHtml.replace(/(<meta name="apple-mobile-web-app-status-bar-style"[^>]*>\s*)/i, '$1\n  ' + iconLink + '\n  ');
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');
}
// Ensure compiled app.js is included in dist so the browser can load it
const appSrc = path.join(root, 'app.js');
const appDest = path.join(dist, 'app.js');
if (fs.existsSync(appSrc)) {
  try {
    fs.copyFileSync(appSrc, appDest);
  } catch (e) {
    console.error('Failed to copy app.js to dist:', e);
  }
}
const authBundleSrc = path.join(root, 'auth-bundle.js');
const authBundleDest = path.join(dist, 'auth-bundle.js');
if (fs.existsSync(authBundleSrc)) {
  try {
    fs.copyFileSync(authBundleSrc, authBundleDest);
  } catch (e) {
    console.error('Failed to copy auth-bundle.js to dist:', e);
  }
}
finish();

function finish() {
  const vercel = path.join(root, 'vercel.json');
  if (fs.existsSync(vercel)) fs.copyFileSync(vercel, path.join(dist, 'vercel.json'));
  // `serve` defaults to cleanUrls → 301 from /onboarding.html to /onboarding; some clients show ERR_INVALID_RESPONSE/404.
  fs.writeFileSync(
    path.join(dist, 'serve.json'),
    JSON.stringify({ cleanUrls: false, trailingSlash: false }, null, 2),
    'utf8'
  );
  console.log('Build done: dist/ with index.html (inline app script) and assets');
}
