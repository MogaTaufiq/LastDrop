# AGENTS.md — Last Drop: Water Survival 0009
> **Purpose:** This file is the single source of truth for any AI agent or new session working on this project.  
> Read this before touching any file. Update the "Changelog" section after every significant change.

---

## 1. Project Overview

**Name:** Last Drop: Water Survival 0009  
**Type:** Browser-based educational mini-game (single HTML page, no framework, no build step)  
**Theme:** Ocean/water pollution awareness — the player must complete 4 sequential tasks to restore a polluted coastal ecosystem.  
**Status:** All 4 tasks implemented and functional. Task 4 has two selectable methods (In-Situ Burning, Corexit Dispersant) with different ecological outcomes.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Structure | Vanilla HTML5 (`index.html`) |
| Logic | Vanilla JavaScript ES6+ (`js/game.js`) — `'use strict'` |
| Styling | Vanilla CSS (`css/style.css`) — no framework |
| Fonts | Google Fonts — **Orbitron** (headings/HUD) + **Exo 2** (body/UI) |
| Audio | HTML5 `<audio>` API (files expected in `assets/audio/`) |
| Graphics | Inline SVG (cinematic scenes + map), CSS animations, emoji particles |
| Assets | `assets/images/` (currently empty) · `assets/audio/` (currently empty — game degrades gracefully) |

**No npm, no bundler, no framework.** Open `index.html` directly in a browser.

---

## 3. File Structure

```
LastDrop/
├── index.html          ← All HTML markup (scenes, HUD, modals, todo panel)
├── css/
│   └── style.css       ← All CSS (1740 lines) — CSS variables, animations, scene styles
├── js/
│   └── game.js         ← All game logic (1602 lines) — state, scene managers, task functions
├── assets/
│   ├── audio/          ← Empty; audio files must be placed here (see Audio section)
│   └── images/         ← Empty; currently unused
└── AGENTS.md           ← This file
```

**Rule:** Keep all code in these three files. Do NOT create additional JS/CSS files unless explicitly asked.

---

## 4. CSS Design System

### CSS Custom Properties (`:root` in `style.css`)
```css
--water-blue: #0a4f7a
--ocean-deep: #041e2e
--ocean-mid:  #0d3a5c
--teal:       #00b4d8   ← primary interactive color
--teal-light: #90e0ef   ← highlight/glow
--green:      #2d9e4f   ← biodiversity / success
--green-light:#52c97a
--red:        #e63946   ← danger / crisis
--orange:     #f4a261   ← warning
--yellow:     #ffd166
--white:      #f0f8ff   ← body text
--gray:       #8ecae6   ← secondary text (HUD labels)
--dark:       #03111e   ← page background
--pollution:  #4a7c59
--oil:        #1a1a0a
```

### Typography Rules
- **Orbitron** → all headings, HUD values, todo titles, scene labels, modal titles
- **Exo 2** → body text, buttons, instructions, subtitles

### Fonts import (top of `style.css`)
```css
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
```

### Key CSS Patterns
- **Scene visibility:** `.scene` → opacity 0 + pointer-events none; `.scene.active` → opacity 1 + pointer-events all (z-index 10).
- **HUD/Todo visibility:** toggled via `.visible` class (display: none → display: block).
- **Modals:** `.modal-overlay` + `.modal-overlay.visible` pattern.
- **`hidden` utility class:** `display: none` — used heavily inside task scenes for sub-elements.

---

## 5. Global JavaScript Objects & State

### `GameState` (object literal, `game.js:11`)
The single source of truth for game progression.

| Property | Type | Default | Description |
|---|---|---|---|
| `waterQuality` | number | 60 | 0–100, displayed in HUD |
| `biodiversity` | number | 50 | 0–100, displayed in HUD |
| `tasksCompleted` | boolean[4] | `[false,false,false,false]` | Index 0–3 maps to Task 1–4 |
| `currentScene` | string | `'landing'` | Active scene ID |
| `task4Choice` | string\|null | null | `'burning'` or `'chemical'` |
| `phase` | string | `'landing'` | Flow guard: `'landing'` → `'cinematic'` → `'map'` → `'task1'` → `'task2'` → `'task3'` → `'task4'` → `'complete'` |
| `currentArea` | string | undefined | Set when player enters a map area (`enterArea()`) |

**Methods:**
- `GameState.updateWater(delta)` — clamps 0–100, calls `HUD.update()`
- `GameState.updateBio(delta)` — clamps 0–100, calls `HUD.update()`
- `GameState.completeTask(index)` — marks `tasksCompleted[index] = true`, calls `TodoPanel.checkTask(index)`
- `GameState.allTasksDone()` — returns `true` when all 4 tasks complete

