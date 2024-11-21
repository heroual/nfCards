import { generateId } from './utils.js';
import { saveToLocalStorage, loadFromLocalStorage } from './storage.js';

export class CardManager {
  constructor(userId) {
    this.userId = userId;
    this.cards = loadFromLocalStorage(`cards_${userId}`) || {
      business: [],
      events: [],
      ratings: []
    };
  }

  addBusinessCard(data) {
    const card = {
      id: generateId(),
      type: 'business',
      ...data,
      created: new Date().toISOString()
    };
    this.cards.business.push(card);
    this.save();
    return card;
  }

  addEventCard(data) {
    const card = {
      id: generateId(),
      type: 'event',
      ...data,
      created: new Date().toISOString()
    };
    this.cards.events.push(card);
    this.save();
    return card;
  }

  addRatingCard(data) {
    const card = {
      id: generateId(),
      type: 'rating',
      ...data,
      created: new Date().toISOString(),
      ratingLink: this.generateGoogleRatingLink(data)
    };
    this.cards.ratings.push(card);
    this.save();
    return card;
  }

  generateGoogleRatingLink({ businessName, placeId }) {
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  }

  save() {
    saveToLocalStorage(`cards_${this.userId}`, this.cards);
  }
}