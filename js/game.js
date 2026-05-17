/* ============================================
   LAST DROP: WATER SURVIVAL 0009
   Main Game Engine
   ============================================ */

'use strict';

// ============================================
// GAME STATE
// ============================================
const GameState = {
    waterQuality: 60,
    biodiversity: 50,
    tasksCompleted: [false, false, false, false],
    agriCompleted: false,
    indCompleted: false,
    coastalAlertShown: false,
    agriAlertShown: false,
    isMapOpen: false,
    mapPos: null,
    currentScene: 'landing',
    task4Choice: null, // 'burning' or 'chemical'
    phase: 'landing',

    updateWater(delta) {
        this.waterQuality = Math.max(0, Math.min(100, this.waterQuality + delta));
        HUD.update();
    },
    updateBio(delta) {
        this.biodiversity = Math.max(0, Math.min(100, this.biodiversity + delta));
        HUD.update();
    },
    completeTask(index, isAgri = false) {
        if (!isAgri) {
            this.tasksCompleted[index] = true;
        }
        TodoPanel.checkTask(index);
    },
    allTasksDone() {
        return this.tasksCompleted.every(t => t);
    }
};

// ============================================
// AUDIO MANAGER
// ============================================
const Audio = {
    sounds: {},
    offsets: {},
    bgMusic: null,
    muted: false,

    // Added startOffset (in seconds) to skip silence at the beginning of audio files
    load(id, src, startOffset = 0) {
        const audio = new window.Audio();
        audio.src = src;
        audio.preload = 'auto';
        this.sounds[id] = audio;
        this.offsets[id] = startOffset;
        return audio;
    },

    play(id, options = {}) {
        if (this.muted) return;
        const snd = this.sounds[id];
        if (!snd) return;
        try {
            const player = options.loop ? snd : snd.cloneNode();

            player.volume = options.volume !== undefined ? options.volume : 0.7;
            player.loop = options.loop || false;

            // We must call play() first to ensure it attaches to the user gesture.
            const playPromise = player.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Playback started! Now we can safely skip silence
                    const offset = this.offsets[id] || 0;
                    if (offset > 0 && player.currentTime < offset) {
                        player.currentTime = offset;
                    }
                    if (options.loop) this.bgMusic = player;
                }).catch(e => console.warn('Audio play error:', id, e));
            } else {
                // Fallback
                const offset = this.offsets[id] || 0;
                if (offset > 0) player.currentTime = offset;
                if (options.loop) this.bgMusic = player;
            }

            return player;
        } catch (e) {
            console.error('Audio exception:', e);
        }
    },

    stopBg() {
        if (this.bgMusic) {
            this.bgMusic.pause();
            this.bgMusic.currentTime = 0;
        }
    },

    init() {
        // --- BACKGROUND MUSIC & AMBIENCE ---
        this.load('cinematic_bg', 'assets/audio/cinematic_bg.mp3', 120);
        this.load('ambient_ocean', 'assets/audio/ambient_ocean.mp3', 0);
        this.load('ambient_underwater', 'assets/audio/ambient_underwater.mp3', 0);
        this.load('ambient_factory', 'assets/audio/ambient_factory.mp3', 0);

        // --- UI & SYSTEM SOUNDS ---
        this.load('alarm', 'assets/audio/alarm.mp3', 0);
        // If "click_success.mp3" has 0.5s of silence at the start, change the 0 below to 0.5
        this.load('click_success', 'assets/audio/click_success.mp3', 3);
        this.load('click_error', 'assets/audio/click_error.mp3', 0);
        this.load('task_complete', 'assets/audio/task_complete.mp3', 0);

        // --- COASTAL SFX ---
        this.load('net_cut', 'assets/audio/net_cut.mp3', 0);
        this.load('trash_pickup', 'assets/audio/trash_pickup.mp3', 0);
        // Using "metap_snap.mp3" because of the typo in the downloaded file name
        this.load('metal_snap', 'assets/audio/metap_snap.mp3', 0);
        this.load('fire_burning', 'assets/audio/fire_burning.mp3', 0);
        this.load('chemical_spray', 'assets/audio/chemical_spray.mp3', 0);

        // --- AGRICULTURAL SFX ---
        this.load('shovel_dig', 'assets/audio/shovel_dig.mp3', 0);

        // --- INDUSTRIAL SFX ---
        this.load('metal_drag', 'assets/audio/metal_drag.mp3', 0);
        this.load('wrench_ratchet', 'assets/audio/wrench_ratchet.mp3', 0);
        this.load('stone_grind', 'assets/audio/stone_grind.mp3', 0);
        this.load('sand_pour', 'assets/audio/sand_pour.mp3', 0);
        this.load('liquid_splash', 'assets/audio/liquid_splash.mp3', 0);
        this.load('bacteria_bubble', 'assets/audio/bacteria_bubble.mp3', 0);
    }
};


// ============================================
// UTILITIES
// ============================================
function typeWriter(element, text, speed = 50, callback) {
    if (element.typewriterInterval) {
        clearInterval(element.typewriterInterval);
    }
    let i = 0;
    element.textContent = '';
    element.typewriterInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text[i];
            i++;
        } else {
            clearInterval(element.typewriterInterval);
            element.typewriterInterval = null;
            if (callback) callback();
        }
    }, speed);
}

// ============================================
// SCENE MANAGER
// ============================================
const SceneManager = {
    current: null,

    show(sceneId, callback) {
        // Hide current
        if (this.current) {
            const prev = document.getElementById(this.current);
            if (prev) {
                prev.classList.remove('active');
            }
        }

        // Show new
        const next = document.getElementById(sceneId);
        if (next) {
            setTimeout(() => {
                next.classList.add('active');
                GameState.currentScene = sceneId;
                if (callback) callback();
            }, 100);
        }

        this.current = sceneId;
    },

    transition(fromId, toId, delay = 0, callback) {
        setTimeout(() => {
            this.show(toId, callback);
        }, delay);
    }
};

// ============================================
// HUD (Heads Up Display)
// ============================================
const HUD = {
    waterFill: null,
    bioFill: null,
    waterVal: null,
    bioVal: null,

    init() {
        this.waterFill = document.getElementById('hud-water-fill');
        this.bioFill = document.getElementById('hud-bio-fill');
        this.waterVal = document.getElementById('hud-water-val');
        this.bioVal = document.getElementById('hud-bio-val');
        this.update();
    },

    show() {
        document.getElementById('game-hud').classList.add('visible');
    },

    hide() {
        document.getElementById('game-hud').classList.remove('visible');
    },

    update() {
        if (!this.waterFill) return;
        const wq = GameState.waterQuality;
        const bio = GameState.biodiversity;

        this.waterFill.style.width = wq + '%';
        this.bioFill.style.width = bio + '%';
        this.waterVal.textContent = wq + '%';
        this.bioVal.textContent = bio + '%';

        // Color change based on value
        if (wq < 30) {
            this.waterFill.style.background = 'linear-gradient(90deg, #e63946, #ff6b6b)';
        } else if (wq < 60) {
            this.waterFill.style.background = 'linear-gradient(90deg, #f4a261, #ffd166)';
        } else {
            this.waterFill.style.background = 'linear-gradient(90deg, var(--teal), var(--teal-light))';
        }

        if (bio < 30) {
            this.bioFill.style.background = 'linear-gradient(90deg, #e63946, #ff6b6b)';
        } else {
            this.bioFill.style.background = 'linear-gradient(90deg, var(--green), var(--green-light))';
        }
    }
};

// ============================================
// TODO PANEL
// ============================================
const TodoPanel = {
    show() {
        document.getElementById('todo-panel').classList.add('visible');
    },
    hide() {
        document.getElementById('todo-panel').classList.remove('visible');
    },

    checkTask(index) {
        const items = document.querySelectorAll('.todo-item');
        if (items[index]) {
            items[index].classList.add('done');
            const check = items[index].querySelector('.todo-check');
            if (check) check.textContent = '✓';
        }
    }
};

// ============================================
// FEEDBACK TOAST
// ============================================
const Toast = {
    timer: null,

    show(text, stats = '', duration = 3000) {
        const toast = document.getElementById('feedback-toast');
        document.getElementById('toast-text').textContent = text;
        document.getElementById('toast-stats').textContent = stats;
        toast.classList.add('show');

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }
};

// ============================================
// MODAL SYSTEM
// ============================================
const Modal = {
    show(id) {
        document.getElementById(id).classList.add('visible');
    },

    hide(id) {
        document.getElementById(id).classList.remove('visible');
    }
};

function showContinueModal(title, body, buttonText, onContinue) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay visible';
    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-icon">✅</div>
            <div class="modal-title success">${title}</div>
            <div class="modal-body">${body}</div>
            <button class="modal-btn" id="dynamic-continue-btn">${buttonText}</button>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#dynamic-continue-btn').addEventListener('click', () => {
        overlay.remove();
        onContinue();
    }, { once: true });
}

// ============================================
// PARTICLE EFFECTS
// ============================================
const Particles = {
    burst(x, y, count = 8, emojis = ['✨', '💧', '🌊']) {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            p.style.fontSize = (Math.random() * 16 + 12) + 'px';

            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = Math.random() * 80 + 40;
            p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');

            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
    }
};

// ============================================
// ALARM EFFECT
// ============================================
function triggerAlarm() {
    Audio.play('alarm', { volume: 0.8 });
    const flash = document.createElement('div');
    flash.className = 'alarm-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 2500);
}

