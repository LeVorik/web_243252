export type Role = 'admin' | 'customer' | 'freelancer';

export interface User {
  id: string | number;
  email: string;
  password?: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}
