document.addEventListener('DOMContentLoaded', () => {
    const cardsContainer = document.getElementById('cards-container');
    const dealBtn = document.getElementById('deal-btn');
    const btnText = document.getElementById('btn-text');
    const langToggle = document.getElementById('lang-toggle');
    const labelId = document.getElementById('label-id');
    const labelEn = document.getElementById('label-en');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    let isGameActive = false;
    let baseQuestions = [];
    let currentLang = 'id';
    let audioCtx = null;

    // Initialize audio on first user interaction
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Synthesize a card shuffling sound (noise bursts)
    function playShuffleSound() {
        if (!audioCtx) return;
        const duration = 1.5;
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;

        const gainNode = audioCtx.createGain();
        
        // Envelope: multiple quick bursts over 1.5s
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        for(let t = 0; t < 1.5; t += 0.2) {
            gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + t + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + t + 0.15);
        }

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        noise.start();
    }

    // Synthesize a quick swish sound for flipping
    function playFlipSound() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    }

    async function fetchQuestions() {
        try {
            const response = await fetch(`/api/questions?lang=${currentLang}`);
            baseQuestions = await response.json();
            // Start the first deal automatically once loaded
            if (baseQuestions.length > 0) {
                dealCards();
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    function createCard(question) {
        const card = document.createElement('div');
        card.className = 'poker-card';
        
        // Inner HTML for 3D flip: .card-face.card-front and .card-face.card-back
        card.innerHTML = `
            <div class="card-face card-front">
                <div class="card-front-inner">
                    <p>${question}</p>
                </div>
            </div>
            <div class="card-face card-back"></div>
        `;
        return card;
    }

    function dealCards() {
        cardsContainer.innerHTML = '';
        dealBtn.classList.add('hidden');
        isGameActive = true;
        
        // Pick 3 random questions
        let shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());
        let selectedQuestions = shuffled.slice(0, 3);
        
        const cardElements = [];

        selectedQuestions.forEach((q, i) => {
            const card = createCard(q);
            cardsContainer.appendChild(card);
            cardElements.push(card);

            card.addEventListener('click', () => {
                if (!isGameActive) return;
                initAudio();
                flipCard(card, cardElements);
            });
        });

        // Trigger deal animation staggered
        cardElements.forEach((card, i) => {
            setTimeout(() => {
                card.classList.add('dealt');
            }, 100 + (i * 150));
        });
        
        updateSubtitleText(currentLang === 'en' ? 'Pick a card!' : 'Pilih satu kartu!');
    }

    function flipCard(selectedCard, allCards) {
        isGameActive = false; // Prevent other clicks
        playFlipSound();

        allCards.forEach(card => {
            if (card === selectedCard) {
                card.classList.add('flipped');
            } else {
                card.classList.add('unselected-card');
            }
        });

        // Show Next Round button after flip animation
        setTimeout(() => {
            btnText.textContent = currentLang === 'en' ? 'NEXT ROUND' : 'PUTAR LAGI';
            dealBtn.classList.remove('hidden');
            updateSubtitleText(currentLang === 'en' ? 'Here is your question!' : 'Ini pertanyaanmu!');
        }, 800);
    }

    function startDeckAnimationAndDeal() {
        initAudio();
        
        // Remove existing cards first
        const cards = document.querySelectorAll('.poker-card');
        cards.forEach(card => {
            card.classList.remove('dealt', 'flipped');
            card.style.opacity = '0';
        });

        const deckContainer = document.getElementById('deck-container');
        dealBtn.classList.add('hidden');
        updateSubtitleText(currentLang === 'en' ? 'Shuffling...' : 'Mengocok kartu...');
        
        // Short delay to let old cards fade out
        setTimeout(() => {
            cardsContainer.innerHTML = '';
            
            // Start shuffle animation
            deckContainer.classList.remove('hidden');
            deckContainer.classList.add('shuffling');
            playShuffleSound();

            // End shuffle and deal
            setTimeout(() => {
                deckContainer.classList.remove('shuffling');
                deckContainer.classList.add('hidden');
                dealCards();
            }, 1500);

        }, 300);
    }

    dealBtn.addEventListener('click', startDeckAnimationAndDeal);

    function updateSubtitleText(text) {
        mainSubtitle.style.opacity = 0;
        setTimeout(() => {
            mainSubtitle.textContent = text;
            mainSubtitle.style.opacity = 1;
        }, 200);
    }

    // Handle Language Toggle
    langToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            currentLang = 'en';
            labelEn.classList.add('active');
            labelId.classList.remove('active');
            mainTitle.innerHTML = `Hangout <span class="highlight">Questions</span>`;
        } else {
            currentLang = 'id';
            labelId.classList.add('active');
            labelEn.classList.remove('active');
            mainTitle.innerHTML = `Tanya <span class="highlight">Tongkrongan</span>`;
        }
        
        // Re-fetch and re-deal
        fetchQuestions();
    });

    // Start
    fetchQuestions();
});
