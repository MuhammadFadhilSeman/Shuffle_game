/**
 * spinner.js — Funny Question Spinner (Solar System edition)
 * Handles: meteor shower canvas, Big Bang effect, planet modal, API fetch,
 *          and a centralized AudioManager for all sound effects + ambient music.
 */

'use strict';

/* ─────────────────────────────────────────────
   AudioManager — Centralized sound controller
───────────────────────────────────────────── */
const AudioManager = (() => {
    // ── Volume presets ──────────────────────────────────────────────────────
    const VOL = {
        ambient: 0.25,
        hover:   0.35,
        effects: 0.60,
    };

    // ── Audio file paths ────────────────────────────────────────────────────
    const AUDIO_SRC = {
        ambient:       '/static/audio/Space Ambient Sleep Music.mp3',
        sunHover:      '/static/audio/sun-hover.wav',
        sunCharge:     '/static/audio/sun-charge.wav',
        bigbangImpact: '/static/audio/bigbang-impact.wav',
        particleBurst: '/static/audio/particle-burst.wav',
        planetSelect:  '/static/audio/planet-select.wav',
        cardReveal:    '/static/audio/card-reveal.wav',
        loaderTick:    '/static/audio/loader-tick.wav',
        questionReveal:'/static/audio/question-reveal.wav',
        buttonHover:   '/static/audio/button-hover.wav',
        spinAgain:     '/static/audio/spin-again.wav',
        modalClose:    '/static/audio/modal-close.wav',
    };

    // ── Internal state ──────────────────────────────────────────────────────
    const pool  = {};     // { key: HTMLAudioElement }
    let ambientReady = false;
    let userInteracted = false;

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** Create and preload a single Audio element. */
    function makeAudio(src, volume, loop = false) {
        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume  = volume;
        audio.loop    = loop;
        audio.src     = src;
        return audio;
    }

    /**
     * Play a sound safely.
     * – Clones the node for effect sounds so concurrent playback never blocks.
     * – Returns the promise so callers can chain if needed.
     */
    function playSafe(audio) {
        if (!userInteracted) return;
        try {
            // Rewind non-looping sounds so they always replay from the start
            if (!audio.loop) {
                audio.currentTime = 0;
            }
            const p = audio.play();
            if (p !== undefined) {
                p.catch(() => { /* Autoplay policy – silently ignore */ });
            }
        } catch (_) { /* Fail silently */ }
    }

    // ── Public API ───────────────────────────────────────────────────────────

    function init() {
        // Effects pool
        pool.sunHover       = makeAudio(AUDIO_SRC.sunHover,       VOL.hover);
        pool.sunCharge      = makeAudio(AUDIO_SRC.sunCharge,      VOL.effects);
        pool.bigbangImpact  = makeAudio(AUDIO_SRC.bigbangImpact,  VOL.effects);
        pool.particleBurst  = makeAudio(AUDIO_SRC.particleBurst,  VOL.effects);
        pool.planetSelect   = makeAudio(AUDIO_SRC.planetSelect,   VOL.effects);
        pool.cardReveal     = makeAudio(AUDIO_SRC.cardReveal,     VOL.effects);
        pool.loaderTick     = makeAudio(AUDIO_SRC.loaderTick,     VOL.effects);
        pool.questionReveal = makeAudio(AUDIO_SRC.questionReveal, VOL.effects);
        pool.buttonHover    = makeAudio(AUDIO_SRC.buttonHover,    VOL.hover);
        pool.spinAgain      = makeAudio(AUDIO_SRC.spinAgain,      VOL.effects);
        pool.modalClose     = makeAudio(AUDIO_SRC.modalClose,     VOL.effects);

        // Ambient loop (not started yet – waits for first interaction)
        pool.ambient = makeAudio(AUDIO_SRC.ambient, VOL.ambient, true);
        ambientReady = true;
    }

    /** Call once after the first user interaction to unlock audio context. */
    function unlockAndStartAmbient() {
        if (userInteracted) return;
        userInteracted = true;

        if (ambientReady) {
            const p = pool.ambient.play();
            if (p !== undefined) {
                p.catch(() => { /* Blocked by browser – ignore */ });
            }
        }
    }

    // Named play functions (called by event handlers below)
    function playSunHover()       { playSafe(pool.sunHover); }
    function playSunCharge()      { playSafe(pool.sunCharge); }
    function playBigBangImpact()  { playSafe(pool.bigbangImpact); }
    function playParticleBurst()  { playSafe(pool.particleBurst); }
    function playPlanetSelect()   { playSafe(pool.planetSelect); }
    function playCardReveal()     { playSafe(pool.cardReveal); }
    function playLoaderTick()     { playSafe(pool.loaderTick); }
    function playQuestionReveal() { playSafe(pool.questionReveal); }
    function playButtonHover()    { playSafe(pool.buttonHover); }
    function playSpinAgain()      { playSafe(pool.spinAgain); }
    function playModalClose()     { playSafe(pool.modalClose); }

    /** Toggle ambient music mute on/off. Returns new muted state (true = muted). */
    function toggleAmbientMute() {
        if (!pool.ambient) return false;
        pool.ambient.muted = !pool.ambient.muted;
        return pool.ambient.muted;
    }

    function isAmbientMuted() {
        return pool.ambient ? pool.ambient.muted : false;
    }

    return {
        init,
        unlockAndStartAmbient,
        toggleAmbientMute,
        isAmbientMuted,
        playSunHover,
        playSunCharge,
        playBigBangImpact,
        playParticleBurst,
        playPlanetSelect,
        playCardReveal,
        playLoaderTick,
        playQuestionReveal,
        playButtonHover,
        playSpinAgain,
        playModalClose,
    };
})();

