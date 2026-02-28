// ─── Element refs ────────────────────────────────────────────
const togglePill    = document.getElementById('toggle-pill');
const modeOptions   = document.querySelectorAll('.mode-option');
const panels        = document.querySelectorAll('.panel');

// Animals
const animalButtons = document.querySelectorAll('.animal-btn');
const animalImg     = document.getElementById('animal-img');
const placeholder   = document.getElementById('placeholder');
const animalLoading = document.getElementById('animal-loading');
const animalBtn     = document.getElementById('animal-btn');
const animalCaption = document.getElementById('animal-caption');

// Quotes
const quoteText     = document.getElementById('quote-text');
const quoteAuthor   = document.getElementById('quote-author');
const quoteLoading  = document.getElementById('quote-loading');
const quoteBtn      = document.getElementById('quote-btn');
const quoteCaption  = document.getElementById('quote-caption');

// Touch Grass
const grassEmoji    = document.getElementById('grass-emoji');
const grassAction   = document.getElementById('grass-action');
const grassDetail   = document.getElementById('grass-detail');
const grassBtn      = document.getElementById('grass-btn');
const grassCaption  = document.getElementById('grass-caption');

// ─── State ───────────────────────────────────────────────────
let currentMode   = 'animals';
let currentAnimal = 'dog';

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
const modeOrder = ['animals', 'quotes', 'touchgrass'];

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

// ─── Quotes (from quotes.js) ──────────────────────────────────
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

// ─── Touch Grass (from touchgrass.js) ────────────────────────
const grassReactions = ["Close the laptop.", "Do it. Right now.", "This one's non-negotiable.", "Your body will thank you.", "Seriously. Go."];
let lastGrassIndex = -1;

function fetchGrass() {
  let index;
  do { index = Math.floor(Math.random() * TOUCH_GRASS_PROMPTS.length); } while (index === lastGrassIndex);
  lastGrassIndex = index;
  const prompt = TOUCH_GRASS_PROMPTS[index];

  grassEmoji.textContent = prompt.emoji;
  grassAction.textContent = prompt.action;
  grassDetail.textContent = prompt.detail;
  grassCaption.textContent = grassReactions[Math.floor(Math.random() * grassReactions.length)];
}
grassBtn.addEventListener('click', fetchGrass);

// ─── Init ─────────────────────────────────────────────────────
chrome.storage.local.get('lastMode', (result) => {
  const saved = result.lastMode || 'animals';
  switchMode(saved);
  if (saved === 'animals') fetchAnimal();
  else if (saved === 'quotes') fetchQuote();
  else if (saved === 'touchgrass') fetchGrass();
});