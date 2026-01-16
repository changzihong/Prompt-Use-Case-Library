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
