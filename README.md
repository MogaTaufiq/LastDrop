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

## 🎮 Gameplay

Players navigate a top-down island map using **WASD** and interact with zones by pressing **E**. Each zone triggers a unique cleanup mission:

| Task | Mission | Environmental Impact |
|------|---------|----------------------|
| 1 | 🐢 **Save a trapped marine animal** from plastic entanglement | Biodiversity +10 |
| 2 | 🧹 **Clean plastic waste** scattered on the beach (8 items) | Water +10, Bio +5 |
| 3 | 🔧 **Seal an underwater oil pipe** leak | — |
| 4 | 🛢️ **Clean an ocean oil spill** — choose your method | Varies |

### Task 4 — The Decision Point

Task 4 presents a real-world ethical dilemma with two cleanup methods:

**🔥 Method A: In-Situ Burning** *(Recommended)*
- Contain the oil with a boom, then ignite it
- Water Quality +25 · Biodiversity +5
- Physically removes oil from the ocean surface

**🧪 Method B: Corexit Dispersant**
- Spray chemical dispersant from a boat, then inject at the source
- Water Quality +20 · Biodiversity **-15**
- Breaks oil into droplets — remains in the water column, harms marine life
- Based on the real-world Deepwater Horizon (2010) response

Your choice affects the final score and which badge you receive on the completion screen.

---

## ✨ Features

- 🎬 **12-slide cinematic opening** with inline SVG illustrations
- 🗺️ **Top-down island map** with WASD player movement and zone collision detection
- 📊 **Live HUD** tracking Water Quality and Biodiversity in real time
- ✅ **Mission checklist** panel updating as tasks are completed
- 🎨 **Fully animated scenes** — waves, stars, particles, progress bars
- 🔊 **Audio system** with clone-based overlapping playback (add `.mp3` files to enable)
- 🌍 **Educational content** grounded in real environmental science
- 📱 Partial **touch/mobile support** (keyboard + mouse fully supported)

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

### Optional: Enable Audio

Place the following `.mp3` files in `assets/audio/` to enable full audio:

| File | Used For |
|------|----------|
| `cinematic_bg.mp3` | Background music during the cinematic intro |
| `ambient_ocean.mp3` | Looping ocean ambience during gameplay |
| `alarm.mp3` | Crisis alert on map entry |
| `click_success.mp3` | Positive feedback sound |
| `task_complete.mp3` | Task completion fanfare |
| `fire_burning.mp3` | Method A burning effect |
| `chemical_spray.mp3` | Method B dispersant injection |

The game degrades gracefully — all audio is wrapped in `try/catch` and missing files are silently skipped.

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
