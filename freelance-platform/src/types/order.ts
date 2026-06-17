export interface Order {
  id: number;
  title: string;
  description: string;
  price: number;
  status: 'open' | 'in_progress' | 'completed';
  customerId: number;
  fileUrl?: string;
  createdAt: string;
}

export interface OrderResponse {
  id: number;
  orderId: number;
  freelancerId: number;
  freelancerName: string;
  message: string;
  fileUrl?: string;
  createdAt: string;
}