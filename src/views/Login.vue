<script setup>
import { Lock, User, Message } from "@element-plus/icons-vue";
import { ref, onMounted, onUnmounted } from "vue";
import { userLoginService, userRegisterService } from "@/api/user";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token";

import { userInfoService } from "@/api/user";
import { useUserInfoStore } from "@/stores/userInfo";

import { reactive } from "vue";

const isRegister = ref(false);
const registerData = ref({
  username: "",
  email: "",
  password: "",
  rePassword: "",
  role: "",
});

const checkEmail = (rule, value, callback) => {
  const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+$/;
  if (!regEmail.test(value)) {
    callback(new Error("请输入合法的邮箱"));
  } else {
    callback();
  }
};

const checkRePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== registerData.value.password) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 5, max: 16, message: "长度为5-16位", trigger: "blur" },
  ],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" },
    { validator: checkEmail, trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 5, max: 16, message: "长度为5-16位", trigger: "blur" },
  ],
  rePassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { validator: checkRePassword, trigger: "blur" },
  ],
};

const register = async () => {
  const valid = await form.value.validate();
  if (valid) {
    const result = await userRegisterService(registerData.value);
    
    if (result.code === 0) {
      alert(result.msg ? msg : "注册成功");
    } else {
      alert("注册失败");
    }
  }
};

const router = useRouter();
const tokenStore = useTokenStore();
const form = ref(null);

const userInfoStore = useUserInfoStore();

const login = async () => {
  const valid = await form.value.validate();
  if (valid) {
    let result = await userLoginService(registerData.value);
    ElMessage.success(result.message ? result.message : "登录成功");
    tokenStore.setToken(result.data);
    let result2 = await userInfoService();
    userInfoStore.setUserInfo(result2.data);

    if (userInfoStore.userInfo.role == "ROLE_USER") {
      await router.push("/user/herb");
    }

    if (userInfoStore.userInfo.role == "ROLE_ADMIN") {
      await router.push("/admin/herb");
    }
  }
};

const clearRegisterData = () => {
  registerData.value = {
    username: "",
    email: "",
    password: "",
    rePassword: "",
  };
};

const activeFeature = ref("");
const popupPosition = ref({ x: 0, y: 0 });

const toggleFeature = (featureName, el) => {
  if (activeFeature.value === featureName) {
    activeFeature.value = "";
    return;
  }
  activeFeature.value = featureName;
  const rect = el.getBoundingClientRect();
  popupPosition.value = {
    x: rect.left + rect.width / 2,
    y: rect.bottom + 12,
  };
};

const selectFeatureFromCard = (featureName) => {
  const linkElements = document.querySelectorAll(".nav-link");
  const linkMap = { herb: 1, prescription: 2, forum: 3 };
  if (linkMap[featureName]) {
    const el = linkElements[linkMap[featureName]];
    if (el) {
      activeFeature.value = featureName;
      const rect = el.getBoundingClientRect();
      popupPosition.value = {
        x: rect.left + rect.width / 2,
        y: rect.bottom + 12,
      };
    }
  }
};

