// 测试题库管理
import { QuestionBankModel } from './models';

// MBTI测试题目（模拟数据）
export const mockQuestions = [
  // 外向(E)/内向(I)维度
  {
    id: '1',
    dimension: 'EI',
    type: 'E',
    question: '我喜欢参加大型社交活动，与很多人交流。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '2',
    dimension: 'EI',
    type: 'I',
    question: '我更喜欢安静的环境，独自思考或与少数亲密朋友相处。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '3',
    dimension: 'EI',
    type: 'E',
    question: '我倾向于通过与他人交流来解决问题。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '4',
    dimension: 'EI',
    type: 'I',
    question: '我倾向于在做出决定前先独立思考。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '5',
    dimension: 'EI',
    type: 'E',
    question: '我喜欢成为注意力的中心。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  
  // 感觉(S)/直觉(N)维度
  {
    id: '6',
    dimension: 'SN',
    type: 'S',
    question: '我更关注具体的事实和细节，而非抽象的概念。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '7',
    dimension: 'SN',
    type: 'N',
    question: '我更关注未来的可能性和潜在的意义，而非当前的事实。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '8',
    dimension: 'S',
    type: 'S',
    question: '我喜欢按照已有的方法和程序做事。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '9',
    dimension: 'SN',
    type: 'N',
    question: '我喜欢尝试新的方法和创意。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '10',
    dimension: 'SN',
    type: 'S',
    question: '我更相信通过感官获得的信息。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  
  // 思考(T)/情感(F)维度
  {
    id: '11',
    dimension: 'TF',
    type: 'T',
    question: '我做决定时更注重逻辑和客观分析。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '12',
    dimension: 'TF',
    type: 'F',
    question: '我做决定时更注重个人价值观和他人感受。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '13',
    dimension: 'TF',
    type: 'T',
    question: '我认为诚实和直接比和谐的关系更重要。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '14',
    dimension: 'TF',
    type: 'F',
    question: '我认为和谐的关系比直接表达意见更重要。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '15',
    dimension: 'TF',
    type: 'T',
    question: '我喜欢分析问题的各个方面，寻找最优解决方案。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  
  // 判断(J)/感知(P)维度
  {
    id: '16',
    dimension: 'JP',
    type: 'J',
    question: '我喜欢有计划、有条理的生活方式。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '17',
    dimension: 'JP',
    type: 'P',
    question: '我喜欢灵活、随性的生活方式，适应变化。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '18',
    dimension: 'JP',
    type: 'J',
    question: '我喜欢在截止日期前完成任务。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '19',
    dimension: 'JP',
    type: 'P',
    question: '我喜欢在最后时刻完成任务，享受压力带来的动力。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  },
  {
    id: '20',
    dimension: 'JP',
    type: 'J',
    question: '我喜欢做出决定并坚持执行。',
    options: ['非常同意', '同意', '中立', '不同意', '非常不同意']
  }
];

// 初始化题库
export const initQuestionBank = () => {
  return QuestionBankModel.init(mockQuestions);
};

// 获取所有题目
export const getAllQuestions = () => {
  return QuestionBankModel.findAll();
};

// 根据维度获取题目
export const getQuestionsByDimension = (dimension) => {
  return QuestionBankModel.findByDimension(dimension);
};

// 计算测评结果
export const calculateResult = (answers) => {
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };
  
  // 遍历答案，计算得分
  answers.forEach(answer => {
    const question = mockQuestions.find(q => q.id === answer.questionId);
    if (question) {
      // 根据选项计算得分
      const score = 5 - answer.optionIndex; // 非常同意=5，非常不同意=1
      scores[question.type] += score;
      
      // 计算相反维度的得分
      const oppositeType = getOppositeType(question.type);
      scores[oppositeType] += (6 - score); // 相反维度的得分
    }
  });
  
  // 确定最终类型
  const result = {
    EI: scores.E > scores.I ? 'E' : 'I',
    SN: scores.S > scores.N ? 'S' : 'N',
    TF: scores.T > scores.F ? 'T' : 'F',
    JP: scores.J > scores.P ? 'J' : 'P'
  };
  
  // 生成性格类型代码
  const typeCode = result.EI + result.SN + result.TF + result.JP;
  
  return {
    scores,
    result,
    typeCode
  };
};

// 获取相反类型
const getOppositeType = (type) => {
  const opposites = {
    'E': 'I', 'I': 'E',
    'S': 'N', 'N': 'S',
    'T': 'F', 'F': 'T',
    'J': 'P', 'P': 'J'
  };
  return opposites[type] || type;
};

// 获取性格类型描述
export const getTypeDescription = (typeCode) => {
  const descriptions = {
    'ISTJ': '检查员型 - 安静、严肃，通过全面性和可靠性获得成功。',
    'ISFJ': '照顾者型 - 忠诚、有奉献精神，重视和谐与合作。',
    'INFJ': '博爱型 - 富有洞察力，致力于帮助他人实现潜能。',
    'INTJ': '专家型 - 独立、具有创造性，善于分析和规划。',
    'ISTP': '冒险家型 - 灵活、现实，善于解决实际问题。',
    'ISFP': '艺术家型 - 敏感、温和，重视个人价值观和审美。',
    'INFP': '理想主义型 - 充满热情，致力于实现个人价值观。',
    'INTP': '思想家型 - 好奇、逻辑，善于分析和理论思考。',
    'ESTP': '企业家型 - 活跃、现实，善于应对挑战和危机。',
    'ESFP': '表演者型 - 外向、友好，喜欢与人互动和享受生活。',
    'ENFP': '激励者型 - 热情、富有创造力，善于激励他人。',
    'ENTP': '发明家型 - 聪明、好奇，善于创新和解决问题。',
    'ESTJ': '监督者型 - 实际、逻辑，善于组织和管理。',
    'ESFJ': '提供者型 - 热情、有责任感，重视和谐与合作。',
    'ENFJ': '教导者型 - 富有魅力，善于激励和引导他人。',
    'ENTJ': '领导者型 - 果断、有远见，善于规划和组织。'
  };
  return descriptions[typeCode] || '未知性格类型';
};