// ============================================
// SCENE: LANDING PAGE
// ============================================
function initLanding() {
    // Generate stars
    const starsContainer = document.querySelector('.landing-stars');
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 3 + 1;
        star.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 3}s;
            animation-duration: ${Math.random() * 2 + 2}s;
        `;
        starsContainer.appendChild(star);
    }

    // Click to start
    document.getElementById('scene-landing').addEventListener('click', () => {
        Audio.play('cinematic_bg', { volume: 0.4, loop: true });
        SceneManager.show('scene-cinematic', () => {
            initCinematic();
        });
    }, { once: true });
}

// ============================================
// SCENE: CINEMATIC OPENING
// ============================================
const cinematicSlides = [
    // Scene 1: Cinematic Opening
    {
        text: 'Water is essential for life.',
        bg: 'oil-spill-sea',
        type: 'oil-sea'
    },
    {
        text: 'Yet today, it is under threat.',
        bg: 'industrial-pipe',
        type: 'pipe'
    },
    {
        text: 'Coastal ecosystems are increasingly polluted by human activities.',
        bg: 'algae-water',
        type: 'algae'
    },
    // Scene 2: Problem Escalation
    {
        text: 'Oil spills spread across oceans, destroying marine habitats.',
        bg: 'oil-spill-sea',
        type: 'oil-sea'
    },
    {
        text: 'Agricultural runoff carries fertilizers and chemicals into water…',
        bg: 'algae-water',
        type: 'algae'
    },
    {
        text: 'Industrial waste releases toxic substances into rivers and seas.',
        bg: 'industrial-pipe',
        type: 'pipe'
    },
    // Scene 3: Impact
    {
        text: 'The consequences are severe.',
        bg: 'dead-sea',
        type: 'dead'
    },
    {
        text: 'Marine life dies. Ecosystems collapse.',
        bg: 'dead-sea',
        type: 'dead'
    },
    {
        text: 'Water becomes unsafe for human use.',
        bg: 'dirty-water',
        type: 'dirty'
    },
    // Scene 4: Player Hook
    {
        text: 'In a small coastal town, water quality continues to decline under constant pressure from pollution.',
        bg: 'coastal-town',
        type: 'town'
    },
    {
        text: 'As environmental conditions worsen, maintaining water quality becomes increasingly difficult.',
        bg: 'coastal-town',
        type: 'town'
    },
    {
        text: 'Your actions will determine whether the system can recover… or collapse.',
        bg: 'coastal-town',
        type: 'town',
        isLast: true
    }
];

let currentSlide = 0;

function getCinematicBg(type) {
    const svgs = {
        'oil-sea': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <radialGradient id="skyGrad" cx="50%" cy="30%">
                        <stop offset="0%" stop-color="#1a1a2e"/>
                        <stop offset="100%" stop-color="#0a0a1a"/>
                    </radialGradient>
                    <radialGradient id="oilGrad" cx="50%" cy="50%">
                        <stop offset="0%" stop-color="#2d2d00" stop-opacity="0.9"/>
                        <stop offset="50%" stop-color="#1a1a0a" stop-opacity="0.8"/>
                        <stop offset="100%" stop-color="#0a0a05" stop-opacity="0.6"/>
                    </radialGradient>
                </defs>
                <!-- Sky -->
                <rect width="800" height="500" fill="url(#skyGrad)"/>
                <!-- Stars -->
                <circle cx="100" cy="50" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="250" cy="30" r="1" fill="white" opacity="0.5"/>
                <circle cx="400" cy="60" r="2" fill="white" opacity="0.7"/>
                <circle cx="600" cy="40" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="700" cy="80" r="1" fill="white" opacity="0.4"/>
                <!-- Ocean base -->
                <rect x="0" y="220" width="800" height="280" fill="#041e2e"/>
                <!-- Ocean waves -->
                <path d="M0,240 C100,220 200,260 300,240 C400,220 500,260 600,240 C700,220 800,260 800,240 L800,500 L0,500 Z" fill="#0a3a5c" opacity="0.8"/>
                <path d="M0,260 C120,240 240,280 360,260 C480,240 600,280 720,260 L800,260 L800,500 L0,500 Z" fill="#0d4a6e" opacity="0.6"/>
                <!-- Oil spill -->
                <ellipse cx="400" cy="320" rx="280" ry="80" fill="url(#oilGrad)"/>
                <ellipse cx="300" cy="350" rx="180" ry="50" fill="#1a1a0a" opacity="0.7"/>
                <ellipse cx="500" cy="340" rx="150" ry="40" fill="#2d2d00" opacity="0.5"/>
                <!-- Oil sheen (rainbow effect) -->
                <ellipse cx="380" cy="310" rx="200" ry="55" fill="none" stroke="#4a3f00" stroke-width="3" opacity="0.4"/>
                <ellipse cx="380" cy="310" rx="180" ry="48" fill="none" stroke="#3d5a00" stroke-width="2" opacity="0.3"/>
                <!-- Dead bird silhouette -->
                <path d="M150,280 Q160,270 170,280 Q165,285 150,280Z" fill="#1a1a1a" opacity="0.6"/>
                <!-- Tanker silhouette -->
                <rect x="550" y="200" width="180" height="40" rx="5" fill="#1a1a1a" opacity="0.8"/>
                <rect x="580" y="175" width="60" height="30" rx="3" fill="#1a1a1a" opacity="0.8"/>
                <rect x="610" y="155" width="8" height="25" fill="#1a1a1a" opacity="0.8"/>
                <!-- Smoke from tanker -->
                <circle cx="614" cy="145" r="8" fill="#333" opacity="0.4"/>
                <circle cx="618" cy="130" r="10" fill="#333" opacity="0.3"/>
                <circle cx="612" cy="115" r="12" fill="#333" opacity="0.2"/>
            </svg>`,

        'pipe': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="skyPipe" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a0a00"/>
                        <stop offset="100%" stop-color="#2d1a00"/>
                    </linearGradient>
                </defs>
                <!-- Dark industrial sky -->
                <rect width="800" height="500" fill="url(#skyPipe)"/>
                <!-- Factory silhouettes -->
                <rect x="50" y="150" width="120" height="250" fill="#0a0a0a"/>
                <rect x="80" y="100" width="30" height="60" fill="#0a0a0a"/>
                <rect x="200" y="180" width="100" height="220" fill="#0a0a0a"/>
                <rect x="220" y="130" width="25" height="55" fill="#0a0a0a"/>
                <rect x="500" y="120" width="150" height="280" fill="#0a0a0a"/>
                <rect x="530" y="70" width="35" height="60" fill="#0a0a0a"/>
                <rect x="580" y="90" width="30" height="40" fill="#0a0a0a"/>
                <!-- Smoke clouds -->
                <circle cx="95" cy="85" r="20" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="110" cy="70" r="25" fill="#2a2a2a" opacity="0.6"/>
                <circle cx="125" cy="55" r="18" fill="#2a2a2a" opacity="0.5"/>
                <circle cx="235" cy="115" r="18" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="248" cy="100" r="22" fill="#2a2a2a" opacity="0.6"/>
                <circle cx="547" cy="55" r="22" fill="#2a2a2a" opacity="0.7"/>
                <circle cx="562" cy="38" r="28" fill="#2a2a2a" opacity="0.6"/>
                <!-- Pipe discharging waste -->
                <rect x="320" y="300" width="160" height="25" rx="12" fill="#4a4a4a"/>
                <rect x="460" y="305" width="80" height="15" rx="7" fill="#3a3a3a"/>
                <!-- Toxic waste flow -->
                <path d="M540,312 Q580,320 620,340 Q660,360 680,380 Q700,400 720,420" stroke="#4a7c00" stroke-width="12" fill="none" opacity="0.8" stroke-linecap="round"/>
                <path d="M540,312 Q580,325 615,348 Q650,370 670,395" stroke="#2d5a00" stroke-width="8" fill="none" opacity="0.6" stroke-linecap="round"/>
                <!-- River/water receiving waste -->
                <path d="M0,400 C200,380 400,420 600,400 C700,390 750,410 800,400 L800,500 L0,500 Z" fill="#1a3a00" opacity="0.8"/>
                <path d="M0,430 C150,415 350,445 550,430 C680,420 750,440 800,430 L800,500 L0,500 Z" fill="#0d2a00" opacity="0.9"/>
                <!-- Warning signs -->
                <polygon points="350,240 370,270 330,270" fill="#ff6600" opacity="0.8"/>
                <text x="350" y="265" text-anchor="middle" fill="black" font-size="14" font-weight="bold">!</text>
            </svg>`,

        'algae': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="algaeSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a1a0a"/>
                        <stop offset="100%" stop-color="#1a2a0a"/>
                    </linearGradient>
                    <radialGradient id="algaeWater" cx="50%" cy="60%">
                        <stop offset="0%" stop-color="#1a4a00"/>
                        <stop offset="100%" stop-color="#0a2a00"/>
                    </radialGradient>
                </defs>
                <rect width="800" height="500" fill="url(#algaeSky)"/>
                <!-- Murky green water -->
                <rect x="0" y="200" width="800" height="300" fill="url(#algaeWater)"/>
                <!-- Algae bloom patches -->
                <ellipse cx="200" cy="280" rx="150" ry="60" fill="#2d6a00" opacity="0.8"/>
                <ellipse cx="500" cy="300" rx="200" ry="70" fill="#3a7a00" opacity="0.7"/>
                <ellipse cx="350" cy="350" rx="180" ry="55" fill="#1a5a00" opacity="0.9"/>
                <ellipse cx="650" cy="270" rx="120" ry="45" fill="#2d6a00" opacity="0.6"/>
                <!-- Algae texture -->
                <path d="M100,260 Q150,240 200,260 Q250,280 300,260" stroke="#4a8a00" stroke-width="3" fill="none" opacity="0.5"/>
                <path d="M350,290 Q400,270 450,290 Q500,310 550,290" stroke="#4a8a00" stroke-width="3" fill="none" opacity="0.5"/>
                <!-- Dead fish floating -->
                <ellipse cx="300" cy="230" rx="25" ry="10" fill="#8a8a6a" opacity="0.7"/>
                <path d="M325,230 L340,220 L340,240 Z" fill="#8a8a6a" opacity="0.7"/>
                <ellipse cx="550" cy="215" rx="20" ry="8" fill="#8a8a6a" opacity="0.6"/>
                <path d="M570,215 L582,207 L582,223 Z" fill="#8a8a6a" opacity="0.6"/>
                <!-- Farm in background -->
                <rect x="600" y="100" width="150" height="100" fill="#2a1a00" opacity="0.6"/>
                <polygon points="600,100 675,50 750,100" fill="#1a0a00" opacity="0.6"/>
                <!-- Runoff stream -->
                <path d="M650,200 Q680,220 700,250 Q720,280 730,320" stroke="#4a7c00" stroke-width="8" fill="none" opacity="0.7"/>
            </svg>`,

        'dead': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="deadSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a0a0a"/>
                        <stop offset="100%" stop-color="#2a0a0a"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#deadSky)"/>
                <!-- Dark polluted water -->
                <rect x="0" y="220" width="800" height="280" fill="#1a0a0a"/>
                <path d="M0,240 C200,220 400,260 600,240 C700,230 750,250 800,240 L800,500 L0,500 Z" fill="#2a0a0a" opacity="0.8"/>
                <!-- Dead fish 1 -->
                <ellipse cx="150" cy="280" rx="50" ry="18" fill="#6a5a4a" opacity="0.8"/>
                <path d="M200,280 L225,265 L225,295 Z" fill="#6a5a4a" opacity="0.8"/>
                <circle cx="135" cy="275" r="5" fill="#1a1a1a"/>
                <line x1="130" y1="270" x2="140" y2="280" stroke="#1a1a1a" stroke-width="2"/>
                <line x1="140" y1="270" x2="130" y2="280" stroke="#1a1a1a" stroke-width="2"/>
                <!-- Dead fish 2 -->
                <ellipse cx="400" cy="260" rx="40" ry="14" fill="#6a5a4a" opacity="0.7" transform="rotate(-15, 400, 260)"/>
                <path d="M440,255 L460,243 L460,267 Z" fill="#6a5a4a" opacity="0.7" transform="rotate(-15, 440, 255)"/>
                <!-- Dead turtle -->
                <ellipse cx="600" cy="290" rx="45" ry="30" fill="#4a5a3a" opacity="0.8"/>
                <circle cx="645" cy="285" r="12" fill="#3a4a2a" opacity="0.8"/>
                <!-- Coral bleached -->
                <path d="M200,400 L200,350 M190,370 L210,370 M185,355 L215,355" stroke="#d4d4d4" stroke-width="4" opacity="0.6"/>
                <path d="M350,420 L350,360 M340,380 L360,380 M335,365 L365,365" stroke="#d4d4d4" stroke-width="4" opacity="0.5"/>
                <!-- Oil on surface -->
                <ellipse cx="400" cy="240" rx="300" ry="30" fill="#1a1a0a" opacity="0.5"/>
            </svg>`,

        'dirty': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="dirtySky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#1a1a0a"/>
                        <stop offset="100%" stop-color="#2a1a00"/>
                    </linearGradient>
                </defs>
                <rect width="800" height="500" fill="url(#dirtySky)"/>
                <!-- Dirty water tap/faucet -->
                <rect x="340" y="80" width="120" height="20" rx="10" fill="#5a5a5a"/>
                <rect x="390" y="100" width="20" height="80" rx="5" fill="#5a5a5a"/>
                <path d="M390,180 Q400,200 410,180" fill="#5a5a5a"/>
                <!-- Dirty water dripping -->
                <path d="M400,185 Q398,220 400,250 Q402,280 400,310" stroke="#6a5a00" stroke-width="8" fill="none" opacity="0.8" stroke-linecap="round"/>
                <!-- Dirty water in glass -->
                <rect x="350" y="300" width="100" height="130" rx="5" fill="none" stroke="#8a8a8a" stroke-width="3"/>
                <rect x="353" y="350" width="94" height="77" rx="3" fill="#4a3a00" opacity="0.7"/>
                <!-- Contamination particles in water -->
                <circle cx="370" cy="380" r="4" fill="#2a1a00" opacity="0.8"/>
                <circle cx="400" cy="370" r="3" fill="#3a2a00" opacity="0.7"/>
                <circle cx="420" cy="390" r="5" fill="#2a1a00" opacity="0.8"/>
                <circle cx="385" cy="400" r="3" fill="#4a3a00" opacity="0.6"/>
                <!-- Warning symbol -->
                <circle cx="400" cy="250" r="30" fill="none" stroke="#ff4444" stroke-width="3" opacity="0.8"/>
                <line x1="400" y1="230" x2="400" y2="260" stroke="#ff4444" stroke-width="4" opacity="0.8"/>
                <circle cx="400" cy="268" r="3" fill="#ff4444" opacity="0.8"/>
                <!-- People silhouettes (sick) -->
                <circle cx="150" cy="200" r="20" fill="#2a2a2a" opacity="0.6"/>
                <rect x="140" y="220" width="20" height="50" rx="5" fill="#2a2a2a" opacity="0.6"/>
                <path d="M140,240 L120,260 M160,240 L180,260" stroke="#2a2a2a" stroke-width="4" opacity="0.6"/>
                <path d="M140,270 L130,300 M160,270 L170,300" stroke="#2a2a2a" stroke-width="4" opacity="0.6"/>
                <!-- X over water symbol -->
                <circle cx="650" cy="200" r="50" fill="none" stroke="#ff4444" stroke-width="4" opacity="0.6"/>
                <line x1="615" y1="165" x2="685" y2="235" stroke="#ff4444" stroke-width="4" opacity="0.6"/>
                <path d="M620,200 Q650,185 680,200 Q650,215 620,200Z" fill="#0077b6" opacity="0.4"/>
            </svg>`,

        'town': `
            <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
                <defs>
                    <linearGradient id="townSky" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a1a2e"/>
                        <stop offset="100%" stop-color="#1a3a5c"/>
                    </linearGradient>
                    <linearGradient id="townSea" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#0a4f7a"/>
                        <stop offset="100%" stop-color="#041e2e"/>
                    </linearGradient>
                </defs>
                <!-- Sky -->
                <rect width="800" height="500" fill="url(#townSky)"/>
                <!-- Moon -->
                <circle cx="680" cy="80" r="35" fill="#f0e68c" opacity="0.8"/>
                <circle cx="695" cy="70" r="30" fill="#1a3a5c" opacity="0.9"/>
                <!-- Stars -->
                <circle cx="100" cy="60" r="2" fill="white" opacity="0.7"/>
                <circle cx="200" cy="40" r="1.5" fill="white" opacity="0.6"/>
                <circle cx="350" cy="70" r="2" fill="white" opacity="0.8"/>
                <circle cx="450" cy="30" r="1.5" fill="white" opacity="0.5"/>
                <circle cx="550" cy="55" r="2" fill="white" opacity="0.7"/>
                <!-- Hills/land -->
                <path d="M0,300 Q100,250 200,280 Q300,310 400,270 Q500,230 600,260 Q700,290 800,270 L800,500 L0,500 Z" fill="#1a3a1a"/>
                <!-- Houses -->
                <rect x="80" y="260" width="60" height="50" fill="#2a2a3a"/>
                <polygon points="80,260 110,235 140,260" fill="#3a2a2a"/>
                <rect x="95" y="280" width="15" height="30" fill="#4a3a2a"/>
                <rect x="115" y="270" width="20" height="15" fill="#5a6a7a" opacity="0.6"/>
                
                <rect x="180" y="255" width="70" height="55" fill="#2a2a3a"/>
                <polygon points="180,255 215,225 250,255" fill="#3a2a2a"/>
                <rect x="200" y="275" width="18" height="35" fill="#4a3a2a"/>
                <rect x="225" y="265" width="22" height="18" fill="#5a6a7a" opacity="0.6"/>
                
                <rect x="300" y="248" width="65" height="60" fill="#2a2a3a"/>
                <polygon points="300,248 332,218 365,248" fill="#3a2a2a"/>
                <rect x="318" y="270" width="16" height="38" fill="#4a3a2a"/>
                
                <rect x="420" y="252" width="55" height="56" fill="#2a2a3a"/>
                <polygon points="420,252 447,225 475,252" fill="#3a2a2a"/>
                
                <rect x="530" y="245" width="75" height="63" fill="#2a2a3a"/>
                <polygon points="530,245 567,210 605,245" fill="#3a2a2a"/>
                <!-- Lighthouse -->
                <rect x="700" y="200" width="25" height="80" fill="#d4d4d4" opacity="0.8"/>
                <polygon points="700,200 712,180 725,200" fill="#cc4444" opacity="0.8"/>
                <circle cx="712" cy="195" r="8" fill="#ffff00" opacity="0.9"/>
                <!-- Sea -->
                <path d="M0,360 C200,340 400,380 600,360 C700,350 750,370 800,360 L800,500 L0,500 Z" fill="url(#townSea)"/>
                <!-- Pollution in water (subtle) -->
                <ellipse cx="400" cy="400" rx="200" ry="30" fill="#1a1a0a" opacity="0.3"/>
                <!-- Boat -->
                <path d="M200,370 Q250,360 300,370 L290,385 L210,385 Z" fill="#4a3a2a" opacity="0.8"/>
                <rect x="245" y="355" width="5" height="20" fill="#4a3a2a" opacity="0.8"/>
            </svg>`
    };
    return svgs[type] || svgs['oil-sea'];
}

