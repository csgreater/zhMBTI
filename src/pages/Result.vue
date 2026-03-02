<template>
  <div class="result-container">
    <h2>测评结果</h2>
    
    <div v-if="result" class="result-card">
      <div class="result-header">
        <h3>您的MBTI性格类型是：</h3>
        <div class="type-code">{{ result.typeCode }}</div>
        <div class="type-description">{{ result.description }}</div>
      </div>
      
      <div class="result-details">
        <h4>维度分析</h4>
        <div class="dimensions">
          <div class="dimension-item">
            <span class="dimension-label">外向(E) / 内向(I)</span>
            <div class="dimension-bar">
              <div class="bar" :style="{ width: result.scores.E / (result.scores.E + result.scores.I) * 100 + '%' }">E</div>
              <div class="bar" :style="{ width: result.scores.I / (result.scores.E + result.scores.I) * 100 + '%' }">I</div>
            </div>
            <span class="dimension-result">{{ result.result.EI }}</span>
            <div class="chart-container">
              <canvas ref="chartEI"></canvas>
            </div>
          </div>
          
          <div class="dimension-item">
            <span class="dimension-label">感觉(S) / 直觉(N)</span>
            <div class="dimension-bar">
              <div class="bar" :style="{ width: result.scores.S / (result.scores.S + result.scores.N) * 100 + '%' }">S</div>
              <div class="bar" :style="{ width: result.scores.N / (result.scores.S + result.scores.N) * 100 + '%' }">N</div>
            </div>
            <span class="dimension-result">{{ result.result.SN }}</span>
            <div class="chart-container">
              <canvas ref="chartSN"></canvas>
            </div>
          </div>
          
          <div class="dimension-item">
            <span class="dimension-label">思考(T) / 情感(F)</span>
            <div class="dimension-bar">
              <div class="bar" :style="{ width: result.scores.T / (result.scores.T + result.scores.F) * 100 + '%' }">T</div>
              <div class="bar" :style="{ width: result.scores.F / (result.scores.T + result.scores.F) * 100 + '%' }">F</div>
            </div>
            <span class="dimension-result">{{ result.result.TF }}</span>
            <div class="chart-container">
              <canvas ref="chartTF"></canvas>
            </div>
          </div>
          
          <div class="dimension-item">
            <span class="dimension-label">判断(J) / 感知(P)</span>
            <div class="dimension-bar">
              <div class="bar" :style="{ width: result.scores.J / (result.scores.J + result.scores.P) * 100 + '%' }">J</div>
              <div class="bar" :style="{ width: result.scores.P / (result.scores.J + result.scores.P) * 100 + '%' }">P</div>
            </div>
            <span class="dimension-result">{{ result.result.JP }}</span>
            <div class="chart-container">
              <canvas ref="chartJP"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div class="career-suggestions">
        <h4>职业建议</h4>
        <div class="suggestions-list">
          <div v-for="(suggestion, index) in careerSuggestions" :key="index" class="suggestion-item">
            {{ suggestion }}
          </div>
        </div>
      </div>
      
      <div v-if="aiError" class="ai-error">
        <h4>AI分析错误</h4>
        <p>{{ aiError }}</p>
      </div>
      
      <div v-else-if="showStreamingContent" class="ai-analysis">
        <h4>AI分析报告</h4>
        <div class="streaming-content">
          <p v-html="streamingContent"></p>
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      <div v-else-if="aiAnalysis" class="ai-analysis">
        <h4>AI分析报告</h4>
        <div class="analysis-section">
          <h5>优势</h5>
          <ul class="analysis-list">
            <li v-for="(item, index) in aiAnalysis.strengths" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div class="analysis-section">
          <h5>劣势</h5>
          <ul class="analysis-list">
            <li v-for="(item, index) in aiAnalysis.weaknesses" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div class="analysis-section">
          <h5>职业发展路径</h5>
          <ul class="analysis-list">
            <li v-for="(item, index) in aiAnalysis.careerPaths" :key="index">{{ item }}</li>
          </ul>
        </div>
        <div class="analysis-section">
          <h5>个人成长建议</h5>
          <ul class="analysis-list">
            <li v-for="(item, index) in aiAnalysis.personalGrowth" :key="index">{{ item }}</li>
          </ul>
        </div>
      </div>
      
      <div class="action-buttons">
        <router-link to="/" class="btn">返回首页</router-link>
        <router-link to="/assessment" class="btn primary">重新测评</router-link>
        <button 
          class="btn primary" 
          :disabled="analyzing" 
          @click="getAIAnalysis"
        >
          {{ analyzing ? '分析中...' : 'AI分析' }}
        </button>
      </div>
    </div>
    
    <div v-else class="no-result">
      <p>暂无测评结果</p>
      <router-link to="/assessment" class="btn primary">开始测评</router-link>
    </div>
  </div>
