<template>
  <div class="login-container">
    <h2>用户登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input type="text" id="username" v-model="form.username" required />
        <div v-if="errors.username" class="error-message small">{{ errors.username }}</div>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input type="password" id="password" v-model="form.password" required />
        <div v-if="errors.password" class="error-message small">{{ errors.password }}</div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit" class="login-button">登录</button>
      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { loginUser } from '../services/userService';

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      error: '',
      errors: {
        username: '',
        password: ''
      }
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      
      // 重置错误信息
      this.errors = {
        username: '',
        password: ''
      };
      
      // 验证用户名
      if (!this.form.username.trim()) {
        this.errors.username = '用户名不能为空';
        isValid = false;
      }
      
      // 验证密码
      if (!this.form.password) {
        this.errors.password = '密码不能为空';
        isValid = false;
      }
      
      return isValid;
    },
    async handleLogin() {
      try {
        this.error = '';
        
        // 验证表单
        if (!this.validateForm()) {
          return;
        }
        
        const user = await loginUser(this.form.username, this.form.password);
        this.$router.push('/');
      } catch (error) {
        this.error = error.message;
      }
    }
  }
};
</script>

<style scoped>
.error-message.small {
  font-size: 0.8rem;
  margin-top: 0.25rem;
  padding: 0.25rem;
}
</style>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #ffebee;
  border-radius: 4px;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #555;
}

.register-link {
  margin-top: 1rem;
  text-align: center;
}

.register-link a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>