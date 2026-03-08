import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// 请求拦截器：添加 token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
