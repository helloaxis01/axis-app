"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "dist");
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
          "\n\nRun: npm run build (onboarding.html must exist in dist/)\n"
      );
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
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

server.listen(PORT, () => {
  console.log("AXIS dev (no redirects): http://localhost:" + PORT + "/  → dist/");
});
