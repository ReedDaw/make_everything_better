const fetchButton = document.getElementById('fetch-button');
const img = document.getElementById('animal-img');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const caption = document.getElementById('caption');
const animalButtons = document.querySelectorAll('.animal-btn');

let currentAnimal = 'dog';

// --- Animal config ---
// Each animal has an emoji, a fetch function, and captions
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
  duck: {
    emoji: '🦆',
    captions: [
      "Quack.",
      "Duck energy: activated.",
      "Nature's most underrated animal.",
      "This duck has its life together.",
      "Stress level: approaching zero.",
    ],
    fetch: async () => {
      const res = await fetch('https://random-d.uk/api/random');
      const data = await res.json();
      return data.url;
    }
  }
};

const allAnimalKeys = ['dog', 'cat', 'fox', 'duck'];

// --- UI helpers ---
function setPlaceholder(emoji) {
  placeholder.textContent = emoji;
  placeholder.style.display = 'block';
  img.style.display = 'none';
}

function showLoading() {
  placeholder.style.display = 'none';
  img.style.display = 'none';
  loading.style.display = 'block';
  fetchButton.disabled = true;
  caption.textContent = '';
}

function showImage(src) {
  img.src = src;
  img.style.display = 'block';
  loading.style.display = 'none';
  fetchButton.disabled = false;
  fetchButton.textContent = '🐾 Another One';
}

function showError() {
  loading.style.display = 'none';
  placeholder.style.display = 'block';
  placeholder.textContent = '😢';
  caption.textContent = 'No wifi? Even cute animals need internet.';
  fetchButton.disabled = false;
}

function pickCaption(animalKey) {
  const list = animals[animalKey].captions;
  return list[Math.floor(Math.random() * list.length)];
}

// --- Fetch logic ---
async function fetchAnimal() {
  const animalKey = currentAnimal === 'surprise'
    ? allAnimalKeys[Math.floor(Math.random() * allAnimalKeys.length)]
    : currentAnimal;

  showLoading();

  try {
    const url = await animals[animalKey].fetch();

    const newImg = new Image();
    newImg.onload = () => {
      showImage(url);
      caption.textContent = pickCaption(animalKey);
    };
    newImg.onerror = showError;
    newImg.src = url;
  } catch (err) {
    showError();
  }
}

// --- Animal selector buttons ---
animalButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    animalButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAnimal = btn.dataset.animal;

    // Update placeholder emoji to match selection
    if (currentAnimal === 'surprise') {
      setPlaceholder('🎲');
    } else {
      setPlaceholder(animals[currentAnimal].emoji);
    }

    // Auto-fetch when switching animal
    fetchAnimal();
  });
});

fetchButton.addEventListener('click', fetchAnimal);

// Auto-load on open
fetchAnimal();