// ─── Element refs ────────────────────────────────────────────
const togglePill      = document.getElementById('toggle-pill');
const modeOptions     = document.querySelectorAll('.mode-option');
const panels          = document.querySelectorAll('.panel');

// Animals
const animalButtons   = document.querySelectorAll('.animal-btn');
const animalImg       = document.getElementById('animal-img');
const placeholder     = document.getElementById('placeholder');
const animalLoading   = document.getElementById('animal-loading');
const animalBtn       = document.getElementById('animal-btn');
const animalCaption   = document.getElementById('animal-caption');

// Quotes
const quoteText       = document.getElementById('quote-text');
const quoteAuthor     = document.getElementById('quote-author');
const quoteLoading    = document.getElementById('quote-loading');
const quoteBtn        = document.getElementById('quote-btn');
const quoteCaption    = document.getElementById('quote-caption');

// Touch Grass
const grassEmoji       = document.getElementById('grass-emoji');
const grassAction      = document.getElementById('grass-action');
const grassDetail      = document.getElementById('grass-detail');
const grassBtn         = document.getElementById('grass-btn');
const grassDoneBtn     = document.getElementById('grass-done-btn');
const grassNextBtn     = document.getElementById('grass-next-btn');
const grassCelebration = document.getElementById('grass-celebration');
const grassCaption     = document.getElementById('grass-caption');

// Movement
const movementEmoji    = document.getElementById('movement-emoji');
const movementAction   = document.getElementById('movement-action');
const movementDetail   = document.getElementById('movement-detail');
const movementBtn      = document.getElementById('movement-btn');
const movementDoneBtn  = document.getElementById('movement-done-btn');
const movementNextBtn  = document.getElementById('movement-next-btn');
const movementCelebration = document.getElementById('movement-celebration');
const movementCaption  = document.getElementById('movement-caption');
const timerSection     = document.getElementById('timer-section');
const timerDisplay     = document.getElementById('timer-display');
const timerStartBtn    = document.getElementById('timer-start-btn');

// Productivity
const prodPrompt      = document.getElementById('prod-prompt');
const prodInput       = document.getElementById('prod-input');
const prodSubmitBtn   = document.getElementById('prod-submit-btn');
const prodGoalCard    = document.getElementById('prod-goal-card');
const prodGoalText    = document.getElementById('prod-goal-text');
const prodDoneBtn     = document.getElementById('prod-done-btn');
const prodClearBtn    = document.getElementById('prod-clear-btn');
const prodCelebration = document.getElementById('prod-celebration');
const prodNextBtn     = document.getElementById('prod-next-btn');
const prodCaption     = document.getElementById('prod-caption');

// ─── State ───────────────────────────────────────────────────
let currentMode      = 'animals';
let currentAnimal    = 'dog';
let timerInterval    = null;
let timerSeconds     = 0;
let timerRunning     = false;
let timerTotal       = 0;

// ─── Animal config ───────────────────────────────────────────
const animals = {
  dog: {
    emoji: '🐶',
    captions: ["You needed this. 🐾", "Good boy energy activated.", "Serotonin: delivered.", "You're doing great. So is this dog.", "World's problems: temporarily solved."],
    fetch: async () => { const res = await fetch('https://dog.ceo/api/breeds/image/random'); const data = await res.json(); return data.message; }
  },
  cat: {
    emoji: '🐱',
    captions: ["This cat does not care about your problems.", "Judging you, but lovingly.", "Cat energy unlocked.", "They're indifferent. It's healing.", "Serotonin: also delivered."],
    fetch: async () => { const res = await fetch('https://api.thecatapi.com/v1/images/search'); const data = await res.json(); return data[0].url; }
  },
  fox: {
    emoji: '🦊',
    captions: ["What does the fox say? Nothing. It's just cute.", "Chaotic good energy.", "Fox mode: activated.", "Sneaky little serotonin hit.", "This fox has more going on than you."],
    fetch: async () => { const res = await fetch('https://randomfox.ca/floof/'); const data = await res.json(); return data.image; }
  },
  lizard: {
    emoji: '🦎',
    captions: ["Lizard mode: activated.", "Cold blooded. Just like your deadlines.", "This lizard has no meetings today.", "Chaotic neutral energy.", "Nature's little weirdo. Iconic."],
    fetch: async () => { const res = await fetch('https://nekos.life/api/v2/img/lizard'); const data = await res.json(); return data.url; }
  }
};
const allAnimalKeys = ['dog', 'cat', 'fox', 'lizard'];

