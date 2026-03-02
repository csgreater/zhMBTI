<template>
  <div class="register-container">
    <h2>用户注册</h2>
    <form @submit.prevent="handleRegister">
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
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input type="password" id="confirmPassword" v-model="form.confirmPassword" required />
        <div v-if="errors.confirmPassword" class="error-message small">{{ errors.confirmPassword }}</div>
      </div>
      <div class="form-group">
        <label for="name">姓名</label>
        <input type="text" id="name" v-model="form.name" required />
        <div v-if="errors.name" class="error-message small">{{ errors.name }}</div>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <button type="submit" class="register-button">注册</button>
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { registerUser } from '../services/userService';

export default {
  data() {
    return {
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        name: ''
      },
      error: '',
      errors: {
        username: '',
        password: '',
        confirmPassword: '',
        name: ''
      }
    };
  },
  methods: {
    validateForm() {
      let isValid = true;
      
      // 重置错误信息
      this.errors = {
        username: '',
        password: '',
        confirmPassword: '',
        name: ''
      };
      
      // 验证用户名
      if (!this.form.username.trim()) {
        this.errors.username = '用户名不能为空';
        isValid = false;
      } else if (this.form.username.length < 3) {
        this.errors.username = '用户名至少3个字符';
        isValid = false;
      }
      
      // 验证密码
      if (!this.form.password) {
        this.errors.password = '密码不能为空';
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = '密码至少6个字符';
        isValid = false;
      }
      
      // 验证确认密码
      if (!this.form.confirmPassword) {
        this.errors.confirmPassword = '请确认密码';
        isValid = false;
      } else if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = '两次输入的密码不一致';
        isValid = false;
      }
      
      // 验证姓名
      if (!this.form.name.trim()) {
        this.errors.name = '姓名不能为空';
        isValid = false;
      }
      
      return isValid;
    },
    async handleRegister() {
      try {
        this.error = '';
        
        // 验证表单
        if (!this.validateForm()) {
          return;
        }
        
        // 注册用户
        const user = await registerUser({
          username: this.form.username,
          password: this.form.password,
          name: this.form.name
        });
        
        // 注册成功后跳转到登录页面
        this.$router.push('/login');
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
.register-container {
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

.register-button {
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

.register-button:hover {
  background-color: #555;
}

.login-link {
  margin-top: 1rem;
  text-align: center;
}

.login-link a {
  color: #333;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>