</template>

<script>
import { getTypeDescription } from '../services/questionBank';
import { AssessmentRecordModel } from '../services/models';
import { getCurrentUser } from '../services/userService';
import { analyzeMBTI } from '../services/aiService';
import Chart from 'chart.js/auto';

export default {
  data() {
    return {
      result: null,
      careerSuggestions: [],
      aiAnalysis: null,
      aiError: '',
      analyzing: false,
      streamingContent: '',
      showStreamingContent: false,
      charts: {}
    };
  },
  mounted() {
    this.loadResult();
  },
  methods: {
    loadResult() {
      // 从URL参数获取typeCode
      const typeCode = this.$route.query.typeCode;
      if (typeCode) {
        // 尝试从本地存储获取实际的测评记录
        const user = getCurrentUser();
        const records = AssessmentRecordModel.findByUserId(user ? user.id : 'guest');
        
        // 找到最新的测评记录
        const latestRecord = records.length > 0 
          ? records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
          : null;
        
        if (latestRecord && latestRecord.typeCode === typeCode) {
          // 使用实际的测评记录数据
          this.result = {
            typeCode: latestRecord.typeCode,
            description: latestRecord.description,
            scores: latestRecord.scores,
            result: latestRecord.result
          };
        } else {
          // 如果没有找到记录，使用模拟数据
          this.result = {
            typeCode,
            description: getTypeDescription(typeCode),
            scores: {
              E: Math.floor(Math.random() * 50) + 25,
              I: Math.floor(Math.random() * 50) + 25,
              S: Math.floor(Math.random() * 50) + 25,
              N: Math.floor(Math.random() * 50) + 25,
              T: Math.floor(Math.random() * 50) + 25,
              F: Math.floor(Math.random() * 50) + 25,
              J: Math.floor(Math.random() * 50) + 25,
              P: Math.floor(Math.random() * 50) + 25
            },
            result: {
              EI: typeCode[0],
              SN: typeCode[1],
              TF: typeCode[2],
              JP: typeCode[3]
            }
          };
        }
        
        // 生成职业建议
        this.generateCareerSuggestions(typeCode);
        
        // 生成AI分析
        this.generateAIAnalysis(typeCode);
        
        // 初始化图表
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    },
    initCharts() {
      if (!this.result) return;
      
      // 销毁现有图表
      Object.values(this.charts).forEach(chart => chart.destroy());
      
      // 初始化EI维度图表
      if (this.$refs.chartEI) {
        this.charts.ei = new Chart(this.$refs.chartEI, {
          type: 'bar',
          data: {
            labels: ['外向(E)', '内向(I)'],
            datasets: [{
              label: '分数',
              data: [this.result.scores.E, this.result.scores.I],
              backgroundColor: ['#333', '#666'],
              borderColor: ['#333', '#666'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
      
      // 初始化SN维度图表
      if (this.$refs.chartSN) {
        this.charts.sn = new Chart(this.$refs.chartSN, {
          type: 'bar',
          data: {
            labels: ['感觉(S)', '直觉(N)'],
            datasets: [{
              label: '分数',
              data: [this.result.scores.S, this.result.scores.N],
              backgroundColor: ['#333', '#666'],
              borderColor: ['#333', '#666'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
      
      // 初始化TF维度图表
      if (this.$refs.chartTF) {
        this.charts.tf = new Chart(this.$refs.chartTF, {
          type: 'bar',
          data: {
            labels: ['思考(T)', '情感(F)'],
            datasets: [{
              label: '分数',
              data: [this.result.scores.T, this.result.scores.F],
              backgroundColor: ['#333', '#666'],
              borderColor: ['#333', '#666'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
      
      // 初始化JP维度图表
      if (this.$refs.chartJP) {
        this.charts.jp = new Chart(this.$refs.chartJP, {
          type: 'bar',
          data: {
            labels: ['判断(J)', '感知(P)'],
            datasets: [{
              label: '分数',
              data: [this.result.scores.J, this.result.scores.P],
              backgroundColor: ['#333', '#666'],
              borderColor: ['#333', '#666'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    },
    generateAIAnalysis(typeCode) {
      // 模拟AI分析（作为默认值）
      this.aiAnalysis = {
        strengths: this.getStrengths(typeCode),
        weaknesses: this.getWeaknesses(typeCode),
        careerPaths: this.getCareerPaths(typeCode),
        personalGrowth: this.getPersonalGrowth(typeCode)
      };
    },
    async getAIAnalysis() {
      if (!this.result) return;
      
      this.analyzing = true;
      this.aiError = '';
      this.aiAnalysis = null;
      this.streamingContent = '';
      this.showStreamingContent = true;
      
      try {
        // 定义流式回调函数
        const onChunk = (chunk) => {
          this.streamingContent += chunk;
        };
        
        const analysis = await analyzeMBTI(this.result, onChunk);
        this.aiAnalysis = analysis;
        this.showStreamingContent = false;
      } catch (error) {
        this.aiError = error.message || 'AI分析失败，请稍后重试';
        this.showStreamingContent = false;
        console.error('Failed to get AI analysis:', error);
      } finally {
        this.analyzing = false;
      }
    },
    getStrengths(typeCode) {
      const strengths = {
        'ISTJ': ['可靠性强', '注重细节', '有责任感', '逻辑思维', '组织能力'],
        'ISFJ': ['富有同情心', '乐于助人', '注重和谐', '细心周到', '忠诚可靠'],
        'INFJ': ['洞察力强', '富有创意', '理想主义', '善于理解他人', '有责任感'],
        'INTJ': ['逻辑思维', '战略规划', '创新能力', '独立思考', '目标导向'],
        'ISTP': ['动手能力强', '适应性强', '逻辑思维', '解决问题能力', '实际务实'],
        'ISFP': ['艺术天赋', '敏感细腻', '注重个人价值观', '灵活适应', '富有同情心'],
        'INFP': ['理想主义', '创造力', '同理心', '价值观强烈', '善于理解他人'],
        'INTP': ['逻辑思维', '好奇心强', '分析能力', '创新能力', '独立思考'],
        'ESTP': ['行动能力强', '适应性强', '实际务实', '善于社交', '解决问题能力'],
        'ESFP': ['外向活泼', '善于社交', '富有同情心', '灵活适应', '享受生活'],
        'ENFP': ['创造力', '热情洋溢', '善于社交', '理想主义', '善于激励他人'],
        'ENTP': ['创新能力', '逻辑思维', '好奇心强', '善于辩论', '适应性强'],
        'ESTJ': ['组织能力', '领导能力', '责任感强', '实际务实', '注重效率'],
        'ESFJ': ['乐于助人', '善于社交', '注重和谐', '有责任感', '细心周到'],
        'ENFJ': ['善于理解他人', '有领导力', '富有同情心', '理想主义', '善于激励他人'],
        'ENTJ': ['领导能力', '战略规划', '逻辑思维', '目标导向', '决策能力']
      };
      return strengths[typeCode] || ['暂无分析'];
    },
    getWeaknesses(typeCode) {
      const weaknesses = {
        'ISTJ': ['过于保守', '不善于表达情感', '对变化适应较慢', '过于注重细节'],
        'ISFJ': ['过于牺牲自己', '不善于拒绝他人', '对批评敏感', '对变化适应较慢'],
        'INFJ': ['过于理想主义', '对批评敏感', '不善于表达情感', '容易过度思考'],
        'INTJ': ['过于独立', '对他人要求过高', '不善于表达情感', '容易忽视细节'],
        'ISTP': ['不善于计划', '对长期目标缺乏关注', '不善于表达情感', '容易冲动'],
        'ISFP': ['对批评敏感', '不善于做决定', '对冲突回避', '缺乏组织能力'],
        'INFP': ['过于理想主义', '对批评敏感', '不善于做决定', '容易拖延'],
        'INTP': ['对社交活动缺乏兴趣', '不善于做决定', '容易过度思考', '对情感表达不擅长'],
        'ESTP': ['容易冲动', '对长期目标缺乏关注', '不善于计划', '容易忽视他人感受'],
        'ESFP': ['对冲突回避', '不善于计划', '容易冲动', '对长期目标缺乏关注'],
        'ENFP': ['容易分散注意力', '对批评敏感', '不善于做决定', '容易过度承诺'],
        'ENTP': ['容易分散注意力', '对细节缺乏关注', '不善于完成任务', '容易与人争论'],
        'ESTJ': ['对变化适应较慢', '对他人要求过高', '不善于表达情感', '过于传统'],
        'ESFJ': ['对批评敏感', '过于牺牲自己', '对变化适应较慢', '不善于做决定'],
        'ENFJ': ['对批评敏感', '过于牺牲自己', '对冲突回避', '容易过度承诺'],
        'ENTJ': ['对他人要求过高', '不善于表达情感', '对批评不敏感', '过于直接']
      };
      return weaknesses[typeCode] || ['暂无分析'];
    },
    getCareerPaths(typeCode) {
      const careerPaths = {
        'ISTJ': ['会计师', '审计师', '工程师', '系统分析师', '财务经理'],
        'ISFJ': ['护士', '教师', '社会工作者', '行政助理', '人力资源专员'],
        'INFJ': ['心理咨询师', '教育顾问', '作家', '宗教领袖', '非营利组织管理者'],
        'INTJ': ['战略规划师', '科学家', '工程师', '项目经理', '企业家'],
        'ISTP': ['机械工程师', '程序员', '侦探', '运动员', '技术专家'],
        'ISFP': ['艺术家', '设计师', '音乐家', '护理人员', '兽医'],
        'INFP': ['作家', '心理咨询师', '教育工作者', '社会工作者', '创意设计师'],
        'INTP': ['科学家', '程序员', '数学家', '哲学家', '系统分析师'],
        'ESTP': ['企业家', '销售人员', '运动员', '警察', '冒险家'],
        'ESFP': ['演员', '销售人员', '公关专员', '旅游顾问', '活动策划者'],
        'ENFP': ['市场营销', '公共关系', '教育工作者', '作家', '创意总监'],
        'ENTP': ['企业家', '律师', '营销顾问', '发明家', '记者'],
        'ESTJ': ['管理者', '警察', '军人', '财务经理', '行政主管'],
        'ESFJ': ['教师', '护士', '社会工作者', '销售经理', '活动策划者'],
        'ENFJ': ['教师', '心理咨询师', '公关专员', '人力资源经理', '政治家'],
        'ENTJ': ['CEO', '管理者', '律师', '工程师', '战略顾问']
      };
      return careerPaths[typeCode] || ['暂无分析'];
    },
    getPersonalGrowth(typeCode) {
      const personalGrowth = {
        'ISTJ': ['尝试接受变化', '学习表达情感', '培养灵活性', '关注全局'],
        'ISFJ': ['学会拒绝他人', '关注自己的需求', '培养自信', '接受批评'],
        'INFJ': ['学会放下完美主义', '关注现实', '培养灵活性', '表达情感'],
        'INTJ': ['学会倾听他人', '关注细节', '培养耐心', '表达情感'],
        'ISTP': ['培养长期规划能力', '关注他人感受', '学会坚持', '表达情感'],
        'ISFP': ['培养决策能力', '面对冲突', '提高组织能力', '建立自信'],
        'INFP': ['培养决策能力', '面对现实', '提高时间管理', '接受批评'],
        'INTP': ['培养社交技能', '关注情感', '提高执行力', '学会做决定'],
        'ESTP': ['培养长期规划能力', '关注他人感受', '学会反思', '提高耐心'],
        'ESFP': ['培养规划能力', '面对冲突', '提高专注力', '建立长期目标'],
        'ENFP': ['培养专注力', '提高决策能力', '学会说"不"', '关注细节'],
        'ENTP': ['培养专注力', '提高执行力', '学会倾听', '关注细节'],
        'ESTJ': ['接受变化', '关注他人感受', '培养灵活性', '表达情感'],
        'ESFJ': ['学会拒绝', '关注自己的需求', '接受变化', '培养决策能力'],
        'ENFJ': ['学会说"不"', '关注自己的需求', '面对冲突', '接受批评'],
        'ENTJ': ['关注他人感受', '学会倾听', '培养耐心', '表达情感']
      };
      return personalGrowth[typeCode] || ['暂无分析'];
    },
    generateCareerSuggestions(typeCode) {
      const suggestions = {
        'ISTJ': [
          '会计师',
          '审计师',
          '工程师',
          '系统分析师',
          '财务经理'
        ],
        'ISFJ': [
          '护士',
          '教师',
          '社会工作者',
          '行政助理',
          '人力资源专员'
        ],
        'INFJ': [
          '心理咨询师',
          '教育顾问',
          '作家',
          '宗教领袖',
          '非营利组织管理者'
        ],
        'INTJ': [
          '战略规划师',
          '科学家',
          '工程师',
          '项目经理',
          '企业家'
        ],
        'ISTP': [
          '机械工程师',
          '程序员',
          '侦探',
          '运动员',
          '技术专家'
        ],
        'ISFP': [
          '艺术家',
          '设计师',
          '音乐家',
          '护理人员',
          '兽医'
        ],
        'INFP': [
          '作家',
          '心理咨询师',
          '教育工作者',
          '社会工作者',
          '创意设计师'
        ],
        'INTP': [
          '科学家',
          '程序员',
          '数学家',
          '哲学家',
          '系统分析师'
        ],
        'ESTP': [
          '企业家',
          '销售人员',
          '运动员',
          '警察',
          '冒险家'
        ],
        'ESFP': [
          '演员',
          '销售人员',
          '公关专员',
          '旅游顾问',
          '活动策划者'
        ],
        'ENFP': [
          '市场营销',
          '公共关系',
          '教育工作者',
          '作家',
          '创意总监'
        ],
        'ENTP': [
          '企业家',
          '律师',
          '营销顾问',
          '发明家',
          '记者'
        ],
        'ESTJ': [
          '管理者',
          '警察',
          '军人',
          '财务经理',
          '行政主管'
        ],
        'ESFJ': [
          '教师',
          '护士',
          '社会工作者',
          '销售经理',
          '活动策划者'
        ],
        'ENFJ': [
          '教师',
          '心理咨询师',
          '公关专员',
          '人力资源经理',
          '政治家'
        ],
        'ENTJ': [
          'CEO',
          '管理者',
          '律师',
          '工程师',
          '战略顾问'
        ]
      };
      
      this.careerSuggestions = suggestions[typeCode] || ['暂无职业建议'];
    }
  }
};
</script>

<style scoped>
.result-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.result-card {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

.result-header {
  text-align: center;
  margin-bottom: 2rem;
}

.result-header h3 {
  margin-bottom: 1rem;
  color: #555;
}

.type-code {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.type-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.result-details {
  margin-bottom: 2rem;
}

.result-details h4 {
  margin-bottom: 1rem;
  color: #555;
}

.dimensions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dimension-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dimension-label {
  font-weight: bold;
  color: #666;
}

.dimension-bar {
  display: flex;
  height: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
}

.bar {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

.bar:nth-child(1) {
  background-color: #333;
}

.bar:nth-child(2) {
  background-color: #666;
}

.dimension-result {
  font-weight: bold;
  color: #333;
  align-self: flex-end;
}

.chart-container {
  width: 100%;
  height: 200px;
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.career-suggestions {
  margin-bottom: 2rem;
}

.career-suggestions h4 {
  margin-bottom: 1rem;
  color: #555;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.suggestion-item {
  background-color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;
}

.ai-error {
  margin-top: 2rem;
  background-color: #ffebee;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #f44336;
}

.ai-error h4 {
  color: #c62828;
  margin-bottom: 1rem;
}

.ai-error p {
  color: #b71c1c;
  line-height: 1.4;
}

.ai-analysis {
  margin-top: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
}

.streaming-content {
  position: relative;
  min-height: 200px;
}

.streaming-content p {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  margin-top: 1rem;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  margin: 0 1px;
  background-color: #333;
  border-radius: 50%;
  display: inline-block;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.analysis-section {
  margin-bottom: 1.5rem;
}

.analysis-section h5 {
  margin-bottom: 0.5rem;
  color: #555;
}

.analysis-list {
  list-style-type: disc;
  padding-left: 2rem;
  color: #666;
}

.analysis-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 0.75rem 1.5rem;
  border: 1px solid #333;
  background-color: #333;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-buttons button:hover:not(:disabled) {
  background-color: #555;
}

.action-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons button:disabled:hover {
  background-color: #333;
  color: white;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid #333;
  background-color: white;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn:hover {
  background-color: #333;
  color: white;
}

.btn.primary {
  background-color: #333;
  color: white;
}

.btn.primary:hover {
  background-color: #555;
}

.no-result {
  text-align: center;
  padding: 4rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.no-result p {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 1.1rem;
}
</style>