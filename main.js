import { login, createAccount } from './js/auth.js';
import { CardManager } from './js/cards.js';
import { NFCManager } from './js/nfc.js';

let currentUser = null;
let cardManager = null;
let nfcManager = null;

// Initialize NFC
async function initializeNFC() {
  nfcManager = new NFCManager();
  const nfcStatus = document.getElementById('nfc-status');
  const supported = await nfcManager.initialize();
  
  nfcStatus.textContent = supported 
    ? 'NFC is ready to use' 
    : 'NFC is not supported on this device';
}

// Auth Management
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    currentUser = await login(email, password);
    initializeApp();
  } catch (error) {
    alert(error.message);
  }
});

// View Management
function showView(viewId) {
  document.querySelectorAll('.view').forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });
}

function showContentView(viewId) {
  document.querySelectorAll('.content-view').forEach(view => {
    view.classList.toggle('active', view.id === viewId);
  });
}

// Initialize App after Login
function initializeApp() {
  showView('main-section');
  cardManager = new CardManager(currentUser.id);
  initializeNFC();
  renderAllCards();
}

// Card Rendering
function renderAllCards() {
  renderBusinessCards();
  renderEventCards();
  renderRatingCards();
}

function renderBusinessCards() {
  const grid = document.getElementById('business-cards-grid');
  grid.innerHTML = cardManager.cards.business.map(card => `
    <div class="card business-card">
      <h3>${card.name}</h3>
      <p>${card.position}</p>
      <p>${card.company}</p>
      <p>${card.email}</p>
      <p>${card.phone}</p>
      <p>${card.website || ''}</p>
    </div>
  `).join('');
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.id === 'logout-btn') {
      logout();
      return;
    }
    const view = btn.dataset.view;
    showContentView(`${view}-view`);
  });
});

// Logout
function logout() {
  currentUser = null;
  cardManager = null;
  showView('auth-section');
}

// Initialize
showView('auth-section');