---

### `Audio` (object literal, `game.js:39`)
Wraps HTML5 audio with clone-based playback (allows overlapping sounds).

| Method/Property | Description |
|---|---|
| `Audio.sounds` | `{}` — keyed by sound ID |
| `Audio.bgMusic` | Reference to the currently looping background track clone |
| `Audio.muted` | boolean — global mute flag |
| `Audio.load(id, src)` | Registers a sound file |
| `Audio.play(id, {volume, loop})` | Clones and plays a sound; returns the clone |
| `Audio.stopBg()` | Pauses and resets `bgMusic` |
| `Audio.init()` | Called once on first click; loads all sounds |

**Sound IDs & expected files in `assets/audio/`:**

| ID | File |
|---|---|
| `cinematic_bg` | `cinematic_bg.mp3` |
| `ambient_ocean` | `ambient_ocean.mp3` |
| `alarm` | `alarm.mp3` |
| `click_success` | `click_success.mp3` |
| `task_complete` | `task_complete.mp3` |
| `fire_burning` | `fire_burning.mp3` |
| `chemical_spray` | `chemical_spray.mp3` |

---

### `SceneManager` (object literal, `game.js:88`)

| Method | Description |
|---|---|
| `SceneManager.show(sceneId, callback)` | Removes `.active` from current scene; adds `.active` to target scene after 100ms; sets `GameState.currentScene` |
| `SceneManager.transition(fromId, toId, delay, callback)` | Delayed wrapper around `show()` |
| `SceneManager.current` | Stores the ID of the currently active scene |

---

### `HUD` (object literal, `game.js:123`)
Floating top-left bars tracking Water Quality and Biodiversity.

| Property/Method | Description |
|---|---|
| `HUD.waterFill` | DOM ref — `#hud-water-fill` |
| `HUD.bioFill` | DOM ref — `#hud-bio-fill` |
| `HUD.waterVal` | DOM ref — `#hud-water-val` |
| `HUD.bioVal` | DOM ref — `#hud-bio-val` |
| `HUD.init()` | Caches DOM refs; called once on `DOMContentLoaded` |
| `HUD.show()` | Adds `.visible` to `#game-hud` |
| `HUD.hide()` | Removes `.visible` from `#game-hud` |
| `HUD.update()` | Syncs bar widths + text + color coding to `GameState` |

**HUD Color thresholds:**
- Water: `< 30` → red gradient; `< 60` → orange/yellow; `≥ 60` → teal
- Biodiversity: `< 30` → red gradient; `≥ 30` → green

---

### `TodoPanel` (object literal, `game.js:175`)

| Method | Description |
|---|---|
| `TodoPanel.show()` | Adds `.visible` to `#todo-panel` |
| `TodoPanel.checkTask(index)` | Adds `.done` to `.todo-item` at `index`; sets `.todo-check` text to `'✓'` |

---

### `Toast` (object literal, `game.js:193`)

| Method | Description |
|---|---|
| `Toast.show(text, stats, duration)` | Shows `#feedback-toast` with `.show` class for `duration` ms |

---

### `Modal` (object literal, `game.js:212`)

| Method | Description |
|---|---|
| `Modal.show(id)` | Adds `.visible` to element by ID |
| `Modal.hide(id)` | Removes `.visible` from element by ID |

---

### `Particles` (object literal, `game.js:243`)

| Method | Description |
|---|---|
| `Particles.burst(x, y, count, emojis)` | Creates `count` emoji particles at **viewport coordinates** (x, y); auto-removes after 1000ms |

> ⚠️ Always pass **viewport** coordinates (from `getBoundingClientRect()`) not element-relative ones.

---

### Helper Functions

| Function | Line | Description |
|---|---|---|
| `showContinueModal(title, body, buttonText, onContinue)` | ~222 | Dynamically creates and appends a success modal overlay; auto-removes on button click |
| `triggerAlarm()` | ~267 | Plays `alarm` audio + adds `.alarm-flash` overlay element for 2500ms |
| `getCinematicBg(type)` | ~391 | Returns inline SVG string for a given scene type |

---

## 6. Scene IDs & HTML Structure

All scenes are `<div class="scene" id="...">`. Only one has `.active` at a time.