function initCinematic() {
    currentSlide = 0;
    renderSlide(0);
    updateDots();
    GameState.phase = 'cinematic';

    document.getElementById('cin-next-btn').onclick = nextSlide;
    document.getElementById('scene-cinematic').onclick = (e) => {
        if (e.target.id !== 'cin-next-btn') nextSlide();
    };
}

function renderSlide(index) {
    const container = document.getElementById('cinematic-slides-container');
    container.innerHTML = '';

    const slide = cinematicSlides[index];
    const div = document.createElement('div');
    div.className = 'cinematic-slide active';
    div.innerHTML = `
        <div class="cin-illustration">${getCinematicBg(slide.type)}</div>
        <div class="cinematic-overlay"></div>
        <div class="cinematic-text">
            <h2 id="slide-text"></h2>
        </div>
    `;
    container.appendChild(div);

    typeWriter(document.getElementById('slide-text'), slide.text, 50);

    // Update next button
    const btn = document.getElementById('cin-next-btn');
    btn.textContent = slide.isLast ? 'Begin Mission →' : 'Next →';
}

function updateDots() {
    const dots = document.querySelectorAll('.cinematic-dot');
    dots.forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
    });
}

function nextSlide() {
    if (GameState.phase !== 'cinematic') return;

    if (currentSlide < cinematicSlides.length - 1) {
        currentSlide++;
        renderSlide(currentSlide);
        updateDots();
    } else {
        GameState.phase = 'residential';
        // fully disable cinematic click handlers once mission starts
        const cinBtn = document.getElementById('cin-next-btn');
        const cinScene = document.getElementById('scene-cinematic');
        if (cinBtn) cinBtn.onclick = null;
        if (cinScene) cinScene.onclick = null;

        // Go to residential world
        Audio.stopBg();
        Audio.play('ambient_ocean', { volume: 0.3, loop: true });
        SceneManager.show('scene-residential', () => {
            initResidential();
        });
    }
}

// ============================================
// SCENE: RESIDENTIAL WORLD & MINIMAP
// ============================================
let residentialControllerActive = false;
let resX = 150;
let resY = 400;

function showMiniMap() {
    const mapContainer = document.getElementById('mini-map-container');
    if (mapContainer) mapContainer.classList.add('visible');
    initMap(); // ensure listeners are bound
}

function hideMiniMap() {
    const mapContainer = document.getElementById('mini-map-container');
    if (mapContainer) mapContainer.classList.remove('visible');
}