// Initialise audio pool immediately (preloads metadata)
AudioManager.init();

/* ─────────────────────────────────────────────
   Planet configuration
───────────────────────────────────────────── */
const PLANETS = [
    {
        name: 'Mercury ☿',
        cssClass: 'planet-mercury',
        bg: 'radial-gradient(circle at 35% 35%, #d8d8d8, #b0b0b0)',
        shadow: 'rgba(160,160,160,0.5)',
        scatterX: -320, scatterY: -280,
        orbitRadius: 110,
    },
    {
        name: 'Venus ♀',
        cssClass: 'planet-venus',
        bg: 'radial-gradient(circle at 35% 35%, #f5e6c8, #e8cda0)',
        shadow: 'rgba(220,190,120,0.5)',
        scatterX: 280, scatterY: -300,
        orbitRadius: 155,
    },
    {
        name: 'Earth 🌍',
        cssClass: 'planet-earth',
        bg: 'radial-gradient(circle at 35% 35%, #4fc3f7, #1565c0)',
        shadow: 'rgba(30,120,255,0.5)',
        scatterX: -260, scatterY: 310,
        orbitRadius: 205,
    },
    {
        name: 'Mars ♂',
        cssClass: 'planet-mars',
        bg: 'radial-gradient(circle at 35% 35%, #ff7961, #ef5350)',
        shadow: 'rgba(255,80,80,0.5)',
        scatterX: 350, scatterY: 250,
        orbitRadius: 260,
    },
    {
        name: 'Jupiter ⚡',
        cssClass: 'planet-jupiter',
        bg: 'radial-gradient(circle at 35% 35%, #f4c5a0, #e8a87c)',
        shadow: 'rgba(220,140,80,0.5)',
        scatterX: -400, scatterY: -180,
        orbitRadius: 325,
    },
    {
        name: 'Saturn 🪐',
        cssClass: 'planet-saturn',
        bg: 'radial-gradient(circle at 35% 35%, #f8e4a0, #f0c987)',
        shadow: 'rgba(220,190,100,0.5)',
        scatterX: 180, scatterY: -400,
        orbitRadius: 400,
        hasRing: true,
    },
    {
        name: 'Uranus 💙',
        cssClass: 'planet-uranus',
        bg: 'radial-gradient(circle at 35% 35%, #b2ebf2, #7de8e8)',
        shadow: 'rgba(100,220,220,0.5)',
        scatterX: -200, scatterY: 420,
        orbitRadius: 475,
    },
];

/* ─────────────────────────────────────────────
   DOM refs
───────────────────────────────────────────── */
const sunBtn          = document.getElementById('sun-btn');
const solarSystem     = document.getElementById('solar-system');
const bangFlash       = document.getElementById('bang-flash');
const particlesCont   = document.getElementById('particles-container');
const questionModal   = document.getElementById('question-modal');
const modalPlanet     = document.getElementById('modal-planet');
const modalPlanetName = document.getElementById('modal-planet-name');
const questionLoader  = document.getElementById('question-loader');
const questionText    = document.getElementById('question-text');
const spinAgainBtn    = document.getElementById('spin-again-btn');
const closeModalBtn   = document.getElementById('close-modal-btn');
const langToggle      = document.getElementById('spinner-lang-toggle');
const labelId         = document.getElementById('spinner-label-id');
const labelEn         = document.getElementById('spinner-label-en');
const ambientMuteBtn  = document.getElementById('ambient-mute-btn');

