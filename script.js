const setupEl = document.getElementById("setup");
const timerEl = document.getElementById("timer");

const timerDisplayEl = document.getElementById("timer-display");
const phaseDisplayEl = document.getElementById("phase-display");
const repsDisplayEl = document.getElementById("reps-display");
const modeDisplayEl = document.getElementById("mode-display");
const quoteEl = document.getElementById("quote");

const progressFillEl = document.getElementById("progress-fill");
const arcProgressEl = document.getElementById("arc-progress");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const resetBtn = document.getElementById("reset-btn");

let timerId = null;
let isPaused = false;
let remainingTime = 0;
let workDuration = 0;
let breakDuration = 0;
let reps = 0;
let remainingReps = 0;
let isWorkPhase = true;

/* simple Motor-Sound via Beep */

function playBeep(type) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === "phase") {
        oscillator.frequency.value = 900; // höherer Ton
    } else {
        oscillator.frequency.value = 500; // tiefer Ton
    }

    oscillator.type = "square";
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);
}

/* Fortschrittsanzeige */

function updateArcProgress(remaining, total) {
    if (total <= 0) {
        arcProgressEl.style.strokeDashoffset = 280;
        return;
    }
    const ratio = (total - remaining) / total;
    const dashOffset = 280 - 280 * ratio;
    arcProgressEl.style.strokeDashoffset = dashOffset;
}

function updateTopProgress(remaining, total) {
    if (total <= 0) {
        progressFillEl.style.height = "0%";
        return;
    }
    const ratio = (total - remaining) / total;
    progressFillEl.style.height = (ratio * 100) + "%";
}

/* Anzeige aktualisieren */

function renderTimer() {
    timerDisplayEl.textContent = remainingTime.toString().padStart(2, "0");
    phaseDisplayEl.textContent = isWorkPhase ? "Work" : "Break";
    repsDisplayEl.textContent = remainingReps.toString();

    const totalDuration = isWorkPhase ? workDuration : breakDuration;
    updateArcProgress(remainingTime, totalDuration);
    updateTopProgress(remainingTime, totalDuration);

    // kleine Beeps
    if (remainingTime > 0 && remainingTime <= 3) {
        playBeep("countdown");
    }
    if (remainingTime === 0) {
        playBeep("phase");
    }

    // Zitat je nach Phase
    if (isWorkPhase) {
        quoteEl.textContent = "Fokus wie auf der Geraden – kein Bremsen.";
    } else {
        quoteEl.textContent = "Cool down in der Boxengasse.";
    }
}

/* Timer starten */

function startTimer() {
    const workInput = document.getElementById("work-duration").value;
    const breakInput = document.getElementById("break-duration").value;
    const repsInput = document.getElementById("reps").value;

    workDuration = parseInt(workInput, 10);
    breakDuration = parseInt(breakInput, 10);
    reps = parseInt(repsInput, 10);

    if (!workDuration || !breakDuration || !reps || workDuration <= 0 || breakDuration <= 0 || reps <= 0) {
        alert("Bitte alle Felder mit gültigen Werten ausfüllen.");
        return;
    }

    remainingTime = workDuration;
    remainingReps = reps;
    isWorkPhase = true;
    isPaused = false;

    setupEl.style.display = "none";
    timerEl.style.display = "flex";

    modeDisplayEl.textContent = "Track Day";
    renderTimer();

    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 1000);
}

/* Tick-Funktion */

function tick() {
    if (isPaused) return;

    remainingTime--;

    if (remainingTime >= 0) {
        renderTimer();
        return;
    }

    // Phasewechsel
    if (isWorkPhase) {
        isWorkPhase = false;
        remainingTime = breakDuration;
        renderTimer();
    } else {
        remainingReps--;
        if (remainingReps > 0) {
            isWorkPhase = true;
            remainingTime = workDuration;
            renderTimer();
        } else {
            // fertig
            clearInterval(timerId);
            timerId = null;
            modeDisplayEl.textContent = "Ziel erreicht";
            quoteEl.textContent = "Boxenstopp – du hast die Session beendet.";
            progressFillEl.style.height = "100%";
            playBeep("phase");
        }
    }
}

/* Pause / Resume / Reset */

function pauseTimer() {
    isPaused = true;
    modeDisplayEl.textContent = "Safety Car";
}

function resumeTimer() {
    if (!timerId) return;
    isPaused = false;
    modeDisplayEl.textContent = "Track Day";
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isPaused = false;

    remainingTime = 0;
    remainingReps = 0;
    isWorkPhase = true;

    timerDisplayEl.textContent = "00";
    phaseDisplayEl.textContent = "Work";
    repsDisplayEl.textContent = "0";
    modeDisplayEl.textContent = "Idle";

    updateArcProgress(0, 1);
    updateTopProgress(0, 1);

    timerEl.style.display = "none";
    setupEl.style.display = "block";

    quoteEl.textContent = "Bereit für die nächste Session?";
}

/* Events */

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resumeBtn.addEventListener("click", resumeTimer);
resetBtn.addEventListener("click", resetTimer);
