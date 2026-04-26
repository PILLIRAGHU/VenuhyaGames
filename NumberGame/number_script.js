const grid = document.getElementById("grid");
const timerDisplay = document.getElementById("timer");
const statusDisplay = document.getElementById("status");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

let timerInterval;
let timeLeft = 0;
let timeLeft1 = 0;
let nextNumber = 1;
let paused = false;
let gameActive = false;

// Shuffle function (Fisher-Yates)
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Generate grid
function generateGrid() {
    grid.innerHTML = "";

    let numbers = [];
    for (let i = 1; i <= 25; i++) numbers.push(i);

    shuffle(numbers);

    numbers.forEach(num => {
        const cell = document.createElement("div");
        cell.classList.add("cell", "fade");
        cell.textContent = num;

        cell.onclick = () => {
            if (!gameActive || paused) return;

            if (num === nextNumber) {
                playCorrectSound();
                cell.classList.add("correct");
                cell.style.pointerEvents = "none";
                nextNumber++;

                if (nextNumber <= 25) {
                    statusDisplay.textContent = "Next: " + nextNumber;
                } else {
                    statusDisplay.textContent = "🎉 You Win!";
                    clearInterval(timerInterval);
                    timerDisplay.textContent = "Time: " + (timeLeft1 - timeLeft);
                    gameActive = false;
                    playWinSound();
                }
            }
            else{
                cell.classList.add("wrong");
                playWrongSound();
            }
            // Remove correct class after 1 second
            setTimeout(() => {
            cell.classList.remove("correct", "wrong");
}, 500);
        };

        grid.appendChild(cell);
    });
}


// Play time-up sound
function playTimeUpSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";

    // Descending tone effect
    oscillator.frequency.setValueAtTime(500, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
        120,
        audioCtx.currentTime + 0.8
    );

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.8
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.8);
}

// Start game
function startGame() {
    const input = parseInt(document.getElementById("secondsInput").value);

    if (!input || input <= 0) {
        alert("Enter valid seconds.");
        return;
    }

    // Reset game state
    clearInterval(timerInterval);
    nextNumber = 1;
    paused = false;
    gameActive = true;
    timeLeft = input;
    timeLeft1 = timeLeft;

    // ✅ Shuffle grid ONLY here
    generateGrid();

    statusDisplay.textContent = "Next: 1";
    timerDisplay.textContent = "Time: " + timeLeft;

    timerInterval = setInterval(() => {
        if (!paused) {
            timeLeft--;
            timerDisplay.textContent = "Time: " + timeLeft;

            if (timeLeft <= 0) {
                playTimeUpSound();
                clearInterval(timerInterval);
                statusDisplay.textContent = "⏰ Time's Up!";
                gameActive = false;
            }
        }
    }, 1000);
}

// Play win sound (rising celebration tones)
function playWinSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const notes = [400, 550, 700, 900]; // ascending frequencies
    let startTime = audioCtx.currentTime;

    notes.forEach((freq, index) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(freq, startTime + index * 0.15);

        gainNode.gain.setValueAtTime(0.25, startTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(
            0.001,
            startTime + index * 0.15 + 0.3
        );

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start(startTime + index * 0.15);
        oscillator.stop(startTime + index * 0.15 + 0.3);
    });
}

// Pause game
function pauseGame() {
    if (!gameActive) return;

    paused = !paused;
    statusDisplay.textContent = paused ? "Paused" : "Next: " + nextNumber;
}

// Reset game
function resetGame() {
    clearInterval(timerInterval);
    paused = false;
    gameActive = false;
    nextNumber = 1;
    timeLeft = 0;

    timerDisplay.textContent = "Time: 0";
    statusDisplay.textContent = "Click Start to play";

    generateGrid();
}

// Play correct sound using Web Audio API
function playCorrectSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime); // pitch

    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); // volume
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.4
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.4);
}

// Play wrong sound
function playWrongSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime); // low pitch

    gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + 0.3
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
}


// Button events
startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", pauseGame);
resetBtn.addEventListener("click", resetGame);



// Initial grid load
generateGrid();
