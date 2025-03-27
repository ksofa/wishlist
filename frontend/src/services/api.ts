import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик запросов для добавления токена
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерфейсы для типизации данных
export interface WishList {
  id: number;
  name: string;
  description: string;
  user_id: number;
  status: string;
  is_public: boolean;
  share_code?: string;
  created_at: string;
  updated_at: string;
  items: WishItem[];
}

export interface WishItem {
  id: number;
  wishlist_id: number;
  name: string;
  description: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWishListRequest {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateWishListRequest {
  name?: string;
  description?: string;
  status?: string;
  is_public?: boolean;
}

export interface CreateWishItemRequest {
  name: string;
  description?: string;
  priority?: number;
}

export interface ShareSettings {
  is_public: boolean;
}

// API сервис
export const api = {
  // Аутентификация
  auth: {
    login: (email: string, password: string) => 
      apiClient.post('/auth/login', { email, password }),
    register: (email: string, password: string) => 
      apiClient.post('/auth/register', { email, password }),
  },
  
  // Списки желаний
  wishlists: {
    getAll: () => 
      apiClient.get<WishList[]>('/wishlists'),
    getById: (id: number) => 
      apiClient.get<WishList>(`/wishlists/${id}`),
    getByShareCode: (shareCode: string) => 
      apiClient.get<WishList>(`/shared-wishlists/${shareCode}`),
    create: (data: CreateWishListRequest) => 
      apiClient.post<WishList>('/wishlists', data),
    update: (id: number, data: UpdateWishListRequest) => 
      apiClient.put<WishList>(`/wishlists/${id}`, data),
    delete: (id: number) => 
      apiClient.delete(`/wishlists/${id}`),
    generateShareCode: (id: number) => 
      apiClient.post<{ share_code: string }>(`/wishlists/${id}/share-code`),
    updateShareSettings: (id: number, settings: ShareSettings) => 
      apiClient.put<WishList>(`/wishlists/${id}/share-settings`, settings),
  },
  
  // Элементы списка желаний
  items: {
    create: (wishlistId: number, data: CreateWishItemRequest) => 
      apiClient.post<WishItem>(`/wishlists/${wishlistId}/items`, data),
    update: (wishlistId: number, itemId: number, data: Partial<CreateWishItemRequest>) => 
      apiClient.put<WishItem>(`/wishlists/${wishlistId}/items/${itemId}`, data),
    delete: (wishlistId: number, itemId: number) => 
      apiClient.delete(`/wishlists/${wishlistId}/items/${itemId}`),
  }
}; 