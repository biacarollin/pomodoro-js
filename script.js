const MODES = {
  'foco':        { label: 'hora de focar',       seconds: 25 * 60 },
  'pausa-curta': { label: 'respira um pouco',    seconds: 5  * 60 },
  'pausa-longa': { label: 'descansa de verdade', seconds: 15 * 60 }
};

const CIRCUMFERENCE = 2 * Math.PI * 118;

const timerDisplay = document.getElementById('timerDisplay');
const modeLabel    = document.getElementById('modeLabel');
const startBtn     = document.getElementById('startBtn');
const resetBtn     = document.getElementById('resetBtn');
const plusBtn      = document.getElementById('plusBtn');
const minusBtn     = document.getElementById('minusBtn');
const sessionCount = document.getElementById('sessionCount');
const ring         = document.getElementById('ring');
const scene        = document.querySelector('.scene');
const tabs         = document.querySelectorAll('.tab');

let currentMode  = 'foco';
let totalSeconds = MODES['foco'].seconds;
let timeLeft     = totalSeconds;
let isRunning    = false;
let intervalId   = null;
let sessions     = 0;

ring.style.strokeDasharray  = CIRCUMFERENCE;
ring.style.strokeDashoffset = 0;

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

function updateRing() {
  const offset = CIRCUMFERENCE * (1 - timeLeft / totalSeconds);
  ring.style.strokeDashoffset = offset;
}

function updateDisplay() {
  timerDisplay.textContent = formatTime(timeLeft);
  updateRing();
}

function setAdjustVisible(visible) {
  plusBtn.classList.toggle('hidden', !visible);
  minusBtn.classList.toggle('hidden', !visible);
}

function setMode(mode) {
  clearInterval(intervalId);
  isRunning = false;
  startBtn.textContent = 'Iniciar';
  currentMode  = mode;
  totalSeconds = MODES[mode].seconds;
  timeLeft     = totalSeconds;
  modeLabel.textContent = MODES[mode].label;
  document.body.className = `mode-${mode}`;
  tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  scene.classList.remove('finished');
  setAdjustVisible(true);
  updateDisplay();
}

function toggleTimer() {
  if (isRunning) {
    clearInterval(intervalId);
    isRunning = false;
    startBtn.textContent = 'Continuar';
    setAdjustVisible(true);
  } else {
    isRunning = true;
    startBtn.textContent = 'Pausar';
    setAdjustVisible(false);
    intervalId = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(intervalId);
        isRunning = false;
        startBtn.textContent = 'Iniciar';
        setAdjustVisible(true);
        onTimerEnd();
      }
      updateDisplay();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(intervalId);
  isRunning = false;
  startBtn.textContent = 'Iniciar';
  timeLeft = totalSeconds;
  scene.classList.remove('finished');
  setAdjustVisible(true);
  updateDisplay();
}

function adjustTime(deltaMinutes) {
  const newTotal = totalSeconds + deltaMinutes * 60;
  if (newTotal < 60 || newTotal > 99 * 60) return;
  totalSeconds = newTotal;
  timeLeft     = totalSeconds;
  updateDisplay();
}

function onTimerEnd() {
  scene.classList.add('finished');
  if (currentMode === 'foco') {
    sessions++;
    sessionCount.textContent = sessions;
  }
  playBeep();
}

function playBeep() {
  try {
    const ctx  = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type            = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch(e) {}
}

startBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);
plusBtn.addEventListener('click',  () => adjustTime(+1));
minusBtn.addEventListener('click', () => adjustTime(-1));
tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

updateDisplay();