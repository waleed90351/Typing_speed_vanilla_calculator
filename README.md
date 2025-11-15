## Typing Practice (HTML/CSS/JS)

A minimal typing practice web app with single-line guided typing, spoken words, and real-time scoring.

### Features
- Single-line display (7–8 words visible)
- Inline feedback while typing:
  - Typed characters replace the current word visually
  - Correct words turn dark/black
  - Incorrect words become grey with strikethrough
- Voice narration of each word (Web Speech API)
- Timer with selectable durations (1–10 minutes)
- Live stats: timer, WPM, CPM, accuracy
- Custom text input or randomized built-in passages

### Quick Start
1. Download this folder to your machine
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox)
   - For best results, serve via a simple local server (optional):
     - Python: `python -m http.server 5500`
     - Node: `npx http-server -p 5500`
3. Paste your text (or leave empty to use built-in text), choose a time, and click “Start Typing”.

### How It Works
- The text is split into words and rendered in a single-line container.
- The input is a transparent overlay positioned over the current word so the caret aligns with it.
- As you type, the typed portion is shown in blue with an orange underline; the remainder stays dark until the word is completed.
- On space:
  - Word is marked correct/incorrect
  - Stats update (WPM, CPM, accuracy)
  - Next word is spoken (if narration enabled)

### Controls
- Enable/disable narration via the checkbox before starting
- Select duration from the dropdown
- Reset / Try Again from the results screen

### Notes & Tips
- Voice narration uses the browser’s Speech Synthesis; first play might trigger a permission prompt
- Accuracy = correct words / total words completed
- WPM uses word completions over elapsed minutes; CPM uses typed characters over elapsed minutes

### Customize
- Edit built-in texts in `script.js` (`builtinTexts` array)
- Adjust colors and the underline style in `style.css` (classes: `.typed-portion`, `.remaining-portion`, `.word.*`)
- Change the visible window of words in `renderWords()` (`visibleRange`)

### File Structure
```
index.html   # UI markup
style.css    # Styles (layout, colors, single-line display)
script.js    # Logic (rendering, timer, scoring, speech, caret alignment)
```

### Browser Support
- Modern Chromium-based browsers and Firefox
- Speech Synthesis support may vary by platform/voice

### License
MIT


