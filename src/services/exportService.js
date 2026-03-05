// 数据导出服务
import { AssessmentRecordModel } from './models';
import { isCurrentUserAdmin, getCurrentUser } from './userService';

// 检查是否有权限导出
const checkExportPermission = () => {
  if (!isCurrentUserAdmin()) {
    throw new Error('无权限导出数据');
  }
};

// 导出测评记录为CSV格式
export const exportToCSV = () => {
  try {
    // 检查权限
    checkExportPermission();
    
    const records = AssessmentRecordModel.findAll();
    
    // CSV表头
    const headers = ['ID', '用户ID', '测评时间', '性格类型', '描述', 'E得分', 'I得分', 'S得分', 'N得分', 'T得分', 'F得分', 'J得分', 'P得分'];
    
    // 转换记录为CSV行
    const rows = records.map(record => [
      record.id,
      record.userId,
      record.createdAt,
      record.typeCode,
      record.description,
      record.scores.E,
      record.scores.I,
      record.scores.S,
      record.scores.N,
      record.scores.T,
      record.scores.F,
      record.scores.J,
      record.scores.P
    ]);
    
    // 组合CSV内容
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mbti-assessment-records-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('导出CSV失败:', error);
    throw error;
  }
};

// 导出单个测评记录为JSON格式
export const exportToJSON = (recordId) => {
  try {
    const currentUser = getCurrentUser();
    const record = AssessmentRecordModel.findById(recordId);
    
    if (!record) {
      throw new Error('测评记录不存在');
    }
    
    // 检查权限：管理员可以导出任何记录，普通用户只能导出自己的记录
    if (!isCurrentUserAdmin() && record.userId !== currentUser.id) {
      throw new Error('无权限导出此记录');
    }
    
    const jsonContent = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `mbti-assessment-${recordId}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('导出JSON失败:', error);
    throw error;
  }
};