// ============================================
// MAP CRISIS INDICATOR — updates the red pulse
// dot on the minimap based on current game state
// ============================================
function updateMapCrisis() {
    const coastal    = document.getElementById('map-coastal');
    const agri       = document.getElementById('map-agricultural');
    const industrial = document.getElementById('map-industrial');

    if (!coastal) return;

    const coastalStatus = document.getElementById('map-coastal-status');
    const agriStatus    = document.getElementById('map-agri-status');
    const indStatus     = document.getElementById('map-ind-status');

    // Helper: set area state
    function setAreaState(el, statusEl, state, label) {
        el.classList.remove('crisis', 'done');
        const dot = el.querySelector('.map-alert-dot');
        if (dot) dot.style.display = 'none';
        if (state === 'crisis') {
            el.classList.add('crisis');
            if (dot) dot.style.display = '';
            if (statusEl) statusEl.textContent = label || '🚨 CRISIS';
        } else if (state === 'done') {
            el.classList.add('done');
            if (statusEl) statusEl.textContent = label || '✅ SAFE';
        } else {
            // neutral / locked
            if (statusEl) statusEl.textContent = label || '';
        }
    }

    // --- Coastal ---
    if (GameState.allTasksDone()) {
        setAreaState(coastal, coastalStatus, 'done', '✅ SAFE');
    } else {
        setAreaState(coastal, coastalStatus, 'crisis', '🚨 CRISIS');
    }

    // --- Agricultural (only active after Coastal done) ---
    if (GameState.agriCompleted) {
        setAreaState(agri, agriStatus, 'done', '✅ SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(agri, agriStatus, 'crisis', '🚨 CRISIS');
    } else {
        setAreaState(agri, agriStatus, 'neutral', '🔒 LOCKED');
    }

    // --- Industrial (only active after Coastal done) ---
    if (GameState.indCompleted) {
        setAreaState(industrial, indStatus, 'done', '✅ SAFE');
    } else if (GameState.allTasksDone()) {
        setAreaState(industrial, indStatus, 'crisis', '🚨 CRISIS');
    } else {
        setAreaState(industrial, indStatus, 'neutral', '🔒 LOCKED');
    }
}


function initResidential() {
    if (GameState.phase !== 'residential') return;
    HUD.show();
    HUD.update();
    showMiniMap();
    TodoPanel.hide();
    // Stop any area-specific ambience when returning to base
    Audio.stopBg();

    // Update minimap crisis / done / locked indicators
    updateMapCrisis();

    // update areas counter
    if (GameState.allTasksDone()) {
        const counter = document.getElementById('areas-counter');
        counter.classList.remove('hidden');
        if (GameState.agriCompleted && GameState.indCompleted) {
            counter.textContent = 'All areas resolved! ✅';
        } else if (GameState.agriCompleted || GameState.indCompleted) {
            counter.textContent = '1 area left to solve';
        } else {
            counter.textContent = '2 areas left to solve';
        }
    }

    const player = document.getElementById('residential-player');
    const speed = 5;

    function updatePlayer() {
        player.style.transform = `translate(${resX}px, ${resY}px)`;
    }
    updatePlayer();

    if (!residentialControllerActive) {
        residentialControllerActive = true;
        if (!window.keys) window.keys = { w: false, a: false, s: false, d: false, e: false };

        window.addEventListener('keydown', (e) => {
            if (GameState.phase !== 'residential') return;
            const key = e.key.toLowerCase();
            if (window.keys.hasOwnProperty(key)) window.keys[key] = true;
        });

        window.addEventListener('keyup', (e) => {
            if (GameState.phase !== 'residential') return;
            const key = e.key.toLowerCase();
            if (window.keys.hasOwnProperty(key)) window.keys[key] = false;
        });

        function resLoop() {
            if (GameState.phase === 'residential') {
                let dx = 0; let dy = 0;
                if (window.keys.w) dy -= speed;
                if (window.keys.s) dy += speed;
                if (window.keys.a) dx -= speed;
                if (window.keys.d) dx += speed;

                if (dx !== 0 || dy !== 0) {
                    resX += dx; resY += dy;
                    resX = Math.max(0, Math.min(resX, 750));
                    resY = Math.max(300, Math.min(resY, 550));
                    updatePlayer();
                }
            }
            requestAnimationFrame(resLoop);
        }
        requestAnimationFrame(resLoop);
    }

    // Modal start button — only for first coastal crisis popup
    const btnStart = document.getElementById('btn-start-mission');
    if (btnStart) {
        btnStart.onclick = () => {
            Modal.hide('modal-map-alert');
            initMap();
            document.getElementById('map-coastal').click();
        };
    }

    // Trigger crisis alert ONCE — only for first entry (Coastal area)
    if (!GameState.coastalAlertShown && !GameState.allTasksDone()) {
        GameState.coastalAlertShown = true;
        setTimeout(() => {
            if (GameState.phase === 'residential') {
                triggerAlarm();
                setTimeout(() => Modal.show('modal-map-alert'), 2000);
            }
        }, 2000);
    } else if (GameState.allTasksDone() && !GameState.agriAlertShown && (!GameState.agriCompleted || !GameState.indCompleted)) {
        // After coastal done — use a Toast (no second modal popup)
        GameState.agriAlertShown = true;
        setTimeout(() => {
            if (GameState.phase === 'residential') {
                Toast.show('🚨 New crisis zones detected! Check Agricultural & Industrial areas on the map.', '', 5000);
            }
        }, 1200);
    }
}

let mapControllerActive = false;

function initMap() {
    if (mapControllerActive) return;
    mapControllerActive = true;

    const areas = document.querySelectorAll('.mini-map-content .map-area');
    areas.forEach(area => {
        area.onclick = () => {
            enterArea(area.dataset.area);
        };
    });

    function enterArea(areaName) {
        if (areaName === 'coastal') {
            if (!GameState.allTasksDone()) {
                showMissionIntro('Coastal Area',
                    'A pollution crisis has been detected in the Coastal Area! Complete all tasks to restore environmental balance.',
                    () => {
                        GameState.currentArea = areaName;
                        TodoPanel.show();
                        GameState.phase = 'task1';
                        SceneManager.show('scene-task1', () => initTask1());
                    }
                );
            } else {
                Toast.show('Coastal Area is already safe!', '✅', 2000);
            }
        } else if (areaName === 'agricultural') {
            if (GameState.allTasksDone() && !GameState.agriCompleted) {
                showMissionIntro('Agricultural Area',
                    'Pollution detected in the Agricultural Area. Excess nutrients are affecting water quality.',
                    () => {
                        GameState.currentArea = areaName;
                        TodoPanel.show();
                        document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>Identify pollution source`;
                        document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>Apply buffer strips`;
                        document.getElementById('todo-2').style.display = 'none';
                        document.getElementById('todo-3').style.display = 'none';
                        document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                        document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');

                        GameState.phase = 'agri1';
                        SceneManager.show('scene-agri-task1', () => initAgriTask1());
                    }
                );
            } else if (GameState.agriCompleted) {
                Toast.show('Agricultural Area is already safe!', '✅', 2000);
            } else {
                Toast.show('Solve Coastal Area first!', '🔒', 2000);
            }
        } else if (areaName === 'industrial') {
            if (GameState.allTasksDone() && !GameState.indCompleted) {
                showMissionIntro('Industrial Area',
                    'Pollution detected in the Industrial Area. Untreated wastewater is being released into the river.',
                    () => {
                        GameState.currentArea = areaName;
                        // Switch to factory ambience for Industrial area
                        Audio.stopBg();
                        Audio.play('ambient_factory', { volume: 0.4, loop: true });
                        TodoPanel.show();
                        document.getElementById('todo-0').innerHTML = `<span class="todo-check"></span>Identify pollution source`;
                        document.getElementById('todo-1').innerHTML = `<span class="todo-check"></span>Stop direct discharge`;
                        document.getElementById('todo-2').innerHTML = `<span class="todo-check"></span>Treat wastewater before release`;
                        document.getElementById('todo-2').style.display = 'flex';
                        document.getElementById('todo-3').style.display = 'none';
                        document.querySelectorAll('.todo-item').forEach(el => el.classList.remove('done'));
                        document.querySelectorAll('.todo-check').forEach(el => el.textContent = '');

                        GameState.phase = 'ind1';
                        SceneManager.show('scene-ind-task1', () => initIndTask1());
                    }
                );
            } else if (GameState.indCompleted) {
                Toast.show('Industrial Area is already safe!', '✅', 2000);
            } else {
                Toast.show('Solve Coastal Area first!', '🔒', 2000);
            }
        } else if (areaName === 'residential') {
            GameState.phase = 'residential';
            SceneManager.show('scene-residential', () => {
                initResidential();
                checkAllAreasDone();
            });
        } else {
            Toast.show('Area is locked.', '🔒', 2000);
        }
    }

    function showMissionIntro(title, body, onStart) {
        document.getElementById('mission-intro-title').textContent = title;
        document.getElementById('mission-intro-body').innerHTML = body;
        Modal.show('modal-mission-intro');
        const btn = document.getElementById('btn-mission-start');
        btn.onclick = () => {
            Modal.hide('modal-mission-intro');
            onStart();
        };
    }
}

// ============================================
// SCENE: TASK 1 — SAVE TRAPPED ANIMAL
// ============================================
function initTask1() {
    if (GameState.phase !== 'task1') return;
    const instructionEl = document.getElementById('t1-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Click the turtle to free it from plastic entanglement', 40);
    let isHelping = false;
    let progressInterval = null;

    const turtleContainer = document.getElementById('turtle-container');
    const progressBar = document.getElementById('help-progress');
    const progressFill = document.getElementById('help-progress-fill');
    const helpLabel = document.getElementById('help-label');

    turtleContainer.onclick = (e) => {
        if (isHelping) return;
        isHelping = true;

        progressBar.style.display = 'block';
        helpLabel.style.display = 'block';
        helpLabel.textContent = 'Helping... keep clicking!';

        // Particle effect
        Particles.burst(e.clientX, e.clientY, 6, ['🤲', '💚', '✨']);
        // Play net cutting SFX
        Audio.play('net_cut', { volume: 0.7 });

        let progress = 0;
        progressInterval = setInterval(() => {
            progress += 20;
            progressFill.style.width = progress + '%';

            if (progress >= 100) {
                clearInterval(progressInterval);
                completeTask1();
            }
        }, 300);
    };

    function completeTask1() {
        // Animate turtle freed
        const turtleSvg = document.getElementById('turtle-svg-main');
        const net = document.getElementById('plastic-net-overlay');
        const eyesSad = document.getElementById('turtle-eyes-sad');
        const eyesHappy = document.getElementById('turtle-eyes-happy');

        if (turtleSvg) {
            turtleSvg.classList.add('turtle-free');
            turtleSvg.style.transition = 'transform 1.5s ease, filter 1.5s ease';
            turtleSvg.style.transform = 'translateY(-40px) scale(1.1)';
            turtleSvg.style.filter = 'drop-shadow(0 15px 30px rgba(82, 201, 122, 0.8))';
        }

        if (net) {
            net.style.opacity = '0';
            net.style.transform = 'translateY(50px) rotate(20deg)';
        }

        if (eyesSad && eyesHappy) {
            eyesSad.classList.add('hidden');
            eyesHappy.classList.remove('hidden');
        }

        document.getElementById('help-label').textContent = '🐢 Animal freed!';

        setTimeout(() => {
            GameState.updateBio(10);
            GameState.completeTask(0);
            Audio.play('task_complete', { volume: 0.8 });
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 12, ['🐢', '💚', '✨', '🌊']);
            Toast.show('Good action! Biodiversity improved.', '🦋 Biodiversity +10', 3000);

            showContinueModal(
                'Task 1 Completed',
                'Great! Marine animal saved. Continue to Task 2: Clean beach plastic.',
                'Next Task →',
                goToTask2
            );
        }, 1000);
    }

    function goToTask2() {
        GameState.phase = 'task2';
        SceneManager.show('scene-task2', () => {
            initTask2();
        });
    }
}