// ─── Mode toggle ─────────────────────────────────────────────
const modeOrder = ['animals', 'quotes', 'touchgrass', 'movement', 'productivity'];

function switchMode(mode) {
  currentMode = mode;
  const idx = modeOrder.indexOf(mode);
  togglePill.style.transform = `translateX(calc(${idx} * 100%))`;
  togglePill.style.width = `calc(${100 / modeOrder.length}% - 4px)`;

  modeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.mode === mode));
  panels.forEach(panel => panel.classList.toggle('active', panel.id === `panel-${mode}`));

  chrome.storage.local.set({ lastMode: mode });

  if (mode === 'quotes' && quoteText.textContent === '') fetchQuote();
  if (mode === 'touchgrass' && grassAction.textContent === '') fetchGrass();
  if (mode === 'movement' && movementAction.textContent === '') fetchMovement();
  if (mode === 'productivity') initProductivity();
}

modeOptions.forEach(opt => opt.addEventListener('click', () => switchMode(opt.dataset.mode)));

// ─── Animals ─────────────────────────────────────────────────
function setPlaceholder(emoji) {
  placeholder.textContent = emoji;
  placeholder.style.display = 'block';
  animalImg.style.display = 'none';
}

function showAnimalLoading() {
  placeholder.style.display = 'none';
  animalImg.style.display = 'none';
  animalLoading.style.display = 'block';
  animalBtn.disabled = true;
  animalCaption.textContent = '';
}

function showAnimalImage(src) {
  animalImg.src = src;
  animalImg.style.display = 'block';
  animalLoading.style.display = 'none';
  animalBtn.disabled = false;
  animalBtn.textContent = '🐾 Another One';
}

function showAnimalError() {
  animalLoading.style.display = 'none';
  placeholder.style.display = 'block';
  placeholder.textContent = '😢';
  animalCaption.textContent = 'No wifi? Even cute animals need internet.';
  animalBtn.disabled = false;
}

async function fetchAnimal() {
  const key = currentAnimal === 'surprise'
    ? allAnimalKeys[Math.floor(Math.random() * allAnimalKeys.length)]
    : currentAnimal;
  showAnimalLoading();
  try {
    const url = await animals[key].fetch();
    const newImg = new Image();
    newImg.onload = () => {
      showAnimalImage(url);
      const caps = animals[key].captions;
      animalCaption.textContent = caps[Math.floor(Math.random() * caps.length)];
    };
    newImg.onerror = showAnimalError;
    newImg.src = url;
  } catch { showAnimalError(); }
}

animalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    animalButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAnimal = btn.dataset.animal;
    setPlaceholder(currentAnimal === 'surprise' ? '🎲' : animals[currentAnimal]?.emoji);
    fetchAnimal();
  });
});
animalBtn.addEventListener('click', fetchAnimal);

// ─── Quotes ───────────────────────────────────────────────────
const quoteReactions = ["Sit with that for a moment.", "Ok that one hit.", "Saving that one.", "Your future self needed to hear this.", "Someone really figured something out."];
let lastQuoteIndex = -1;

function fetchQuote() {
  let index;
  do { index = Math.floor(Math.random() * QUOTES.length); } while (index === lastQuoteIndex);
  lastQuoteIndex = index;
  const quote = QUOTES[index];
  quoteLoading.style.display = 'block';
  quoteText.textContent = '';
  quoteAuthor.textContent = '';
  quoteBtn.disabled = true;
  setTimeout(() => {
    quoteLoading.style.display = 'none';
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteBtn.disabled = false;
    quoteCaption.textContent = quoteReactions[Math.floor(Math.random() * quoteReactions.length)];
  }, 300);
}
quoteBtn.addEventListener('click', fetchQuote);

// ─── Touch Grass ──────────────────────────────────────────────
const grassReactions = ["Close the laptop.", "Do it. Right now.", "This one's non-negotiable.", "Your body will thank you.", "Seriously. Go."];
const grassCelebrations = ["Look at you. Actually doing it. 🌿", "That counts. That really counts.", "Your nervous system thanks you.", "Certified grass toucher. 🏆", "You just chose yourself. Nice."];
let lastGrassIndex = -1;

function celebrateGrass() {
  grassDoneBtn.style.display = 'none';
  grassBtn.style.display = 'none';
  grassNextBtn.style.display = 'block';
  grassCelebration.style.display = 'flex';
  grassCaption.textContent = grassCelebrations[Math.floor(Math.random() * grassCelebrations.length)];
  launchConfetti(document.getElementById('grass-confetti-canvas'));
}

