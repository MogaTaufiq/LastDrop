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
| `tasksCompleted` | boolean[4] | `[false,false,false,false]` | Index 0–3 maps to Coastal Task 1–4 |
| `agriCompleted` | boolean | `false` | True when Agricultural tasks are done |
| `indCompleted` | boolean | `false` | True when Industrial tasks are done |
| `currentScene` | string | `'landing'` | Active scene ID |
| `task4Choice` | string\|null | null | `'burning'` or `'chemical'` |
| `phase` | string | `'landing'` | Flow guard string to prevent duplicate inits |
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
| `scene-residential` | `'residential'` | New 2D Base World — Player spawn point after cinematic. WASD movement |
| `scene-task1` | `'task1'` | Save trapped turtle — click to free, progress bar |
| `scene-task2` | `'task2'` | Clean beach plastic — click 8 trash items |
| `scene-task3` | `'task3'` | Stop oil leak — click pipe, progress bar |
| `scene-task4` | `'task4'` | Clean oil spill — **decision point** (Method A or B), 3-step mini-game |
| `scene-agri-task1` | `'agri1'` | Agricultural Task 1 — Click red pulse to identify pollution source, typing text effect |
| `scene-agri-task2` | `'agri2'` | Agricultural Task 2 — Plant buffer strips (8 slots), reduces river opacity |
| `scene-ind-task1`  | `'ind1'`  | Industrial Task 1 — Locate waste source |
| `scene-ind-task2`  | `'ind2'`  | Industrial Task 2 — Stop direct discharge by dragging missing bolts and tightening with a wrench |
| `scene-ind-task3`  | `'ind3'`  | Industrial Task 3 — Treat wastewater with 3 methods (Filtration, Chemical, Bacteria) |
| `scene-reflection` | `'reflection'` | Reflection scene — Beautiful island background with typing key messages |

**Static overlay elements** (always in DOM, not scene-based):
- `#feedback-toast` — bottom toast notification
- `#game-hud` — top-left HUD bars (Water Quality & Biodiversity)
- `#mini-map-container` — top-right minimap for fast travel between areas
- `#todo-panel` — bottom-right mission checklist (shown only inside task areas)
- `#areas-counter` — top-left counter for remaining areas
- `#modal-map-alert` — crisis modal alert overlay
- `#modal-mission-intro` — mission intro modal for each area
- `#modal-you-survived` — final completion modal
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
  └─ [last slide] → phase = 'residential'
     stop cinematic_bg, play ambient_ocean (loop)
     └─ SceneManager.show('scene-residential') → initResidential()

initResidential()
  └─ HUD.show(), showMiniMap(), TodoPanel.hide()
  └─ WASD player movement in Residential base
  └─ Triggers Coastal Alert → click "Start Mission" → enterArea('coastal')
  └─ Or click directly on the Minimap to fast travel.

enterArea(areaName)
  └─ routes to respective area (e.g., 'coastal' or 'agricultural')
  └─ checks completion prerequisites (e.g. Agricultural needs Coastal done)
  └─ Shows TodoPanel, SceneManager.show('scene-task1') -> initTask1()

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

### Scene: Minimap (Top-Right Overlay)
| ID | Purpose |
|---|---|
| `mini-map-container` | Container for the Minimap UI (`.visible` toggles display) |
| `map-industrial` | Map area — click to travel to Industrial (data-area="industrial") |
| `map-agricultural` | Map area — click to travel to Agricultural |
| `map-residential` | Map area — click to travel to Residential |
| `map-coastal` | Map area — click to travel to Coastal (has pulse animation + crisis badge) |

### Scene: Residential Base World
| ID | Purpose |
|---|---|
| `residential-player` | 🧍 emoji, moved via `transform: translate(x,y)` with WASD keys |
| `areas-counter` | "X areas left to solve" HUD counter |

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

