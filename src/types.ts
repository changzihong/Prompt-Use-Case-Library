export type UserRole = 'contributor' | 'explorer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  dept: string;
  role: UserRole;
  createdAt: string;
}

export interface PromptCard {
  id: string;
  title: string;
  use_case: string;
  prompt: string;
  tags: string[];
  author_name: string;
  author_role: string;
  created_at: string;
  expires_at: string;
  view_count: number;
  avg_rating?: number;
  rating_count?: number;
  comment_count: number;
  session_id?: string;
  photos?: Photo[];
}

export interface Photo {
  id: string;
  prompt_id: string;
  url: string;
  order: number;
  created_at: string;
}

export interface Rating {
  id: string;
  prompt_id: string;
  stars: number;
  created_at: string;
}

export interface Comment {
  id: string;
  prompt_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface Report {
  id: string;
  userId: string;
  cardId?: string;
  commentId?: string;
  reason: string;
  status: 'pending' | 'resolved';
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  dept: string;
  joinedAt: string;
}

export type FeedItemType = 'text' | 'image' | 'link' | 'announcement';

export interface FeedItem {
  id: string;
  sessionId: string;
  type: FeedItemType;
  title: string;
  useCase: string;
  prompt: string;
  imageUrl?: string;
  linkUrl?: string;
  authorName: string;
  authorDept: string;
  createdAt: string;
  likes: number;
  ratings: number[];
  comments: {
    id: string;
    authorName: string;
    text: string;
    createdAt: string;
  }[];
}

export interface SessionData {
  id: string;
  adminId: string;
  users: SessionUser[];
  feed: FeedItem[];
  createdAt: string;
}