| Scene ID | Phase | Description |
|---|---|---|
| `scene-landing` | `'landing'` | Title screen — animated stars, waves, "LAST DROP" logo, tap-to-start |
| `scene-cinematic` | `'cinematic'` | 12-slide story intro — inline SVG illustrations + nav dots + Next button |
| `scene-map` | `'map'` | Top-down island map — WASD movement, press E to enter area |
| `scene-task1` | `'task1'` | Save trapped turtle — click to free, progress bar |
| `scene-task2` | `'task2'` | Clean beach plastic — click 8 trash items |
| `scene-task3` | `'task3'` | Stop oil leak — click pipe, progress bar |
| `scene-task4` | `'task4'` | Clean oil spill — **decision point** (Method A or B), 3-step mini-game |
| `scene-complete` | `'complete'` | Completion screen — final stats, choice badge, confetti |

**Static overlay elements** (always in DOM, not scene-based):
- `#feedback-toast` — bottom toast notification
- `#game-hud` — top-left HUD bars (shown after map entry)
- `#todo-panel` — top-right mission checklist (shown after map entry)
- `#modal-map-alert` — initial crisis modal on map
- `.modal-overlay` (dynamic) — created by `showContinueModal()`

---

## 7. Game Flow (Linear)

```
DOMContentLoaded
  └─ HUD.init()
  └─ SceneManager.show('scene-landing') → initLanding()

Landing Click (once)
  └─ Audio.init() + play cinematic_bg (loop)
  └─ SceneManager.show('scene-cinematic') → initCinematic()
     phase = 'cinematic'

12x Next → / click
  └─ [last slide] → phase = 'map'
     stop cinematic_bg, play ambient_ocean (loop)
     └─ SceneManager.show('scene-map') → initMap()

initMap()
  └─ HUD.show(), TodoPanel.show() (shown on task entry)
  └─ WASD player movement, collision detection with .map-area
  └─ Press E on any area → enterArea(areaName)
     └─ ALL areas → scene-task1 (all 4 areas currently route to Task 1)
     phase = 'task1'
     └─ SceneManager.show('scene-task1') → initTask1()

initTask1() — Save Turtle
  └─ Click turtle → progress fills → completeTask1()
     └─ GameState.updateBio(+10), GameState.completeTask(0)
     └─ showContinueModal → goToTask2()
        phase = 'task2'

initTask2() — Clean Beach
  └─ 8 trash items spawned → click each → collectTrash()
     └─ all 8 → completeTask2()
        └─ GameState.updateWater(+10), updateBio(+5), completeTask(1)
        └─ showContinueModal → phase = 'task3', initTask3()

initTask3() — Stop Leak
  └─ Click #pipe-container → fixInterval → completeTask3()
     └─ GameState.completeTask(2)
     └─ showContinueModal → phase = 'task4', initTask4()

initTask4() — Clean Oil Spill (DECISION)
  └─ Player chooses Method A or Method B

  METHOD A: In-Situ Burning (task4Choice = 'burning')
    Step 1: Draw boom on canvas (#t4-boom-canvas)
      └─ checkBoomSuccess() → closed loop enclosing oil center → methodA_Step2()
    Step 2: Click #btn-t4-ignite → fire particles, oil blob shrinks → methodA_Step3()
    Step 3: Result card shown → btn-t4-complete → finishTask4('burning')
      └─ updateWater(+25), updateBio(+5)

  METHOD B: Corexit Dispersant (task4Choice = 'chemical')
    Step 1: Drag #t4-boat over oil → updateCoverage() → 100% → methodB_Step2()
    Step 2: Click #t4-inject-target 3× → methodB_Step3()
    Step 3: Result card (negative outcome) → btn-t4-complete → finishTask4('chemical')
      └─ updateWater(+20), updateBio(-15)

finishTask4()
  └─ GameState.completeTask(3) → showCompletion()

showCompletion()
  └─ phase = 'complete'
  └─ SceneManager.show('scene-complete')
  └─ Final stats from GameState
  └─ Badge: eco (burning) or costly (chemical)
  └─ #btn-restart → location.reload()
```

---

## 8. Key DOM Element IDs (Complete Reference)

### Global / Persistent
| ID | Type | Purpose |
|---|---|---|
| `feedback-toast` | div | Toast container |
| `toast-text` | div | Toast message text |
| `toast-stats` | div | Toast stat text |
| `game-hud` | div | HUD container (`.visible` toggles display) |
| `hud-water-fill` | div | Water quality bar fill |
| `hud-water-val` | span | Water quality % text |
| `hud-bio-fill` | div | Biodiversity bar fill |
| `hud-bio-val` | span | Biodiversity % text |
| `todo-panel` | div | Mission checklist container |
| `modal-map-alert` | div | Initial crisis modal overlay |
| `btn-start-mission` | button | Dismisses crisis modal |

