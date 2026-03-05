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
        <h4>职业风格</h4>
        <div class="type-header">
          <span class="type-code">{{ result.typeCode }}</span>
          <span class="type-name">({{ getTypeName(result.typeCode) }})</span>
        </div>
        <div class="chart-container">
          <canvas ref="mainChart"></canvas>
        </div>
        
        <div class="scores-table">
          <h4>得分详情</h4>
          <table>
            <thead>
              <tr>
                <th>维度</th>
                <th>得分</th>
                <th>倾向</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>外向(E) / 内向(I)</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill e-score" :style="{ width: (result.scores.E / (result.scores.E + result.scores.I)) * 100 + '%' }">{{ result.scores.E }}</div>
                    <div class="score-fill i-score" :style="{ width: (result.scores.I / (result.scores.E + result.scores.I)) * 100 + '%' }">{{ result.scores.I }}</div>
                  </div>
                </td>
                <td>{{ result.result.EI }}</td>
              </tr>
              <tr>
                <td>感觉(S) / 直觉(N)</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill s-score" :style="{ width: (result.scores.S / (result.scores.S + result.scores.N)) * 100 + '%' }">{{ result.scores.S }}</div>
                    <div class="score-fill n-score" :style="{ width: (result.scores.N / (result.scores.S + result.scores.N)) * 100 + '%' }">{{ result.scores.N }}</div>
                  </div>
                </td>
                <td>{{ result.result.SN }}</td>
              </tr>
              <tr>
                <td>思考(T) / 情感(F)</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill t-score" :style="{ width: (result.scores.T / (result.scores.T + result.scores.F)) * 100 + '%' }">{{ result.scores.T }}</div>
                    <div class="score-fill f-score" :style="{ width: (result.scores.F / (result.scores.T + result.scores.F)) * 100 + '%' }">{{ result.scores.F }}</div>
                  </div>
                </td>
                <td>{{ result.result.TF }}</td>
              </tr>
              <tr>
                <td>判断(J) / 感知(P)</td>
                <td>
                  <div class="score-bar">
                    <div class="score-fill j-score" :style="{ width: (result.scores.J / (result.scores.J + result.scores.P)) * 100 + '%' }">{{ result.scores.J }}</div>
                    <div class="score-fill p-score" :style="{ width: (result.scores.P / (result.scores.J + result.scores.P)) * 100 + '%' }">{{ result.scores.P }}</div>
                  </div>
                </td>
                <td>{{ result.result.JP }}</td>
              </tr>
            </tbody>
          </table>
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
        
        <!-- A4格式报告和下载功能 -->
        <div class="report-download-section">
          <h5>A4格式报告</h5>
          <div class="report-actions">
            <button class="btn" @click="showA4Report = !showA4Report">
              {{ showA4Report ? '隐藏A4报告' : '显示A4报告' }}
            </button>
            <button v-if="showA4Report" class="btn primary" @click="downloadAsImage">
              下载为图片
            </button>
            <button v-if="showA4Report" class="btn primary" @click="downloadAsPDF">
              下载为PDF
            </button>
          </div>
          
          <div v-if="showA4Report" class="a4-report" ref="a4Report">
            <div class="a4-header">
              <h2>MBTI性格分析报告</h2>
              <div class="report-info">
                <p>测评日期: {{ formatDate(new Date()) }}</p>
                <p>性格类型: {{ result.typeCode }} - {{ result.description }}</p>
              </div>
            </div>
            
            <div class="a4-content">
              <section class="a4-section">
                <h3>一、性格类型概述</h3>
                <p>{{ result.description }}</p>
                <p>类型名称: {{ getTypeName(result.typeCode) }}</p>
              </section>
              
              <section class="a4-section">
                <h3>二、得分详情</h3>
                <table class="a4-table">
                  <tr>
                    <th>维度</th>
                    <th>得分</th>
                    <th>倾向</th>
                  </tr>
                  <tr>
                    <td>外向(E) / 内向(I)</td>
                    <td>{{ result.scores.E }} / {{ result.scores.I }}</td>
                    <td>{{ result.result.EI }}</td>
                  </tr>
                  <tr>
                    <td>感觉(S) / 直觉(N)</td>
                    <td>{{ result.scores.S }} / {{ result.scores.N }}</td>
                    <td>{{ result.result.SN }}</td>
                  </tr>
                  <tr>
                    <td>思考(T) / 情感(F)</td>
                    <td>{{ result.scores.T }} / {{ result.scores.F }}</td>
                    <td>{{ result.result.TF }}</td>
                  </tr>
                  <tr>
                    <td>判断(J) / 感知(P)</td>
                    <td>{{ result.scores.J }} / {{ result.scores.P }}</td>
                    <td>{{ result.result.JP }}</td>
                  </tr>
                </table>
              </section>
              
              <section class="a4-section">
                <h3>三、优势分析</h3>
                <ul class="a4-list">
                  <li v-for="(item, index) in aiAnalysis.strengths" :key="index">{{ item }}</li>
                </ul>
              </section>
              
              <section class="a4-section">
                <h3>四、劣势分析</h3>
                <ul class="a4-list">
                  <li v-for="(item, index) in aiAnalysis.weaknesses" :key="index">{{ item }}</li>
                </ul>
              </section>
              
              <section class="a4-section">
                <h3>五、职业发展路径</h3>
                <ul class="a4-list">
                  <li v-for="(item, index) in aiAnalysis.careerPaths" :key="index">{{ item }}</li>
                </ul>
              </section>
              
              <section class="a4-section">
                <h3>六、个人成长建议</h3>
                <ul class="a4-list">
                  <li v-for="(item, index) in aiAnalysis.personalGrowth" :key="index">{{ item }}</li>
                </ul>
              </section>
            </div>
            
            <div class="a4-footer">
              <p>本报告由MBTI职业性格测评系统生成</p>
            </div>
          </div>
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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
      showA4Report: false,
      charts: {}
    };
  },
  mounted() {
    this.loadResult();
  },
  methods: {
    loadResult() {
      // 从URL参数获取recordId或typeCode
      const recordId = this.$route.query.recordId;
      const typeCode = this.$route.query.typeCode;
      
      if (recordId) {
        // 根据recordId加载特定的测评记录
        const record = AssessmentRecordModel.findById(recordId);
        if (record) {
          // 使用实际的测评记录数据
          this.result = {
            typeCode: record.typeCode,
            description: record.description,
            scores: record.scores,
            result: record.result
          };
          
          // 生成职业建议
          this.generateCareerSuggestions(record.typeCode);
          
          // 加载AI分析（优先使用保存的分析结果）
          if (record.aiAnalysis) {
            this.aiAnalysis = record.aiAnalysis;
          } else {
            this.generateAIAnalysis(record.typeCode);
          }
          
          // 初始化图表
          this.$nextTick(() => {
            this.initCharts();
          });
        } else {
          // 如果没有找到记录，显示错误信息
          alert('未找到测评记录');
          this.$router.push('/profile');
        }
      } else if (typeCode) {
        // 从URL参数获取typeCode（原有逻辑）
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
    getTypeName(typeCode) {
      const typeNames = {
        'ISTJ': '检查员型',
        'ISFJ': '照顾者型',
        'INFJ': '博爱型',
        'INTJ': '专家型',
        'ISTP': '冒险家型',
        'ISFP': '艺术家型',
        'INFP': '理想主义型',
        'INTP': '思想家型',
        'ESTP': '企业家型',
        'ESFP': '表演者型',
        'ENFP': '激励者型',
        'ENTP': '发明家型',
        'ESTJ': '监督者型',
        'ESFJ': '提供者型',
        'ENFJ': '教导者型',
        'ENTJ': '领导者型'
      };
      return typeNames[typeCode] || '未知性格类型';
    },
    initCharts() {
      if (!this.result) return;
      
      // 销毁现有图表
      Object.values(this.charts).forEach(chart => chart.destroy());
      
      // 初始化主图表（按照图1所示的方式）
      if (this.$refs.mainChart) {
        const ctx = this.$refs.mainChart.getContext('2d');
        this.charts.main = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['内向/外向', '感觉/直觉', '思考/情感', '判断/感知'],
            datasets: [{
              label: '职业风格评分',
              data: [
                this.result.result.EI === 'E' ? this.result.scores.E : this.result.scores.I,
                this.result.result.SN === 'S' ? this.result.scores.S : this.result.scores.N,
                this.result.result.TF === 'T' ? this.result.scores.T : this.result.scores.F,
                this.result.result.JP === 'J' ? this.result.scores.J : this.result.scores.P
              ],
              backgroundColor: 'rgba(51, 51, 51, 0.2)',
              borderColor: 'rgba(51, 51, 51, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(51, 51, 51, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(51, 51, 51, 1)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: {
                  display: true
                },
                suggestedMin: 0,
                suggestedMax: 100
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
        
        // 保存AI分析结果到测评记录
        const recordId = this.$route.query.recordId;
        if (recordId) {
          const record = AssessmentRecordModel.findById(recordId);
          if (record) {
            AssessmentRecordModel.update(recordId, { aiAnalysis: analysis });
            console.log('AI analysis saved to record:', recordId);
          } else {
            // 如果没有recordId，尝试找到最新的测评记录
            const user = getCurrentUser();
            if (user) {
              const records = AssessmentRecordModel.findByUserId(user.id);
              if (records.length > 0) {
                const latestRecord = records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
                AssessmentRecordModel.update(latestRecord.id, { aiAnalysis: analysis });
                console.log('AI analysis saved to latest record:', latestRecord.id);
              }
            }
          }
        }
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
    },
    async downloadAsImage() {
      try {
        const reportElement = this.$refs.a4Report;
        if (!reportElement) {
          alert('报告元素未找到');
          return;
        }
        
        const canvas = await html2canvas(reportElement, {
          scale: 2, // 提高分辨率
          useCORS: true,
          logging: false
        });
        
        const link = document.createElement('a');
        link.download = `mbti-report-${this.result.typeCode}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('下载图片失败:', error);
        alert('下载图片失败，请重试');
      }
    },
    async downloadAsPDF() {
      try {
        const reportElement = this.$refs.a4Report;
        if (!reportElement) {
          alert('报告元素未找到');
          return;
        }
        
        const canvas = await html2canvas(reportElement, {
          scale: 2, // 提高分辨率
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`mbti-report-${this.result.typeCode}-${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (error) {
        console.error('下载PDF失败:', error);
        alert('下载PDF失败，请重试');
      }
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
  text-align: center;
}

.type-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.type-header .type-code {
  font-size: 2rem;
  margin-bottom: 0;
}

.type-header .type-name {
  font-size: 1.2rem;
  color: #666;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin: 0 auto;
  max-width: 600px;
}

.scores-table {
  margin-top: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.scores-table h4 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.scores-table table {
  width: 100%;
  border-collapse: collapse;
}

.scores-table th,
.scores-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.scores-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  color: #555;
}

.scores-table tr:hover {
  background-color: #f9f9f9;
}

.score-bar {
  display: flex;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
}

.score-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  transition: width 0.5s ease;
}

.score-fill.e-score {
  background-color: #4CAF50;
}

.score-fill.i-score {
  background-color: #2196F3;
}

.score-fill.s-score {
  background-color: #FF9800;
}

.score-fill.n-score {
  background-color: #9C27B0;
}

.score-fill.t-score {
  background-color: #F44336;
}

.score-fill.f-score {
  background-color: #00BCD4;
}

.score-fill.j-score {
  background-color: #795548;
}

.score-fill.p-score {
  background-color: #607D8B;
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

/* A4报告样式 */
.report-download-section {
  margin-top: 2rem;
  border-top: 1px solid #ddd;
  padding-top: 1.5rem;
}

.report-download-section h5 {
  margin-bottom: 1rem;
  color: #555;
}

.report-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.a4-report {
  width: 210mm;
  min-height: 297mm;
  background-color: white;
  margin: 0 auto;
  padding: 20mm;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-family: 'SimSun', serif;
  line-height: 1.5;
}

.a4-header {
  text-align: center;
  margin-bottom: 20mm;
  padding-bottom: 10mm;
  border-bottom: 1px solid #ddd;
}

.a4-header h2 {
  font-size: 18pt;
  color: #333;
  margin-bottom: 10mm;
}

.report-info {
  font-size: 10pt;
  color: #666;
  text-align: right;
}

.a4-content {
  margin-bottom: 20mm;
}

.a4-section {
  margin-bottom: 15mm;
}

.a4-section h3 {
  font-size: 14pt;
  color: #333;
  margin-bottom: 5mm;
  text-align: center;
}

.a4-section p {
  font-size: 10pt;
  color: #333;
  margin-bottom: 5mm;
  text-align: justify;
}

.a4-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10mm 0;
  font-size: 9pt;
}

.a4-table th,
.a4-table td {
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}

.a4-table th {
  background-color: #f9f9f9;
  font-weight: bold;
}

.a4-list {
  list-style-type: disc;
  padding-left: 20mm;
  font-size: 10pt;
  color: #333;
}

.a4-list li {
  margin-bottom: 3mm;
  text-align: justify;
}

.a4-footer {
  text-align: center;
  font-size: 9pt;
  color: #999;
  padding-top: 10mm;
  border-top: 1px solid #ddd;
}
</style>