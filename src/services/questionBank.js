// 测试题库管理
import { QuestionBankModel } from './models';
import questionsData from '../../MBTIquestion.json';

// 根据类型获取维度
const getDimensionFromType = (type) => {
  const dimensionMap = {
    'E': 'EI', 'I': 'EI',
    'S': 'SN', 'N': 'SN',
    'T': 'TF', 'F': 'TF',
    'J': 'JP', 'P': 'JP'
  };
  return dimensionMap[type] || 'EI';
};

// 转换MBTIquestion.json中的题目为系统需要的格式
export const mockQuestions = questionsData.questions.map(q => {
  let section = 1;
  let sectionTitle = "一、哪一个答案最能贴切的描绘你一般的感受或行为？";
  
  if (q.id >= 27 && q.id <= 58) {
    section = 2;
    sectionTitle = "二、在下列每一对词语中，哪一个词语更合你心意？请仔细想想这些词语的意义，而不要理会他们的字形或读音。";
  } else if (q.id >= 59 && q.id <= 78) {
    section = 3;
    sectionTitle = "三、哪一个答案最能贴切地描绘你一般的感受或行为";
  } else if (q.id >= 79 && q.id <= 93) {
    section = 4;
    sectionTitle = "四、在下列每一对词语中，哪一个词语更合你心意？";
  }
  
  return {
    id: q.id.toString(),
    section: section,
    sectionTitle: sectionTitle,
    dimension: getDimensionFromType(q.type_a),
    type: q.type_a,
    question: q.question,
    options: [q.option_a, q.option_b],
    type_b: q.type_b
  };
});

// MBTI测试题目（从JSON文件加载）

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
      if (answer.optionIndex === 0) {
        // 选择了option_a，给type_a加分
        scores[question.type] += 1;
      } else if (answer.optionIndex === 1) {
        // 选择了option_b，给type_b加分
        scores[question.type_b] += 1;
      }
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