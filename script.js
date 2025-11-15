// Built-in sample text
const builtinTexts = [
    "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
    "Programming is the art of telling another human being what one wants the computer to do. It requires precision, clarity, and creativity.",
    "Practice makes perfect. The more you type, the better you become. Consistency is key to improving your typing speed and accuracy.",
    "Technology has transformed the way we work, communicate, and live. Computers have become an essential tool in our daily lives.",
    "Learning to type efficiently is an important skill in today's digital world. Speed and accuracy both matter when typing."
];

// Global state
let words = [];
let wordStates = []; // Array to track state of each word: 'pending', 'correct', 'incorrect'
let currentWordIndex = 0;
let timer = null;
let timeRemaining = 0;
let startTime = null;
let correctWords = 0;
let incorrectWords = 0;
let isActive = false;
let speechSynthesis = window.speechSynthesis;
let voiceEnabled = true;
let totalCharsTyped = 0;

// DOM elements
const customTextInput = document.getElementById('custom-text');
const timeSelect = document.getElementById('time-select');
const voiceCheckbox = document.getElementById('voice-enabled');
const startBtn = document.getElementById('start-btn');
const typingArea = document.getElementById('typing-area');
const timerStat = document.getElementById('timer-stat');
const wpmStat = document.getElementById('wpm-stat');
const cpmStat = document.getElementById('cpm-stat');
const accuracyStat = document.getElementById('accuracy-stat');
const textDisplay = document.getElementById('text-display');
const typingInput = document.getElementById('typing-input');
const resetBtn = document.getElementById('reset-btn');
const stats = document.getElementById('stats');
const speedDisplay = document.getElementById('speed');
const accuracyDisplay = document.getElementById('accuracy');
const wordsTypedDisplay = document.getElementById('words-typed');
const correctWordsDisplay = document.getElementById('correct-words');
const incorrectWordsDisplay = document.getElementById('incorrect-words');
const restartBtn = document.getElementById('restart-btn');

// Initialize
function init() {
    startBtn.addEventListener('click', startTyping);
    resetBtn.addEventListener('click', reset);
    restartBtn.addEventListener('click', reset);
    typingInput.addEventListener('input', handleTyping);
    typingInput.addEventListener('keydown', handleKeyDown);
    voiceCheckbox.addEventListener('change', (e) => {
        voiceEnabled = e.target.checked;
    });
}

// Start typing session
function startTyping() {
    const text = customTextInput.value.trim() || getRandomBuiltinText();
    if (!text) {
        alert('Please provide some text to practice with!');
        return;
    }

    // Parse text into words
    words = text.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) {
        alert('The text must contain at least one word!');
        return;
    }

    // Get selected time
    timeRemaining = parseInt(timeSelect.value);

    // Reset state
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;
    totalCharsTyped = 0;
    isActive = true;
    startTime = Date.now();
    wordStates = new Array(words.length).fill('pending');

    // Hide controls, show typing area
    document.querySelector('.controls').style.display = 'none';
    typingArea.style.display = 'block';
    stats.style.display = 'none';

    // Render words
    renderWords();

    // Focus input
    typingInput.value = '';
    typingInput.focus();

    // Start timer
    startTimer();
    updateLiveStats();

    // Speak first word if voice is enabled
    if (voiceEnabled && words.length > 0) {
        speakWord(words[0]);
    }
}

// Get random built-in text
function getRandomBuiltinText() {
    return builtinTexts[Math.floor(Math.random() * builtinTexts.length)];
}

// Render words on screen - only show one line (7-8 words at a time)
function renderWords() {
    textDisplay.innerHTML = '';
    
    // Determine visible range: show 7-8 words centered around current word
    const visibleRange = 7;
    const startIndex = Math.max(0, currentWordIndex - 2);
    const endIndex = Math.min(words.length, startIndex + visibleRange);
    
    // Get current typed value
    const currentTypedValue = typingInput.value.trim();
    
    // Show words in the visible range
    for (let index = startIndex; index < endIndex; index++) {
        const span = document.createElement('span');
        span.className = 'word';
        
        // Set state based on wordStates array
        const state = wordStates[index];
        const originalWord = words[index];
        
        if (state === 'correct') {
            // Already typed correctly - show as dark
            span.classList.add('typed-correct');
            span.textContent = originalWord + ' ';
        } else if (state === 'incorrect') {
            // Already typed incorrectly - show as grey with strikethrough
            span.classList.add('typed-incorrect');
            span.textContent = originalWord + ' ';
        } else if (index === currentWordIndex) {
            // Current word being typed - show typed portion in blue, rest in black
            const typedLength = currentTypedValue.length;
            const originalLength = originalWord.length;
            
            if (typedLength > 0) {
                // Show typed portion in blue with underline
                const typedSpan = document.createElement('span');
                typedSpan.className = 'typed-portion';
                typedSpan.textContent = currentTypedValue.substring(0, Math.min(typedLength, originalLength));
                span.appendChild(typedSpan);
                
                // Show remaining portion in black
                if (typedLength < originalLength) {
                    const remainingSpan = document.createElement('span');
                    remainingSpan.className = 'remaining-portion';
                    remainingSpan.textContent = originalWord.substring(typedLength);
                    span.appendChild(remainingSpan);
                }
                
                // Add space after the word
                span.appendChild(document.createTextNode(' '));
            } else {
                // No typing yet, show whole word in black
                span.classList.add('current');
                span.textContent = originalWord + ' ';
            }
        } else {
            // Upcoming word
            span.classList.add('upcoming');
            span.textContent = originalWord + ' ';
        }
        
        textDisplay.appendChild(span);
    }

    // After rendering, reposition the hidden input so the caret sits over the current word
    positionInput(startIndex);
}

