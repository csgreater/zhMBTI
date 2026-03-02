// 数据模型
import { setItem, getItem, removeItem } from './storage';

// 用户模型
export const UserModel = {
  // 创建用户
  create: (user) => {
    const users = getItem('users') || [];
    const newUser = {
      id: Date.now().toString(),
      ...user,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    setItem('users', users);
    return newUser;
  },
  
  // 根据用户名查找用户
  findByUsername: (username) => {
    const users = getItem('users') || [];
    return users.find(user => user.username === username);
  },
  
  // 根据ID查找用户
  findById: (id) => {
    const users = getItem('users') || [];
    return users.find(user => user.id === id);
  },
  
  // 更新用户信息
  update: (id, updates) => {
    const users = getItem('users') || [];
    const index = users.findIndex(user => user.id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      setItem('users', users);
      return users[index];
    }
    return null;
  }
};

// 测评记录模型
export const AssessmentRecordModel = {
  // 创建测评记录
  create: (record) => {
    const records = getItem('assessmentRecords') || [];
    const newRecord = {
      id: Date.now().toString(),
      ...record,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    setItem('assessmentRecords', records);
    return newRecord;
  },
  
  // 获取用户的测评记录
  findByUserId: (userId) => {
    const records = getItem('assessmentRecords') || [];
    return records.filter(record => record.userId === userId);
  },
  
  // 根据ID查找测评记录
  findById: (id) => {
    const records = getItem('assessmentRecords') || [];
    return records.find(record => record.id === id);
  },
  
  // 获取所有测评记录
  findAll: () => {
    return getItem('assessmentRecords') || [];
  }
};

// 测试题库模型
export const QuestionBankModel = {
  // 初始化题库
  init: (questions) => {
    setItem('questions', questions);
    return questions;
  },
  
  // 获取所有题目
  findAll: () => {
    return getItem('questions') || [];
  },
  
  // 根据维度获取题目
  findByDimension: (dimension) => {
    const questions = getItem('questions') || [];
    return questions.filter(question => question.dimension === dimension);
  }
};