const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const { Resvg } = require('@resvg/resvg-js');

const root = __dirname;
const dist = path.join(root, 'dist');

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });

const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const openTag = '<script type="text/babel" data-presets="react">';
const closeTag = '</script>';

const startIdx = html.indexOf(openTag);
if (startIdx === -1) {
  console.error('Could not find Babel script tag in index.html');
  process.exit(1);
}

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
let builtHtml = html.slice(0, startIdx) + newScript + html.slice(contentEnd + closeTag.length);
builtHtml = builtHtml.replace(/<script src="[^"]*babel[^"]*"[^>]*><\/script>\n?/i, '');
fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');

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
// Single app icon only: navy PNG → axis-icon.png (no old filenames, no SVG fallback)
const iconPngRoot = path.join(root, 'assets', 'AXIS_Branding_Navy-9822171e-ccb8-4b9c-b1e2-6ad101e1a56b.png');
const iconPngDist = path.join(dist, 'axis-icon.png');
if (fs.existsSync(iconPngRoot)) {
  fs.copyFileSync(iconPngRoot, iconPngDist);
  // One icon link only; strip any other apple-touch-icon links
  builtHtml = builtHtml.replace(/<link rel="apple-touch-icon"[^>]*>\s*/gi, '');
  const iconLink = '<link rel="apple-touch-icon" href="/axis-icon.png" sizes="180x180" />';
  builtHtml = builtHtml.replace(/(<meta name="apple-mobile-web-app-status-bar-style"[^>]*>\s*)/i, '$1\n  ' + iconLink + '\n  ');
  fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');
}
finish();

function finish() {
  const vercel = path.join(root, 'vercel.json');
  if (fs.existsSync(vercel)) fs.copyFileSync(vercel, path.join(dist, 'vercel.json'));
  console.log('Build done: dist/ with index.html (inline app script) and assets');
}
