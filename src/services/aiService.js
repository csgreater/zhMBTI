// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'xxxxxxx'; // 实际API密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 错误处理函数
const handleError = (error) => {
  console.error('AI API Error:', error);
  return Promise.reject(new Error(`API Error: ${error.message || 'Unknown error'}`));
};

// 调用DeepSeek API进行MBTI分析（流式输出）
export const analyzeMBTI = async (mbtiResult, onChunk) => {
  try {
    const prompt = `请基于以下MBTI测评结果进行详细分析：

性格类型：${mbtiResult.typeCode} - ${mbtiResult.description}

维度分数：
- 外向(E): ${mbtiResult.scores.E} / 内向(I): ${mbtiResult.scores.I}
- 感觉(S): ${mbtiResult.scores.S} / 直觉(N): ${mbtiResult.scores.N}
- 思考(T): ${mbtiResult.scores.T} / 情感(F): ${mbtiResult.scores.F}
- 判断(J): ${mbtiResult.scores.J} / 感知(P): ${mbtiResult.scores.P}

请从以下几个方面进行详细分析：
1. 优势：该性格类型的主要优点和强项，包括具体表现和实际应用
2. 劣势：需要注意的潜在弱点，包括可能的挑战和改进方向
3. 职业发展路径：适合的职业方向、发展建议和晋升路径
4. 个人成长建议：如何发挥优势、克服劣势，包括具体的行动建议

分析结果请使用中文，保持专业、客观、有深度，内容要全面详实。`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的MBTI性格分析专家，擅长基于测评结果提供深入、客观的分析和建议。你的分析应该全面详实，涵盖性格类型的各个方面。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') continue;

          try {
            const data = JSON.parse(dataStr);
            const content = data.choices[0]?.delta?.content;
            if (content) {
              fullContent += content;
              if (onChunk) {
                onChunk(content);
              }
            }
          } catch (error) {
            console.error('Error parsing chunk:', error);
          }
        }
      }
    }

    return parseAnalysisResult(fullContent);
  } catch (error) {
    return handleError(error);
  }
};

// 解析分析结果
const parseAnalysisResult = (content) => {
  // 简单的解析逻辑，根据文本格式提取各个部分
  const sections = {
    strengths: [],
    weaknesses: [],
    careerPaths: [],
    personalGrowth: []
  };

  // 尝试匹配各个部分
  const strengthMatch = content.match(/1\. 优势：([\s\S]*?)2\. 劣势：/);
  const weaknessMatch = content.match(/2\. 劣势：([\s\S]*?)3\. 职业发展路径：/);
  const careerPathMatch = content.match(/3\. 职业发展路径：([\s\S]*?)4\. 个人成长建议：/);
  const personalGrowthMatch = content.match(/4\. 个人成长建议：([\s\S]*)$/);

  if (strengthMatch) {
    sections.strengths = strengthMatch[1].trim().split('\n').filter(item => item.trim());
  }

  if (weaknessMatch) {
    sections.weaknesses = weaknessMatch[1].trim().split('\n').filter(item => item.trim());
  }

  if (careerPathMatch) {
    sections.careerPaths = careerPathMatch[1].trim().split('\n').filter(item => item.trim());
  }

  if (personalGrowthMatch) {
    sections.personalGrowth = personalGrowthMatch[1].trim().split('\n').filter(item => item.trim());
  }

  // 如果解析失败，返回原始内容
  if (sections.strengths.length === 0) {
    return {
      strengths: [content],
      weaknesses: [],
      careerPaths: [],
      personalGrowth: []
    };
  }

  return sections;
};

