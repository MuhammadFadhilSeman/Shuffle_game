/**
 * spinner.js — Funny Question Spinner (Solar System edition)
 * Handles: meteor shower canvas, Big Bang effect, planet modal, API fetch
 */

'use strict';

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

let currentLang  = 'en';
let isAnimating  = false;

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
   6. Show modal with planet + question
───────────────────────────────────────────── */
async function showModal(planet) {
    // Reset state
    questionText.classList.add('hidden');
    questionText.textContent = '';
    questionLoader.style.display = 'flex';

    applyPlanetToModal(planet);
    questionModal.classList.add('visible');

    // Fetch question concurrently
    try {
        const question = await fetchQuestion();
        questionLoader.style.display = 'none';
        questionText.textContent = question;
        questionText.classList.remove('hidden');
    } catch (err) {
        questionLoader.style.display = 'none';
        questionText.textContent = '🌌 The cosmos is silent… try again!';
        questionText.classList.remove('hidden');
    }
}


/* ─────────────────────────────────────────────
   7. Hide modal & restore solar system
───────────────────────────────────────────── */
function hideModal() {
    questionModal.classList.remove('visible');
}

function restoreSolarSystem() {
    solarSystem.classList.remove('big-bang');
    // Re-enable sun
    sunBtn.style.pointerEvents = '';
    sunBtn.style.animation     = '';
    isAnimating = false;
}


/* ─────────────────────────────────────────────
   8. Full Big Bang sequence
───────────────────────────────────────────── */
function triggerBigBang() {
    if (isAnimating) return;
    isAnimating = true;

    // Get sun center for particle origin
    const sunRect = sunBtn.getBoundingClientRect();
    const cx = sunRect.left + sunRect.width  / 2;
    const cy = sunRect.top  + sunRect.height / 2;

    // --- Phase 1: Flash ---
    bangFlash.classList.add('active');
    setTimeout(() => bangFlash.classList.remove('active'), 120);

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
   9. Event listeners
───────────────────────────────────────────── */

// Stamp --sx / --sy on each planet so the scatter animation
// sends each one flying in a different direction
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

sunBtn.addEventListener('click', triggerBigBang);

// "Spin Again" — close modal, restore solar system, re-trigger
spinAgainBtn.addEventListener('click', () => {
    hideModal();
    setTimeout(() => {
        restoreSolarSystem();
        // Small delay then fire again
        setTimeout(triggerBigBang, 600);
    }, 350);
});

// "Reset" — close modal, restore solar system
closeModalBtn.addEventListener('click', () => {
    hideModal();
    setTimeout(restoreSolarSystem, 350);
});

// Clicking modal backdrop also closes
document.querySelector('.modal-backdrop').addEventListener('click', () => {
    hideModal();
    setTimeout(restoreSolarSystem, 350);
});
