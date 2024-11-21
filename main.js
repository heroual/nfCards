import { auth } from './js/firebase.js';
import { login, createAccount, signOut } from './js/auth.js';
import { CardManager } from './js/cards.js';
import { NFCManager } from './js/nfc.js';

let currentUser = null;
let cardManager = null;
let nfcManager = null;

// Initialize DOM elements and event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Auth UI Management
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');
  const loginSwitch = document.getElementById('login-switch');
  const registerSwitch = document.getElementById('register-switch');

  function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginSwitch.style.display = 'none';
    registerSwitch.style.display = 'block';
  }

  function showLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    registerSwitch.style.display = 'none';
    loginSwitch.style.display = 'block';
  }

  if (showRegisterBtn) showRegisterBtn.addEventListener('click', showRegisterForm);
  if (showLoginBtn) showLoginBtn.addEventListener('click', showLoginForm);

  // Login Form Handler
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorElement = document.getElementById('login-error');
      
      try {
        currentUser = await login(email, password);
        errorElement.textContent = '';
        loginForm.reset();
        initializeApp();
      } catch (error) {
        errorElement.textContent = error.message;
      }
    });
  }

  // Register Form Handler
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const errorElement = document.getElementById('register-error');
      
      try {
        currentUser = await createAccount(email, password, fullName);
        errorElement.textContent = '';
        registerForm.reset();
        initializeApp();
      } catch (error) {
        errorElement.textContent = error.message;
      }
    });
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
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b === btn);
      });
    });
  });

  // Initialize view
  showView('auth-section');
});

// Initialize NFC
async function initializeNFC() {
  try {
    nfcManager = new NFCManager();
    const nfcStatus = document.getElementById('nfc-status');
    const nfcControls = document.getElementById('nfc-controls');
    
    const supported = await nfcManager.initialize();
    
    if (supported) {
      nfcStatus.innerHTML = `
        <div class="success-message">NFC is available and ready to use</div>
      `;
      nfcControls.innerHTML = `
        <button id="write-nfc" class="primary-btn">Write to NFC Tag</button>
      `;
    } else {
      nfcStatus.innerHTML = `
        <div class="info-message">
          NFC is not available on this device. You can still use other features.
        </div>
      `;
      nfcControls.innerHTML = '';
    }
  } catch (error) {
    console.log('NFC initialization error:', error.message);
  }
}

// Auth state observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = {
      id: user.uid,
      email: user.email,
      fullName: user.displayName || 'User'
    };
    await initializeApp();
  } else {
    currentUser = null;
    showView('auth-section');
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
async function initializeApp() {
  showView('main-section');
  updateHeaderGreeting();
  cardManager = new CardManager(currentUser.id);
  await cardManager.loadCards();
  await initializeNFC();
  renderAllCards();
}

function updateHeaderGreeting() {
  const header = document.querySelector('header h1');
  if (header) {
    const timeOfDay = getTimeOfDay();
    header.textContent = `${timeOfDay}, ${currentUser.fullName}`;
  }
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// Card Rendering
function renderAllCards() {
  renderBusinessCards();
  renderEventCards();
  renderRatingCards();
}

function renderBusinessCards() {
  const grid = document.getElementById('business-cards-grid');
  if (!grid) return;
  grid.innerHTML = cardManager.cards.business.map(card => `
    <div class="card business-card">
      <h3>${card.name}</h3>
      <p>${card.position}</p>
      <p>${card.company}</p>
      <p>${card.email}</p>
      <p>${card.phone}</p>
      <p>${card.website || ''}</p>
      <button onclick="deleteCard('${card.id}')" class="delete-btn">Delete</button>
    </div>
  `).join('');
}

function renderEventCards() {
  const grid = document.getElementById('event-cards-grid');
  if (!grid) return;
  grid.innerHTML = cardManager.cards.events.map(card => `
    <div class="card event-card">
      <h3>${card.name}</h3>
      <p>${card.date}</p>
      <p>${card.location}</p>
      <p>${card.description}</p>
      <button onclick="deleteCard('${card.id}')" class="delete-btn">Delete</button>
    </div>
  `).join('');
}

function renderRatingCards() {
  const grid = document.getElementById('rating-cards-grid');
  if (!grid) return;
  grid.innerHTML = cardManager.cards.ratings.map(card => `
    <div class="card rating-card">
      <h3>${card.businessName}</h3>
      <p>Rating Link: <a href="${card.ratingLink}" target="_blank">Leave a Review</a></p>
      <button onclick="deleteCard('${card.id}')" class="delete-btn">Delete</button>
    </div>
  `).join('');
}

// Logout
async function logout() {
  try {
    await signOut();
    currentUser = null;
    cardManager = null;
    showView('auth-section');
    showLoginForm();
  } catch (error) {
    alert('Error signing out');
  }
}

// Make deleteCard available globally
window.deleteCard = async (cardId) => {
  try {
    await cardManager.deleteCard(cardId);
    renderAllCards();
  } catch (error) {
    alert('Error deleting card');
  }
};