// ============================================
// SCENE: TASK 2 — CLEAN BEACH PLASTIC
// ============================================
function initTask2() {
    if (GameState.phase !== 'task2') return;
    const instructionEl = document.getElementById('t2-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Click each trash item to collect it', 40);
    const trashItems = [
        { emoji: '🧴', x: 6, y: 52 },
        { emoji: '🥤', x: 18, y: 75 },
        { emoji: '🛍️', x: 30, y: 58 },
        { emoji: '🧃', x: 46, y: 82 },
        { emoji: '🍶', x: 60, y: 55 },
        { emoji: '🥡', x: 72, y: 70 },
        { emoji: '🧴', x: 84, y: 62 },
        { emoji: '🪣', x: 38, y: 68 }
    ];

    let collected = 0;
    const total = trashItems.length;
    const scene = document.getElementById('beach-scene-content');
    if (!scene) {
        console.error('Task2 init failed: #beach-scene-content not found');
        return;
    }

    // Clean stale trash items if task re-initialized
    scene.querySelectorAll('.trash-item').forEach((el) => el.remove());

    // Create trash items
    trashItems.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'trash-item';
        el.id = `trash-${index}`;
        el.textContent = item.emoji;
        el.style.left = item.x + '%';
        el.style.top = item.y + '%';
        el.style.animationDelay = (index * 0.3) + 's';
        el.addEventListener('click', () => collectTrash(el, index));
        scene.appendChild(el);
    });

    updateCounter();

    function collectTrash(el, index) {
        if (el.classList.contains('collected')) return;
        el.classList.add('collected');
        // Trash pickup SFX instead of generic click_success
        Audio.play('trash_pickup', { volume: 0.7 });
        Particles.burst(
            el.getBoundingClientRect().left + 20,
            el.getBoundingClientRect().top + 20,
            4, ['✨', '💚']
        );

        collected++;
        updateCounter();

        if (collected >= total) {
            setTimeout(completeTask2, 800);
        }
    }

    function updateCounter() {
        const counter = document.getElementById('beach-counter');
        if (counter) counter.textContent = `🗑️ ${collected} / ${total} cleaned`;
    }

    function completeTask2() {
        GameState.updateWater(10);
        GameState.updateBio(5);
        GameState.completeTask(1);
        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌊', '✨', '💧', '🌿']);
        Toast.show('Beach cleaned successfully!', '💧 Water Quality +10  🦋 Biodiversity +5', 3500);

        // Shake trash bin
        const bin = document.getElementById('trash-bin');
        if (bin) bin.classList.add('shake');

        showContinueModal(
            'Task 2 Completed',
            'Beach cleaned successfully. Continue to Task 3: Stop oil leak source.',
            'Next Task →',
            () => {
                GameState.phase = 'task3';
                SceneManager.show('scene-task3', () => {
                    initTask3();
                });
            }
        );
    }
}

