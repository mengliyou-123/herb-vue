<template>
  <el-container class="layout-container">
    <!-- 移动端菜单按钮 -->
    <el-button 
      class="mobile-menu-btn" 
      @click="mobileMenuVisible = !mobileMenuVisible"
      v-if="isMobile"
    >
      <el-icon><Menu /></el-icon>
    </el-button>

    <!-- 左侧菜单 -->
    <el-aside :width="isMobile ? '0px' : '260px'" :class="{ 'mobile-aside': isMobile, 'aside-open': mobileMenuVisible }">
      <!-- Logo区域 -->
      <div class="aside-header">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" alt="百草居" class="logo-img" />
          <div class="logo-text">
            <h1 class="logo-title">百草居</h1>
            <span class="logo-subtitle">中医智慧平台</span>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <el-menu 
        :default-active="$route.path"
        text-color="#6B5D4D" 
        active-text-color="#6B4423"
        background-color="transparent"
        router
        :collapse="isMobile"
        @select="handleMenuSelect"
        class="custom-menu"
      >
        <!-- 用户菜单组 -->
        <template v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <div class="menu-section-title">探索发现</div>
          
          <el-menu-item index="/user/herb" class="menu-item-custom">
            <el-icon><Orange/></el-icon>
            <span>药材坊</span>
          </el-menu-item>

          <el-menu-item index="/user/prescription" class="menu-item-custom">
            <el-icon><HotWater/></el-icon>
            <span>方剂堂</span>
          </el-menu-item>

          <el-menu-item index="/user/pcm" class="menu-item-custom">
            <el-icon><Mug/></el-icon>
            <span>中成药</span>
          </el-menu-item>

          <el-menu-item index="/user/book" class="menu-item-custom">
            <el-icon><Reading/></el-icon>
            <span>藏经阁</span>
          </el-menu-item>

          <div class="menu-divider"></div>
          <div class="menu-section-title">互动交流</div>

          <el-menu-item index="/user/forum" class="menu-item-custom">
            <el-icon><ChatLineRound/></el-icon>
            <span>老茶馆</span>
          </el-menu-item>

          <el-menu-item index="/user/diagnosis" class="menu-item-custom menu-item-highlight">
            <el-icon><FirstAidKit/></el-icon>
            <span>智能问诊</span>
          </el-menu-item>

          <el-menu-item index="/user/herb-recognition" class="menu-item-custom menu-item-highlight">
            <el-icon><Aim/></el-icon>
            <span>AI 识药</span>
          </el-menu-item>

          <el-menu-item index="/user/tongue-diagnosis" class="menu-item-custom menu-item-highlight">
            <el-icon><MagicStick/></el-icon>
            <span>AI 舌诊</span>
          </el-menu-item>

          <el-menu-item index="/user/knowledge-graph" class="menu-item-custom menu-item-highlight">
            <el-icon><Connection/></el-icon>
            <span>知识图谱</span>
          </el-menu-item>
        </template>

        <!-- 管理员菜单组 -->
        <template v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <div class="menu-section-title">内容管理</div>
          
          <el-menu-item index="/admin/herb" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>中药材管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/pre" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>方剂管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/pcm" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>中成药管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/book" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>典籍管理</span>
          </el-menu-item>

          <div class="menu-divider"></div>
          <div class="menu-section-title">系统管理</div>

          <el-menu-item index="/admin/post" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>讨论区管理</span>
          </el-menu-item>

          <el-menu-item index="/admin/userManage" class="menu-item-custom">
            <el-icon><Setting/></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </template>

        <div class="menu-divider"></div>
        
        <!-- 个人中心 -->
        <el-sub-menu index="personal" class="submenu-custom">
          <template #title>
            <el-icon><UserFilled/></el-icon>
            <span>个人中心</span>
          </template>

          <el-menu-item index="/mine/info" class="submenu-item">
            <el-icon><User/></el-icon>
            <span>基本资料</span>
          </el-menu-item>

          <el-menu-item index="/mine/collections" v-if="userInfoStore.userInfo.role === 'ROLE_USER'" class="submenu-item">
            <el-icon><Star/></el-icon>
            <span>收藏夹</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <!-- 底部装饰 -->
      <div class="aside-footer">
        <div class="footer-decoration">
          <svg viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 30C50 10 100 50 150 25C175 12.5 200 20 200 30V60H0V30Z" fill="url(#gradient)" opacity="0.1"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                <stop offset="0%" stop-color="#6B4423"/>
                <stop offset="100%" stop-color="#A67C52"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </el-aside>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && mobileMenuVisible" 
      class="mobile-overlay"
      @click="mobileMenuVisible = false"
    ></div>

    <!-- 右侧主区域 -->
    <el-container class="main-container">
      <!-- 头部区域 -->
      <el-header class="main-header">
        <div class="header-left">
          <div class="breadcrumb-area">
            <h2 class="page-title">{{ pageTitle }}</h2>
          </div>
        </div>
        
        <div class="header-right">
          <div class="user-info">
            <span class="welcome-text">欢迎，</span>
            <strong class="username">{{ userInfoStore.userInfo.nickname }}</strong>
          </div>
          
          <el-dropdown placement="bottom-end" @command="handleCommand" trigger="click">
            <div class="user-dropdown">
              <el-avatar 
                :src="userInfoStore.userInfo.userPic || avatar" 
                :size="36"
                class="user-avatar"
              />
              <el-icon class="dropdown-arrow"><CaretBottom/></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="custom-dropdown">
                <el-dropdown-item command="info" :icon="User">
                  <span>基本资料</span>
                </el-dropdown-item>
                <el-dropdown-item command="logout" :icon="SwitchButton" divided>
                  <span class="logout-text">退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 中间内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      
      <!-- 底部区域 -->
      <el-footer class="main-footer">
        <div class="footer-content">
          <span class="footer-brand">🌿 百草居</span>
          <span class="footer-separator">·</span>
          <span class="footer-copyright">©2026 Created by ysuShenNong</span>
        </div>
      </el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  CaretBottom,
  SwitchButton,
  User,
  UserFilled,
  HotWater,
  Orange,
  Mug,
  Reading,
  ChatLineRound,
  Setting,
  Star,
  Menu,
  FirstAidKit,
  Aim,
  MagicStick,
  Connection
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { userInfoService } from "@/api/user";
import { useUserInfoStore } from "@/stores/userInfo";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTokenStore } from "@/stores/token";

