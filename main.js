import { auth } from './js/firebase.js';
import { login, createAccount, signOut } from './js/auth.js';
import { CardManager } from './js/cards.js';
import { NFCManager } from './js/nfc.js';

let currentUser = null;
let cardManager = null;
let nfcManager = null;

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterBtn = document.getElementById('show-register');
  const showLoginBtn = document.getElementById('show-login');
  const loginSwitch = document.getElementById('login-switch');
  const registerSwitch = document.getElementById('register-switch');
  const newBusinessCardBtn = document.getElementById('new-business-card-btn');
  const newEventCardBtn = document.getElementById('new-event-card-btn');
  const newRatingCardBtn = document.getElementById('new-rating-card-btn');

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

  if (newBusinessCardBtn) {
    newBusinessCardBtn.addEventListener('click', () => {
      showCardForm('business');
    });
  }

  if (newEventCardBtn) {
    newEventCardBtn.addEventListener('click', () => {
      showCardForm('event');
    });
  }

  if (newRatingCardBtn) {
    newRatingCardBtn.addEventListener('click', () => {
      showCardForm('rating');
    });
  }

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
});

function showCardForm(type) {
  const formHtml = createCardFormHtml(type);
  const formContainer = document.createElement('div');
  formContainer.className = 'modal';
  formContainer.innerHTML = formHtml;
  document.body.appendChild(formContainer);

  const form = formContainer.querySelector('form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    try {
      switch(type) {
        case 'business':
          await cardManager.addBusinessCard(data);
          break;
        case 'event':
          await cardManager.addEventCard(data);
          break;
        case 'rating':
          await cardManager.addRatingCard(data);
          break;
      }
      renderAllCards();
      formContainer.remove();
    } catch (error) {
      console.error('Error creating card:', error);
    }
  });

  formContainer.querySelector('.close-modal').addEventListener('click', () => {
    formContainer.remove();
  });
}

function createCardFormHtml(type) {
  switch(type) {
    case 'business':
      return `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h2>New Business Card</h2>
          <form>
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="position">Position</label>
              <input type="text" id="position" name="position" required>
            </div>
            <div class="form-group">
              <label for="company">Company</label>
              <input type="text" id="company" name="company" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" name="phone" required>
            </div>
            <div class="form-group">
              <label for="website">Website (optional)</label>
              <input type="url" id="website" name="website">
            </div>
            <button type="submit" class="primary-btn">Create Card</button>
          </form>
        </div>
      `;
    case 'event':
      return `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h2>New Event Card</h2>
          <form>
            <div class="form-group">
              <label for="name">Event Name</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="date">Date</label>
              <input type="datetime-local" id="date" name="date" required>
            </div>
            <div class="form-group">
              <label for="location">Location</label>
              <input type="text" id="location" name="location" required>
            </div>
            <div class="form-group">
              <label for="description">Description</label>
              <textarea id="description" name="description" required></textarea>
            </div>
            <button type="submit" class="primary-btn">Create Card</button>
          </form>
        </div>
      `;
    case 'rating':
      return `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h2>New Rating Card</h2>
          <form>
            <div class="form-group">
              <label for="businessName">Business Name</label>
              <input type="text" id="businessName" name="businessName" required>
            </div>
            <div class="form-group">
              <label for="placeId">Google Place ID</label>
              <input type="text" id="placeId" name="placeId" required>
            </div>
            <button type="submit" class="primary-btn">Create Card</button>
          </form>
        </div>
      `;
  }
}

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
  if (header && currentUser) {
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
      <p>${new Date(card.date).toLocaleString()}</p>
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

window.deleteCard = async (cardId) => {
  try {
    await cardManager.deleteCard(cardId);
    renderAllCards();
  } catch (error) {
    alert('Error deleting card');
  }
};