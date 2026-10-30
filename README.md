# Safety Hunt: demo app (Dec 4 presentation)

This is the working demo of Part 1 of the build spec (`../06 Safety Scavenger Hunt App - Build Spec.docx`).
It's a mobile web page with no install and no login, and it never stores any photos.

## Files
- `index.html`, `style.css`, `app.js`: the app
- `data.js`: all hunt text (steps, hints, hazard cards, questions). Edit the wording here.
- `sw.js`: lets the app keep working if the Wi-Fi drops (only on an https address)

## Try it on your Mac
    cd "this folder"
    python3 -m http.server 8765
Then open http://localhost:8765. On a phone on the same Wi-Fi, open http://<your Mac's IP>:8765.

## Presenter panel
To open it, tap "Safety Hunt" in the top bar 5 times, press P, or add `?presenter` to the address.
- **Photo check**: "On-phone" checks for real. "Auto-pass" accepts any photo (an emergency fallback).
- **Buddy override code**: 2580 (you can change it in `data.js`)
- Also: match strictness, large text for the projector, show match scores, reset, QR code, and moving your teaching to another phone (export/import)

## Teach the photo check (do this in the actual presentation room)
1. Open the presenter panel on the phone you'll present from.
2. For each campus item, tap **+ Photos** and take 5–8 photos from different angles and distances.
3. For **Other things**, add 10+ photos of walls, doors, chairs and desks. This is what makes wrong photos fail.
4. For the Laundry route, take 5–8 photos of each printed picture.
5. Use **Test a photo** to check it, and turn on "Show match scores" while you rehearse.
   - If right photos fail, lower the strictness.
   - If wrong photos pass, add more "Other things" photos.

How it works: a free image model (MobileNet, run with TensorFlow.js) turns each photo into a numeric "fingerprint". A new photo passes when the item it most resembles is the target item and the match score is above the strictness setting.

A step with no teaching photos passes automatically, so teach every step before the presentation.

## Before Dec 4
- Put it on a free https host (GitHub Pages or Netlify Drop) so it opens from a QR code anywhere, and so the offline mode works.
- Open it once on the presenting phone while online, so the model gets cached.
- Rehearse the full run in the room. Record a backup video.