### Scene: Industrial (Tasks 1-3)
| ID | Purpose |
|---|---|
| `ind-pipe-area` | Clickable area to identify pollution source in Task 1 |
| `ind1-typing-text` | Educational typing text in Task 1 |
| `ind2-bolts-container` | Container for draggable bolts and slots |
| `ind2-toolbox` | Toolbox holding missing bolts |
| `ind2-wrench` | Clickable wrench tool |
| `ind3-pool-water` | Wastewater pool SVG rect, changes color based on treatment |
| `ind3-method-selection` | Buttons for wastewater treatment choice |
| `ind3-typing-text` | Result text after treatment |

### Scene: Reflection
| ID | Purpose |
|---|---|
| `reflection-text-container` | Types key messages |
| `modal-you-survived` | Final "YOU SURVIVED" modal |

---

## 9. Navigation & Minimap Logic

- **World Navigation:** Player can move around the 2D Residential Base (`scene-residential`) using WASD keys.
- **Minimap Fast Travel:** The map is now a permanent UI element in the top-right corner. WASD movement inside the map was removed. 
- **Interaction:** Players simply click on a `.map-area` in the Minimap to trigger `enterArea(areaName)`.
- **Area Routing:** `enterArea()` contains the logic to route the player:
  - `coastal` → goes to Task 1
  - `agricultural` → goes to Agri Task 1 (requires Coastal to be completed first)
  - `residential` → returns to base world
- **Todo Panel Visibility:** The `#todo-panel` is positioned at the bottom-right and is hidden via `TodoPanel.hide()` when returning to `residential`, ensuring a clean base world UI.

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

## 12. Audio System & Asset Needs

The audio engine (`Audio` object in `game.js`) wraps HTML5 `<audio>` and manages background loops and overlapping sound effects via `cloneNode()`. 

The `assets/audio/` directory is currently empty. The game handles this gracefully by wrapping `.play()` in a `try/catch` block. To bring the game to life, the following `.mp3` files should be added:

### Background Music (BGM)
| ID | File | Vibe / Emotion | Scene Usage |
|---|---|---|---|
| `cinematic_bg` | `cinematic_bg.mp3` | Dramatic, urgent, but educational | Landing, Cinematic Intro |
| `ambient_ocean` | `ambient_ocean.mp3` | Calming ocean waves, seagulls | Base World, Reflection Scene |
| `ambient_underwater` | `ambient_underwater.mp3` | Deep, muffled, bubbling ambiance | Coastal Task 3 (Underwater) |
| `ambient_factory` | `ambient_factory.mp3` | Low hum, mechanical drone | Industrial Area Tasks |

### UI & System Sounds
| ID | File | Description | Usage |
|---|---|---|---|
| `click_success` | `click_success.mp3` | Bright, satisfying high-pitch pop/ding | Generic correct action, task step |
| `click_error` | `click_error.mp3` | Soft buzz or low-pitch dull thud | Wrong click, miss |
| `task_complete` | `task_complete.mp3` | Rewarding chime or short fanfare | Completing any main task |
| `alarm` | `alarm.mp3` | Klaxon / siren, urgent but not deafening | Coastal Crisis trigger |
| `ui_hover` | `ui_hover.mp3` | Very soft futuristic click/blip | Button hovers, minimap clicks |

### Coastal Area SFX
| ID | File | Description | Usage |
|---|---|---|---|
| `net_cut` | `net_cut.mp3` | Scissors snipping rope/plastic | Task 1: Saving turtle |
| `trash_pickup` | `trash_pickup.mp3` | Crinkling plastic bag / rustle | Task 2: Cleaning beach |
| `glue_squish` | `glue_squish.mp3` | Wet, sticky application sound | Task 3: Applying glue to patch |
| `metal_snap` | `metal_snap.mp3` | Heavy metallic clank | Task 3: Patch snapping to pipe |
| `fire_burning` | `fire_burning.mp3` | Roaring flames, crackling | Task 4: In-situ burning |
| `chemical_spray` | `chemical_spray.mp3` | Aerosol hiss / spray | Task 4: Corexit dispersant |
| `helicopter_loop` | `helicopter_loop.mp3` | Chopper blades (looping) | Task 4: Overhead scene bg |

