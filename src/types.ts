export type Tab = 'feed' | 'create' | 'profile' | 'friends'

export interface User {
  id: string
  name: string
  username: string
  initials: string
  avatar: string
  bio: string
  friendCount: number
  isFriend: boolean
}

export interface Comment {
  id: string
  author: Pick<User, 'name' | 'username' | 'initials' | 'avatar'>
  text: string
}

export interface Quote {
  id: string
  text: string
  subject: User
  postedBy: User
  timestamp: string
  color: string
  liked: boolean
  likes: number
  comments: Comment[]
}
