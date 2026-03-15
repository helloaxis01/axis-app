# AXIS — Smoke Test Checklist

Run these steps after changes to ensure core flows work before sharing.

1. Launch
   - Start local server: `python3 -m http.server 3000`
   - Open http://localhost:3000
2. Onboarding
   - If onboarding is shown: complete onboarding flow to home.
3. Today suggestion
   - From Home, under "Today" card, click Begin — session view should open.
4. Session → List
   - Switch to Session view, open the `List` tab.
   - Expand "Seated Cat-Cow" (or equivalent Cat–Cow) and confirm instructions visible.
5. Guided
   - Start Guided, let it run through Get Ready → Launch → one exercise.
   - Confirm audio cues (if applicable) and timer progress.
6. Video demos
   - If a demo appears, confirm it autoplays muted and loops.
7. Timer controls
   - Pause, resume, and mark step done; confirm UI updates.
8. Navigation
   - Back to Home, open a different track, confirm labels and durations.
9. Console errors
   - Open DevTools Console and ensure there are no uncaught exceptions.
10. Device check (mobile)
   - Open on iOS Safari and Android Chrome if possible and repeat steps 3–7.

If any step fails, capture a screenshot and console log and file an issue.

