
export type UserRole = 'GUEST' | 'HOST';

export type Currency = 'IDR' | 'MYR' | 'SGD' | 'CAD' | 'USD';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: UserRole;
  currency: Currency;
  isHostRegistered: boolean;
}

export interface Car {
  id: string;
  hostId: string;
  make: string;
  model: string;
  year: number;
  pricePerDayIdr: number;
  location: string;
  description: string;
  imageUrl: string;
  isSponsored: boolean;
  available: boolean;
  rating?: number;
  trips?: number;
  features?: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  censored: boolean;
}

export interface Conversation {
  id: string;
  guestId: string;
  hostId: string;
  carId: string;
  messages: Message[];
  lastUpdated: number;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface BookingRequest {
  id: string;
  carId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  totalPriceIdr: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED';
}
