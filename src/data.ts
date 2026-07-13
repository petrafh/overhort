import type { Quote, User } from './types'

export const currentUser: User = {
  id: 'ida',
  name: 'Ida Solberg',
  username: 'idasol',
  initials: 'IS',
  avatar: 'linear-gradient(145deg, #1d2530 0%, #64707c 100%)',
  bio: 'Halvt menneske, halvt kaffe. Oslo.',
  friendCount: 128,
  isFriend: true,
}

export const friends: User[] = [
  { id: 'thea', name: 'Thea Berg', username: 'theaberg', initials: 'TB', avatar: 'linear-gradient(145deg, #7a4d3d, #d6a584)', bio: 'Tar livet passe seriøst.', friendCount: 92, isFriend: true },
  { id: 'jonas', name: 'Jonas Vik', username: 'jonasvik', initials: 'JV', avatar: 'linear-gradient(145deg, #314f43, #89a99b)', bio: 'Ute hvis det ikke regner.', friendCount: 84, isFriend: true },
  { id: 'selma', name: 'Selma Noor', username: 'selman', initials: 'SN', avatar: 'linear-gradient(145deg, #523e69, #ad91c9)', bio: 'Kamera først, spørsmål etterpå.', friendCount: 156, isFriend: true },
  { id: 'aksel', name: 'Aksel Moen', username: 'akselm', initials: 'AM', avatar: 'linear-gradient(145deg, #7c713c, #c8bd79)', bio: 'Ingen plan, god stemning.', friendCount: 73, isFriend: true },
]

const [thea, jonas, selma, aksel] = friends

export const initialQuotes: Quote[] = [
  {
    id: 'q1',
    text: 'Jeg er ikke sen, jeg er bare veldig tidlig til neste avtale.',
    subject: thea,
    postedBy: currentUser,
    timestamp: '12 min',
    color: '#A75D50',
    liked: false,
    likes: 24,
    comments: [
      { id: 'c1', author: jonas, text: 'Dette forklarer så mye 😭' },
      { id: 'c2', author: selma, text: 'Hun kom 40 min for sent.' },
    ],
  },
  {
    id: 'q2',
    text: 'Har pingviner knær, eller går de bare på ren viljestyrke?',
    subject: jonas,
    postedBy: selma,
    timestamp: '2 t',
    color: '#496F6B',
    liked: true,
    likes: 47,
    comments: [{ id: 'c3', author: aksel, text: 'Et viktig spørsmål faktisk.' }],
  },
  {
    id: 'q3',
    text: 'Det er ikke overtenking hvis jeg har rett til slutt.',
    subject: currentUser,
    postedBy: thea,
    timestamp: '5 t',
    color: '#76608A',
    liked: false,
    likes: 31,
    comments: [{ id: 'c4', author: selma, text: '– Ida, hver eneste tirsdag' }],
  },
  {
    id: 'q4',
    text: 'Jeg har et veldig sunt forhold til skjermtid. Vi sees hele tiden.',
    subject: aksel,
    postedBy: jonas,
    timestamp: 'i går',
    color: '#A17B3F',
    liked: false,
    likes: 62,
    comments: [],
  },
]

export const pendingRequests: User[] = [
  { id: 'maria', name: 'Maria Eng', username: 'mariaeng', initials: 'ME', avatar: 'linear-gradient(145deg, #7c3f56, #c88aa0)', bio: 'Lager lister jeg aldri følger.', friendCount: 61, isFriend: false },
  { id: 'emil', name: 'Emil Strand', username: 'emilstrand', initials: 'ES', avatar: 'linear-gradient(145deg, #354d69, #86a2be)', bio: 'Musikk, mat og middels gode ideer.', friendCount: 105, isFriend: false },
]

export const quoteColors = ['#A75D50', '#496F6B', '#76608A', '#A17B3F', '#536B87', '#9A646E']