### Scene: Map
| ID | Purpose |
|---|---|
| `map-bounds` | Constrains player movement |
| `player-char` | 🧍 emoji, moved via `transform: translate(x,y)` |
| `interact-prompt` | "Press [E]" prompt, toggled via `.hidden` |
| `map-industrial` | Map area — Industrial (data-area="industrial") |
| `map-agricultural` | Map area — Agricultural |
| `map-residential` | Map area — Residential |
| `map-coastal` | Map area — Coastal (has pulse animation + crisis badge) |

### Scene: Task 1
| ID | Purpose |
|---|---|
| `turtle-container` | Clickable turtle area |
| `turtle-svg-main` | Turtle SVG — animated on free |
| `plastic-net-overlay` | Red net SVG — fades out on free |
| `help-progress` | Progress bar container |
| `help-progress-fill` | Progress bar fill |
| `help-label` | "Helping..." status text |

### Scene: Task 2
| ID | Purpose |
|---|---|
| `beach-scene-content` | Container for dynamically spawned `.trash-item` divs |
| `trash-bin` | 🗑️ bin element (gets `.shake` on complete) |
| `beach-counter` | "🗑️ X/8 cleaned" counter |

### Scene: Task 3
| ID | Purpose |
|---|---|
| `underwater-scene-content` | Contains pipe + bubbles |
| `pipe-container` | Clickable area to fix leak |
| `oil-drop-anim` | Oil drip SVG element — hidden on fix |
| `pipe-fixed-indicator` | "✅ Pipe Sealed!" — shown on fix |
| `fix-progress` | Fix progress bar container |
| `fix-progress-fill` | Fix progress bar fill |

### Scene: Task 4
| ID | Purpose |
|---|---|
| `t4-step-indicator` | "Task 4: Step X/3" header |
| `t4-instruction` | Dynamic instruction text |
| `t4-method-selection` | Method choice cards container |
| `btn-method-a` | "🔥 In-Situ Burning" card |
| `btn-method-b` | "🧪 Corexit Dispersant" card |
| `t4-ocean-container` | Main interactive ocean area |
| `t4-oil-blob` | CSS-animated dark oil blob (center of container) |
| `t4-boom-canvas` | Canvas for drawing containment boom (Method A Step 1) |
| `btn-t4-ignite` | "🔥 IGNITE" button (Method A Step 2) |
| `t4-boat` | 🚢 draggable boat (Method B Step 1) |
| `t4-spray-canvas` | Canvas for spray trail visualization (Method B Step 1) |
| `t4-underwater-scene` | Submarine injection sub-scene (Method B Step 2) |
| `t4-inject-target` | Clickable injection point |
| `t4-inject-counter` | "Injections: X/3" counter |
| `t4-action-progress-container` | Progress bar wrapper (used in both methods) |
| `t4-action-progress-bar` | Progress bar fill element |
| `t4-fish-container` | Shows sick fish emojis after Method B |
| `t4-result-card` | Outcome card shown at Step 3 |
| `t4-result-icon` | ✅ or ⚠️ icon |
| `t4-result-title` | Outcome title text |
| `t4-r-water` | Water Quality delta value |
| `t4-r-bio` | Biodiversity delta value (gets `.negative` class for Method B) |
| `t4-result-warning` | Warning text for Method B |
| `t4-result-info` | Scientific info footnote |
| `btn-t4-complete` | "Complete Task ✓" button |

### Scene: Complete
| ID | Purpose |
|---|---|
| `complete-choice-badge` | `badge eco` or `badge costly` class applied dynamically |
| `final-water` | Final Water Quality % |
| `final-bio` | Final Biodiversity % |
| `btn-restart` | Reload page |

---

## 9. Map Area Collision & Movement

- **Player movement:** WASD keys; handled in `gameLoop()` via `requestAnimationFrame`
- **Position tracking:** `x`, `y` local vars in `initMap()` scope; applied via `transform: translate(x,y)` on `#player-char`
- **Bounds:** clamped to `(0, maxX)` × `(0, maxY)` where max = `bounds.clientWidth/Height - 40`
- **Collision detection:** `getBoundingClientRect()` AABB check in `checkCollisions()` against all `.map-area` elements
- **Interaction:** Press `E` while `activeZone` is set → `enterArea(areaName)` → all areas currently route to Task 1
- **`window.keys`:** `{ w, a, s, d, e: boolean }` — set on `window` to survive re-init. Guard: `mapControllerActive` flag prevents duplicate event listener registration.
- **`activeZone`:** string (area name) or null — tracks which area the player is currently overlapping

