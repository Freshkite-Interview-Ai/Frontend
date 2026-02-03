import apiClient from './api';
import { ApiResponse, Plan, User } from '@/types';

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  plan: Plan;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayHandlerResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  notes?: Record<string, string | undefined>;
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

export const paymentService = {
  createOrder: async (plan: Plan): Promise<ApiResponse<CreateOrderResponse>> => {
    const response = await apiClient.post<ApiResponse<CreateOrderResponse>>('/payment/create-order', {
      plan,
    });
    return response.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<ApiResponse<{ status: string }>> => {
    const response = await apiClient.post<ApiResponse<{ status: string }>>('/payment/verify', payload);
    return response.data;
  },

  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  openCheckout: (
    order: CreateOrderResponse,
    user: User | null
  ): Promise<RazorpayHandlerResponse> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      const options: RazorpayOptions = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Interview App',
        description: `${order.plan === 'basic' ? 'Basic' : 'Pro'} Plan`,
        order_id: order.orderId,
        prefill: {
          name: user ? `${user.firstName} ${user.lastName}`.trim() : undefined,
          email: user?.email,
        },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  },
};

export default paymentService;
