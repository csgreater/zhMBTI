<template>
  <div class="app">
    <nav class="navbar">
      <div class="container">
        <h1 class="logo">MBTI职业性格测评系统</h1>
        <ul class="nav-links">
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/assessment">开始测评</router-link></li>
          <li><router-link to="/profile">个人中心</router-link></li>
          <li v-if="!currentUser"><router-link to="/login">登录</router-link></li>
          <li v-if="!currentUser"><router-link to="/register">注册</router-link></li>
          <li v-else class="user-info">
            {{ currentUser.name }}
          </li>
        </ul>
      </div>
    </nav>
    <main class="main">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { getCurrentUser } from './services/userService';

export default {
  name: 'App',
  data() {
    return {
      currentUser: null
    };
  },
  mounted() {
    this.updateUserStatus();
  },
  methods: {
    updateUserStatus() {
      this.currentUser = getCurrentUser();
    }
  },
  watch: {
    $route() {
      this.updateUserStatus();
    }
  }
};
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #333;
  color: white;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-links a:hover {
  background-color: #555;
}

.user-info {
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #555;
}

.main {
  flex: 1;
  padding: 2rem;
}
</style>