const handleClickOutside = (e) => {
  const popup = document.querySelector(".feature-popup");
  if (popup && !popup.contains(e.target)) {
    const isNavLink = e.target.closest(".nav-link");
    if (!isNavLink) {
      activeFeature.value = "";
    }
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

const featureDetails = {
  herb: { title: "中药材百科", desc: "系统收录500+种中草药，包含性味归经、功效主治、用法用量等详细信息，传承经典药性理论。" },
  prescription: { title: "经典方剂库", desc: "汇聚200+古今名方，支持智能配伍推荐与方剂解析，帮助理解中医方剂配伍规律。" },
  "patent-medicine": { title: "中成药库", desc: "收录常见中成药，包含成分组成、功能主治、用法用量及注意事项，方便日常用药参考。" },
  classics: { title: "中医典籍", desc: "汇集黄帝内经、伤寒杂病论、神农本草经等中医经典著作，提供系统化阅读与检索功能。" },
  forum: { title: "中医论坛", desc: "交流中医学习心得，分享临床经验，与同好共同探讨中医文化与健康养生。" },
  "ai-diagnosis": { title: "AI智能问诊", desc: "融合现代AI技术，通过智能对话分析症状，提供个性化中医健康调理方案。" },
  "herb-ai": { title: "中草药AI识别", desc: "拍照即可智能识别中草药种类，自动解析药材功效、用法用量及注意事项。" },
  tongue: { title: "舌象AI识别", desc: "基于深度学习分析舌象特征，辅助中医体质辨识与健康状况评估。" },
  knowledge: { title: "知识图谱", desc: "可视化展示中药、方剂、病症之间的关联关系，帮助构建系统化的中医知识体系。" },
};
</script>

<template>
  <div class="login-page">
    <!-- 微妙背景渐变 -->
    <div class="bg-gradient"></div>

    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="deco-circle deco-circle-1"></div>
      <div class="deco-circle deco-circle-2"></div>
      <div class="deco-circle deco-circle-3"></div>
      <div class="deco-line deco-line-1"></div>
      <div class="deco-line deco-line-2"></div>
    </div>

    <!-- 顶部导航栏 -->
    <header class="top-bar">
      <div class="top-bar-content">
        <div class="nav-logo">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4C20 4 12 10 12 18C12 24 16 28 20 32C24 28 28 24 28 18C28 10 20 4 20 4Z" fill="rgba(107, 68, 35, 0.7)"/>
            <circle cx="20" cy="19" r="3" fill="white"/>
          </svg>
        </div>
        <nav class="nav-links">
          <a class="nav-link" :class="{ active: activeFeature === '' }" @click.prevent="activeFeature = ''">首页</a>
          <a class="nav-link" :class="{ active: activeFeature === 'herb' }" @click.prevent="toggleFeature('herb', $event.target)">药材</a>
          <a class="nav-link" :class="{ active: activeFeature === 'prescription' }" @click.prevent="toggleFeature('prescription', $event.target)">方剂</a>
          <a class="nav-link" :class="{ active: activeFeature === 'patent-medicine' }" @click.prevent="toggleFeature('patent-medicine', $event.target)">中成药</a>
          <a class="nav-link" :class="{ active: activeFeature === 'classics' }" @click.prevent="toggleFeature('classics', $event.target)">典籍</a>
          <a class="nav-link" :class="{ active: activeFeature === 'ai-diagnosis' }" @click.prevent="toggleFeature('ai-diagnosis', $event.target)">AI问诊</a>
          <a class="nav-link" :class="{ active: activeFeature === 'herb-ai' }" @click.prevent="toggleFeature('herb-ai', $event.target)">识药</a>
          <a class="nav-link" :class="{ active: activeFeature === 'tongue' }" @click.prevent="toggleFeature('tongue', $event.target)">舌象</a>
          <a class="nav-link" :class="{ active: activeFeature === 'knowledge' }" @click.prevent="toggleFeature('knowledge', $event.target)">图谱</a>
          <a class="nav-link" :class="{ active: activeFeature === 'forum' }" @click.prevent="toggleFeature('forum', $event.target)">论坛</a>
        </nav>
      </div>

      <!-- 功能详情弹框 -->
      <transition name="popup-fade">
        <div v-if="activeFeature" class="feature-popup" :style="{ left: popupPosition.x + 'px', top: popupPosition.y + 'px' }">
          <div class="popup-arrow"></div>
          <h3 class="popup-title">{{ featureDetails[activeFeature]?.title }}</h3>
          <p class="popup-desc">{{ featureDetails[activeFeature]?.desc }}</p>
          <span class="popup-cta">登录后即可体验完整功能</span>
        </div>
      </transition>
    </header>

    <!-- 主内容区 -->
    <div class="content-wrapper">
      <!-- 品牌展示区 -->
      <div class="hero-section">
        <div class="brand-content">
          <div class="brand-badge">中医养生</div>
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10C50 10 30 25 30 45C30 60 40 70 50 80C60 70 70 60 70 45C70 25 50 10 50 10Z" fill="rgba(107, 68, 35, 0.1)" stroke="rgba(107, 68, 35, 0.6)" stroke-width="2"/>
              <path d="M50 35C50 35 42 42 42 52C42 58 46 63 50 68C54 63 58 58 58 52C58 42 50 35 50 35Z" fill="rgba(107, 68, 35, 0.2)"/>
              <circle cx="50" cy="48" r="6" fill="rgba(107, 68, 35, 0.8)"/>
            </svg>
          </div>
          <h1 class="brand-title">百草居</h1>
          <p class="brand-subtitle">传承千年智慧，守护健康本源</p>
          
          <!-- 数据统计展示 -->
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-number">500+</span>
              <span class="stat-label">药材百科</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">200+</span>
              <span class="stat-label">经典方剂</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">AI</span>
              <span class="stat-label">智能问诊</span>
            </div>
          </div>
        </div>

        <!-- 项目亮点展示 -->
        <div class="features-grid">
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'herb' }"
            @click="activeFeature === 'herb' ? activeFeature = '' : selectFeatureFromCard('herb')"
          >
            <div class="feature-icon">🌿</div>
            <h3 class="feature-title">中药材百科</h3>
            <p class="feature-desc">系统收录中草药知识，传承经典药性理论</p>
          </div>
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'prescription' }"
            @click="activeFeature === 'prescription' ? activeFeature = '' : selectFeatureFromCard('prescription')"
          >
            <div class="feature-icon">📚</div>
            <h3 class="feature-title">经典方剂库</h3>
            <p class="feature-desc">汇聚古今名方，智能配伍推荐</p>
          </div>
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'ai-diagnosis' }"
          >
            <div class="feature-icon">🤖</div>
            <h3 class="feature-title">AI智能问诊</h3>
            <p class="feature-desc">融合现代科技，提供个性化健康方案</p>
          </div>
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'herb-ai' }"
          >
            <div class="feature-icon">📷</div>
            <h3 class="feature-title">中草药AI识别</h3>
            <p class="feature-desc">拍照识药，智能解析药材功效与用法</p>
          </div>
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'tongue' }"
          >
            <div class="feature-icon">👅</div>
            <h3 class="feature-title">舌象AI识别</h3>
            <p class="feature-desc">智能分析舌象特征，辅助中医体质辨识</p>
          </div>
          <div 
            class="feature-card" 
            :class="{ 'card-active': activeFeature === 'knowledge' }"
          >
            <div class="feature-icon">🕸️</div>
            <h3 class="feature-title">知识图谱</h3>
            <p class="feature-desc">可视化展示中药、方剂、病症关联关系</p>
          </div>
        </div>
      </div>

      <!-- 表单卡片 -->
      <div class="form-wrapper">
        <!-- 注册表单 -->
        <el-form
          ref="form"
          size="large"
          autocomplete="on"
          v-if="isRegister"
          :model="registerData"
          :rules="rules"
          class="auth-form"
        >
          <div class="form-header">
            <h2 class="form-title">创建账号</h2>
            <p class="form-desc">加入百草居，开启中医养生之旅</p>
          </div>

          <el-form-item prop="username">
            <el-input
              :prefix-icon="User"
              placeholder="请输入用户名"
              v-model="registerData.username"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item prop="email">
            <el-input
              :prefix-icon="Message"
              placeholder="请输入邮箱"
              v-model="registerData.email"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码"
              v-model="registerData.password"
              class="custom-input"
              show-password
            ></el-input>
          </el-form-item>

          <el-form-item prop="rePassword">
            <el-input
              :prefix-icon="Lock"
              type="password"
              placeholder="请再次确认密码"
              v-model="registerData.rePassword"
              class="custom-input"
              show-password
            ></el-input>
          </el-form-item>

          <el-form-item>
            <button type="button" class="submit-btn" @click="register(); isRegister = false;">
              注册
            </button>
          </el-form-item>

          <el-form-item class="switch-form">
            <span class="switch-text">已有账号？</span>
            <el-link type="primary" :underline="false" @click="isRegister = false; clearRegisterData();" class="switch-link">
              立即登录
            </el-link>
          </el-form-item>
        </el-form>

        <!-- 登录表单 -->
        <el-form
          ref="form"
          size="large"
          autocomplete="off"
          v-else
          :model="registerData"
          :rules="rules"
          class="auth-form"
        >
          <div class="form-header">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-desc">登录您的百草居账户</p>
          </div>

          <el-form-item prop="username">
            <el-input
              :prefix-icon="User"
              placeholder="请输入用户名"
              v-model="registerData.username"
              class="custom-input"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              name="password"
              :prefix-icon="Lock"
              type="password"
              placeholder="请输入密码"
              v-model="registerData.password"
              class="custom-input"
              show-password
            ></el-input>
          </el-form-item>

          <el-form-item>
            <button type="button" class="submit-btn" @click="login">
              登录
            </button>
          </el-form-item>

          <el-form-item class="switch-form">
            <span class="switch-text">还没有账号？</span>
            <el-link type="primary" :underline="false" @click="isRegister = true; clearRegisterData();" class="switch-link">
              注册账号
            </el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <footer class="footer-bar">
      <div class="footer-content">
        <p class="footer-text">百草居 - 传承千年智慧 · 守护健康本源</p>
        <div class="footer-divider"></div>
        <p class="footer-copyright">© 2025 Baicaoju. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  .bg-gradient {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(107, 68, 35, 0.04) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(166, 124, 82, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(250, 248, 245, 1) 0%, rgba(250, 248, 245, 0.98) 100%);
    z-index: 0;
  }

  .bg-decoration {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;

    .deco-circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(107, 68, 35, 0.06);
    }

    .deco-circle-1 {
      width: 400px;
      height: 400px;
      top: 10%;
      left: -5%;
      animation: floatSlow 25s ease-in-out infinite;
    }

    .deco-circle-2 {
      width: 280px;
      height: 280px;
      bottom: 15%;
      right: 5%;
      animation: floatSlow 20s ease-in-out infinite reverse;
    }

    .deco-circle-3 {
      width: 160px;
      height: 160px;
      top: 40%;
      right: 30%;
      animation: floatSlow 18s ease-in-out infinite;
    }

    .deco-line {
      position: absolute;
      background: linear-gradient(90deg, transparent, rgba(107, 68, 35, 0.04), transparent);
      height: 1px;
    }

    .deco-line-1 {
      width: 300px;
      top: 35%;
      left: 20%;
      transform: rotate(-15deg);
      animation: shimmerLine 12s ease-in-out infinite;
    }

    .deco-line-2 {
      width: 250px;
      bottom: 25%;
      left: 40%;
      transform: rotate(10deg);
      animation: shimmerLine 15s ease-in-out infinite reverse;
    }
  }

  @keyframes floatSlow {
    0%, 100% { transform: translate(0, 0); }
    50% { transform: translate(15px, -15px); }
  }

  @keyframes shimmerLine {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.8; }
  }
}

