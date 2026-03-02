import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { initQuestionBank } from './services/questionBank'

// 导入页面组件
import Home from './pages/Home.vue'
import Assessment from './pages/Assessment.vue'
import Result from './pages/Result.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import Profile from './pages/Profile.vue'

// 配置路由
const routes = [
  { path: '/', component: Home },
  { path: '/assessment', component: Assessment },
  { path: '/result', component: Result },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 初始化题库
try {
  console.log('Initializing question bank...');
  initQuestionBank();
  console.log('Question bank initialized successfully');
} catch (error) {
  console.error('Error initializing question bank:', error);
}

const app = createApp(App)
app.use(router)
app.mount('#app')
console.log('App mounted successfully')