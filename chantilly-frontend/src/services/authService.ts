import axiosInstance from '../lib/axiosInstance';

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string | null;
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface CurrentSessionResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export const authService = {
  login: (data: LoginData) =>
    axiosInstance.post<AuthResponse>('/auth/login', data),
  getSession: () =>
    axiosInstance.get<CurrentSessionResponse>('/auth/session', { skipAuthRedirect: true } as never),
  getCsrf: () =>
    axiosInstance.get<{ mensaje: string }>('/auth/csrf'),
  register: (data: RegisterData) =>
    axiosInstance.post<{ mensaje: string }>('/auth/register', data),
  recuperarPassword: (email: string) =>
    axiosInstance.post<{ mensaje: string }>('/auth/recuperar-password', { email }),
  logout: () =>
    axiosInstance.post<{ mensaje: string }>('/auth/logout'),
};
