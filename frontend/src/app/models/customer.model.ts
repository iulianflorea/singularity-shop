export interface Customer {
  id: number;
  email: string;
  name: string;
  address: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  customer: Customer;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  address?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