// 顶部导航栏
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 20px 48px;
  background: rgba(250, 248, 245, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(107, 68, 35, 0.06);

  @media (max-width: 768px) {
    padding: 16px 24px;
  }

  .top-bar-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    width: 32px;
    height: 32px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .nav-links {
    display: flex;
    gap: 36px;

    @media (max-width: 640px) {
      gap: 20px;
    }

    .nav-link {
      color: $text-secondary;
      font-size: 14px;
      font-weight: 400;
      text-decoration: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 1px;
      cursor: pointer;
      position: relative;

      &::after {
        content: '';
        display: block;
        width: 0;
        height: 2px;
        background: $color-primary;
        margin: 4px auto 0;
        border-radius: 1px;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      &:hover {
        color: $color-primary;
      }

      &.active {
        color: $color-primary;
        font-weight: 500;

        &::after {
          width: 16px;
        }
      }
    }
  }
}

.content-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px 80px 40px;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 60px;
    padding: 100px 24px 100px 24px;
  }
}

.hero-section {
  flex: 1;
  max-width: 560px;
  margin-right: 80px;

  @media (max-width: 1024px) {
    margin-right: 0;
    text-align: center;
    max-width: 600px;
  }

  .brand-content {
    margin-bottom: 64px;

    @media (max-width: 1024px) {
      margin-bottom: 48px;
    }
  }

  .brand-badge {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(107, 68, 35, 0.08);
    color: $color-primary;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 3px;
    border-radius: $radius-full;
    margin-bottom: 32px;
    text-transform: uppercase;

    @media (max-width: 1024px) {
      margin-bottom: 24px;
    }
  }

  .logo-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 32px;

    @media (max-width: 1024px) {
      margin: 0 auto 24px;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .brand-title {
    font-size: 52px;
    font-weight: 300;
    color: $text-primary;
    margin: 0 0 16px 0;
    letter-spacing: 10px;
    line-height: 1.2;

    @media (max-width: 1024px) {
      font-size: 42px;
      letter-spacing: 6px;
    }
  }

  .brand-subtitle {
    font-size: 17px;
    color: $text-secondary;
    margin: 0 0 40px 0;
    line-height: 1.8;
    font-weight: 300;
    letter-spacing: 2px;

    @media (max-width: 1024px) {
      margin-bottom: 32px;
    }
  }

  .stats-row {
    display: flex;
    align-items: center;
    gap: 24px;

    @media (max-width: 1024px) {
      justify-content: center;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .stat-number {
        font-size: 28px;
        font-weight: 300;
        color: $color-primary;
        letter-spacing: 2px;
      }

      .stat-label {
        font-size: 13px;
        color: $text-muted;
        font-weight: 400;
        letter-spacing: 1px;
      }
    }

    .stat-divider {
      width: 1px;
      height: 36px;
      background: rgba(107, 68, 35, 0.15);
    }
  }
}

// 功能详情弹框
.feature-popup {
  position: fixed;
  transform: translateX(-50%);
  z-index: 110;
  padding: 20px 24px;
  min-width: 280px;
  max-width: 360px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  border-radius: $radius-lg;
  border: 1px solid rgba(107, 68, 35, 0.1);
  box-shadow: 0 12px 40px rgba(44, 36, 22, 0.12);
  text-align: center;

  .popup-arrow {
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid rgba(107, 68, 35, 0.1);
    border-left: 1px solid rgba(107, 68, 35, 0.1);
  }

  .popup-title {
    font-size: 16px;
    font-weight: 500;
    color: $text-primary;
    letter-spacing: 1px;
    margin: 0 0 8px 0;
  }

  .popup-desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.7;
    margin: 0 0 12px 0;
    font-weight: 300;
  }

  .popup-cta {
    font-size: 12px;
    color: $color-primary;
    font-weight: 400;
    letter-spacing: 1px;
  }
}

