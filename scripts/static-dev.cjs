"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

// Capacitor webDir — same bundle as iOS/Android (not dist/, which follows root index.html + build.js).
const root = path.resolve(
  process.env.AXIS_WEB_ROOT || path.join(__dirname, "..", "public_web")
);
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".webmanifest": "application/manifest+json",
};

/** Same as vercel.json: /onboarding → onboarding.html. Needed after browsers follow /onboarding.html → /onboarding (e.g. serve cleanUrls). */
const PATH_ALIASES = {
  "/onboarding": "/onboarding.html",
  "/onboarding/": "/onboarding.html",
};

function filePathForUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, "");
  if (rel.startsWith("..")) return null;
  const abs = path.join(root, rel);
  if (!abs.startsWith(root)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405);
    return res.end();
  }
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/" || reqPath === "") reqPath = "/index.html";
  else if (PATH_ALIASES[reqPath]) reqPath = PATH_ALIASES[reqPath];
  const filePath = filePathForUrl(reqPath);
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end(
        "404: " +
          reqPath +
          "\n\nExpected file under: " +
          root +
          "\n"
      );
    }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (ext === ".html" || ext === ".js" || ext === ".json") {
      headers["Cache-Control"] = "no-store, no-cache, must-revalidate";
      headers["Pragma"] = "no-cache";
    }
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      "Port " + PORT + " is already in use (another app or old dev server). Try:\n  PORT=4173 npm run dev"
    );
  }
  throw err;
});

function openSystemBrowser(urls) {
  const list = Array.isArray(urls) ? urls : [urls];
  if (process.platform === "darwin") {
    for (const u of list) execFile("open", [u], () => {});
  } else if (process.platform === "win32") {
    for (const u of list) execFile("cmd", ["/c", "start", "", u], () => {});
  } else {
    for (const u of list) execFile("xdg-open", [u], () => {});
  }
}

// Listen on all interfaces (IPv4 + IPv6 loopback). Binding only 127.0.0.1 breaks some
// clients (e.g. Cursor Simple Browser) that connect via localhost → ::1.
server.listen(PORT, () => {
  const base = "http://127.0.0.1:" + PORT;
  const local = "http://localhost:" + PORT;
  console.log("AXIS dev (no redirects): " + base + "/");
  console.log("  Serving from: " + root);
  if (process.env.AXIS_WEB_ROOT) {
    console.log("  (AXIS_WEB_ROOT override)");
  }
  console.log("  Main:        " + base + "/  (or " + local + "/)");
  console.log("  Onboarding:  " + base + "/onboarding.html");
  if (process.env.AXIS_OPEN_BROWSER === "1") {
    openSystemBrowser([base + "/", base + "/onboarding.html"]);
  }
});
