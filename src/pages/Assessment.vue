<template>
  <div class="assessment-container">
    <h2>MBTI职业性格测评</h2>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else>
      <div class="progress-bar">
        <div class="progress" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="progress-text">
        第 {{ currentQuestionIndex + 1 }} 题，共 {{ questions.length }} 题
      </div>
      
      <div v-if="currentQuestion" class="section-info">
        <h4>{{ currentSectionTitle }}</h4>
      </div>
      
      <div v-if="currentQuestion" class="question-card">
        <h3>{{ currentQuestion.question }}</h3>
        <div class="options">
          <div 
            v-for="(option, index) in currentQuestion.options" 
            :key="index"
            class="option-item"
            :class="{ selected: selectedOptions[currentQuestion.id] === index }"
            @click="selectOption(currentQuestion.id, index)"
          >
            {{ option }}
          </div>
        </div>
      </div>
      
      <div class="navigation">
        <button 
          class="nav-button" 
          :disabled="currentQuestionIndex === 0"
          @click="prevQuestion"
        >
          上一题
        </button>
        <button 
          class="nav-button primary" 
          :disabled="!selectedOptions.hasOwnProperty(currentQuestion.id) || submitting"
          @click="nextQuestion"
        >
          {{ submitting ? '提交中...' : (currentQuestionIndex === questions.length - 1 ? '提交' : '下一题') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getAllQuestions, calculateResult, getTypeDescription } from '../services/questionBank';
import { mockQuestions } from '../services/questionBank';
import { getCurrentUser } from '../services/userService';
import { AssessmentRecordModel } from '../services/models';
import { submitAssessment as submitToServer } from '../services/apiService';

export default {
  data() {
    return {
      questions: [],
      currentQuestionIndex: 0,
      selectedOptions: {},
      loading: true,
      submitting: false,
      error: ''
    };
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentQuestionIndex];
    },
    currentSectionTitle() {
      return this.currentQuestion ? this.currentQuestion.sectionTitle : '';
    },
    progress() {
      return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
    }
  },
  mounted() {
    // 检查用户是否登录
    const user = getCurrentUser();
    if (!user) {
      this.$router.push('/login');
      return;
    }
    this.loadQuestions();
  },
  methods: {
    loadQuestions() {
      this.loading = true;
      this.error = '';
      try {
        // 直接使用mockQuestions
        this.questions = mockQuestions;
        console.log('Questions loaded:', this.questions);
      } catch (error) {
        this.error = '加载题目失败，请刷新页面重试';
        console.error('Error loading questions:', error);
      } finally {
        this.loading = false;
      }
    },
    selectOption(questionId, optionIndex) {
      this.selectedOptions[questionId] = optionIndex;
      // 自动跳转到下一题（如果不是最后一题）
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      }
    },
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
      } else {
        this.submitAssessment();
      }
    },
    async submitAssessment() {
      // 准备答案数据
      const answers = Object.entries(this.selectedOptions).map(([questionId, optionIndex]) => ({
        questionId,
        optionIndex
      }));
      
      // 计算测评结果
      const result = calculateResult(answers);
      
      // 保存测评记录到本地存储
      const user = getCurrentUser();
      AssessmentRecordModel.create({
        userId: user ? user.id : 'guest',
        answers,
        scores: result.scores,
        result: result.result,
        typeCode: result.typeCode,
        description: result.typeCode + ' - ' + getTypeDescription(result.typeCode)
      });
      
      // 发送到服务器
      this.submitting = true;
      try {
        const assessmentData = {
          userId: user ? user.id : 'guest',
          answers,
          scores: result.scores,
          result: result.result,
          typeCode: result.typeCode,
          description: result.typeCode + ' - ' + getTypeDescription(result.typeCode),
          createdAt: new Date().toISOString()
        };
        await submitToServer(assessmentData);
        console.log('Assessment submitted to server successfully');
      } catch (error) {
        console.error('Failed to submit assessment to server:', error);
        // 服务器传输失败不影响本地功能，仍然跳转到结果页面
      } finally {
        this.submitting = false;
      }
      
      // 跳转到结果页面
      this.$router.push({
        path: '/result',
        query: { typeCode: result.typeCode }
      });
    }
  }
};
</script>

<style scoped>
.assessment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #333;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: right;
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.section-info {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  border-left: 4px solid #333;
}

.section-info h4 {
  margin: 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.4;
}

.question-card {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.question-card h3 {
  margin-bottom: 1.5rem;
  color: #333;
  line-height: 1.4;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.option-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  background-color: white;
}

.option-item:hover {
  border-color: #333;
  background-color: #f0f0f0;
}

.option-item.selected {
  background-color: #333;
  color: white;
  border-color: #333;
}

.navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #333;
  background-color: white;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-button:hover:not(:disabled) {
  background-color: #333;
  color: white;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button:disabled:hover {
  background-color: white;
  color: #333;
}

.nav-button.primary {
  background-color: #333;
  color: white;
}

.nav-button.primary:hover:not(:disabled) {
  background-color: #555;
}

.nav-button.primary:disabled:hover {
  background-color: #333;
  color: white;
}

.loading {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: red;
  background-color: #ffebee;
  border-radius: 8px;
}
</style>