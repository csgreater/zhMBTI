import axios from 'axios';

// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-36c478e459dc414ea06463c911a9ca58';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 测试API调用
async function testAIApi() {
  try {
    // 创建axios实例
    const aiApi = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      }
    });

    const response = await aiApi.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的MBTI性格分析专家'
        },
        {
          role: 'user',
          content: '请分析ISTJ性格类型'
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    console.log('API调用成功！');
    console.log('响应结果:', response.data);
  } catch (error) {
    console.error('API调用失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 执行测试
testAIApi();