import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase.js';
import { generateId } from './utils.js';

export class CardManager {
  constructor(userId) {
    this.userId = userId;
    this.cards = {
      business: [],
      events: [],
      ratings: []
    };
  }

  async loadCards() {
    try {
      const cardsRef = collection(db, 'cards');
      const q = query(cardsRef, where('userId', '==', this.userId));
      const querySnapshot = await getDocs(q);
      
      this.cards = {
        business: [],
        events: [],
        ratings: []
      };

      querySnapshot.forEach((doc) => {
        const card = { id: doc.id, ...doc.data() };
        this.cards[card.type].push(card);
      });

      return this.cards;
    } catch (error) {
      console.error('Error loading cards:', error);
      throw error;
    }
  }

  async addBusinessCard(data) {
    try {
      const card = {
        type: 'business',
        userId: this.userId,
        ...data,
        created: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'cards'), card);
      card.id = docRef.id;
      this.cards.business.push(card);
      return card;
    } catch (error) {
      console.error('Error adding business card:', error);
      throw error;
    }
  }

  async addEventCard(data) {
    try {
      const card = {
        type: 'event',
        userId: this.userId,
        ...data,
        created: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'cards'), card);
      card.id = docRef.id;
      this.cards.events.push(card);
      return card;
    } catch (error) {
      console.error('Error adding event card:', error);
      throw error;
    }
  }

  async addRatingCard(data) {
    try {
      const card = {
        type: 'rating',
        userId: this.userId,
        ...data,
        created: new Date().toISOString(),
        ratingLink: this.generateGoogleRatingLink(data)
      };

      const docRef = await addDoc(collection(db, 'cards'), card);
      card.id = docRef.id;
      this.cards.ratings.push(card);
      return card;
    } catch (error) {
      console.error('Error adding rating card:', error);
      throw error;
    }
  }

  generateGoogleRatingLink({ businessName, placeId }) {
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  }

  async deleteCard(cardId) {
    try {
      await deleteDoc(doc(db, 'cards', cardId));
      ['business', 'events', 'ratings'].forEach(type => {
        this.cards[type] = this.cards[type].filter(card => card.id !== cardId);
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}