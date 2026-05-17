# 💧 Last Drop: Water Survival 0009

> An educational browser-based mini-game about water and ocean pollution awareness.

[![Play in Browser](https://img.shields.io/badge/Play-Open%20index.html-00b4d8?style=for-the-badge&logo=googlechrome)](index.html)
![HTML5](https://img.shields.io/badge/HTML5-Vanilla-orange?style=flat-square)
![CSS3](https://img.shields.io/badge/CSS3-Vanilla-blue?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=flat-square)
![No Build Step](https://img.shields.io/badge/Build-None%20Required-green?style=flat-square)

---

## 🌊 About

**Last Drop** is a single-page, browser-based educational game where players take on the role of an environmental responder tasked with restoring a polluted coastal ecosystem. Through four interactive missions, players learn about real-world ocean pollution causes, consequences, and cleanup methods — including the ethical trade-offs of different remediation strategies.

The game is built entirely with **Vanilla HTML, CSS, and JavaScript** — no frameworks, no bundler, no dependencies. Just open `index.html` in a browser and play.

---

## 🎮 Gameplay & Missions

Players explore a dynamically expanding game world using a **Minimap** for fast travel. The game is divided into three major areas, each containing distinct, multi-step interactive tasks:

### 🌊 Coastal Area
| Task | Mission | Environmental Impact |
|------|---------|----------------------|
| 1 | 🐢 **Save a trapped marine animal** from a plastic net | Biodiversity +10 |
| 2 | 🧹 **Clean plastic waste** on a layered, animated beach | Water +10, Bio +5 |
| 3 | 🔧 **Seal an underwater oil leak** (glue patch & drag) | — |
| 4 | 🛢️ **Clean an ocean oil spill** (Choice: Burn vs Dispersant) | Varies |

### 🌾 Agricultural Area
| Task | Mission | Environmental Impact |
|------|---------|----------------------|
| 1 | 🔎 **Identify pollution source** (fertilizer runoff scan) | — |
| 2 | 🌳 **Plant buffer strips** along the river to stop runoff | Water +15, Bio +10 |

### 🏭 Industrial Area
| Task | Mission | Environmental Impact |
|------|---------|----------------------|
| 1 | 🔎 **Find waste discharge pipe** on a factory pipeline | — |
| 2 | 🔧 **Seal direct discharge** by dragging bolts & wrenching | — |
| 3 | 🧪 **Treat wastewater** (Choice: Filter vs Chem vs Bacteria) | Varies (Bacteria Best: +15/+15) |

Your choices in Coastal Task 4 and Industrial Task 3 affect your final score, evaluating whether you prioritize cheap, chemical fixes or ecologically sound bioremediation.

---

## ✨ Features

- 🎬 **12-slide cinematic opening** with inline SVG illustrations
- 🗺️ **Persistent Minimap UI** for fast travel between Coastal, Agricultural, and Industrial zones.
- 📊 **Live HUD** tracking Water Quality and Biodiversity in real time
- ✅ **Mission checklist** panel updating as tasks are completed
- 🎨 **Fully animated scenes** — layered SVG waves, helicopter POV, particles, progress bars
- 🔊 **Comprehensive Audio Engine** with clone-based overlapping playback
- 🌍 **Educational content** grounded in real environmental science

---

## 🚀 Getting Started

No installation required.

```bash
# Clone the repository
git clone https://github.com/MogaTaufiq/LastDrop.git

# Open the game
open LastDrop/index.html
# or just double-click index.html in your file manager
```

That's it. No `npm install`, no build step.

### 🎧 Enable Audio (Assets Needed)

The game includes a complete audio engine, but the actual `.mp3` files are intentionally excluded from the repo to save space. Place the following files in `assets/audio/` to bring the game to life:

**Background Ambience:**
- `cinematic_bg.mp3` (Cinematic intro)
- `ambient_ocean.mp3` (Base world, beach)
- `ambient_underwater.mp3` (Task 3 underwater)
- `ambient_factory.mp3` (Industrial area)

**System & UI Sounds:**
- `click_success.mp3` (Positive action)
- `click_error.mp3` (Wrong choice)
- `task_complete.mp3` (Mission success fanfare)
- `alarm.mp3` (Crisis warning)
- `ui_hover.mp3` (Hovering over minimap or cards)

**Interaction SFX:**
- `net_cut.mp3` (Snipping rope)
- `trash_pickup.mp3` (Plastic rustle)
- `glue_squish.mp3` (Applying patch glue)
- `metal_snap.mp3` (Patch snapping)
- `fire_burning.mp3` (In-situ burning)
- `chemical_spray.mp3` (Dispersant spray)
- `helicopter_loop.mp3` (Task 4 POV ambiance)
- `radar_ping.mp3` (Scanning pollution)
- `shovel_dig.mp3` (Planting trees)
- `metal_drag.mp3` (Sliding bolts)
- `wrench_ratchet.mp3` (Tightening bolts)
- `stone_grind.mp3`, `sand_pour.mp3`, `liquid_splash.mp3`, `bacteria_bubble.mp3` (Industrial Task 3)

*Note: The game degrades gracefully — all audio is wrapped in `try/catch` and missing files are silently skipped.*

---

## 🏗️ Project Structure

```
LastDrop/
├── index.html          ← All HTML markup
├── css/
│   └── style.css       ← All styles (1740 lines)
├── js/
│   └── game.js         ← All game logic (1602 lines)
├── assets/
│   ├── audio/          ← Place .mp3 files here
│   └── images/         ← Reserved for future use
├── README.md           ← You are here
└── AGENTS.md           ← AI agent context documentation
```

---

## 🎨 Design System

The game uses a custom ocean-themed design system with CSS custom properties:

| Token | Value | Usage |
|-------|-------|-------|
| `--teal` | `#00b4d8` | Primary interactive color |
| `--ocean-deep` | `#041e2e` | Background base |
| `--green` | `#2d9e4f` | Biodiversity / success states |
| `--red` | `#e63946` | Danger / crisis indicators |
| `--white` | `#f0f8ff` | Body text |

**Fonts:** [Orbitron](https://fonts.google.com/specimen/Orbitron) (headings/HUD) + [Exo 2](https://fonts.google.com/specimen/Exo+2) (body/buttons)

---

## 📈 Scoring

| Starting Values | Water Quality 60% | Biodiversity 50% |
|---|---|---|
| **Best Ending** (Method A) | 95% | 70% |
| **Worst Ending** (Method B) | 90% | 50% |

---

## 🤝 Contributing

This project is intentionally kept to **three files only** (`index.html`, `css/style.css`, `js/game.js`). Before contributing, read `AGENTS.md` for the full technical reference — it covers every state variable, DOM ID, function signature, and coding convention used in the project.

---

## 📚 Educational References

- [NOAA — In-Situ Burning](https://response.restoration.noaa.gov/oil-and-chemical-spills/oil-spills/response-tools/burning.html)
- [EPA — Dispersants in Oil Spill Response](https://www.epa.gov/emergency-response/dispersants-use-during-oil-spills)
- [Deepwater Horizon Oil Spill (2010)](https://en.wikipedia.org/wiki/Deepwater_Horizon_oil_spill)

---

## 📄 License

MIT License — feel free to use, modify, and distribute with attribution.

---

*Made with 💧 to raise awareness about water and ocean pollution.*
