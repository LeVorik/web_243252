import { api } from './api';
import type { OrderResponse } from '../types/order';

export const responsesService = {
  async getByOrder(orderId: number): Promise<OrderResponse[]> {
    const res = await api.get<OrderResponse[]>(`/responses?orderId=${orderId}`);
    return res.data;
  },

  async create(data: Omit<OrderResponse, 'id' | 'createdAt'>): Promise<OrderResponse> {
    const res = await api.post<OrderResponse>('/responses', {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return res.data;
  },
};