const route = useRoute();
const userInfoStore = useUserInfoStore();
const router = useRouter();
const tokenStore = useTokenStore();

const isMobile = ref(false);
const mobileMenuVisible = ref(false);

// 根据路由动态显示页面标题
const pageTitle = computed(() => {
  const path = route.path;
  const titleMap = {
    '/user/herb': '药材坊',
    '/user/prescription': '方剂堂',
    '/user/pcm': '中成药',
    '/user/book': '藏经阁',
    '/user/forum': '老茶馆',
    '/user/diagnosis': '智能问诊',
    '/user/herb-recognition': 'AI 中草药识别',
    '/user/tongue-diagnosis': 'AI 舌诊体质自测',
    '/user/knowledge-graph': '知识图谱',
    '/admin/herb': '中药材管理',
    '/admin/pre': '方剂管理',
    '/admin/pcm': '中成药管理',
    '/admin/book': '典籍管理',
    '/admin/post': '讨论区管理',
    '/admin/userManage': '用户管理',
    '/mine/info': '个人中心',
    '/mine/collections': '收藏夹',
  };
  return titleMap[path] || '百草居';
});

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    mobileMenuVisible.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  getUserInfo();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

const getUserInfo = async () => {
  let result = await userInfoService();
  userInfoStore.setUserInfo(result.data);
};