function fetchGrass() {
  let index;
  do { index = Math.floor(Math.random() * TOUCH_GRASS_PROMPTS.length); } while (index === lastGrassIndex);
  lastGrassIndex = index;
  const prompt = TOUCH_GRASS_PROMPTS[index];
  grassEmoji.textContent = prompt.emoji;
  grassAction.textContent = prompt.action;
  grassDetail.textContent = prompt.detail;
  grassCaption.textContent = grassReactions[Math.floor(Math.random() * grassReactions.length)];
  // Reset celebration state
  grassDoneBtn.style.display = 'block';
  grassBtn.style.display = 'block';
  grassNextBtn.style.display = 'none';
  grassCelebration.style.display = 'none';
}
grassDoneBtn.addEventListener('click', celebrateGrass);
grassNextBtn.addEventListener('click', fetchGrass);
grassBtn.addEventListener('click', fetchGrass);

// ─── Movement ─────────────────────────────────────────────────
const movementReactions = ["Your body needs this.", "No excuses. Go.", "You'll feel better after. Promise.", "Future you says thank you.", "This is the way."];
let lastMovementIndex = -1;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}

function resetTimer() {
  stopTimer();
  timerSeconds = timerTotal;
  timerDisplay.textContent = formatTime(timerSeconds);
  timerDisplay.classList.remove('done');
  timerStartBtn.textContent = '▶ Start Timer';
}

function startTimer() {
  if (timerSeconds <= 0) resetTimer();
  timerRunning = true;
  timerStartBtn.textContent = '⏸ Pause';
  timerInterval = setInterval(() => {
    timerSeconds--;
    timerDisplay.textContent = formatTime(timerSeconds);
    // Pulse red in last 10 seconds
    timerDisplay.classList.toggle('urgent', timerSeconds <= 10 && timerSeconds > 0);
    if (timerSeconds <= 0) {
      stopTimer();
      timerDisplay.textContent = '✅ Done!';
      timerDisplay.classList.add('done');
      timerStartBtn.textContent = '↺ Reset';
      movementCaption.textContent = "That's what I'm talking about. 🔥";
    }
  }, 1000);
}

timerStartBtn.addEventListener('click', () => {
  if (timerDisplay.classList.contains('done')) {
    resetTimer();
  } else if (timerRunning) {
    stopTimer();
    timerStartBtn.textContent = '▶ Resume';
  } else {
    startTimer();
  }
});

const movementCelebrations = ["Beast mode. Activated. 💪", "That just happened. You did that.", "Your future self felt that.", "Body: 1. Excuses: 0. 🏆", "Endorphins incoming. You earned it."];

function celebrateMovement() {
  stopTimer();
  movementDoneBtn.style.display = 'none';
  movementBtn.style.display = 'none';
  movementNextBtn.style.display = 'block';
  timerSection.style.display = 'none';
  movementCelebration.style.display = 'flex';
  movementCaption.textContent = movementCelebrations[Math.floor(Math.random() * movementCelebrations.length)];
  launchConfetti(document.getElementById('movement-confetti-canvas'));
}

function fetchMovement() {
  stopTimer();

  let index;
  do { index = Math.floor(Math.random() * MOVEMENT_PROMPTS.length); } while (index === lastMovementIndex);
  lastMovementIndex = index;
  const prompt = MOVEMENT_PROMPTS[index];

  movementEmoji.textContent = prompt.emoji;
  movementAction.textContent = prompt.action;
  movementDetail.textContent = prompt.detail;
  movementCaption.textContent = movementReactions[Math.floor(Math.random() * movementReactions.length)];

  // Reset celebration state
  movementDoneBtn.style.display = 'block';
  movementBtn.style.display = 'block';
  movementNextBtn.style.display = 'none';
  movementCelebration.style.display = 'none';

  // Show/hide timer based on whether this prompt has a duration
  if (prompt.timerSeconds) {
    timerTotal = prompt.timerSeconds;
    timerSeconds = timerTotal;
    timerDisplay.textContent = formatTime(timerSeconds);
    timerDisplay.classList.remove('done', 'urgent');
    timerStartBtn.textContent = '▶ Start Timer';
    timerSection.style.display = 'flex';
  } else {
    timerSection.style.display = 'none';
  }
}

movementDoneBtn.addEventListener('click', celebrateMovement);
movementNextBtn.addEventListener('click', fetchMovement);
movementBtn.addEventListener('click', fetchMovement);

// ─── Productivity ────────────────────────────────────────────────
let lastProdPromptIndex = -1;
let currentProdPrompt = '';

