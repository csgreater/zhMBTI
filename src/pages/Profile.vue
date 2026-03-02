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
        <span class="label">注册时间：</span>
        <span class="value">{{ formatDate(user.createdAt) }}</span>
      </div>
      <button class="logout-button" @click="handleLogout">退出登录</button>
      <button class="export-button" @click="handleExportCSV">导出测评记录</button>
    </div>
    
    <div v-if="user" class="assessment-records">
      <h3>测评记录</h3>
      <div v-if="records.length === 0" class="no-records">
        暂无测评记录
      </div>
      <div v-else class="records-list">
        <div v-for="record in records" :key="record.id" class="record-item">
          <div class="record-header">
            <span class="record-date">{{ formatDate(record.createdAt) }}</span>
            <span class="record-type">{{ record.typeCode }}</span>
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
import { getCurrentUser, logoutUser } from '../services/userService';
import { AssessmentRecordModel } from '../services/models';
import { exportToCSV, exportToJSON } from '../services/exportService';

export default {
  data() {
    return {
      user: null,
      records: []
    };
  },
  mounted() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      this.user = getCurrentUser();
      if (this.user) {
        this.loadAssessmentRecords();
      }
    },
    loadAssessmentRecords() {
      this.records = AssessmentRecordModel.findByUserId(this.user.id);
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
    }
  }
};
</script>

<style scoped>
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