// ============================================
// SCENE: TASK 3 — STOP OIL LEAK
// ============================================
function initTask3() {
    if (GameState.phase !== 'task3') return;

    // Start underwater ambience for this scene
    Audio.stopBg();
    Audio.play('ambient_underwater', { volume: 0.5, loop: true });

    const instructionEl = document.getElementById('t3-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Apply glue on all 4 edges of the patch plate, then drag it to the crack!', 35);

    // ── STEP 1: Glue all 4 edges ──────────────────────────────────────
    const edges = ['top', 'right', 'bottom', 'left'];
    const glued = new Set();
    const hintEl = document.getElementById('t3-glue-hint');

    edges.forEach(edgeName => {
        const el = document.getElementById(`t3-edge-${edgeName}`);
        if (!el) return;
        el.addEventListener('click', () => {
            if (glued.has(edgeName)) return;
            glued.add(edgeName);
            el.classList.add('glued');
            el.textContent = '✔ GLUED';
            // Glue squish SFX would be ideal; use metal_snap as close alternative since no glue_squish in assets
            Audio.play('click_success', { volume: 0.5 });
            Particles.burst(el.getBoundingClientRect().left + 12, el.getBoundingClientRect().top + 12, 4, ['✨', '🟡']);

            if (hintEl) hintEl.textContent = `Apply glue (${glued.size}/4)`;

            if (glued.size === 4) {
                setTimeout(startStep2, 600);
            }
        });
    });

    // ── STEP 2: Drag glued plate to crack ────────────────────────────
    function startStep2() {
        const gluePanel = document.getElementById('t3-glue-panel');
        if (gluePanel) gluePanel.classList.add('hidden');

        const plate = document.getElementById('t3-draggable-plate');
        if (!plate) return;
        plate.classList.remove('hidden');

        if (instructionEl) typeWriter(instructionEl, 'Now drag the patch plate to the crack on the pipe!', 40);

        // Drag logic
        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        plate.addEventListener('mousedown', (e) => {
            isDragging = true;
            const rect = plate.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            plate.style.transition = 'none';
            plate.style.right = 'unset';
            plate.style.transform = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Touch support
        plate.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = plate.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            plate.style.transition = 'none';
            plate.style.right = 'unset';
            plate.style.transform = 'none';
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);

        function movePlateTo(clientX, clientY) {
            if (!isDragging) return;
            plate.style.left = (clientX - offsetX) + 'px';
            plate.style.top = (clientY - offsetY) + 'px';
        }

        function onMouseMove(e) { movePlateTo(e.clientX, e.clientY); }
        function onTouchMove(e) {
            e.preventDefault();
            movePlateTo(e.touches[0].clientX, e.touches[0].clientY);
        }

        function checkDrop(clientX, clientY) {
            isDragging = false;
            const dropzone = document.getElementById('t3-dropzone');
            if (!dropzone) return;
            const dz = dropzone.getBoundingClientRect();
            const px = clientX;
            const py = clientY;
            // Did the plate's center land inside/near the dropzone?
            if (px > dz.left - 30 && px < dz.right + 30 && py > dz.top - 30 && py < dz.bottom + 30) {
                // Snap plate to dropzone
                plate.style.transition = 'all 0.4s ease';
                plate.style.left = dz.left + 'px';
                plate.style.top = dz.top + 'px';
                plate.style.width = dz.width + 'px';
                plate.style.height = dz.height + 'px';
                cleanup();
                setTimeout(sealPipe, 500);
            }
        }

        function onMouseUp(e) { checkDrop(e.clientX, e.clientY); }
        function onTouchEnd(e) {
            const touch = e.changedTouches[0];
            checkDrop(touch.clientX, touch.clientY);
        }

        function cleanup() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            plate.onmousedown = null;
            plate.ontouchstart = null;
        }
    }

    // ── Seal pipe animation & complete ───────────────────────────────
    function sealPipe() {
        // Stop oil plume
        const plume = document.getElementById('oil-drop-anim');
        if (plume) plume.style.display = 'none';

        // Hide dropzone
        const dz = document.getElementById('t3-dropzone');
        if (dz) dz.style.display = 'none';

        // Show fixed indicator
        const fixed = document.getElementById('pipe-fixed-indicator');
        if (fixed) fixed.classList.remove('hidden');

        // Progress bar animation
        const bar = document.getElementById('fix-progress');
        const fill = document.getElementById('fix-progress-fill');
        if (bar && fill) {
            bar.classList.remove('hidden');
            let p = 0;
            const iv = setInterval(() => {
                p += 20;
                fill.style.width = p + '%';
                if (p >= 100) {
                    clearInterval(iv);
                    completeTask3();
                }
            }, 180);
        } else {
            completeTask3();
        }
    }

    function completeTask3() {
        // Stop underwater ambience when leaving this scene
        Audio.stopBg();
        GameState.completeTask(2);
        Audio.play('task_complete', { volume: 0.8 });
        // Play metal_snap for the satisfying pipe-sealed moment
        Audio.play('metal_snap', { volume: 0.7 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 12, ['🔧', '✅', '✨', '🌊']);
        Toast.show('Leak successfully contained!', '🔧 Oil leak stopped', 3000);
        if (instructionEl) instructionEl.textContent = '✅ Pipe sealed successfully!';

        showContinueModal(
            'Task 3 Completed',
            'Great work! The oil leak has been patched. Continue to Task 4: Clean the oil spill.',
            'Next Task →',
            () => {
                GameState.phase = 'task4';
                SceneManager.show('scene-task4', () => { initTask4(); });
            }
        );
    }
}



// ============================================
// SCENE: TASK 4 — CLEAN OIL SPILL (DECISION)
// ============================================
function initTask4() {
    if (GameState.phase !== 'task4') return;
    const instructionEl = document.getElementById('t4-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Choose a method to clean up the oil spill', 40);

    const stepIndicator = document.getElementById('t4-step-indicator');
    const instruction = document.getElementById('t4-instruction');
    const methodSelection = document.getElementById('t4-method-selection');
    const btnMethodA = document.getElementById('btn-method-a');
    const btnMethodB = document.getElementById('btn-method-b');
    const oilBlob = document.getElementById('t4-oil-blob');
    const oceanContainer = document.getElementById('t4-ocean-container');
    const resultCard = document.getElementById('t4-result-card');

    btnMethodA.onclick = () => startMethodA();
    btnMethodB.onclick = () => startMethodB();

    // ==========================================
    // METHOD A: IN-SITU BURNING
    // ==========================================
    function startMethodA() {
        methodSelection.classList.add('hidden');
        GameState.task4Choice = 'burning';

        // Step 1: Localize
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 1/3 — Containment';
        typeWriter(instruction, 'Draw a containment boom around the oil spill!', 30);

        const canvas = document.getElementById('t4-boom-canvas');
        canvas.classList.remove('hidden');
        // Use getBoundingClientRect for accurate sizing after layout
        const rect = oceanContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        let isDrawing = false;
        let points = [];

        canvas.onmousedown = (e) => {
            e.preventDefault();
            isDrawing = true;
            const cr = canvas.getBoundingClientRect();
            points = [{ x: e.clientX - cr.left, y: e.clientY - cr.top }];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        canvas.onmousemove = (e) => {
            if (!isDrawing) return;
            const cr = canvas.getBoundingClientRect();
            points.push({ x: e.clientX - cr.left, y: e.clientY - cr.top });
            drawPath(ctx, points, true);
        };

        canvas.onmouseup = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };

        // Also handle mouse leaving canvas while drawing
        canvas.onmouseleave = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };

        // For touch support
        canvas.ontouchstart = (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const cr = canvas.getBoundingClientRect();
            isDrawing = true;
            points = [{ x: touch.clientX - cr.left, y: touch.clientY - cr.top }];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };
        canvas.ontouchmove = (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            const touch = e.touches[0];
            const cr = canvas.getBoundingClientRect();
            points.push({ x: touch.clientX - cr.left, y: touch.clientY - cr.top });
            drawPath(ctx, points, true);
        };
        canvas.ontouchend = (e) => {
            e.preventDefault();
            if (!isDrawing) return;
            isDrawing = false;
            checkBoomSuccess(ctx, points);
        };
    }

    function drawPath(ctx, points, isDashed) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 4;
        ctx.setLineDash(isDashed ? [10, 10] : []);
        ctx.stroke();
    }

    function checkBoomSuccess(ctx, points) {
        if (points.length < 8) return;
        const first = points[0];
        const last = points[points.length - 1];
        const dist = Math.hypot(last.x - first.x, last.y - first.y);

        // Bounding box of drawn path
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        points.forEach(p => {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
        });

        const cw = ctx.canvas.width;
        const ch = ctx.canvas.height;
        // Oil blob center is at 50%,50% of ocean container
        const cx = cw / 2;
        const cy = ch / 2;
        // Loop must: be closed (start~end within 80px), span must enclose blob center
        const spanX = maxX - minX;
        const spanY = maxY - minY;
        const closed = dist < 80;
        const enclosesOil = minX < cx && maxX > cx && minY < cy && maxY > cy;
        const bigEnough = spanX > 60 && spanY > 40;

        if (closed && enclosesOil && bigEnough) {
            // Success — draw solid boom
            drawPath(ctx, points, false);
            // Draw success checkmark text
            ctx.fillStyle = '#ff9800';
            ctx.font = 'bold 18px Exo 2, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✔ Boom Deployed!', cx, cy - 90);

            const canvas = document.getElementById('t4-boom-canvas');
            canvas.onmousedown = canvas.onmousemove = canvas.onmouseup = canvas.onmouseleave = null;
            canvas.ontouchstart = canvas.ontouchmove = canvas.ontouchend = null;

            typeWriter(instruction, '✔ Boom deployed! Oil contained.', 30);
            setTimeout(() => methodA_Step2(), 1200);
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            if (!closed) {
                typeWriter(instruction, 'Loop not closed! Bring the line back to start. Try again!', 30);
            } else if (!enclosesOil) {
                typeWriter(instruction, 'Loop missed the oil spill! Draw around the dark blob. Try again!', 30);
            } else {
                typeWriter(instruction, 'Loop too small! Draw a bigger circle. Try again!', 30);
            }
        }
    }

    function methodA_Step2() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 2/3 — Ignition';
        typeWriter(instruction, 'The oil is contained. Click IGNITE to start controlled burning!', 30);

        const igniteBtn = document.getElementById('btn-t4-ignite');
        igniteBtn.classList.remove('hidden');

        igniteBtn.onclick = () => {
            igniteBtn.classList.add('hidden');
            typeWriter(instruction, '🔥 Burning in progress...', 30);

            // Get viewport coords of ocean container center for particles
            const rect = oceanContainer.getBoundingClientRect();
            const vcx = rect.left + rect.width / 2;
            const vcy = rect.top + rect.height / 2;

            // Fire particles at correct viewport coordinates
            Particles.burst(vcx, vcy, 20, ['🔥', '💨', '🔥']);
            // Start fire burning sound and keep reference to stop it later
            const fireSfx = Audio.play('fire_burning', { volume: 0.6, loop: true });

            // Stop CSS animation then shrink oil blob
            oilBlob.style.animation = 'none';
            oilBlob.style.transition = 'transform 2.5s ease-out, opacity 2.5s ease-out';
            // Small delay so transition kicks in after animation:none
            setTimeout(() => {
                oilBlob.style.transform = 'translate(-50%, -50%) scale(0.05)';
                oilBlob.style.opacity = '0';
            }, 30);

            // Progress Bar
            const progContainer = document.getElementById('t4-action-progress-container');
            const progBar = document.getElementById('t4-action-progress-bar');
            progBar.style.width = '0%';
            progBar.style.background = 'linear-gradient(90deg, #ff9800, #ffeb3b)';
            progContainer.classList.remove('hidden');

            let prog = 0;
            const interval = setInterval(() => {
                prog += 4;
                progBar.style.width = prog + '%';

                // Random fire/smoke bursts at viewport coords
                if (Math.random() > 0.6) {
                    const offsetX = (Math.random() * 80) - 40;
                    const offsetY = (Math.random() * 40) - 60;
                    Particles.burst(vcx + offsetX, vcy + offsetY, 2, ['🔥', '💨']);
                }

                if (prog >= 100) {
                    clearInterval(interval);
                    // Stop fire looping sound when burning is done
                    if (fireSfx) { fireSfx.pause(); fireSfx.currentTime = 0; }
                    progContainer.classList.add('hidden');
                    methodA_Step3();
                }
            }, 100);
        };
    }

    function methodA_Step3() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 3/3 — Result';
        typeWriter(instruction, 'Cleanup complete.', 30);
        oceanContainer.style.background = 'linear-gradient(180deg, #0a4f7a 0%, #0d3a5c 100%)';

        resultCard.classList.remove('hidden');
        document.getElementById('t4-result-icon').textContent = '✅';
        document.getElementById('t4-result-title').textContent = 'Oil successfully removed by combustion.';
        document.getElementById('t4-r-water').textContent = '+25';
        document.getElementById('t4-r-bio').textContent = '+5';
        document.getElementById('t4-result-info').textContent = 'In-situ burning physically removes oil from the water surface. Some air pollution occurs but marine ecosystem impact is minimal.';

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('burning');
    }

    // ==========================================
    // METHOD B: COREXIT DISPERSANT
    // ==========================================
    function startMethodB() {
        methodSelection.classList.add('hidden');
        GameState.task4Choice = 'chemical';

        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 1/3 — Surface Spraying';
        typeWriter(instruction, 'Drag the boat across the oil spill to spray dispersant!', 30);

        const boat = document.getElementById('t4-boat');
        const canvas = document.getElementById('t4-spray-canvas');
        boat.classList.remove('hidden');
        canvas.classList.remove('hidden');

        // Use getBoundingClientRect for accurate sizing
        const rect = oceanContainer.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const ctx = canvas.getContext('2d');

        // Reset boat pos — use left/top without transform offset
        // Boat CSS has transform: translate(-50%,-50%) so left/top is its center
        let boatX = canvas.width / 2;
        let boatY = canvas.height * 0.7;
        boat.style.left = boatX + 'px';
        boat.style.top = boatY + 'px';

        let isDragging = false;
        let coverage = 0;
        let done = false;

        const progContainer = document.getElementById('t4-action-progress-container');
        const progBar = document.getElementById('t4-action-progress-bar');
        progBar.style.width = '0%';
        progBar.style.background = 'linear-gradient(90deg, #9c27b0, #ce93d8)';
        progContainer.classList.remove('hidden');

        function stopB1() {
            done = true;
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            boat.ontouchstart = boat.ontouchmove = boat.ontouchend = null;
            boat.onmousedown = null;
            typeWriter(instruction, '✔ Surface spraying complete!', 30);
            progContainer.classList.add('hidden');
            setTimeout(() => methodB_Step2(), 1000);
        }

        function updateCoverage(bx, by) {
            // Draw spray circle on canvas
            ctx.fillStyle = 'rgba(156, 39, 176, 0.18)';
            ctx.beginPath();
            ctx.arc(bx, by, 25, 0, Math.PI * 2);
            ctx.fill();
            // Add a bright center dot
            ctx.fillStyle = 'rgba(206, 147, 216, 0.4)';
            ctx.beginPath();
            ctx.arc(bx, by, 8, 0, Math.PI * 2);
            ctx.fill();

            // Coverage increases when dragging near the oil (center area)
            const distFromCenter = Math.hypot(bx - canvas.width / 2, by - canvas.height / 2);
            if (distFromCenter < 130) {
                coverage += 0.8;
                progBar.style.width = Math.min(coverage, 100) + '%';
                if (coverage >= 100 && !done) stopB1();
            }
        }

        function onMouseMove(e) {
            if (!isDragging || done) return;
            const r = oceanContainer.getBoundingClientRect();
            boatX = e.clientX - r.left;
            boatY = e.clientY - r.top;
            // Clamp inside container
            boatX = Math.max(0, Math.min(canvas.width, boatX));
            boatY = Math.max(0, Math.min(canvas.height, boatY));
            boat.style.left = boatX + 'px';
            boat.style.top = boatY + 'px';
            updateCoverage(boatX, boatY);
        }
        function onMouseUp() { isDragging = false; }

        boat.onmousedown = (e) => { e.preventDefault(); isDragging = true; };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Touch support
        boat.ontouchstart = (e) => { e.preventDefault(); isDragging = true; };
        boat.ontouchmove = (e) => {
            e.preventDefault();
            if (!isDragging || done) return;
            const touch = e.touches[0];
            const r = oceanContainer.getBoundingClientRect();
            boatX = Math.max(0, Math.min(canvas.width, touch.clientX - r.left));
            boatY = Math.max(0, Math.min(canvas.height, touch.clientY - r.top));
            boat.style.left = boatX + 'px';
            boat.style.top = boatY + 'px';
            updateCoverage(boatX, boatY);
        };
        boat.ontouchend = () => { isDragging = false; };
    }

    function methodB_Step2() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 2/3 — Submarine Injection';
        typeWriter(instruction, 'Click the injection point 3 times to inject dispersant into the leak source!', 30);

        document.getElementById('t4-boat').classList.add('hidden');
        document.getElementById('t4-spray-canvas').classList.add('hidden');
        // Hide surface oil blob — transitioning to underwater view
        oilBlob.classList.add('hidden');

        // Hide & reset progress bar from step 1
        const progContainer = document.getElementById('t4-action-progress-container');
        const progBar = document.getElementById('t4-action-progress-bar');
        progContainer.classList.add('hidden');
        progBar.style.width = '0%';

        const uwScene = document.getElementById('t4-underwater-scene');
        uwScene.classList.remove('hidden');

        const injectTarget = document.getElementById('t4-inject-target');
        const counter = document.getElementById('t4-inject-counter');
        counter.textContent = 'Injections: 0/3';

        let clicks = 0;
        injectTarget.onclick = () => {
            clicks++;
            counter.textContent = `Injections: ${clicks}/3`;

            // Animate inject target briefly
            injectTarget.style.background = 'rgba(156,39,176,0.4)';
            setTimeout(() => { injectTarget.style.background = ''; }, 300);

            // Particles at viewport coords of the inject target
            const r = injectTarget.getBoundingClientRect();
            const vx = r.left + r.width / 2;
            const vy = r.top + r.height / 2;
            Particles.burst(vx, vy, 6, ['🫧', '💧', '🟣']);
            Audio.play('chemical_spray', { volume: 0.5 });

            if (clicks >= 3) {
                injectTarget.onclick = null;
                injectTarget.style.animation = 'none';
                injectTarget.style.borderColor = '#4caf50';
                typeWriter(instruction, '✔ Injection complete. Dispersant deployed!', 30);
                setTimeout(() => methodB_Step3(), 1200);
            }
        };
    }

    function methodB_Step3() {
        if (stepIndicator) stepIndicator.textContent = 'Task 4: Step 3/3 — Result';
        typeWriter(instruction, 'Cleanup complete.', 30);

        // Show sick fish
        const fishContainer = document.getElementById('t4-fish-container');
        fishContainer.classList.remove('hidden');
        fishContainer.innerHTML = `
            <div class="fish-sick" style="top: 30%; left: 30%;">🐟</div>
            <div class="fish-sick" style="top: 50%; left: 70%; animation-delay: 0.5s;">🐠</div>
            <div class="fish-sick" style="top: 70%; left: 40%; animation-delay: 1s;">🐡</div>
        `;

        resultCard.classList.remove('hidden');
        document.getElementById('t4-result-icon').textContent = '⚠️';
        document.getElementById('t4-result-title').textContent = 'Oil dispersed — but not removed.';

        document.getElementById('t4-r-water').textContent = '+20';

        const bioSpan = document.getElementById('t4-r-bio');
        bioSpan.textContent = '−15';
        bioSpan.classList.add('negative');

        const warning = document.getElementById('t4-result-warning');
        warning.classList.remove('hidden');
        warning.innerHTML = 'Chemical dispersants break oil into tiny droplets that remain in the water column, making them more accessible to marine life. Toxic to fish, coral, and plankton.';

        document.getElementById('t4-result-info').textContent = 'Used in Deepwater Horizon (2010) — still debated by scientists.';

        document.getElementById('btn-t4-complete').onclick = () => finishTask4('chemical');
    }

    function finishTask4(method) {
        if (method === 'burning') {
            GameState.updateWater(25);
            GameState.updateBio(5);
            Audio.play('task_complete', { volume: 0.8 });
        } else {
            GameState.updateWater(20);
            GameState.updateBio(-15);
            Audio.play('task_complete', { volume: 0.8 });
        }

        GameState.completeTask(3);

        showContinueModal(
            'Coastal Area Saved',
            'You have completed all tasks in the Coastal Area! Return to the Residential Area.',
            'Return to World',
            () => {
                GameState.phase = 'residential';
                SceneManager.show('scene-residential', () => initResidential());
            }
        );
    }
}

