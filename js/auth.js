import { generateId } from './utils.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

const users = loadFromLocalStorage('users') || [];

export function createAccount(email, password, fullName) {
  if (users.find(user => user.email === email)) {
    throw new Error('Email already exists');
  }

  const user = {
    id: generateId(),
    email,
    password: hashPassword(password),
    fullName,
    created: new Date().toISOString()
  };

  users.push(user);
  saveToLocalStorage('users', users);
  return { id: user.id, email: user.email, fullName: user.fullName };
}

export function login(email, password) {
  const user = users.find(u => u.email === email);
  if (!user || !verifyPassword(password, user.password)) {
    throw new Error('Invalid credentials');
  }
  return { id: user.id, email: user.email, fullName: user.fullName };
}

function hashPassword(password) {
  // In a real app, use bcrypt. For demo, we'll use a simple hash
  return btoa(password);
}

function verifyPassword(password, hash) {
  return btoa(password) === hash;
}