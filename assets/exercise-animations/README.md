# Exercise animations

Place licensed exercise motion files here and reference them from `exerciseMedia` in `index.html`.

The current MVP already uses clearly licensed Wikimedia Commons GIFs for:

- `Push-up` - https://commons.wikimedia.org/wiki/File:Pushups.gif - CC BY-SA 4.0
- `Back squat` / `Squat` - https://commons.wikimedia.org/wiki/File:Squats.gif - CC BY-SA 4.0
- `Pull-up` - https://commons.wikimedia.org/wiki/File:Pullup.gif - CC BY-SA 3.0 / GFDL
- `Burpee` - https://commons.wikimedia.org/wiki/File:Burpee.gif - CC BY-SA 4.0
- `Hanging leg raise` core-motion fallback - https://commons.wikimedia.org/wiki/File:Sit-ups_or_Crunch.gif - CC BY 3.0

Owner-provided placeholder filenames:

- `bench-press.webm`
- `lat-pulldown.webm`
- `kettlebell-swing.webm`

Use WebM or MP4 when possible. GIF also works, but is heavier and cannot be paused by IntersectionObserver. For every file, keep `imageUrl`, `animationUrl`, `animationType`, `sourceName`, `sourceUrl`, `license`, and `attributionText` in the exercise metadata. Do not add random Google images or videos unless the license explicitly allows this use.
