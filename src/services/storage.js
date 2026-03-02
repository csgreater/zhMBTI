// 本地存储服务

// 存储数据
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
};

// 获取数据
export const getItem = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('获取数据失败:', error);
    return null;
  }
};

// 删除数据
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
};

// 清空所有数据
export const clear = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('清空数据失败:', error);
    return false;
  }
};