// 功能详情面板
.feature-detail-panel {
  padding: 32px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-radius: $radius-lg;
  border: 1px solid rgba(107, 68, 35, 0.08);
  margin-bottom: 24px;

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .panel-title {
      font-size: 20px;
      font-weight: 400;
      color: $text-primary;
      letter-spacing: 2px;
      margin: 0;
    }

    .panel-close {
      width: 28px;
      height: 28px;
      border: none;
      background: rgba(107, 68, 35, 0.08);
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all $transition-normal;
      padding: 0;

      svg {
        width: 14px;
        height: 14px;
        color: $text-muted;
      }

      &:hover {
        background: rgba(107, 68, 35, 0.15);

        svg {
          color: $text-primary;
        }
      }
    }
  }

  .panel-desc {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.8;
    margin: 0 0 16px 0;
    font-weight: 300;
  }

  .panel-cta {
    .cta-text {
      font-size: 13px;
      color: $color-primary;
      font-weight: 400;
      letter-spacing: 1px;
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 24px;

  @media (max-width: 1024px) {
    gap: 20px;
    justify-items: center;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
  }

  .feature-card {
    padding: 28px 20px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: $radius-lg;
    border: 1px solid rgba(107, 68, 35, 0.08);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    animation: fadeUp 0.8s ease-out both;

    &:nth-child(1) { animation-delay: 0.1s; }
    &:nth-child(2) { animation-delay: 0.15s; }
    &:nth-child(3) { animation-delay: 0.2s; }
    &:nth-child(4) { animation-delay: 0.25s; }
    &:nth-child(5) { animation-delay: 0.3s; }
    &:nth-child(6) { animation-delay: 0.35s; }

    &:hover {
      background: rgba(255, 255, 255, 0.85);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(44, 36, 22, 0.1);
    }

    &.card-active {
      background: rgba(255, 255, 255, 0.9);
      border-color: rgba(107, 68, 35, 0.2);
      box-shadow: 0 8px 24px rgba(44, 36, 22, 0.1);
      transform: translateY(-4px);
    }

    .feature-icon {
      font-size: 28px;
      margin-bottom: 14px;
    }

    .feature-title {
      font-size: 15px;
      font-weight: 500;
      color: $text-primary;
      margin: 0 0 6px 0;
      letter-spacing: 1px;
    }

    .feature-desc {
      font-size: 12px;
      color: $text-muted;
      margin: 0;
      line-height: 1.6;
    }
  }
}

.form-wrapper {
  flex: 0 0 420px;
  padding: 56px 48px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: $radius-xl;
  border: 1px solid rgba(107, 68, 35, 0.08);
  box-shadow: 
    0 8px 32px rgba(44, 36, 22, 0.08),
    0 2px 8px rgba(44, 36, 22, 0.04);
  animation: fadeInScale 0.6s ease-out;

  @media (max-width: 1024px) {
    flex: none;
    width: 100%;
    max-width: 420px;
    padding: 48px 40px;
  }

  @media (max-width: 480px) {
    padding: 40px 24px;
  }
}

.auth-form {
  .form-header {
    margin-bottom: 40px;
    text-align: center;

    .form-title {
      font-size: 24px;
      font-weight: 400;
      color: $text-primary;
      margin: 0 0 12px 0;
      letter-spacing: 2px;
    }

    .form-desc {
      font-size: 14px;
      color: $text-muted;
      margin: 0;
      font-weight: 300;
    }
  }
}

:deep(.custom-input) {
  .el-input__wrapper {
    border-radius: $radius-md;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 0 1px rgba(107, 68, 35, 0.1);
    transition: all $transition-normal;
    padding: 4px 16px;

    &:hover {
      box-shadow: 0 0 0 1px rgba(107, 68, 35, 0.2);
    }

    &.is-focus {
      box-shadow: 0 0 0 1.5px rgba(107, 68, 35, 0.25);
      background: rgba(255, 255, 255, 0.8);
    }

    .el-input__inner {
      font-size: 15px;
      color: $text-primary;
      font-weight: 300;
    }

    .el-input__prefix {
      color: $text-muted;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: $radius-md;
  background: $color-primary;
  color: white;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
  transition: all $transition-normal;
  letter-spacing: 2px;

  &:hover {
    background: $color-primary-light;
    box-shadow: $shadow-md;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.switch-form {
  margin-top: 16px;
  margin-bottom: 0 !important;
  justify-content: center;

  .switch-text {
    color: $text-muted;
    font-size: 14px;
    font-weight: 300;
  }

  .switch-link {
    font-size: 14px;
    font-weight: 400;
    color: $color-primary;
    margin-left: 6px;

    &:hover {
      color: $color-primary-light;
    }
  }
}

.popup-fade-leave-active,
.popup-fade-enter-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.96);
}

.popup-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-8px) scale(0.96);
}

.fade-slide-leave-active,
.fade-slide-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}
// 底部信息栏
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 48px;
  background: rgba(250, 248, 245, 0.9);
  backdrop-filter: blur(10px);
  z-index: 10;

  @media (max-width: 768px) {
    padding: 20px 24px;
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }

  .footer-text {
    font-size: 13px;
    color: $text-secondary;
    font-weight: 300;
    letter-spacing: 1px;
    margin: 0;
  }

  .footer-divider {
    width: 1px;
    height: 14px;
    background: rgba(107, 68, 35, 0.2);
  }

  .footer-copyright {
    font-size: 13px;
    color: $text-muted;
    font-weight: 300;
    margin: 0;
  }
}
</style>
