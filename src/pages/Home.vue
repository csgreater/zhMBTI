<template>
  <div class="home-container">
    <div class="hero">
      <h1>MBTI职业性格测评系统</h1>
      <p>了解自己的性格特质，探索适合的职业方向</p>
      <router-link to="/assessment" class="start-button">开始测评</router-link>
    </div>
    
    <div class="features">
      <h2>系统特点</h2>
      <div class="feature-list">
        <div class="feature-item">
          <h3>科学测评</h3>
          <p>基于MBTI理论，提供专业的性格测评服务</p>
        </div>
        <div class="feature-item">
          <h3>详细报告</h3>
          <p>生成个性化的测评报告，包含性格分析和职业建议</p>
        </div>
        <div class="feature-item">
          <h3>数据管理</h3>
          <p>存储测评记录，方便随时查看和分析</p>
        </div>
      </div>
    </div>
    
    <div class="about">
      <h2>关于MBTI</h2>
      <p>MBTI（Myers-Briggs Type Indicator）是一种广泛使用的人格评估工具，基于卡尔·荣格的心理类型理论，由伊莎贝尔·迈尔斯和凯瑟琳·布里格斯开发。测试包含四个维度：外向(E)/内向(I)、感觉(S)/直觉(N)、思考(T)/情感(F)、判断(J)/感知(P)，最终形成16种不同的性格类型。</p>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #666;
}

.start-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #555;
}

.features {
  margin-bottom: 3rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.feature-list {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.feature-item {
  flex: 1;
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.feature-item h3 {
  margin-bottom: 1rem;
  color: #555;
}

.feature-item p {
  color: #666;
  line-height: 1.4;
}

.about {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
}

.about h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.about p {
  color: #666;
  line-height: 1.6;
  text-align: justify;
}

@media (max-width: 768px) {
  .feature-list {
    flex-direction: column;
  }
  
  .hero h1 {
    font-size: 2rem;
  }
  
  .hero p {
    font-size: 1rem;
  }
}
</style>