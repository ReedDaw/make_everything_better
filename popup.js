// ─── Element refs ───────────────────────────────────────────
const togglePill       = document.getElementById('toggle-pill');
const modeOptions      = document.querySelectorAll('.mode-option');
const panels           = document.querySelectorAll('.panel');

// Animals
const animalButtons    = document.querySelectorAll('.animal-btn');
const animalImg        = document.getElementById('animal-img');
const placeholder      = document.getElementById('placeholder');
const animalLoading    = document.getElementById('animal-loading');
const animalBtn        = document.getElementById('animal-btn');
const animalCaption    = document.getElementById('animal-caption');

// Quotes
const quoteText        = document.getElementById('quote-text');
const quoteAuthor      = document.getElementById('quote-author');
const quoteLoading     = document.getElementById('quote-loading');
const quoteBtn         = document.getElementById('quote-btn');
const quoteCaption     = document.getElementById('quote-caption');

// ─── State ──────────────────────────────────────────────────
let currentMode   = 'animals';
let currentAnimal = 'dog';

// ─── Animal config ──────────────────────────────────────────
const animals = {
  dog: {
    emoji: '🐶',
    captions: [
      "You needed this. 🐾",
      "Good boy energy activated.",
      "Serotonin: delivered.",
      "You're doing great. So is this dog.",
      "World's problems: temporarily solved.",
    ],
    fetch: async () => {
      const res = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await res.json();
      return data.message;
    }
  },
  cat: {
    emoji: '🐱',
    captions: [
      "This cat does not care about your problems.",
      "Judging you, but lovingly.",
      "Cat energy unlocked.",
      "They're indifferent. It's healing.",
      "Serotonin: also delivered.",
    ],
    fetch: async () => {
      const res = await fetch('https://api.thecatapi.com/v1/images/search');
      const data = await res.json();
      return data[0].url;
    }
  },
  fox: {
    emoji: '🦊',
    captions: [
      "What does the fox say? Nothing. It's just cute.",
      "Chaotic good energy.",
      "Fox mode: activated.",
      "Sneaky little serotonin hit.",
      "This fox has more going on than you.",
    ],
    fetch: async () => {
      const res = await fetch('https://randomfox.ca/floof/');
      const data = await res.json();
      return data.image;
    }
  },
  lizard: {
    emoji: '🦎',
    captions: [
      "Lizard mode: activated.",
      "Cold blooded. Just like your deadlines.",
      "This lizard has no meetings today.",
      "Chaotic neutral energy.",
      "Nature's little weirdo. Iconic.",
    ],
    fetch: async () => {
      const res = await fetch('https://nekos.life/api/v2/img/lizard');
      const data = await res.json();
      return data.url;
    }
  }
};

const allAnimalKeys = ['dog', 'cat', 'fox', 'lizard'];

// ─── Mode toggle ─────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;

  // Move pill
  togglePill.classList.toggle('quotes', mode === 'quotes');

  // Update tab labels
  modeOptions.forEach(opt => {
    opt.classList.toggle('active', opt.dataset.mode === mode);
  });

  // Show correct panel
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `panel-${mode}`);
  });

  // Save to storage
  chrome.storage.local.set({ lastMode: mode });

  // Auto-fetch if switching to quotes and box is empty
  if (mode === 'quotes' && quoteText.textContent === '') {
    fetchQuote();
  }
}

modeOptions.forEach(opt => {
  opt.addEventListener('click', () => switchMode(opt.dataset.mode));
});

// ─── Animal fetching ─────────────────────────────────────────
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
  const animalKey = currentAnimal === 'surprise'
    ? allAnimalKeys[Math.floor(Math.random() * allAnimalKeys.length)]
    : currentAnimal;

  showAnimalLoading();

  try {
    const url = await animals[animalKey].fetch();
    const newImg = new Image();
    newImg.onload = () => {
      showAnimalImage(url);
      const captions = animals[animalKey].captions;
      animalCaption.textContent = captions[Math.floor(Math.random() * captions.length)];
    };
    newImg.onerror = showAnimalError;
    newImg.src = url;
  } catch (err) {
    showAnimalError();
  }
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

// ─── Quote fetching ──────────────────────────────────────────
const quoteReactions = [
  "Sit with that for a moment.",
  "Ok that one hit.",
  "Saving that one.",
  "Your future self needed to hear this.",
  "Someone really figured something out.",
];

function showQuoteLoading() {
  quoteLoading.style.display = 'block';
  quoteText.textContent = '';
  quoteAuthor.textContent = '';
  quoteBtn.disabled = true;
  quoteCaption.textContent = '';
}

function showQuoteError() {
  quoteLoading.style.display = 'none';
  quoteText.textContent = 'Could not load a quote right now.';
  quoteAuthor.textContent = '';
  quoteCaption.textContent = 'Check your connection and try again.';
  quoteBtn.disabled = false;
}

// Bundled quotes — no API needed, no CORS issues, no downtime
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "To see what is right and not do it is a lack of courage.", author: "Confucius" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { text: "Many of life's failures are people who did not realize how close they were to success when they gave up.", author: "Thomas A. Edison" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" },
  { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Money and success don't change people; they merely amplify what is already there.", author: "Will Smith" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
  { text: "If you're not stubborn, you'll give up on experiments too soon.", author: "Jeff Bezos" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
  { text: "Get busy living or get busy dying.", author: "Stephen King" },
  { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "Two roads diverged in a wood, and I took the one less traveled by.", author: "Robert Frost" },
  { text: "I attribute my success to this: I never gave or took any excuse.", author: "Florence Nightingale" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "I've learned that people will forget what you said, but people will never forget how you made them feel.", author: "Maya Angelou" },
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "Perfection is not attainable, but if we chase perfection we can catch excellence.", author: "Vince Lombardi" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "We become what we think about.", author: "Earl Nightingale" },
  { text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "Mark Twain" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "People often say that motivation doesn't last. Well, neither does bathing. That's why we recommend it daily.", author: "Zig Ziglar" },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
  { text: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "It is never too late to be what you might have been.", author: "George Eliot" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
];

let lastQuoteIndex = -1;

function getRandomQuote() {
  let index;
  do { index = Math.floor(Math.random() * QUOTES.length); }
  while (index === lastQuoteIndex);
  lastQuoteIndex = index;
  return QUOTES[index];
}

function fetchQuote() {
  showQuoteLoading();
  // Small timeout so the loading state is visible
  setTimeout(() => {
    const quote = getRandomQuote();
    quoteLoading.style.display = 'none';
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
    quoteBtn.disabled = false;
    quoteCaption.textContent = quoteReactions[Math.floor(Math.random() * quoteReactions.length)];
  }, 300);
}

quoteBtn.addEventListener('click', fetchQuote);

// ─── Init: restore last mode from storage ───────────────────
chrome.storage.local.get('lastMode', (result) => {
  const savedMode = result.lastMode || 'animals';
  switchMode(savedMode);

  // Always auto-fetch on open for whichever panel is shown
  if (savedMode === 'animals') {
    fetchAnimal();
  } else {
    fetchQuote();
  }
});