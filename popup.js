const button = document.getElementById('puppy-button');
const img = document.getElementById('puppy-img');
const placeholder = document.getElementById('placeholder');
const loading = document.getElementById('loading');
const caption = document.getElementById('caption');

const captions = [
  "You needed this. 🐾",
  "Everything is better now.",
  "Good boy energy activated.",
  "Serotonin: delivered.",
  "World's problems: temporarily solved.",
  "Science says this helps. Probably.",
  "You're doing great. So is this dog.",
];

async function fetchPuppy() {
  // Show loading state
  placeholder.style.display = 'none';
  img.style.display = 'none';
  loading.style.display = 'block';
  button.disabled = true;
  caption.textContent = '';

  try {
    // dog.ceo is a free, no-auth public API — perfect for this
    const response = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await response.json();

    const newImg = new Image();
    newImg.onload = () => {
      img.src = newImg.src;
      img.style.display = 'block';
      loading.style.display = 'none';
      button.disabled = false;
      caption.textContent = captions[Math.floor(Math.random() * captions.length)];
      button.textContent = '🐾 Another One';
    };
    newImg.onerror = showError;
    newImg.src = data.message;

  } catch (err) {
    showError();
  }
}

function showError() {
  loading.style.display = 'none';
  placeholder.style.display = 'block';
  placeholder.textContent = '😢';
  caption.textContent = 'No wifi? Even puppies need internet.';
  button.disabled = false;
}

button.addEventListener('click', fetchPuppy);

// Auto-load a puppy on open so users get instant joy
fetchPuppy();
