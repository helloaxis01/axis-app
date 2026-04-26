#!/usr/bin/env python3
"""
Build a Vercel v13 deployment payload from local files.
Text: data as UTF-8 string + encoding "utf-8"
Binary: data as base64 + encoding "base64"
"""
import base64
import json
import os
import sys
import time
import urllib.request

# Optional: fetch missing files from GitHub (raw) into bundle first
GITHUB_PREFIX = (
    "https://raw.githubusercontent.com/helloaxis01/axis-app/main/"
    "031726%20REBUILD/public_web/"
)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, ".vercel-upload-bundle")
TOKEN = os.environ.get("VERCEL_TOKEN", "").strip()
if not TOKEN:
    print("Set VERCEL_TOKEN", file=sys.stderr)
    sys.exit(1)

TEXT_EXT = {".html", ".htm", ".css", ".js", ".json", ".svg", ".txt", ".csv", ".md"}


def download(url: str, dest: str) -> None:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "axis-vercel-upload"})
    with urllib.request.urlopen(req, timeout=120) as r:
        with open(dest, "wb") as f:
            f.write(r.read())


def ensure_remote_files():
    """Pull small assets that may be missing locally from GitHub main."""
    remote = [
        "onboarding.css",
        "onboarding.html",
        "axis-icon.png",
        "login.html",
    ]
    for rel in remote:
        dest = os.path.join(BUNDLE, rel)
        if os.path.isfile(dest) and os.path.getsize(dest) > 0:
            continue
        url = GITHUB_PREFIX + rel.replace(" ", "%20")
        print("fetch", url, "->", dest, file=sys.stderr)
        try:
            download(url, dest)
        except Exception as e:
            print("warn: could not fetch", rel, e, file=sys.stderr)

    # app-icons/*.png
    icons = [
        "icon-classic.png",
        "icon-dark.png",
        "icon-light.png",
        "icon-midday.png",
        "icon-prime.png",
        "icon-rest.png",
        "icon-rise.png",
        "icon-ultra.png",
    ]
    for name in icons:
        rel = "app-icons/" + name
        dest = os.path.join(BUNDLE, rel)
        if os.path.isfile(dest) and os.path.getsize(dest) > 0:
            continue
        url = GITHUB_PREFIX + "app-icons/" + name
        print("fetch", rel, file=sys.stderr)
        try:
            download(url, dest)
        except Exception as e:
            print("warn: could not fetch", rel, e, file=sys.stderr)


def copy_from_public_web():
    local = os.path.join(ROOT, "public_web")
    if not os.path.isdir(local):
        print("missing public_web", local, file=sys.stderr)
        return
    import shutil

    for name in os.listdir(local):
        src = os.path.join(local, name)
        if not os.path.isfile(src):
            continue
        if name.endswith(".bak"):
            continue
        dst = os.path.join(BUNDLE, name)
        shutil.copy2(src, dst)
        print("copy", name, file=sys.stderr)


def file_to_entry(rel_path: str) -> dict:
    full = os.path.join(BUNDLE, rel_path)
    ext = os.path.splitext(rel_path)[1].lower()
    is_text = ext in TEXT_EXT
    with open(full, "rb") as f:
        raw = f.read()
    if is_text:
        return {
            "file": rel_path.replace(os.sep, "/"),
            "data": raw.decode("utf-8"),
            "encoding": "utf-8",
        }
    b64 = base64.b64encode(raw).decode("ascii")
    return {
        "file": rel_path.replace(os.sep, "/"),
        "data": b64,
        "encoding": "base64",
    }


def main():
    os.makedirs(BUNDLE, exist_ok=True)
    copy_from_public_web()
    ensure_remote_files()

    # Every file in bundle
    files_out = []
    for dirpath, _, files in os.walk(BUNDLE):
        for fn in files:
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, BUNDLE)
            if rel.startswith("."):
                continue
            try:
                files_out.append(file_to_entry(rel))
            except Exception as e:
                print("skip", rel, e, file=sys.stderr)

    name = "axis-static-" + str(int(time.time()))
    body = {
        "name": name,
        "files": files_out,
        "target": "production",
    }
    out_path = os.path.join(ROOT, ".vercel-payload.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(body, f, ensure_ascii=False)
    print(name)
    print(out_path)
    print("files", len(files_out), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
