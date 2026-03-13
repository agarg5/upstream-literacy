import api from './api';

export interface User {
  id: number;
  email: string;
  name: string;
  title: string;
  role: string;
  district_id: number | null;
  district: District | null;
  problems: Problem[];
  challenge_text: string | null;
  bio: string | null;
  created_at: string | null;
}

export interface District {
  id: number;
  nces_id: string;
  name: string;
  state: string;
  city: string;
  type: string;
  enrollment: number;
  free_reduced_lunch_pct: number;
  esl_pct: number;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface Member {
  id: number;
  name: string;
  title: string;
  district: District | null;
  problems: Problem[];
  match_score: number | null;
  shared_problems: Problem[];
  challenge_text?: string | null;
  bio?: string | null;
  commonalities?: {
    shared_problems: Problem[];
    same_district_type: boolean;
    similar_size: boolean;
    similar_frl: boolean;
    similar_esl: boolean;
  };
}

export interface ConversationSummary {
  id: number;
  participants: { id: number; name: string; title: string; role: string }[];
  last_message: { id: number; sender_id: number; body: string; created_at: string } | null;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  body: string;
  is_system: boolean;
  created_at: string;
}

export async function register(email: string, password: string, name: string, title: string) {
  const res = await api.post('/api/auth/register', { email, password, name, title });
  localStorage.setItem('token', res.data.access_token);
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post('/api/auth/login', { email, password });
  localStorage.setItem('token', res.data.access_token);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get('/api/auth/me');
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login';
}

export function isLoggedIn() {
  return !!localStorage.getItem('token');
}
