import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import { initQuestionBank } from './services/questionBank'
import { UserModel } from './services/models'

// 导入页面组件
import Home from './pages/Home.vue'
import Assessment from './pages/Assessment.vue'
import Result from './pages/Result.vue'
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import Profile from './pages/Profile.vue'
import UserManagement from './pages/UserManagement.vue'

// 配置路由
const routes = [
  { path: '/', component: Home },
  { path: '/assessment', component: Assessment },
  { path: '/result', component: Result },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/profile', component: Profile },
  { path: '/user-management', component: UserManagement }
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

// 初始化管理员账户
try {
  console.log('Checking for admin account...');
  const users = UserModel.findAll();
  const adminExists = users.some(user => user.role === 'admin');
  
  if (!adminExists) {
    console.log('Creating default admin account...');
    // 创建默认管理员账户
    UserModel.create({
      username: 'admin',
      name: '管理员',
      password: btoa('admin123'), // 简单加密，实际生产环境应使用更安全的方法
      role: 'admin'
    });
    console.log('Default admin account created successfully');
    console.log('Username: admin, Password: admin123');
  } else {
    console.log('Admin account already exists');
  }
} catch (error) {
  console.error('Error initializing admin account:', error);
}

const app = createApp(App)
app.use(router)
app.mount('#app')
console.log('App mounted successfully')