// ============================================
// SCENE: AGRICULTURAL TASK 1
// ============================================
function initAgriTask1() {
    if (GameState.phase !== 'agri1') return;
    const instructionEl = document.getElementById('agri1-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Scan the farm area to find the source of pollution.', 40);

    const scanArea = document.getElementById('farm-scan-area');
    const progBar = document.getElementById('scan-progress');
    const progFill = document.getElementById('scan-progress-fill');
    const typingText = document.getElementById('agri-typing-text');
    const nextBtn = document.getElementById('btn-agri1-next');
    const runoffAnim = document.getElementById('runoff-anim-layer');

    let isScanning = false;
    let scanProgress = 0;

    scanArea.onclick = (e) => {
        if (isScanning) return;
        isScanning = true;
        scanArea.classList.remove('alert-pulse');
        scanArea.style.borderColor = 'var(--teal)';

        progBar.style.display = 'block';
        Particles.burst(e.clientX, e.clientY, 5, ['🔎', '✨']);
        Audio.play('click_success', { volume: 0.5 });

        runoffAnim.classList.remove('hidden');

        const interval = setInterval(() => {
            scanProgress += 20;
            progFill.style.width = scanProgress + '%';

            if (scanProgress >= 100) {
                clearInterval(interval);
                completeAgri1();
            }
        }, 400);
    };

    function completeAgri1() {
        progBar.style.display = 'none';
        scanArea.style.display = 'none';

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';
        const msg = "Fertilizers from farms are flowing into the water. These nutrients can pollute water and harm the ecosystem.";

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    Toast.show('Source identified.', '☑', 3000);
                    Audio.play('task_complete', { volume: 0.8 });
                    GameState.completeTask(0, true);
                    nextBtn.classList.remove('hidden');
                }, 1000);
            }
        }, 50);
    }

    nextBtn.onclick = () => {
        GameState.phase = 'agri2';
        SceneManager.show('scene-agri-task2', () => initAgriTask2());
    };
}

// ============================================
// SCENE: AGRICULTURAL TASK 2
// ============================================
function initAgriTask2() {
    if (GameState.phase !== 'agri2') return;
    const instructionEl = document.getElementById('agri2-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Plant vegetation along the river to filter runoff.', 40);

    const slotsContainer = document.getElementById('plant-slots-container');
    const riverDirty = document.getElementById('agri2-river-dirty');
    const counter = document.getElementById('plant-counter');

    slotsContainer.innerHTML = '';
    const totalSlots = 8;
    let plantedCount = 0;

    const positions = [
        { x: 350, y: 150, type: '🌱' }, { x: 380, y: 220, type: '🌱' }, { x: 320, y: 280, type: '🌱' },
        { x: 420, y: 350, type: '🌿' }, { x: 390, y: 420, type: '🌿' }, { x: 450, y: 480, type: '🌿' },
        { x: 480, y: 550, type: '🌳' }, { x: 520, y: 580, type: '🌳' }
    ];

    positions.forEach((pos, idx) => {
        const slot = document.createElement('div');
        slot.className = 'plant-slot';
        slot.style.left = pos.x + 'px';
        slot.style.top = pos.y + 'px';

        slot.onclick = (e) => {
            if (slot.classList.contains('planted')) return;
            slot.classList.add('planted');
            slot.textContent = pos.type;

            Particles.burst(e.clientX, e.clientY, 4, ['✨', '💚', pos.type]);
            Audio.play('shovel_dig', { volume: 0.6 });

            plantedCount++;
            counter.textContent = `🌱 ${plantedCount} / ${totalSlots} planted`;

            const opacity = 0.8 - (plantedCount / totalSlots) * 0.8;
            riverDirty.style.opacity = opacity;

            if (plantedCount >= totalSlots) {
                setTimeout(completeAgri2, 800);
            }
        };
        slotsContainer.appendChild(slot);
    });

    function completeAgri2() {
        GameState.updateWater(15);
        GameState.updateBio(10);
        GameState.agriCompleted = true;
        GameState.completeTask(1, true);

        Audio.play('task_complete', { volume: 0.8 });
        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🌱', '🌊', '🦋']);
        Toast.show('Runoff successfully reduced.', '💧+15 🦋+10', 3500);

        showContinueModal(
            'Mission Complete',
            'Runoff successfully reduced. Return to the residential area.',
            'Return to World',
            () => {
                GameState.phase = 'residential';
                SceneManager.show('scene-residential', () => initResidential());
            }
        );
    }
}

// ============================================
// SCENE: INDUSTRIAL TASK 1
// ============================================
function initIndTask1() {
    if (GameState.phase !== 'ind1') return;
    const instructionEl = document.getElementById('ind1-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Locate the source of industrial wastewater.', 40);
    // ambient_factory is already playing (started by enterArea())

    const pipeArea = document.getElementById('ind-pipe-area');
    const typingText = document.getElementById('ind1-typing-text');
    const nextBtn = document.getElementById('btn-ind1-next');

    let isIdentified = false;

    pipeArea.onclick = (e) => {
        if (isIdentified) return;
        isIdentified = true;
        pipeArea.classList.remove('alert-pulse');
        pipeArea.style.borderColor = 'var(--teal)';

        Particles.burst(e.clientX, e.clientY, 5, ['🔎', '✨']);
        Audio.play('click_success', { volume: 0.5 });

        Toast.show('Source identified.', '☑', 3000);
        GameState.completeTask(0, true);

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';

        const msg1 = "Factories are releasing untreated waste into the water.";
        const msg2 = " Industrial waste may contain toxic chemicals and heavy metals.";
        const fullMsg = msg1 + msg2;

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += fullMsg.charAt(i);
            i++;
            if (i >= fullMsg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    nextBtn.classList.remove('hidden');
                }, 500);
            }
        }, 40);
    };

    nextBtn.onclick = () => {
        GameState.phase = 'ind2';
        SceneManager.show('scene-ind-task2', () => initIndTask2());
    };
}

// ============================================
// SCENE: INDUSTRIAL TASK 2
// ============================================
function initIndTask2() {
    if (GameState.phase !== 'ind2') return;
    const instructionEl = document.getElementById('ind2-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Fix the leaking pipe joint. Drag missing bolts and tighten all.', 40);

    const container = document.getElementById('ind2-bolts-container');
    const toolbox = document.getElementById('ind2-toolbox');
    const wrench = document.getElementById('ind2-wrench');
    const successMsg = document.getElementById('ind2-success-msg');
    const leakAnim = document.getElementById('ind2-leak-anim');

    container.innerHTML = '';
    toolbox.innerHTML = '';
    successMsg.classList.add('hidden');

    const slotPositions = [
        { x: 370, y: 240, hasBolt: true }, { x: 430, y: 240, hasBolt: false },
        { x: 370, y: 280, hasBolt: false }, { x: 430, y: 280, hasBolt: true },
        { x: 370, y: 320, hasBolt: true }, { x: 430, y: 320, hasBolt: false },
        { x: 370, y: 360, hasBolt: false }, { x: 430, y: 360, hasBolt: true }
    ];

    let boltsTightened = 0;

    // Create missing bolts in toolbox
    for (let i = 0; i < 4; i++) {
        const toolBolt = document.createElement('div');
        toolBolt.className = 'ind-bolt';
        toolBolt.textContent = '🔩';
        toolBolt.draggable = true;
        toolBolt.dataset.tool = 'true';

        toolBolt.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', 'bolt');
            setTimeout(() => toolBolt.style.opacity = '0.5', 0);
        };
        toolBolt.ondragend = () => {
            toolBolt.style.opacity = '1';
        };
        toolbox.appendChild(toolBolt);
    }

    // Create slots and pre-existing bolts
    slotPositions.forEach((pos, idx) => {
        const slot = document.createElement('div');
        slot.className = 'bolt-slot' + (pos.hasBolt ? ' filled' : '');
        slot.style.left = pos.x + 'px';
        slot.style.top = pos.y + 'px';

        if (pos.hasBolt) {
            const bolt = document.createElement('div');
            bolt.className = 'ind-bolt';
            bolt.textContent = '🔩';
            slot.appendChild(bolt);
        }

        slot.ondragover = (e) => {
            e.preventDefault();
        };
        slot.ondrop = (e) => {
            e.preventDefault();
            if (slot.children.length > 0) return;
            const data = e.dataTransfer.getData('text/plain');
            if (data === 'bolt') {
                const availableBolts = toolbox.querySelectorAll('.ind-bolt');
                if (availableBolts.length > 0) {
                    availableBolts[0].remove();
                    const bolt = document.createElement('div');
                    bolt.className = 'ind-bolt';
                    bolt.textContent = '🔩';
                    slot.appendChild(bolt);
                    slot.classList.add('filled');
                    Audio.play('click_success', { volume: 0.5 });
                }
            }
        };

        container.appendChild(slot);
    });

    let selectedWrench = false;
    wrench.onclick = () => {
        selectedWrench = !selectedWrench;
        wrench.style.background = selectedWrench ? '#2980b9' : '#222';
    };

    container.onclick = (e) => {
        if (!selectedWrench) return;
        const target = e.target;
        if (target.classList.contains('ind-bolt') && !target.classList.contains('tightened')) {
            target.classList.add('tightened');
            target.textContent = '✅';
            Audio.play('wrench_ratchet', { volume: 0.7 });
            Particles.burst(e.clientX, e.clientY, 4, ['🔧', '✨']);

            boltsTightened++;
            if (boltsTightened === 8) {
                completeInd2();
            }
        }
    };

    function completeInd2() {
        leakAnim.style.display = 'none';
        GameState.completeTask(1, true);
        Audio.play('task_complete', { volume: 0.8 });

        successMsg.classList.remove('hidden');
        successMsg.innerHTML = '';

        const msg = "Discharge successfully stopped.";
        let i = 0;
        const typeInterval = setInterval(() => {
            successMsg.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    GameState.phase = 'ind3';
                    SceneManager.show('scene-ind-task3', () => initIndTask3());
                }, 2000);
            }
        }, 50);
    }
}