function getRandomProdPrompt() {
  let index;
  do { index = Math.floor(Math.random() * PRODUCTIVITY_PROMPTS.length); } while (index === lastProdPromptIndex);
  lastProdPromptIndex = index;
  return PRODUCTIVITY_PROMPTS[index];
}

function showProductivityInput(prompt = null) {
  // Use provided prompt or get a new random one
  currentProdPrompt = prompt || getRandomProdPrompt();
  prodPrompt.textContent = currentProdPrompt;
  prodInput.value = '';
  prodSubmitBtn.disabled = true;
  document.getElementById('productivity-box').style.display = 'flex';
  document.getElementById('prod-prompt-picker').style.display = 'none';
  prodGoalCard.style.display = 'none';
  prodCelebration.style.display = 'none';
  prodNextBtn.style.display = 'none';
  prodCaption.textContent = '';
}

function showPromptPicker() {
  // Show the choice: same prompt or new one
  document.getElementById('productivity-box').style.display = 'none';
  prodGoalCard.style.display = 'none';
  prodCelebration.style.display = 'none';
  prodNextBtn.style.display = 'none';
  document.getElementById('prod-prompt-picker').style.display = 'flex';
  prodCaption.textContent = '';
}

function showSavedGoal(goalText) {
  prodGoalText.textContent = goalText;
  document.getElementById('productivity-box').style.display = 'none';
  document.getElementById('prod-prompt-picker').style.display = 'none';
  prodGoalCard.style.display = 'flex';
  prodCelebration.style.display = 'none';
  prodNextBtn.style.display = 'none';
  prodCaption.textContent = 'You committed to this. Now go do it.';
}

function initProductivity() {
  chrome.storage.local.get('savedGoal', (result) => {
    if (result.savedGoal) {
      showSavedGoal(result.savedGoal);
    } else {
      showProductivityInput();
    }
  });
}

// Enable submit only when there's text
prodInput.addEventListener('input', () => {
  prodSubmitBtn.disabled = prodInput.value.trim() === '';
});

// Save goal
prodSubmitBtn.addEventListener('click', () => {
  const goal = prodInput.value.trim();
  if (!goal) return;
  chrome.storage.local.set({ savedGoal: goal }, () => {
    showSavedGoal(goal);
  });
});

// Swap to a different prompt
document.getElementById('prod-swap-btn').addEventListener('click', () => {
  showProductivityInput();
});

// Mark goal as done → show prompt picker
prodDoneBtn.addEventListener('click', () => {
  chrome.storage.local.remove('savedGoal', () => {
    prodGoalCard.style.display = 'none';
    prodCelebration.style.display = 'flex';
    prodNextBtn.style.display = 'block';
    prodCaption.textContent = "You said you would. You did. That's everything.";
    launchConfetti(document.getElementById('prod-confetti-canvas'));
  });
});

// Clear goal → show prompt picker
prodClearBtn.addEventListener('click', () => {
  chrome.storage.local.remove('savedGoal', () => {
    showPromptPicker();
  });
});

// After celebrating, ask same or new prompt
prodNextBtn.addEventListener('click', () => {
  showPromptPicker();
});

// Prompt picker: same prompt
document.getElementById('prod-same-prompt-btn').addEventListener('click', () => {
  showProductivityInput(currentProdPrompt);
});

// Prompt picker: new prompt
document.getElementById('prod-new-prompt-btn').addEventListener('click', () => {
  showProductivityInput();
});

// ─── Confetti ─────────────────────────────────────────────────
function launchConfetti(canvas) {
  if (!canvas) return;
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const pieces = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    w: 6 + Math.random() * 6,
    h: 10 + Math.random() * 6,
    color: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6ef7'][Math.floor(Math.random() * 5)],
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    vx: (Math.random() - 0.5) * 3,
    vy: 2 + Math.random() * 3,
  }));

  let frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let allGone = true;
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      if (p.y < canvas.height + 20) allGone = false;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (!allGone) { frame = requestAnimationFrame(draw); }
    else { canvas.style.display = 'none'; cancelAnimationFrame(frame); }
  }
  if (frame) cancelAnimationFrame(frame);
  draw();
}

// ─── Init ─────────────────────────────────────────────────────
chrome.storage.local.get('lastMode', (result) => {
  const saved = result.lastMode || 'animals';
  switchMode(saved);
  if (saved === 'animals') fetchAnimal();
  else if (saved === 'quotes') fetchQuote();
  else if (saved === 'touchgrass') fetchGrass();
  else if (saved === 'movement') fetchMovement();
  else if (saved === 'productivity') initProductivity();
});