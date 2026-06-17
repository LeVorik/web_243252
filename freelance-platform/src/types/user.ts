export type Role = 'admin' | 'customer' | 'freelancer';

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}