// ============================================
// SCENE: INDUSTRIAL TASK 3 - WASTEWATER TREATMENT WITH INTERACTIVE MECHANICS
// ============================================
function initIndTask3() {
    if (GameState.phase !== 'ind3') return;
    const instructionEl = document.getElementById('ind3-instruction');
    if (instructionEl) typeWriter(instructionEl, 'Choose a method to treat the remaining wastewater.', 40);

    const btn1 = document.getElementById('btn-ind-method1');
    const btn2 = document.getElementById('btn-ind-method2');
    const btn3 = document.getElementById('btn-ind-method3');
    const methodSelection = document.getElementById('ind3-method-selection');
    const gameplayArea = document.getElementById('ind3-gameplay-area');
    const typingText = document.getElementById('ind3-typing-text');
    const nextBtn = document.getElementById('btn-ind3-next');
    const poolMain = document.getElementById('ind3-pool-main');
    const poolClean = document.getElementById('ind3-pool-clean');

    let methodChosen = false;

    function showGameplay(method) {
        if (methodChosen) return;
        methodChosen = true;
        methodSelection.style.display = 'none';
        gameplayArea.classList.remove('hidden');
        gameplayArea.style.display = 'flex';

        if (method === 'filtration') initFiltrationGame();
        else if (method === 'chemical') initChemicalGame();
        else if (method === 'bacteria') initBacteriaGame();
    }

    // -------- FILTRATION MECHANIC --------
    function initFiltrationGame() {
        const filtrationArea = document.getElementById('ind3-filtration-area');
        filtrationArea.classList.remove('hidden');
        filtrationArea.style.display = 'flex';

        const layers = document.querySelectorAll('#ind3-filtration-area .ind-filter-layer');
        let clickedLayers = 0;

        layers.forEach((layer, idx) => {
            if (idx === 0) {
                layer.style.display = 'flex';
            }
            layer.onclick = () => {
                if (layer.classList.contains('completed')) return;
                layer.classList.add('completed');
                layer.style.opacity = '0.5';
                clickedLayers++;

                // Layer 1 = gravel (stone_grind), layer 2 = sand (sand_pour), layer 3 = charcoal (stone_grind)
                if (idx === 0 || idx === 2) {
                    Audio.play('stone_grind', { volume: 0.6 });
                } else {
                    Audio.play('sand_pour', { volume: 0.6 });
                }
                Particles.burst(layer.getBoundingClientRect().left + 35, layer.getBoundingClientRect().top + 45, 8, ['✨', '💧']);

                if (idx < layers.length - 1) {
                    setTimeout(() => {
                        layers[idx + 1].style.display = 'flex';
                    }, 600);
                }

                // Update pool color gradually
                const progress = clickedLayers / 3;
                poolMain.style.fill = `rgb(${Math.round(139 - (139 - 46) * progress)}, ${Math.round(69 - (69 - 180) * progress)}, ${Math.round(19 + (180 - 19) * progress)})`;

                if (clickedLayers === 3) {
                    completeTreatment('filtration', 15, 0);
                }
            };
        });
    }

    // -------- CHEMICAL MECHANIC --------
    function initChemicalGame() {
        const chemicalArea = document.getElementById('ind3-chemical-area');
        chemicalArea.classList.remove('hidden');
        chemicalArea.style.display = 'flex';

        const bottle = document.getElementById('ind3-chemical-bottle');
        const poolMainRect = poolMain.getBoundingClientRect();
        const poolMainCenterX = poolMainRect.left + poolMainRect.width / 2;
        const poolMainCenterY = poolMainRect.top + poolMainRect.height / 2;

        let isDragging = false;
        let isDropped = false;

        bottle.ondragstart = (e) => {
            isDragging = true;
            e.dataTransfer.effectAllowed = 'move';
            bottle.style.opacity = '0.6';
        };

        bottle.ondragend = () => {
            isDragging = false;
            bottle.style.opacity = '1';
        };

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            if (!isDragging || isDropped) return;
            isDropped = true;

            const dropX = e.clientX;
            const dropY = e.clientY;
            const distance = Math.sqrt(
                Math.pow(dropX - poolMainCenterX, 2) +
                Math.pow(dropY - poolMainCenterY, 2)
            );

            if (distance < 120) {
                Audio.play('chemical_spray', { volume: 0.7 });
                // Liquid splash SFX when chemical hits pool
                Audio.play('liquid_splash', { volume: 0.6 });
                Particles.burst(poolMainCenterX, poolMainCenterY, 20, ['🧪', '✨', '💧']);

                // Animate pool clearing
                poolMain.style.fill = '#2ecc71';
                setTimeout(() => {
                    poolClean.style.fill = '#2ecc71';
                    completeTreatment('chemical', 20, 0);
                }, 1000);
            } else {
                isDropped = false;
                Toast.show('Drag the bottle to the treatment pool!', '🧪', 2000);
            }
        });
    }

    // -------- BACTERIA MECHANIC --------
    function initBacteriaGame() {
        const bacteriaArea = document.getElementById('ind3-bacteria-area');
        bacteriaArea.classList.remove('hidden');
        bacteriaArea.style.display = 'flex';

        const feedBtn = document.getElementById('ind3-bacteria-feed-btn');
        const bacteriaDisplay = document.getElementById('ind3-bacteria-display');
        const countSpan = document.getElementById('bacteria-feed-count');

        let feedCount = 0;
        const maxFeeds = 3;
        let feedInProgress = false;

        feedBtn.onclick = () => {
            if (feedInProgress || feedCount >= maxFeeds) return;
            feedInProgress = true;
            feedCount++;
            countSpan.textContent = maxFeeds - feedCount;

            // Bacteria bubble SFX when releasing cultures
            Audio.play('bacteria_bubble', { volume: 0.7 });

            // Add bacteria emoji
            bacteriaDisplay.innerHTML += '🦠';
            Particles.burst(bacteriaDisplay.getBoundingClientRect().left + 50, bacteriaDisplay.getBoundingClientRect().top + 40, 5, ['🦠', '✨']);

            // Update pool color
            const progress = feedCount / maxFeeds;
            poolMain.style.fill = `rgb(${Math.round(74 - (74 - 46) * progress)}, ${Math.round(124 - (124 - 180) * progress)}, ${Math.round(89 + (180 - 89) * progress)})`;

            setTimeout(() => {
                feedInProgress = false;
                if (feedCount === maxFeeds) {
                    feedBtn.disabled = true;
                    feedBtn.style.opacity = '0.5';

                    setTimeout(() => {
                        poolClean.style.fill = '#2ecc71';
                        Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['🦠', '✨', '🌿']);
                        completeTreatment('bacteria', 15, 15);
                    }, 1500);
                }
            }, 800);
        };
    }

    function completeTreatment(method, waterVal, bioVal) {
        gameplayArea.classList.add('hidden');
        GameState.updateWater(waterVal);
        GameState.updateBio(bioVal);

        if (bioVal > 0) {
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 25, ['🦠', '✨', '💧', '🌿', '🌱']);
        } else {
            Particles.burst(window.innerWidth / 2, window.innerHeight / 2, 15, ['✨', '💧', '💙']);
        }

        const resultCard = document.getElementById('ind3-result-card');
        if (resultCard) resultCard.classList.remove('hidden');

        typingText.classList.remove('hidden');
        typingText.innerHTML = '';

        const methodNames = { 'filtration': 'Filtration', 'chemical': 'Chemical Coagulation', 'bacteria': 'Bacterial Treatment' };
        const msg1 = `${methodNames[method]} complete. Water quality restored.`;
        const msg2 = bioVal > 0 ? ' Biodiversity improved!' : '';
        const fullMsg = msg1 + msg2;

        let i = 0;
        const typeInterval = setInterval(() => {
            typingText.innerHTML += fullMsg.charAt(i);
            i++;
            if (i >= fullMsg.length) {
                clearInterval(typeInterval);
                GameState.completeTask(2, true);
                GameState.indCompleted = true;
                nextBtn.classList.remove('hidden');
            }
        }, 40);
    }

    btn1.onclick = () => showGameplay('filtration');
    btn2.onclick = () => showGameplay('chemical');
    btn3.onclick = () => showGameplay('bacteria');

    nextBtn.onclick = () => {
        GameState.phase = 'residential';
        SceneManager.show('scene-residential', () => {
            initResidential();
            checkAllAreasDone();
        });
    };
}

function checkAllAreasDone() {
    if (GameState.allTasksDone() && GameState.agriCompleted && GameState.indCompleted) {
        setTimeout(() => {
            const resSvg = document.querySelector('.residential-bg-svg');
            if (resSvg) {
                const grass = resSvg.querySelector('path[fill="#2d9e4f"]');
                if (grass) grass.setAttribute('fill', '#2ecc71');
                const sky = resSvg.querySelector('rect[fill="#8ecae6"]');
                if (sky) sky.setAttribute('fill', '#3498db');
            }

            Toast.show('All pollution sources have been successfully managed.', '✅', 4000);

            setTimeout(() => {
                GameState.phase = 'reflection';
                SceneManager.show('scene-reflection', () => initReflection());
            }, 4000);
        }, 1000);
    }
}

// ============================================
// SCENE: REFLECTION
// ============================================
function initReflection() {
    if (GameState.phase !== 'reflection') return;

    Audio.stopBg();
    Audio.play('ambient_ocean', { volume: 0.6, loop: true });

    const bgSvg = document.querySelector('.reflection-bg-svg');
    bgSvg.style.transform = 'scale(1.2)';

    const textContainer = document.getElementById('reflection-text-container');

    const lines = [
        "Protecting water resources is a shared responsibility.",
        "Every action has an impact on the environment.",
        "The future of the ecosystem depends on the choices we make today."
    ];

    let currentLine = 0;

    function typeLine() {
        if (currentLine >= lines.length) {
            setTimeout(() => {
                Modal.show('modal-you-survived');

                document.getElementById('btn-final-play-again').onclick = () => {
                    location.reload();
                };
                document.getElementById('btn-final-exit').onclick = () => {
                    location.href = 'about:blank';
                };
            }, 2000);
            return;
        }

        textContainer.innerHTML = '';
        const msg = lines[currentLine];
        let i = 0;

        const typeInterval = setInterval(() => {
            textContainer.innerHTML += msg.charAt(i);
            i++;
            if (i >= msg.length) {
                clearInterval(typeInterval);
                currentLine++;
                if (currentLine === 1) bgSvg.style.transform = 'scale(1.05) translate(-20px, 10px)';
                if (currentLine === 2) bgSvg.style.transform = 'scale(1.1) translate(20px, -10px)';

                setTimeout(typeLine, 3000);
            }
        }, 50);
    }

    typeLine();
}

// ============================================
// INIT GAME
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize audio system immediately so browser can preload metadata
    Audio.init();

    HUD.init();
    SceneManager.show('scene-landing', () => {
        initLanding();
    });
});
