import type { Quote, User } from './types'

// Denne verdien blir erstattet av profilen brukeren oppretter før appen rendres.
// Produksjonsbygget inneholder ingen eksempelbrukere eller eksempelinnhold.
export const currentUser: User = {
  id: 'current-user',
  name: 'Ny bruker',
  username: 'nybruker',
  initials: 'DU',
  avatar: 'linear-gradient(145deg, #1d2530 0%, #64707c 100%)',
  bio: '',
  friendCount: 0,
  isFriend: true,
}

export const friends: User[] = []
export const initialQuotes: Quote[] = []
export const pendingRequests: User[] = []

export const quoteColors = ['#A75D50', '#496F6B', '#76608A', '#A17B3F', '#536B87', '#9A646E']
