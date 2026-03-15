# AXIS — Local Development & Testing

This repo contains the AXIS web prototype. Below are quick instructions to run, test, and share the app with testers.

## Run locally
1. From the project root:
   - `python3 -m http.server 3000`
2. Open: http://localhost:3000

## Dev flags
- Append `?dev=1` to the URL to enable the developer overlay and verbose logging.
- Toggle persistent verbose logs with `localStorage.setItem('axis_dev','1')` and `localStorage.setItem('axis_verbose','1')`.

## Quick smoke checklist
See `SMOKE_TEST.md` for the checklist to run before sharing with testers.

## Notes
- Keep `index.html` as the single entry point. The iOS port will be developed in a separate branch/folder.
- Avoid committing large media files (MP4). Host externally if possible.