### Agricultural Area SFX
| ID | File | Description | Usage |
|---|---|---|---|
| `radar_ping` | `radar_ping.mp3` | Sonar-like blip | Task 1: Scanning pollution |
| `shovel_dig` | `shovel_dig.mp3` | Shovel hitting dirt | Task 2: Planting buffer strips |

### Industrial Area SFX
| ID | File | Description | Usage |
|---|---|---|---|
| `metal_drag` | `metal_drag.mp3` | Screech/slide of heavy metal | Task 2: Dragging bolts |
| `wrench_ratchet` | `wrench_ratchet.mp3` | Mechanical clicking/tightening | Task 2: Tightening bolts |
| `stone_grind` | `stone_grind.mp3` | Heavy rock impact | Task 3: Filtration (layer 1) |
| `sand_pour` | `sand_pour.mp3` | Pouring granular material | Task 3: Filtration (layer 2 & 3) |
| `liquid_splash` | `liquid_splash.mp3` | Chemical dropping into pool | Task 3: Chemical method |
| `bacteria_bubble` | `bacteria_bubble.mp3` | Organic bubbling / fizzing | Task 3: Bacteria method |

*To implement these, simply add them to `Audio.init()` in `game.js` and call `Audio.play('id')` at the respective interaction points.*

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
| Coastal Task 1 (save turtle) | — | +10 |
| Coastal Task 2 (clean beach) | +10 | +5 |
| Coastal Task 3 (stop leak) | — | — |
| Coastal Task 4 Method A (burning) | +25 | +5 |
| Coastal Task 4 Method B (Corexit) | +20 | -15 |
| Agricultural Task 2 (buffer strips) | +15 | +10 |
| Industrial Task 3 (Bacteria - Best) | +15 | +15 |
| Industrial Task 3 (Chemical) | +20 | — |
| Industrial Task 3 (Filtration) | +15 | — |

Starting values: Water Quality 60, Biodiversity 50. (Values clamp at 0 and 100).

---

## 15. Changelog (Most Recent First)

| Date | Change | Session/Agent |
|---|---|---|
| 2026-05-17 | **Dynamic Minimap Indicators:** Refactored map HTML to include `.map-alert-dot` across all areas. Created `updateMapCrisis()` helper function to apply `.crisis` (red pulse) and `.done` (green) dynamically based on progression. Cleaned up UX by replacing double-popup modals with a single Toast directing users to new areas. | Gemini |
| 2026-05-16 | **Audio System Overhaul:** Refactored `Audio.play()` using Promises to fix `InvalidStateError` constraints. Added `offsets` support to trim silent intros of SFX dynamically. Assigned specific, realistic audio files (e.g., `net_cut`, `trash_pickup`, `metal_snap`, `ambient_underwater`) replacing generic click sounds. Stopped `fire_burning` loop successfully upon ignition finish. | Gemini |
| 2026-05-16 | Industrial Task 3 Complete Redesign: Fixed text box responsiveness in Tasks 1-3, redesigned Task 3 with SVG wastewater treatment pools visual, implemented 3 interactive game mechanics (Filtration: click 3 filter layers; Chemical: drag bottle to pool; Bacteria: feed 3 times). Each method has unique gameplay interaction. | GitHub Copilot |
| 2026-05-16 | Fixed mini-map z-index from 200 to 1000 and added pointer-events:auto on visible state to prevent overlay obstruction | GitHub Copilot |
| 2026-05-13 | Fixed Task 4 — boom canvas sizing, boat drag event cleanup, Corexit progress tracking | Session `62f4ea7c` |
| 2026-05-09–13 | Implemented Task 4 (both methods), completion screen choice badge | Session `fccc00f4` |
| Earlier | Core game engine, Tasks 1–3, cinematic, map | — |

---

## 16. What To Do Next / Open Items

- [x] Add audio files to `assets/audio/` for full experience (Done)
- [ ] Mobile touch support is partially implemented but needs end-to-end QA on real devices
- [ ] `assets/images/` is empty — illustrations could be replaced with real images if added here

---

*Keep this file updated after every meaningful change to the codebase.*
