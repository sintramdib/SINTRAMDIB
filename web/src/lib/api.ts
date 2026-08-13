import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.error ?? 'Erro inesperado';
    return Promise.reject(new Error(message));
  },
);