---

## 10. Task 4 Canvas & Interaction Details

### Method A — Boom Drawing
- Canvas (`#t4-boom-canvas`) is sized via `oceanContainer.getBoundingClientRect()` on start
- `isDrawing` flag tracks mouse/touch state
- `points[]` — array of `{x, y}` coordinates relative to canvas
- **Success criteria** (`checkBoomSuccess()`):
  - `points.length >= 8`
  - `dist(first, last) < 80` (loop closed)
  - Drawn bounding box **encloses** `(cw/2, ch/2)` — the oil blob center
  - Span `> 60px` wide and `> 40px` tall
- On success: draw solid path, disable all canvas events, call `methodA_Step2()` after 1200ms
- On fail: clear canvas, show specific error hint in `#t4-instruction`

### Method B — Boat Drag
- `boatX/boatY` are positions in container-relative coords; boat CSS uses `transform: translate(-50%, -50%)` so `left/top` is the center
- `coverage` accumulates when boat is within 130px of container center
- Event listeners attach to `document` for `mousemove/mouseup` (not the boat element) for smooth dragging
- `stopB1()` cleans up all listeners before transitioning to Step 2

---

## 11. Cinematic System

- `cinematicSlides[]` — array of 12 slide objects: `{ scene, text, bg, type, isLast? }`
- `currentSlide` — module-level integer index
- `renderSlide(index)` — clears container, creates `.cinematic-slide.active` div with inline SVG
- `updateDots()` — syncs `.cinematic-dot.active` class to `currentSlide`
- `nextSlide()` — guarded by `phase === 'cinematic'`; on last slide: disables handlers, transitions to map
- SVG types: `'oil-sea'`, `'pipe'`, `'algae'`, `'dead'`, `'dirty'`, `'town'`

---

## 12. Audio Notes

All audio files are expected in `assets/audio/` but the directory is currently **empty**. The game degrades gracefully (try/catch around `.play()`). Add `.mp3` files with the exact names in section 5 to enable audio.

---

## 13. Known Patterns & Conventions

1. **Phase Guards:** Every `initTaskX()` function starts with `if (GameState.phase !== 'taskX') return;` to prevent double-init.
2. **`{ once: true }` listeners:** Landing click and similar one-shot events use the `once` option.
3. **Event cleanup in Task 4:** After boom draw success or boat drag complete, all canvas/element event handlers are explicitly set to `null` to prevent memory leaks.
4. **Dynamic modal pattern:** `showContinueModal()` creates and appends a full overlay to `document.body` (not a static HTML element) and removes it on click.
5. **CSS `.hidden` class:** Maps to `display: none` — used extensively within task scenes for sub-element visibility. Do not confuse with `.visible` which maps to `display: block`.
6. **No `innerHTML` for user input:** All dynamic content is either emoji strings or developer-controlled strings — no XSS concern but maintain this pattern.
7. **Particle coordinates:** Always use **viewport coordinates** from `getBoundingClientRect()` when calling `Particles.burst()`.

---

## 14. Stat Impact Summary

| Event | Water Quality | Biodiversity |
|---|---|---|
| Task 1 complete (save turtle) | — | +10 |
| Task 2 complete (clean beach) | +10 | +5 |
| Task 3 complete (stop leak) | — | — |
| Task 4 Method A (burning) | +25 | +5 |
| Task 4 Method B (Corexit) | +20 | -15 |
| **Best ending total** | 95% | 70% |
| **Worst ending total** | 90% | 50% |

Starting values: Water Quality 60, Biodiversity 50.

---

## 15. Changelog (Most Recent First)

| Date | Change | Session/Agent |
|---|---|---|
| 2026-05-14 | Created `AGENTS.md` — full project documentation | Antigravity |
| 2026-05-13 | Fixed Task 4 — boom canvas sizing, boat drag event cleanup, Corexit progress tracking | Session `62f4ea7c` |
| 2026-05-09–13 | Implemented Task 4 (both methods), completion screen choice badge | Session `fccc00f4` |
| Earlier | Core game engine, Tasks 1–3, cinematic, map | — |

---

## 16. What To Do Next / Open Items

- [ ] Add audio files to `assets/audio/` for full experience
- [ ] Map currently routes ALL 4 areas → Task 1. Each area could eventually get a unique task set.
- [ ] Mobile touch support is partially implemented but needs end-to-end QA on real devices
- [ ] `assets/images/` is empty — illustrations could be replaced with real images if added here

---

*Keep this file updated after every meaningful change to the codebase.*
