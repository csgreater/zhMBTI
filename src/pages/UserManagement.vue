<template>
  <div class="user-management">
    <h1>用户管理</h1>
    
    <div v-if="!isAdmin" class="access-denied">
      <h2>无权限访问</h2>
      <p>只有管理员可以访问用户管理页面</p>
      <router-link to="/home" class="btn">返回首页</router-link>
    </div>
    
    <div v-else class="user-list">
      <h2>用户列表</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>角色</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>
              <select v-model="userRoles[user.id]" @change="updateRole(user.id, userRoles[user.id])">
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <span v-if="user.id === currentUser.id" class="current-user">当前用户</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getAllUsers, updateUserRole, isCurrentUserAdmin, getCurrentUser } from '../services/userService';

export default {
  name: 'UserManagement',
  data() {
    return {
      users: [],
      userRoles: {},
      isAdmin: false,
      currentUser: null
    };
  },
  mounted() {
    this.isAdmin = isCurrentUserAdmin();
    this.currentUser = getCurrentUser();
    if (this.isAdmin) {
      this.loadUsers();
    }
  },
  methods: {
    loadUsers() {
      try {
        const users = getAllUsers();
        this.users = users;
        // 初始化用户角色映射
        users.forEach(user => {
          this.userRoles[user.id] = user.role;
        });
      } catch (error) {
        console.error('加载用户列表失败:', error);
        alert('加载用户列表失败');
      }
    },
    updateRole(userId, role) {
      try {
        updateUserRole(userId, role);
        alert('角色更新成功');
        // 重新加载用户列表以确保数据同步
        this.loadUsers();
      } catch (error) {
        console.error('更新角色失败:', error);
        alert('更新角色失败');
        // 恢复原始角色
        this.loadUsers();
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  }
};
</script>

<style scoped>
.user-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.access-denied {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 40px;
}

.access-denied h2 {
  color: #dc3545;
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  margin-top: 20px;
}

.btn:hover {
  background-color: #0069d9;
}

.user-list {
  margin-top: 20px;
}

.user-list h2 {
  color: #333;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #333;
}

tr:hover {
  background-color: #f5f5f5;
}

select {
  padding: 6px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.current-user {
  color: #6c757d;
  font-style: italic;
}
</style>