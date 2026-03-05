<template>
  <div class="profile-container">
    <h2>个人中心</h2>
    <div v-if="user" class="user-info">
      <h3>用户信息</h3>
      <div class="info-item">
        <span class="label">用户名：</span>
        <span class="value">{{ user.username }}</span>
      </div>
      <div class="info-item">
        <span class="label">姓名：</span>
        <span class="value">{{ user.name }}</span>
      </div>
      <div class="info-item">
        <span class="label">角色：</span>
        <span class="value">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</span>
      </div>
      <div class="info-item">
        <span class="label">注册时间：</span>
        <span class="value">{{ formatDate(user.createdAt) }}</span>
      </div>
      <button class="logout-button" @click="handleLogout">退出登录</button>
      <button v-if="isAdmin" class="export-button" @click="handleExportCSV">导出测评记录</button>
    </div>
    
    <div v-if="user" class="assessment-records">
      <h3>{{ isAdmin ? '所有用户测评记录' : '我的测评记录' }}</h3>
      <div v-if="records.length === 0" class="no-records">
        {{ isAdmin ? '暂无测评记录' : '您暂无测评记录' }}
      </div>
      <div v-else class="records-list">
        <div v-for="record in records" :key="record.id" class="record-item" @click="viewRecord(record.id)">
          <div class="record-header">
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
            <span class="record-type">{{ record.typeCode }}</span>
            <span class="view-button">查看详情</span>
          </div>
          <div v-if="isAdmin" class="record-user">
            <span class="user-label">用户：</span>
            <span class="user-value">{{ getUsernameById(record.userId) }}</span>
          </div>
          <div class="record-description">{{ record.description }}</div>
        </div>
      </div>
    </div>
    
    <div v-else class="login-prompt">
      <p>请先登录</p>
      <router-link to="/login" class="login-button">立即登录</router-link>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, logoutUser, isCurrentUserAdmin, getAllUsers } from '../services/userService';
import { AssessmentRecordModel } from '../services/models';
import { exportToCSV, exportToJSON } from '../services/exportService';

export default {
  data() {
    return {
      user: null,
      records: [],
      allUsers: []
    };
  },
  computed: {
    isAdmin() {
      return isCurrentUserAdmin();
    }
  },
  mounted() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      this.user = getCurrentUser();
      if (this.user) {
        this.loadAssessmentRecords();
        if (this.isAdmin) {
          this.loadAllUsers();
        }
      }
    },
    loadAssessmentRecords() {
      if (this.isAdmin) {
        this.records = AssessmentRecordModel.findAll();
      } else {
        this.records = AssessmentRecordModel.findByUserId(this.user.id);
      }
    },
    loadAllUsers() {
      this.allUsers = getAllUsers();
    },
    getUsernameById(userId) {
      const user = this.allUsers.find(u => u.id === userId);
      return user ? user.username : '未知用户';
    },
    handleLogout() {
      logoutUser();
      this.user = null;
      this.records = [];
      this.$router.push('/');
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    handleExportCSV() {
      try {
        exportToCSV();
      } catch (error) {
        alert(error.message);
      }
    },
    viewRecord(recordId) {
      // 导航到结果页面，并传递记录ID
      this.$router.push({ 
        path: '/result', 
        query: { recordId } 
      });
    }
  }
};
</script>

<style scoped>
/* 现有样式保持不变 */
.record-user {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.user-label {
  font-weight: bold;
}

.user-value {
  color: #333;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.user-info {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

h3 {
  margin-bottom: 1rem;
  color: #555;
}

.info-item {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  width: 100px;
  color: #666;
}

.value {
  color: #333;
}

.logout-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 1rem;
}

.logout-button:hover {
  background-color: #555;
}

.export-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-button:hover {
  background-color: #888;
}

.assessment-records {
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.no-records {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.records-list {
  margin-top: 1rem;
}

.record-item {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.record-date {
  color: #666;
  font-size: 0.9rem;
}

.record-type {
  font-weight: bold;
  color: #333;
}

.record-description {
  color: #555;
  line-height: 1.4;
}

.record-item {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.record-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.view-button {
  background-color: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.view-button:hover {
  background-color: #0069d9;
}

.login-prompt {
  text-align: center;
  padding: 4rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.login-prompt p {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 1.1rem;
}

.login-button {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #555;
}
</style>