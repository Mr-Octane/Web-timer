const timerDisplayEl = document.getElementById("timer-display");
const setupEl = document.getElementById("setup");
const timerEl = document.getElementById("timer");
const progressFillEl = document.getElementById("progress-fill");
let timerId = null;

function playBeep(event) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if(event == 3){oscillator.frequency.value = 800;}
    else{oscillator.frequency.value = 600;}
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function startTimer(workDuration, breakDuration, reps) {
    setupEl.style.display = "none";
    timerEl.style.display = "flex";

    // Konvertiere zu Numbers falls Strings
    workDuration = parseInt(workDuration);
    breakDuration = parseInt(breakDuration);
    reps = parseInt(reps);

    let remainingTime = workDuration;
    let remainingReps = reps;
    let isWorkPhase = true;

    if (timerId) clearInterval(timerId);

    // Zeige initial die erste Sekunde an
    renderTimer(remainingTime, isWorkPhase, remainingReps);
    updateProgressFill(remainingTime, workDuration);

    timerId = setInterval(() => {
        remainingTime--;
        
        if (remainingTime >= 0) {
            renderTimer(remainingTime, isWorkPhase, remainingReps);
            const totalDuration = isWorkPhase ? workDuration : breakDuration;
            updateProgressFill(remainingTime, totalDuration);
        }
        
        if (remainingTime <= -1) {
            if (isWorkPhase) {
                remainingTime = breakDuration;
                isWorkPhase = false;
                renderTimer(remainingTime, isWorkPhase, remainingReps);
                updateProgressFill(remainingTime, breakDuration);
            } else {
                remainingReps--;
                if (remainingReps >= 0) {
                    remainingTime = workDuration;
                    isWorkPhase = true;
                    renderTimer(remainingTime, isWorkPhase, remainingReps);
                    updateProgressFill(remainingTime, workDuration);
                } else {
                    clearInterval(timerId);
                    timerEl.style.display = "none";
                    setupEl.style.display = "block";
                    updateProgressFill(0, 0);
                    progressFillEl.style.height = "100%";
                    playBeep(3);
                }
            }
        }
    }, 1000);
}

function renderTimer(remainingTime, isWorkPhase, remainingReps) {
    timerDisplayEl.innerHTML = `${remainingTime.toString().padStart(2, '0')}`;
    document.getElementById("phase-display").innerHTML = isWorkPhase ? "Work" : "Break";
    document.getElementById("reps-display").innerHTML = `Reps left: ${remainingReps}`;
    
    if (remainingTime > 0 && remainingTime <= 3) {
        playBeep(1);
    }
    if (remainingTime === 0) {
        playBeep(3);
    }
}

function updateProgressFill(remainingTime, totalDuration) {
    // Berechne den Fortschritt (von 0 bis 100%)
    const progress = ((totalDuration - remainingTime) / totalDuration) * 100;
    progressFillEl.style.height = progress + "%";
}

function saveTimer(workDuration, breakDuration, reps){
    localStorage.setItem("workDuration", workDuration);
    localStorage.setItem("breakDuration", breakDuration);
    localStorage.setItem("reps", reps);
}

function loadTimer(){
    const workDuration = localStorage.getItem("workDuration");
    const breakDuration = localStorage.getItem("breakDuration");
    const reps = localStorage.getItem("reps");
    
    if (workDuration) document.getElementById("work-duration").value = workDuration;
    if (breakDuration) document.getElementById("break-duration").value = breakDuration;
    if (reps) document.getElementById("reps").value = reps;
}

window.onload = function() {
    loadTimer();
}

function setTimer(workDuration, breakDuration, reps){
    saveTimer(workDuration, breakDuration, reps);
    startTimer(workDuration, breakDuration, reps);
}
