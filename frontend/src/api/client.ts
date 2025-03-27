import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface WishList {
  id: number;
  name: string;
  userID: number;
  items: WishItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishItem {
  id: number;
  title: string;
  description: string;
  url: string;
  wishListID: number;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  auth: {
    login: (credentials: LoginCredentials) =>
      client.post('/auth/login', credentials),
    register: (credentials: RegisterCredentials) =>
      client.post('/auth/register', credentials),
  },
  wishlists: {
    list: () => client.get<WishList[]>('/wishlists'),
    get: (id: number) => client.get<WishList>(`/wishlists/${id}`),
    create: (name: string) => client.post<WishList>('/wishlists', { name }),
    update: (id: number, name: string) =>
      client.put<WishList>(`/wishlists/${id}`, { name }),
    delete: (id: number) => client.delete(`/wishlists/${id}`),
    addItem: (wishListId: number, item: Omit<WishItem, 'id' | 'wishListID' | 'createdAt' | 'updatedAt'>) =>
      client.post<WishItem>(`/wishlists/${wishListId}/items`, item),
  },
}; 