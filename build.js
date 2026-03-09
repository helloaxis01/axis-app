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

fs.writeFileSync(path.join(dist, 'app.js'), result.code, 'utf8');

const newScript = '<script src="/app.js"></script>';
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
const iconSvg = path.join(root, 'apple-touch-icon.svg');
if (fs.existsSync(iconSvg)) {
  fs.copyFileSync(iconSvg, path.join(dist, 'apple-touch-icon.svg'));
  try {
    const svgBuf = fs.readFileSync(iconSvg);
    const resvg = new Resvg(svgBuf, {
      fitTo: { mode: 'width', value: 180 },
    });
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    fs.writeFileSync(path.join(dist, 'apple-touch-icon.png'), pngBuffer);
    builtHtml = builtHtml.replace(/apple-touch-icon\.svg/g, 'apple-touch-icon.png');
    fs.writeFileSync(path.join(dist, 'index.html'), builtHtml, 'utf8');
  } catch (e) {
    console.warn('Could not generate PNG icon:', e.message);
  }
}
finish();

function finish() {
  const vercel = path.join(root, 'vercel.json');
  if (fs.existsSync(vercel)) fs.copyFileSync(vercel, path.join(dist, 'vercel.json'));
  console.log('Build done: dist/ with index.html, app.js, and assets');
}
