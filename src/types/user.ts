export type UserRole = 'Apprentice' | 'Practitioner' | 'Expert' | 'Elite';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  provider: 'google' | 'email' | 'demo';
  avatarUrl?: string;
  createdAt: string;
}
