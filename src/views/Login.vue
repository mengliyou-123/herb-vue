<script setup>
import { Lock, User, Message } from "@element-plus/icons-vue";
import { ref } from "vue";
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
</script>

<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 主内容区 -->
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10C50 10 30 25 30 45C30 60 40 70 50 80C60 70 70 60 70 45C70 25 50 10 50 10Z" fill="rgba(255,255,255,0.2)" stroke="white" stroke-width="2"/>
              <path d="M50 35C50 35 42 42 42 52C42 58 46 63 50 68C54 63 58 58 58 52C58 42 50 35 50 35Z" fill="rgba(255,255,255,0.4)"/>
              <circle cx="50" cy="48" r="6" fill="white"/>
            </svg>
          </div>
          <h1 class="brand-title">百草居</h1>
          <p class="brand-subtitle">传承千年智慧 · 守护健康本源</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">🌿</span>
              <span>中药材百科</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📚</span>
              <span>经典方剂库</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>智能问诊</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 -->
      <div class="form-section">
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
              <span>注册</span>
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </el-form-item>

          <el-form-item class="switch-form">
            <span class="switch-text">已有账号？</span>
            <el-link type="primary" :underline="false" @click="isRegister = false; clearRegisterData();" class="switch-link">
              立即登录 →
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
              <span>登录</span>
              <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </el-form-item>

          <el-form-item class="switch-form">
            <span class="switch-text">还没有账号？</span>
            <el-link type="primary" :underline="false" @click="isRegister = true; clearRegisterData();" class="switch-link">
              注册账号 →
            </el-link>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2C1810 0%, #4A2F1D 50%, #6B4423 100%);
  position: relative;
  overflow: hidden;

  // 背景装饰圆圈
  .bg-decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
    }

    .circle-1 {
      width: 600px;
      height: 600px;
      top: -200px;
      right: -150px;
      animation: float 20s ease-in-out infinite;
    }

    .circle-2 {
      width: 400px;
      height: 400px;
      bottom: -100px;
      left: -100px;
      animation: float 15s ease-in-out infinite reverse;
    }

    .circle-3 {
      width: 300px;
      height: 300px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: float 18s ease-in-out infinite;
      background: rgba(166, 124, 82, 0.08);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-30px) scale(1.05);
    }
  }
}

.login-container {
  display: flex;
  width: 900px;
  min-height: 580px;
  background: $bg-surface;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
  overflow: hidden;
  position: relative;
  z-index: 1;
  animation: fadeInScale 0.6s ease-out;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 92%;
    min-height: auto;
  }
}

// 品牌展示区
.brand-section {
  flex: 0 0 380px;
  background: $color-primary-gradient;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  }

  @media (max-width: 768px) {
    flex: none;
    padding: 32px 24px;
    text-align: center;
  }

  .brand-content {
    position: relative;
    z-index: 1;
  }

  .logo-icon {
    width: 72px;
    height: 72px;
    margin-bottom: 24px;

    svg {
      width: 100%;
      height: 100%;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    }

    @media (max-width: 768px) {
      margin: 0 auto 20px;
    }
  }

  .brand-title {
    font-size: 36px;
    font-weight: 700;
    color: white;
    margin: 0 0 12px 0;
    letter-spacing: 4px;
  }

  .brand-subtitle {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 36px 0;
    line-height: 1.6;
  }

  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 16px;

    @media (max-width: 768px) {
      align-items: center;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;

      .feature-icon {
        font-size: 20px;
        opacity: 0.9;
      }
    }
  }
}

// 表单区域
.form-section {
  flex: 1;
  padding: 48px 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-surface;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
}

.auth-form {
  width: 100%;

  .form-header {
    margin-bottom: 36px;
    text-align: center;

    .form-title {
      font-size: 28px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 8px 0;
    }

    .form-desc {
      font-size: 14px;
      color: $text-muted;
      margin: 0;
    }
  }
}

// 自定义输入框样式
:deep(.custom-input) {
  .el-input__wrapper {
    border-radius: $radius-md;
    box-shadow: 0 0 0 1px $border-default;
    transition: all $transition-normal;
    padding: 4px 16px;

    &:hover {
      box-shadow: 0 0 0 1px $color-primary-light;
    }

    &.is-focus {
      box-shadow: 0 0 0 2px rgba(107, 68, 35, 0.2), $shadow-sm;
    }

    .el-input__inner {
      font-size: 15px;
    }

    .el-input__prefix {
      color: $text-muted;
    }
  }
}

// 提交按钮
.submit-btn {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: $radius-md;
  background: $color-primary-gradient;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all $transition-normal;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  .btn-arrow {
    width: 18px;
    height: 18px;
    transition: transform $transition-fast;
  }

  &:hover .btn-arrow {
    transform: translateX(4px);
  }
}

// 切换表单链接
.switch-form {
  margin-top: 8px;
  margin-bottom: 0 !important;

  .switch-text {
    color: $text-muted;
    font-size: 14px;
  }

  .switch-link {
    font-size: 14px;
    font-weight: 500;
    color: $color-primary;
    margin-left: 4px;

    &:hover {
      color: $color-primary-light;
    }
  }
}
</style>
