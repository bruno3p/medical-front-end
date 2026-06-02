import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

// Interceptor para adicionar o token JWT em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar erro de token expirado ou inválido (401/403)
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  // 401 = Unauthorized (Token expirado ou inválido) -> Desloga o usuário
  // 403 = Forbidden (Sem permissão para aquela rota específica) -> Deixa o componente tratar
  if (error.response && error.response.status === 401) {
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/' && window.location.pathname !== '/register') {
      localStorage.removeItem('token');
      localStorage.removeItem('loggedUserId');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    }
  }
  return Promise.reject(error);
});