const handleMenuSelect = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = false;
  }
};

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确认退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(
      async () => {
        userInfoStore.removeUserInfo();
        tokenStore.removeToken();
        ElMessage.success("已退出登录");
        await router.push('/login');
      }
    )
  } else {
    router.push('/mine/' + command);
  }
};
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  background: $bg-base;
  overflow: hidden;

  // 移动端菜单按钮
  .mobile-menu-btn {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    background: $color-primary-gradient;
    color: white;
    border: none;
    border-radius: $radius-md;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: $shadow-md;

    @media (min-width: 768px) {
      display: none;
    }
  }

  // 侧边栏
  .el-aside {
    background: $bg-surface;
    border-right: 1px solid $border-light;
    display: flex;
    flex-direction: column;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;

    &.mobile-aside {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 1000;
      width: 0px !important;
      overflow: hidden;
      box-shadow: none;

      &.aside-open {
        width: 260px !important;
        box-shadow: $shadow-xl;
      }
    }

    // Logo区域
    .aside-header {
      padding: 24px 24px 20px;
      border-bottom: 1px solid $border-light;
      background: linear-gradient(180deg, rgba(107, 68, 35, 0.02) 0%, transparent 100%);
    }

    .logo-wrapper {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .logo-img {
      width: 42px;
      height: 42px;
      object-fit: contain;
      filter: drop-shadow(0 2px 4px rgba(107, 68, 35, 0.15));
    }

    .logo-text {
      .logo-title {
        font-size: 22px;
        font-weight: 700;
        color: $color-primary;
        margin: 0;
        letter-spacing: 2px;
        line-height: 1.2;
      }

      .logo-subtitle {
        font-size: 11px;
        color: $text-muted;
        letter-spacing: 1px;
      }
    }

    // 自定义菜单样式
    .custom-menu {
      flex: 1;
      overflow-y: auto;
      padding: 8px 12px;
      border-right: none !important;

      // 滚动条
      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(107, 68, 35, 0.15);
        border-radius: $radius-full;
      }
    }

    .menu-section-title {
      padding: 16px 16px 8px;
      font-size: 11px;
      font-weight: 600;
      color: $text-light;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .menu-divider {
      height: 1px;
      background: $border-light;
      margin: 8px 16px;
    }

    .menu-item-custom {
      margin: 4px 0;
      border-radius: $radius-md;
      height: 46px;
      line-height: 46px;

      &:hover {
        background-color: rgba(107, 68, 35, 0.06) !important;
        color: $color-primary !important;
      }

      &.is-active {
        background: linear-gradient(135deg, rgba(107, 68, 35, 0.1) 0%, rgba(166, 124, 82, 0.08) 100%) !important;
        color: $color-primary !important;
        font-weight: 600;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: $color-primary-gradient;
          border-radius: 0 $radius-sm $radius-sm 0;
        }
      }

      .el-icon {
        font-size: 18px;
        margin-right: 10px;
      }
    }

    .menu-item-highlight {
      position: relative;

    }

    // 子菜单
    .submenu-custom {
      :deep(.el-sub-menu__title) {
        border-radius: $radius-md;
        height: 46px;
        line-height: 46px;
        margin: 4px 0;

        &:hover {
          background-color: rgba(107, 68, 35, 0.06) !important;
          color: $color-primary !important;
        }
      }

      .submenu-item {
        padding-left: 52px !important;
        min-width: auto;
        height: 40px;
        line-height: 40px;
        margin: 2px 0;

        &:hover {
          background-color: rgba(107, 68, 35, 0.04) !important;
          color: $color-primary-light !important;
        }

        &.is-active {
          color: $color-primary !important;
          background-color: rgba(107, 68, 35, 0.06) !important;
        }
      }
    }

    // 底部装饰
    .aside-footer {
      padding: 0;
      margin-top: auto;

      .footer-decoration {
        svg {
          width: 100%;
          height: auto;
          display: block;
        }
      }
    }
  }

  // 移动端遮罩
  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(44, 36, 22, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
  }

  // 主容器
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  // 头部
  .main-header {
    height: 64px !important;
    background: $bg-surface;
    border-bottom: 1px solid $border-light;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    box-shadow: $shadow-sm;
    position: relative;
    z-index: 10;

    @media (max-width: 768px) {
      padding: 0 16px 0 64px;
      height: 56px !important;
    }

    .header-left {
      .page-title {
        font-size: 20px;
        font-weight: 700;
        color: $text-primary;
        margin: 0;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .user-info {
        display: flex;
        align-items: baseline;
        gap: 4px;

        @media (max-width: 768px) {
          display: none;
        }

        .welcome-text {
          font-size: 13px;
          color: $text-muted;
        }

        .username {
          font-size: 14px;
          color: $text-primary;
        }
      }

      .user-dropdown {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        padding: 4px;
        border-radius: $radius-full;
        transition: background $transition-fast;

        &:hover {
          background: rgba(107, 68, 35, 0.06);
        }

        .user-avatar {
          border: 2px solid rgba(107, 68, 35, 0.15);
          transition: border-color $transition-fast;

          &:hover {
            border-color: $color-primary-light;
          }
        }

        .dropdown-arrow {
          color: $text-muted;
          font-size: 12px;
          transition: transform $transition-fast;
        }

        &:hover .dropdown-arrow {
          transform: translateY(2px);
        }
      }
    }
  }

  // 主内容区
  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: $bg-base;

    @media (max-width: 768px) {
      padding: 16px;
    }

    // 内容滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(107, 68, 35, 0.2);
      border-radius: $radius-full;

      &:hover {
        background: rgba(107, 68, 35, 0.35);
      }
    }
  }

  // 底部
  .main-footer {
    height: 48px !important;
    background: $bg-surface;
    border-top: 1px solid $border-light;
    display: flex;
    align-items: center;
    justify-content: center;

    .footer-content {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: $text-muted;

      .footer-brand {
        font-weight: 600;
        color: $color-primary;
      }

      .footer-separator {
        opacity: 0.5;
      }
    }
  }
}

// 下拉菜单自定义样式
:deep(.custom-dropdown) {
  border-radius: $radius-md;
  box-shadow: $shadow-lg;
  border: 1px solid $border-light;
  padding: 6px;
  min-width: 180px;

  .el-dropdown-item {
    border-radius: $radius-sm;
    padding: 10px 16px;
    margin: 2px 0;
    transition: all $transition-fast;

    &:hover {
      background: rgba(107, 68, 35, 0.06);
      color: $color-primary;
    }

    .logout-text {
      color: $color-accent;
      font-weight: 500;
    }
  }
}
</style>
