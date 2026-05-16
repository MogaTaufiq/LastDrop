# Last Drop - Tasks Tracker

## 1. Landing & Cinematic
- [x] Implement Landing Scene (Title, tap-to-start)
- [x] Implement Cinematic Scene (12 slides narrative)
- [x] Transition from Cinematic to Main Game

## 2. World System
- [x] Create Map System (WASD movement, bounds checking)
- [x] Area Collision Detection (Coastal, Residential, Agricultural, Industrial)
- [x] Convert Map to Popup Overlay (Press M to open, X to close)
- [x] Create 2D Residential World Base (New spawn point)
- [x] Add "X areas left to solve" HUD Counter
- [x] Dynamic Map Routing logic per-area via `enterArea()`

## 3. Coastal Area Missions
- [x] Task 1: Save Trapped Turtle (Click progress)
- [x] Task 2: Clean Beach Plastic (Collect 8 trash items)
- [x] Task 3: Stop Oil Leak (Seal underwater pipe)
- [x] Task 4: Clean Oil Spill (Decision path: Burning vs Corexit)
- [x] Coastal Completion Logic & Result Calculation

## 4. Agricultural Area Missions
- [x] Alert Trigger: "Pollution detected in the agricultural area. Excess nutrients..."
- [x] Task 1: Identify Pollution Source
  - [x] Farm visual with red blinking alert
  - [x] Scanning interaction logic
  - [x] Runoff animation
  - [x] Typing text effect explanation
- [x] Task 2: Apply Buffer Strips
  - [x] Plant 8 slots with varying vegetation (grass, shrubs, trees)
  - [x] Dynamic water clarity update as planting progresses
  - [x] Score calculation: Water +15, Bio +10
- [x] Return flow back to Residential World

## 5. Industrial Area Missions
- [ ] Alert Trigger
- [ ] Task 1 Design & Implementation
- [ ] Task 2 Design & Implementation
- [ ] Score calculation and integration

## 6. Global Systems
- [x] HUD Tracking (Water Quality, Biodiversity)
- [x] Mission Checklist (Todo panel)
- [x] Audio engine (graceful degradation)
- [x] Toast Notification System
- [x] Particle burst system (Emojis)
