import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'https://api.example.com', // 模拟服务器地址，后续可根据实际配置修改
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 统一错误处理
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 发送测评数据
export const submitAssessment = async (assessmentData) => {
  try {
    const response = await api.post('/assessments', assessmentData);
    return response;
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    throw error;
  }
};

// 获取测评历史
export const getAssessmentHistory = async (userId) => {
  try {
    const response = await api.get(`/assessments?userId=${userId}`);
    return response;
  } catch (error) {
    console.error('Failed to get assessment history:', error);
    throw error;
  }
};

export default api;