let currentLang  = 'en';
let isAnimating  = false;

/* ─────────────────────────────────────────────
   First-interaction unlock (autoplay policy)
   Attach to every gesture type for maximum
   mobile / desktop compatibility.
───────────────────────────────────────────── */
const UNLOCK_EVENTS = ['click', 'touchstart', 'keydown', 'pointerdown'];
function onFirstInteraction() {
    AudioManager.unlockAndStartAmbient();
    UNLOCK_EVENTS.forEach(evt =>
        document.removeEventListener(evt, onFirstInteraction, { passive: true })
    );
}
UNLOCK_EVENTS.forEach(evt =>
    document.addEventListener(evt, onFirstInteraction, { passive: true })
);

/* ─────────────────────────────────────────────
   1. Meteor shower canvas
───────────────────────────────────────────── */
(function initMeteors() {
    const canvas = document.getElementById('meteor-canvas');
    const ctx    = canvas.getContext('2d');

    // Stars
    const STAR_COUNT = 200;
    const stars = [];

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Populate static star field
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 1.5 + 0.3,
            a: Math.random(),
            speed: Math.random() * 0.005 + 0.002,
        });
    }

    // Meteors
    const meteors = [];
    function spawnMeteor() {
        meteors.push({
            x: Math.random() * canvas.width * 1.5,
            y: -20,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 6 + 4,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
            life: 1,
            decay: Math.random() * 0.015 + 0.01,
            width: Math.random() * 1.5 + 0.5,
        });
    }

    // Spawn meteors at random intervals
    function scheduleMeteor() {
        spawnMeteor();
        setTimeout(scheduleMeteor, Math.random() * 1400 + 300);
    }
    scheduleMeteor();

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw star field
        stars.forEach(s => {
            s.a += s.speed;
            const alpha = (Math.sin(s.a) * 0.4 + 0.6);
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fill();
        });

        // Draw & advance meteors
        for (let i = meteors.length - 1; i >= 0; i--) {
            const m = meteors[i];
            const dx = Math.cos(m.angle) * m.len;
            const dy = Math.sin(m.angle) * m.len;

            const grad = ctx.createLinearGradient(m.x, m.y, m.x - dx, m.y - dy);
            grad.addColorStop(0, `rgba(255,255,255,${m.life})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - dx, m.y - dy);
            ctx.strokeStyle = grad;
            ctx.lineWidth   = m.width;
            ctx.stroke();

            // Trail glow
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(m.x - dx * 0.5, m.y - dy * 0.5);
            ctx.strokeStyle = `rgba(180,220,255,${m.life * 0.4})`;
            ctx.lineWidth   = m.width * 2.5;
            ctx.stroke();

            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.life -= m.decay;

            if (m.life <= 0) meteors.splice(i, 1);
        }

        requestAnimationFrame(draw);
    }
    draw();
})();


/* ─────────────────────────────────────────────
   2. Language toggle
───────────────────────────────────────────── */
langToggle.addEventListener('change', e => {
    currentLang = e.target.checked ? 'en' : 'id';
    labelEn.classList.toggle('active', e.target.checked);
    labelId.classList.toggle('active', !e.target.checked);
});


/* ─────────────────────────────────────────────
   3. Big Bang particle burst
───────────────────────────────────────────── */
function createParticles(cx, cy) {
    particlesCont.innerHTML = '';
    const PARTICLE_COLORS = [
        '#FFD700', '#FF6EB4', '#00F5FF', '#FF4500',
        '#ADFF2F', '#FF69B4', '#00BFFF', '#FFD700',
    ];
    const COUNT = 60;

    for (let i = 0; i < COUNT; i++) {
        const p    = document.createElement('div');
        const size = Math.random() * 14 + 5;
        const angle = (i / COUNT) * 360 + Math.random() * 10;
        const dist  = Math.random() * 340 + 80;
        const dur   = Math.random() * 0.7 + 0.6;
        const tx    = Math.cos(angle * Math.PI / 180) * dist;
        const ty    = Math.sin(angle * Math.PI / 180) * dist;
        const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        p.className = 'particle';
        Object.assign(p.style, {
            width:  size + 'px',
            height: size + 'px',
            background: color,
            left: cx + 'px',
            top:  cy + 'px',
            '--tx':  tx + 'px',
            '--ty':  ty + 'px',
            '--dur': dur + 's',
            boxShadow: `0 0 ${size}px ${color}`,
        });
        particlesCont.appendChild(p);
    }

    // Clear after animation
    setTimeout(() => { particlesCont.innerHTML = ''; }, 1400);
}


/* ─────────────────────────────────────────────
   4. Pick a random planet, style the modal planet
───────────────────────────────────────────── */
function pickRandomPlanet() {
    return PLANETS[Math.floor(Math.random() * PLANETS.length)];
}

function applyPlanetToModal(planet) {
    // Clear previous classes
    PLANETS.forEach(p => modalPlanet.classList.remove(p.cssClass));

    modalPlanet.style.background  = planet.bg;
    modalPlanet.style.boxShadow   = `0 0 40px ${planet.shadow}, 0 0 80px ${planet.shadow}`;

    // Saturn ring
    let ring = modalPlanet.querySelector('.saturn-ring');
    if (planet.hasRing) {
        if (!ring) {
            ring = document.createElement('div');
            ring.className = 'saturn-ring';
            ring.style.cssText = 'width:160px;height:40px;border-width:8px;';
            modalPlanet.insertBefore(ring, modalPlanet.firstChild);
        }
    } else if (ring) {
        ring.remove();
    }

    // Jupiter bands overlay
    modalPlanet.style.setProperty('--show-bands', planet.name.includes('Jupiter') ? 'block' : 'none');

    modalPlanetName.textContent = planet.name;
}


/* ─────────────────────────────────────────────
   5. Fetch question from API
───────────────────────────────────────────── */
async function fetchQuestion() {
    const url = `/api/get_question?lang=${currentLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.question;
}


/* ─────────────────────────────────────────────
   6. Loader-tick sound — fires every dot cycle
   The CSS loader has three dots that animate
   sequentially; we mirror the cadence in JS.
───────────────────────────────────────────── */
let loaderTickInterval = null;

function startLoaderTick() {
    // CSS loader dot animation typically cycles ~600 ms per dot
    loaderTickInterval = setInterval(() => {
        AudioManager.playLoaderTick();
    }, 600);
}

function stopLoaderTick() {
    if (loaderTickInterval !== null) {
        clearInterval(loaderTickInterval);
        loaderTickInterval = null;
    }
}


/* ─────────────────────────────────────────────
   7. Show modal with planet + question
───────────────────────────────────────────── */
async function showModal(planet) {
    // Reset state
    questionText.classList.add('hidden');
    questionText.textContent = '';
    questionLoader.style.display = 'flex';

    applyPlanetToModal(planet);

    // Planet selected sound
    AudioManager.playPlanetSelect();

    // Show modal
    questionModal.classList.add('visible');

    // Card reveal sound when modal appears
    AudioManager.playCardReveal();

    // Start loader tick
    startLoaderTick();

    // Fetch question concurrently
    try {
        const question = await fetchQuestion();
        stopLoaderTick();
        questionLoader.style.display = 'none';
        questionText.textContent = question;
        questionText.classList.remove('hidden');

        // Question reveal sound
        AudioManager.playQuestionReveal();
    } catch (err) {
        stopLoaderTick();
        questionLoader.style.display = 'none';
        questionText.textContent = '🌌 The cosmos is silent… try again!';
        questionText.classList.remove('hidden');
        AudioManager.playQuestionReveal();
    }
}


/* ─────────────────────────────────────────────
   8. Hide modal & restore solar system
───────────────────────────────────────────── */
function hideModal() {
    questionModal.classList.remove('visible');
    stopLoaderTick();   // Safety — stop tick if modal closes while loading
}

function restoreSolarSystem() {
    solarSystem.classList.remove('big-bang');
    // Re-enable sun
    sunBtn.style.pointerEvents = '';
    sunBtn.style.animation     = '';
    isAnimating = false;
}


/* ─────────────────────────────────────────────
   9. Full Big Bang sequence
───────────────────────────────────────────── */
function triggerBigBang() {
    if (isAnimating) return;
    isAnimating = true;

    // Unlock ambient on this (first) interaction if not already done
    AudioManager.unlockAndStartAmbient();

    // Sun charge sound plays immediately on click
    AudioManager.playSunCharge();

    // Get sun center for particle origin
    const sunRect = sunBtn.getBoundingClientRect();
    const cx = sunRect.left + sunRect.width  / 2;
    const cy = sunRect.top  + sunRect.height / 2;

    // --- Phase 1: Flash ---
    bangFlash.classList.add('active');
    setTimeout(() => bangFlash.classList.remove('active'), 120);

    // Big Bang impact sound on flash
    AudioManager.playBigBangImpact();

    // Particle burst sound
    AudioManager.playParticleBurst();

    // Particles
    createParticles(cx, cy);

    // Scatter planets via CSS class
    solarSystem.classList.add('big-bang');

    // Pick planet now (while Big Bang plays)
    const chosenPlanet = pickRandomPlanet();

    // --- Phase 2: Show modal after planets scatter ---
    setTimeout(() => {
        showModal(chosenPlanet);
    }, 700);
}


/* ─────────────────────────────────────────────
   10. Sun hover — debounced to prevent overlap
───────────────────────────────────────────── */
let sunHoverDebounce = null;

sunBtn.addEventListener('mouseenter', () => {
    if (sunHoverDebounce) return;      // Already playing, skip
    AudioManager.playSunHover();
    // Block re-trigger until the wav finishes (~600 ms)
    sunHoverDebounce = setTimeout(() => {
        sunHoverDebounce = null;
    }, 650);
});

// Touch equivalent for mobile
sunBtn.addEventListener('touchstart', () => {
    if (sunHoverDebounce) return;
    AudioManager.playSunHover();
    sunHoverDebounce = setTimeout(() => { sunHoverDebounce = null; }, 650);
}, { passive: true });


/* ─────────────────────────────────────────────
   11. Button hover sounds (Spin Again + Reset)
───────────────────────────────────────────── */
let btnHoverDebounce = null;

function addButtonHoverSound(btn) {
    btn.addEventListener('mouseenter', () => {
        if (btnHoverDebounce) return;
        AudioManager.playButtonHover();
        btnHoverDebounce = setTimeout(() => { btnHoverDebounce = null; }, 300);
    });
}

addButtonHoverSound(spinAgainBtn);
addButtonHoverSound(closeModalBtn);


/* ─────────────────────────────────────────────
   12. Planet scatter vars (CSS custom props)
───────────────────────────────────────────── */
function initPlanetScatterVars() {
    PLANETS.forEach(planet => {
        const el = document.querySelector(`.${planet.cssClass}`);
        if (el) {
            el.style.setProperty('--sx', planet.scatterX + 'px');
            el.style.setProperty('--sy', planet.scatterY + 'px');
        }
    });
}
initPlanetScatterVars();


/* ─────────────────────────────────────────────
   13. Event listeners
───────────────────────────────────────────── */

// Sun click → Big Bang
sunBtn.addEventListener('click', triggerBigBang);

// "Spin Again" — close modal, restore solar system, re-trigger
spinAgainBtn.addEventListener('click', () => {
    AudioManager.playSpinAgain();
    hideModal();
    setTimeout(() => {
        restoreSolarSystem();
        // Small delay then fire again
        setTimeout(triggerBigBang, 600);
    }, 350);
});

// "Reset" — close modal, restore solar system
closeModalBtn.addEventListener('click', () => {
    AudioManager.playModalClose();
    hideModal();
    setTimeout(restoreSolarSystem, 350);
});

// Clicking modal backdrop also closes
document.querySelector('.modal-backdrop').addEventListener('click', () => {
    AudioManager.playModalClose();
    hideModal();
    setTimeout(restoreSolarSystem, 350);
});

/* ─────────────────────────────────────────────
   14. Ambient music mute button
───────────────────────────────────────────── */
function syncMuteBtn(muted) {
    const icon  = ambientMuteBtn.querySelector('.mute-icon');
    const label = ambientMuteBtn.querySelector('.mute-label');
    if (muted) {
        icon.textContent  = '🔇';
        label.textContent = 'Muted';
        ambientMuteBtn.classList.add('is-muted');
        ambientMuteBtn.setAttribute('aria-label', 'Unmute ambient music');
    } else {
        icon.textContent  = '🔊';
        label.textContent = 'Music';
        ambientMuteBtn.classList.remove('is-muted');
        ambientMuteBtn.setAttribute('aria-label', 'Mute ambient music');
    }
}

ambientMuteBtn.addEventListener('click', () => {
    const nowMuted = AudioManager.toggleAmbientMute();
    syncMuteBtn(nowMuted);
});

