document.addEventListener('DOMContentLoaded', () => {
    const carouselContainer = document.querySelector('.carousel-container');
    const carousel = document.getElementById('carousel');
    const spinBtn = document.getElementById('spin-btn');
    const resultModal = document.getElementById('result-modal');
    const resultText = document.getElementById('result-text');
    const closeModal = document.getElementById('close-modal');
    const langToggle = document.getElementById('lang-toggle');
    const labelId = document.getElementById('label-id');
    const labelEn = document.getElementById('label-en');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    let isSpinning = false;
    let baseQuestions = [];
    let currentLang = 'id';

    // Card dimensions from CSS
    const cardWidth = 250;
    const cardMargin = 10;
    const totalCardWidth = cardWidth + (cardMargin * 2);

    // Audio Object for the new YouTube spin sound
    const spinAudio = new Audio('/static/spin_sound.mp3');

    // Initial fetch of questions
    fetchQuestions();

    async function fetchQuestions() {
        try {
            const response = await fetch(`/api/questions?lang=${currentLang}`);
            baseQuestions = await response.json();
            setupCarousel();
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    }

    // Handle Language Toggle
    langToggle.addEventListener('change', (e) => {
        if (isSpinning) {
            e.preventDefault();
            langToggle.checked = !langToggle.checked;
            return;
        }

        if (e.target.checked) {
            currentLang = 'en';
            labelEn.classList.add('active');
            labelId.classList.remove('active');
            mainTitle.innerHTML = `Hangout <span class="highlight">Questions</span>`;
            mainSubtitle.textContent = `Dare to be honest?`;
            spinBtn.querySelector('span').textContent = `TAKE A QUESTION`;
            document.querySelector('#result-modal h2').textContent = `Selected Question!`;
            closeModal.textContent = `Close`;
        } else {
            currentLang = 'id';
            labelId.classList.add('active');
            labelEn.classList.remove('active');
            mainTitle.innerHTML = `Tanya <span class="highlight">Tongkrongan</span>`;
            mainSubtitle.textContent = `Berani jawab jujur?`;
            spinBtn.querySelector('span').textContent = `TAKE A QUESTION`;
            document.querySelector('#result-modal h2').textContent = `Pertanyaan Terpilih!`;
            closeModal.textContent = `Tutup`;
        }
        
        fetchQuestions();
    });

    function setupCarousel() {
        let longQuestionsList = [];
        for (let i = 0; i < 10; i++) {
            let shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());
            longQuestionsList = longQuestionsList.concat(shuffled);
        }

        carousel.innerHTML = '';
        longQuestionsList.forEach((q, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<p>${q}</p>`;
            card.dataset.index = index;
            carousel.appendChild(card);
        });

        const containerCenter = carouselContainer.offsetWidth / 2;
        const centerOffset = containerCenter - (totalCardWidth / 2);
        carousel.style.transition = 'none';
        carousel.style.transform = `translateX(${centerOffset}px)`;
        
        return longQuestionsList;
    }

    spinBtn.addEventListener('click', () => {
        if (isSpinning || baseQuestions.length === 0) return;
        
        isSpinning = true;
        spinBtn.disabled = true;

        // Reset and play the new spin audio
        spinAudio.currentTime = 0;
        spinAudio.play().catch(e => console.log('Audio play failed:', e));

        setupCarousel();
        void carousel.offsetWidth;

        const minCards = 50;
        const maxCards = 80;
        const winningIndex = Math.floor(Math.random() * (maxCards - minCards + 1)) + minCards;
        
        const maxOffset = (cardWidth / 2) - 20; 
        const randomOffset = Math.floor(Math.random() * (maxOffset * 2)) - maxOffset;

        const containerCenter = carouselContainer.offsetWidth / 2;
        const targetPos = containerCenter - (winningIndex * totalCardWidth) - (totalCardWidth / 2) + randomOffset;

        // Set duration to 5000ms to exactly match the 5-second audio clip
        const spinDuration = 5000;
        carousel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.15, 0.85, 0.15, 1)`;
        carousel.style.transform = `translateX(${targetPos}px)`;

        setTimeout(() => {
            isSpinning = false;
            spinBtn.disabled = false;
            
            const cards = document.querySelectorAll('.card');
            if (cards[winningIndex]) {
                cards[winningIndex].classList.add('active');
                
                setTimeout(() => {
                    resultText.textContent = cards[winningIndex].textContent;
                    resultModal.classList.remove('hidden');
                }, 800);
            }
        }, spinDuration);
    });

    closeModal.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });
});