// Reposition input over the current word so the caret is visually aligned
function positionInput(visibleStartIndex) {
    // Find index of current word within the visible range
    const relativeIndex = currentWordIndex - visibleStartIndex;
    const currentSpan = textDisplay.children[relativeIndex];
    if (!currentSpan) return;

    // Compute left position relative to the wrapper
    const leftOffset = currentSpan.offsetLeft;
    const width = currentSpan.offsetWidth;

    typingInput.style.left = `${20 + leftOffset}px`; // wrapper has 20px padding
    typingInput.style.width = `${Math.max(40, width)}px`;
}

// Handle typing input
function handleTyping(e) {
    if (!isActive) return;

    const typedValue = typingInput.value;
    const currentWord = words[currentWordIndex];

    // Check if space was typed (word completion)
    if (typedValue.endsWith(' ')) {
        const typedWord = typedValue.trim();
        totalCharsTyped += typedWord.length;
        
        // Mark word as correct or incorrect
        if (typedWord === currentWord) {
            wordStates[currentWordIndex] = 'correct';
            correctWords++;
        } else {
            wordStates[currentWordIndex] = 'incorrect';
            incorrectWords++;
        }

        // Move to next word
        currentWordIndex++;
        typingInput.value = '';

        // Check if all words are done
        if (currentWordIndex >= words.length) {
            finishTyping();
            return;
        }

        // Update display
        renderWords();
        updateLiveStats();

        // Speak next word if voice is enabled
        if (voiceEnabled && currentWordIndex < words.length) {
            speakWord(words[currentWordIndex]);
        }
    } else {
        // Update display while typing - show typed characters replacing original
        renderWords();
        updateLiveStats();
    }
}

// Handle special keys
function handleKeyDown(e) {
    // Prevent default behavior for space if needed
    // Allow normal typing flow
}

// Update live statistics
function updateLiveStats() {
    if (!isActive || !startTime) return;

    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    
    // Update timer - show seconds format when under a minute
    const remainingSeconds = Math.max(0, timeRemaining);
    if (remainingSeconds < 60) {
        timerStat.textContent = `${remainingSeconds} seconds`;
    } else {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        timerStat.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    // Calculate WPM and CPM
    const wordsTyped = correctWords + incorrectWords;
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    const cpm = elapsedMinutes > 0 ? Math.round(totalCharsTyped / elapsedMinutes) : 0;
    const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 0;
    
    wpmStat.textContent = wpm;
    cpmStat.textContent = cpm;
    accuracyStat.textContent = accuracy;
}

// Speak word using speech synthesis
function speakWord(word) {
    if (!voiceEnabled || !speechSynthesis) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    speechSynthesis.speak(utterance);
}

// Start timer countdown
function startTimer() {
    updateLiveStats();
    
    timer = setInterval(() => {
        timeRemaining--;
        updateLiveStats();

        if (timeRemaining <= 0) {
            finishTyping();
        }
    }, 1000);
}

// Finish typing session
function finishTyping() {
    isActive = false;
    clearInterval(timer);

    // Final render to remove current highlighting
    renderWords();

    // Calculate and display stats
    const actualTime = parseInt(timeSelect.value) - timeRemaining;
    const wordsTyped = correctWords + incorrectWords;
    const elapsedMinutes = actualTime / 60;
    
    // WPM calculation
    const wpm = elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;
    const accuracy = wordsTyped > 0 ? Math.round((correctWords / wordsTyped) * 100) : 0;

    // Display stats
    speedDisplay.textContent = `${wpm} WPM`;
    accuracyDisplay.textContent = `${accuracy}%`;
    wordsTypedDisplay.textContent = wordsTyped;
    correctWordsDisplay.textContent = correctWords;
    incorrectWordsDisplay.textContent = incorrectWords;

    stats.style.display = 'block';
    typingInput.disabled = true;

    // Stop any ongoing speech
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
}

// Reset to initial state
function reset() {
    isActive = false;
    clearInterval(timer);
    currentWordIndex = 0;
    correctWords = 0;
    incorrectWords = 0;
    totalCharsTyped = 0;
    wordStates = [];
    typingInput.value = '';
    typingInput.disabled = false;

    document.querySelector('.controls').style.display = 'flex';
    typingArea.style.display = 'none';
    stats.style.display = 'none';

    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
}

// Initialize on page load
init();

