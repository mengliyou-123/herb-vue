import axios from "axios";
import { ElMessage } from "element-plus";
import { useTokenStore } from "@/stores/token";
import router from "@/router";

const instance = axios.create({ baseURL: '/api' });

instance.interceptors.request.use(
  config => {
    const tokenStore = useTokenStore();
    
    if (tokenStore.token) {
      config.headers.Authorization = tokenStore.token;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  result => {
    if (result.data.code === 0) {
      return result.data;
    }

    const errorMessage = result.data.message || '操作失败，请稍后重试';
    ElMessage({
      message: errorMessage,
      type: 'error',
      duration: 3000,
      showClose: true
    });
    return Promise.reject(result.data);
  },
  error => {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      
      switch (status) {
        case 401:
          ElMessage({
            message: '登录已过期，请重新登录',
            type: 'warning',
            duration: 3000
          });
          router.push('/login');
          break;
        case 403:
          ElMessage({
            message: '您没有权限执行此操作',
            type: 'error',
            duration: 3000
          });
          break;
        case 404:
          ElMessage({
            message: '请求的资源不存在',
            type: 'error',
            duration: 3000
          });
          break;
        case 500:
          ElMessage({
            message: '服务器内部错误，请稍后重试',
            type: 'error',
            duration: 3000
          });
          break;
        default:
          ElMessage({
            message: message || '网络请求失败',
            type: 'error',
            duration: 3000
          });
      }
    } else {
      ElMessage({
        message: '网络连接失败，请检查您的网络设置',
        type: 'error',
        duration: 3000
      });
    }
    
    return Promise.reject(error);
  }
);

export default instance;
