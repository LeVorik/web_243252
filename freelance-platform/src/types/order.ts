export interface Order {
  id: string | number;
  title: string;
  description: string;
  price: number;
  status: 'open' | 'in_progress' | 'completed';
  customerId: string | number;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}

export interface OrderResponse {
  id: string | number;
  orderId: string | number;
  freelancerId: string | number;
  freelancerName: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  createdAt: string;
}
