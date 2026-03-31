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
    <el-aside :width="isMobile ? '0px' : '200px'" :class="{ 'mobile-aside': isMobile, 'aside-open': mobileMenuVisible }">
      <div class="el-aside__logo"></div>
      <el-menu 
        text-color="#8B4513" 
        background-color="#FFF8DC" 
        router
        :collapse="isMobile"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/user/herb" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><Orange/></el-icon>
          <span>药材坊</span>
        </el-menu-item>

        <el-menu-item index="/user/prescription" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><HotWater/></el-icon>
          <span>方剂堂</span>
        </el-menu-item>

        <el-menu-item index="/user/pcm" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><Mug/></el-icon>
          <span>中成药</span>
        </el-menu-item>

        <el-menu-item index="/user/book" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><Reading/></el-icon>
          <span>藏经阁</span>
        </el-menu-item>

        <el-menu-item index="/user/forum" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><ChatLineRound/></el-icon>
          <span>老茶馆</span>
        </el-menu-item>

        <el-menu-item index="/user/diagnosis" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
          <el-icon><FirstAidKit/></el-icon>
          <span>智能问诊</span>
        </el-menu-item>

        <el-menu-item index="/admin/herb" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>中药材管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/pre" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>方剂管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/pcm" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>中成药管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/book" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>典籍管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/post" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>讨论区管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/userManage" v-if="userInfoStore.userInfo.role === 'ROLE_ADMIN'">
          <el-icon><Setting/></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-sub-menu index="">
          <template #title>
            <el-icon><UserFilled/></el-icon>
            <span>个人中心</span>
          </template>

          <el-menu-item index="/mine/info">
            <el-icon><User/></el-icon>
            <span>基本资料</span>
          </el-menu-item>

          <el-menu-item index="/mine/avatar">
            <el-icon><Crop/></el-icon>
            <span>更换头像</span>
          </el-menu-item>

          <el-menu-item index="/mine/resetPassword">
            <el-icon><EditPen/></el-icon>
            <span>重置密码</span>
          </el-menu-item>

          <el-menu-item index="/mine/collections" v-if="userInfoStore.userInfo.role === 'ROLE_USER'">
            <el-icon><Star/></el-icon>
            <span>收藏夹</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 移动端遮罩层 -->
    <div 
      v-if="isMobile && mobileMenuVisible" 
      class="mobile-overlay"
      @click="mobileMenuVisible = false"
    ></div>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <div style="color:#8B4513" class="header-user">
          用户：<strong>{{ userInfoStore.userInfo.nickname }}</strong>
        </div>
        <el-dropdown placement="bottom-end" @command="handleCommand">
          <span class="el-dropdown__box">
            <el-avatar :src="userInfoStore.userInfo.userPic?userInfoStore.userInfo.userPic:avatar"/>
            <el-icon><CaretBottom/></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="info" :icon="User">基本资料</el-dropdown-item>
              <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
              <el-dropdown-item command="resetPassword" :icon="EditPen">重置密码</el-dropdown-item>
              <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>
      
      <!-- 中间区域 -->
      <el-main>
        <router-view/>
      </el-main>
      
      <!-- 底部区域 -->
      <el-footer style="display: flex; align-items: center; justify-content: center;">百草居 ©2026 Created by ysuShenNong</el-footer>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import {
  CaretBottom,
  Crop,
  EditPen,
  Management,
  Promotion,
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
  FirstAidKit
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { userInfoService } from "@/api/user";
import { useUserInfoStore } from "@/stores/userInfo";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useTokenStore } from "@/stores/token";

const userInfoStore = useUserInfoStore();
const router = useRouter();
const tokenStore = useTokenStore();

const isMobile = ref(false);
const mobileMenuVisible = ref(false);

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
      '你确认要退出吗？',
      '温馨提示',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(
      async () => {
        userInfoStore.removeUserInfo();
        tokenStore.removeToken();
        ElMessage.success("退出成功");
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
  background-image: url('@/assets/background.jpg');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  .mobile-menu-btn {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1001;
    background-color: #8B4513;
    color: white;
    border: none;
    
    @media (min-width: 768px) {
      display: none;
    }
  }

  .el-aside {
    background-image: url('@/assets/background.jpg');
    background-repeat: no-repeat;
    transition: width 0.3s ease;

    &.mobile-aside {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 1000;
      width: 0px !important;
      overflow: hidden;

      &.aside-open {
        width: 200px !important;
      }
    }

    &__logo {
      height: 120px;
      background: url('@/assets/logo.png') no-repeat center / 320px auto;
    }

    .el-menu {
      border-right: none;
      
      .el-menu-item.is-active {
        border-left: #8B4513 solid 6px !important;
        background-color: #FFFFF0 !important;
        color: #8B4513 !important;
      }
      
      .el-menu-item:hover {
        background-color: #FFFFF0 !important;
        color: #8B4513 !important;
        
        i {
          color: #8B4513;
        }
      }
    }
  }

  .mobile-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .el-header {
    background-image: url('@/assets/background.jpg');
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    @media (max-width: 768px) {
      padding-left: 60px;
    }

    .header-user {
      @media (max-width: 768px) {
        font-size: 14px;
      }
    }

    .el-dropdown__box {
      display: flex;
      align-items: center;

      .el-icon {
        color: #999;
        margin-left: 10px;
      }

      &:active,
      &:focus {
        outline: none;
      }
    }
  }

  .el-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    width: 100%;
    font-size: 14px;
    color: #666;
    height: 40px;
    
    @media (max-width: 768px) {
      font-size: 12px;
    }
  }
}
</style>
