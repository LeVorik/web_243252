import { api } from './api';
import type { User } from '../types/user';

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/users');
    return response.data;
  },
};