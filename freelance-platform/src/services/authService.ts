import { api } from './api';
import type { User } from '../types/user';

export const authService = {
  async login(email: string, password: string): Promise<User | null> {
    const response = await api.get<User[]>(`/users?email=${email}&password=${password}`);
    return response.data.length > 0 ? response.data[0] : null;
  },

  async register(userData: Omit<User, 'id'> & { password: string }): Promise<User> {
    const response = await api.post<User>('/users', userData);
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, userData);
    return response.data;
  },
};