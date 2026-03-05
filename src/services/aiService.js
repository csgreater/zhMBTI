// DeepSeek API 配置
const DEEPSEEK_API_KEY = 'sk-36c478e459dc414ea06463c911a9ca58'; // 实际API密钥
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

维度分数（请重点结合分数进行分析）：
- 外向(E): ${mbtiResult.scores.E} / 内向(I): ${mbtiResult.scores.I}
- 感觉(S): ${mbtiResult.scores.S} / 直觉(N): ${mbtiResult.scores.N}
- 思考(T): ${mbtiResult.scores.T} / 情感(F): ${mbtiResult.scores.F}
- 判断(J): ${mbtiResult.scores.J} / 感知(P): ${mbtiResult.scores.P}

分数分析：
- 外向/内向倾向程度：${mbtiResult.scores.E > mbtiResult.scores.I ? '外向' : '内向'}，分数差距：${Math.abs(mbtiResult.scores.E - mbtiResult.scores.I)}
- 感觉/直觉倾向程度：${mbtiResult.scores.S > mbtiResult.scores.N ? '感觉' : '直觉'}，分数差距：${Math.abs(mbtiResult.scores.S - mbtiResult.scores.N)}
- 思考/情感倾向程度：${mbtiResult.scores.T > mbtiResult.scores.F ? '思考' : '情感'}，分数差距：${Math.abs(mbtiResult.scores.T - mbtiResult.scores.F)}
- 判断/感知倾向程度：${mbtiResult.scores.J > mbtiResult.scores.P ? '判断' : '感知'}，分数差距：${Math.abs(mbtiResult.scores.J - mbtiResult.scores.P)}

请从以下几个方面进行详细分析，务必结合分数差距和倾向程度：
1. 优势：该性格类型的主要优点和强项，包括具体表现和实际应用，结合分数差距分析优势的明显程度
2. 劣势：需要注意的潜在弱点，包括可能的挑战和改进方向，结合分数差距分析劣势的影响程度
3. 职业发展路径：适合的职业方向、发展建议和晋升路径，结合分数特点推荐最适合的职业领域
4. 个人成长建议：如何发挥优势、克服劣势，包括具体的行动建议，结合分数差距提供针对性的改进方案

分析结果请使用中文，保持专业、客观、有深度，内容要全面详实，并且要明确对应到各个分析部分。`;

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
  // 初始化各个部分
  const sections = {
    strengths: [],
    weaknesses: [],
    careerPaths: [],
    personalGrowth: []
  };

  // 清理内容，移除***等标记
  let cleanedContent = content.replace(/\*+/g, '').replace(/\#+ /g, '').trim();

  // 尝试多种解析模式，提高匹配成功率
  const patterns = [
    {
      strengths: /1\.\s*优势[：:]([\s\S]*?)(?=2\.\s*劣势|3\.\s*职业|4\.\s*个人|$)/,
      weaknesses: /2\.\s*劣势[：:]([\s\S]*?)(?=3\.\s*职业|4\.\s*个人|$)/,
      careerPaths: /3\.\s*职业发展路径[：:]([\s\S]*?)(?=4\.\s*个人|$)/,
      personalGrowth: /4\.\s*个人成长建议[：:]([\s\S]*)$/
    },
    {
      strengths: /优势[：:]([\s\S]*?)(?=劣势|职业|个人|$)/,
      weaknesses: /劣势[：:]([\s\S]*?)(?=职业|个人|$)/,
      careerPaths: /职业发展路径[：:]([\s\S]*?)(?=个人|$)/,
      personalGrowth: /个人成长建议[：:]([\s\S]*)$/
    },
    {
      strengths: /优势[：:]([\s\S]*?)(?=劣势|职业|建议|$)/,
      weaknesses: /劣势[：:]([\s\S]*?)(?=职业|建议|$)/,
      careerPaths: /职业[：:]([\s\S]*?)(?=建议|$)/,
      personalGrowth: /建议[：:]([\s\S]*)$/
    }
  ];

  let parsed = false;
  for (const pattern of patterns) {
    const strengthMatch = cleanedContent.match(pattern.strengths);
    const weaknessMatch = cleanedContent.match(pattern.weaknesses);
    const careerPathMatch = cleanedContent.match(pattern.careerPaths);
    const personalGrowthMatch = cleanedContent.match(pattern.personalGrowth);

    if (strengthMatch || weaknessMatch || careerPathMatch || personalGrowthMatch) {
      if (strengthMatch) {
        sections.strengths = strengthMatch[1].trim().split('\n')
          .map(item => item.trim().replace(/^[•·●○-]+\s*/, ''))
          .filter(item => item && !item.match(/^\d+\./));
      }

      if (weaknessMatch) {
        sections.weaknesses = weaknessMatch[1].trim().split('\n')
          .map(item => item.trim().replace(/^[•·●○-]+\s*/, ''))
          .filter(item => item && !item.match(/^\d+\./));
      }

      if (careerPathMatch) {
        sections.careerPaths = careerPathMatch[1].trim().split('\n')
          .map(item => item.trim().replace(/^[•·●○-]+\s*/, ''))
          .filter(item => item && !item.match(/^\d+\./));
      }

      if (personalGrowthMatch) {
        sections.personalGrowth = personalGrowthMatch[1].trim().split('\n')
          .map(item => item.trim().replace(/^[•·●○-]+\s*/, ''))
          .filter(item => item && !item.match(/^\d+\./));
      }

      parsed = true;
      break;
    }
  }

  // 如果解析失败，尝试提取关键点
  if (!parsed) {
    // 尝试提取列表项
    const lines = cleanedContent.split('\n').map(line => line.trim()).filter(line => line);
    
    // 简单分类
    const keywords = {
      strengths: ['优势', '优点', '强项', '长处'],
      weaknesses: ['劣势', '缺点', '弱点', '不足'],
      careerPaths: ['职业', '工作', '发展', '路径'],
      personalGrowth: ['建议', '成长', '改进', '提升']
    };

    let currentSection = null;
    for (const line of lines) {
      // 检查是否是新部分的开始
      for (const [section, sectionKeywords] of Object.entries(keywords)) {
        if (sectionKeywords.some(keyword => line.includes(keyword))) {
          currentSection = section;
          continue;
        }
      }

      // 添加到当前部分
      if (currentSection && line && !line.match(/^\d+\./)) {
        sections[currentSection].push(line.replace(/^[•·●○-]+\s*/, ''));
      }
    }
  }

  // 确保每个部分至少有内容
  if (sections.strengths.length === 0) {
    sections.strengths = ['AI分析未能提供优势信息，请尝试重新分析'];
  }
  if (sections.weaknesses.length === 0) {
    sections.weaknesses = ['AI分析未能提供劣势信息，请尝试重新分析'];
  }
  if (sections.careerPaths.length === 0) {
    sections.careerPaths = ['AI分析未能提供职业发展路径信息，请尝试重新分析'];
  }
  if (sections.personalGrowth.length === 0) {
    sections.personalGrowth = ['AI分析未能提供个人成长建议信息，请尝试重新分析'];
  }

  return sections;
};

