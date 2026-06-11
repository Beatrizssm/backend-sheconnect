import axios from 'axios';

export const AUTH_TOKEN_STORAGE_KEY = 'sheconnect_access_token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('sheconnect:unauthorized'));
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'A requisição expirou. Tente novamente.';
      }

      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3333.';
    }

    const message = error.response.data?.message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      if (message === 'Internal server error') {
        return 'Erro no servidor. Verifique se o Docker está rodando (PostgreSQL).';
      }

      return message;
    }
  }

  return 'Não foi possível completar a ação. Tente novamente.';
}
