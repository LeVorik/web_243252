import { api } from './api';
import type { Order } from '../types/order';

export const ordersService = {
  async getOrders(): Promise<Order[]> {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const response = await api.post<Order>('/orders', {
      ...orderData,
      createdAt: new Date().toISOString(),
    });
    return response.data;
  },

  async deleteOrder(id: string | number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
  async updateOrderStatus(id: string | number, status: 'open' | 'in_progress' | 'completed'): Promise<Order> {
    const response = await api.patch<Order>(`/orders/${id}`, { status });
    return response.data;
  },
};
