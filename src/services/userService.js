// 用户管理服务
import { UserModel } from './models';

// 简单的密码加密函数
const encryptPassword = (password) => {
  // 使用简单的加密方法，实际生产环境中应使用更安全的加密算法
  try {
    return btoa(password);
  } catch (error) {
    console.error('密码加密失败:', error);
    throw new Error('密码处理失败');
  }
};

// 密码解密函数
const decryptPassword = (encryptedPassword) => {
  try {
    return atob(encryptedPassword);
  } catch (error) {
    console.error('密码解密失败:', error);
    throw new Error('密码验证失败');
  }
};

// 注册用户
export const registerUser = (userData) => {
  try {
    // 检查用户名是否已存在
    const existingUser = UserModel.findByUsername(userData.username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    
    // 加密密码
    const encryptedUserData = {
      ...userData,
      password: encryptPassword(userData.password)
    };
    
    // 创建新用户
    const newUser = UserModel.create(encryptedUserData);
    return newUser;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

// 用户登录
export const loginUser = (username, password) => {
  try {
    // 查找用户
    const user = UserModel.findByUsername(username);
    if (!user) {
      throw new Error('用户不存在');
    }
    
    // 验证密码
    if (decryptPassword(user.password) !== password) {
      throw new Error('密码错误');
    }
    
    // 确保用户有角色
    if (!user.role) {
      UserModel.update(user.id, { role: 'user' });
      user.role = 'user';
    }
    
    // 保存登录状态（不保存密码）
    const userWithoutPassword = {
      ...user,
      password: undefined
    };
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

// 获取当前登录用户
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
};

// 退出登录
export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

// 更新用户信息
export const updateUser = (userId, updates) => {
  return UserModel.update(userId, updates);
};

// 获取所有用户
export const getAllUsers = () => {
  try {
    const users = UserModel.findAll();
    // 移除密码信息
    return users.map(user => ({
      ...user,
      password: undefined
    }));
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

// 更新用户角色
export const updateUserRole = (userId, role) => {
  try {
    return UserModel.update(userId, { role });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    throw error;
  }
};

// 检查用户是否为管理员
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};

// 检查当前用户是否为管理员
export const isCurrentUserAdmin = () => {
  const user = getCurrentUser();
  return isAdmin(user);
};