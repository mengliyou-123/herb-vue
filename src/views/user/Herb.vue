<script setup>
import { Delete, Edit, Plus, Search } from "@element-plus/icons-vue";

import { ref } from "vue";
import { herbListService, herbDetailService } from "@/api/herb.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import {useUserInfoStore} from "@/stores/userInfo";
import { useRouter } from "vue-router";

const userInfoStore = useUserInfoStore();

const family = ref("");
const category = ref("");
const property = ref("");
const flavor = ref("");
const meridianTropism = ref("");
const cnName = ref("");

const herbs = ref([]);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(10);

const onSizeChange = (size) => {
  pageSize.value = size;
  herbList();
};

const onCurrentChange = (num) => {
  pageNum.value = num;
  herbList();
};

const herbList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    family: family.value ? family.value : null,
    category: category.value ? category.value : null,
    property: property.value ? property.value : null,
    flavor: flavor.value ? flavor.value : null,
    meridianTropism: meridianTropism.value ? meridianTropism.value : null,
    cnName: cnName.value ? cnName.value : null,
  };
  const result = await herbListService(params);
  herbs.value = result.data.items;
  total.value = result.data.total;
};
herbList();

const herbModel = ref({
  cnName: "",
  latinName: "",
  en_name: "",
  family: "",
  habitat: "",
  part: "",
  catrgory: "",
  property: "",
  flavor: "",
  meridianTropism: "",
  efficacy: "",
  trait: "",
  indications: "",
  herbPic: "",
});

const tokenStore = useTokenStore();

const router = useRouter();

const herbDetail = async (id) => {
  router.push({ path: "/user/herbDetail", query: { id: id } });
};

const story = async (index) => {
  await router.push({ path: "/user/herbStories", query: { index: index } });
}
</script>

<template>
  <div class="herb-page">
    <!-- 页面头部 - 自然有机风格 -->
    <div class="nature-hero">
      <!-- 背景装饰层 -->
      <div class="bg-layer">
        <div class="leaf-decoration leaf-1">🍃</div>
        <div class="leaf-decoration leaf-2">🌿</div>
        <div class="leaf-decoration leaf-3">🍀</div>
        <div class="floating-particles">
          <span class="particle p1"></span>
          <span class="particle p2"></span>
          <span class="particle p3"></span>
          <span class="particle p4"></span>
          <span class="particle p5"></span>
        </div>
        <svg class="wave-svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 L1200,120 L0,120 Z" fill="rgba(74, 124, 89, 0.03)"/>
        </svg>
      </div>

      <!-- 主内容区 -->
      <div class="hero-container">
        <!-- 左侧植物图标 -->
        <div class="plant-icon-section">
          <div class="icon-glow"></div>
          <div class="main-plant-wrapper">
            <span class="plant-main">🌿</span>
            <div class="plant-ring ring-1"></div>
            <div class="plant-ring ring-2"></div>
            <div class="growing-leaves">
              <span class="small-leaf leaf-l">🌱</span>
              <span class="small-leaf leaf-r">🌱</span>
            </div>
          </div>
        </div>

        <!-- 中间标题信息 -->
        <div class="title-info-section">
          <div class="badge-row">
            <span class="nature-badge">NATURAL</span>
            <span class="divider-dot">●</span>
            <span class="subtitle-tag">中医药材库</span>
          </div>

          <h1 class="main-title">
            <span class="title-char" v-for="(char, index) in '药材坊'.split('')" :key="index" :style="{ animationDelay: `${index * 0.15}s` }">{{ char }}</span>
          </h1>

          <p class="description-text">
            <span class="desc-line">探索千年中医药材智慧</span>
            <br/>
            <span class="desc-line light">了解每一味草药的奥秘</span>
          </p>

          <div class="quick-stats">
            <div class="stat-box">
              <span class="stat-icon">🌾</span>
              <div class="stat-content">
                <span class="stat-num">{{ total }}</span>
                <span class="stat-txt">种药材</span>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-icon">🔬</span>
              <div class="stat-content">
                <span class="stat-num">5</span>
                <span class="stat-txt">药性</span>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-icon">⚕️</span>
              <div class="stat-content">
                <span class="stat-num">12</span>
                <span class="stat-txt">归经</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧装饰 -->
        <div class="decoration-section">
          <div class="organic-shape shape-1"></div>
          <div class="organic-shape shape-2"></div>
          <div class="zen-circle">
            <span class="zen-text">道法<br/>自然</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <div class="search-bar">
        <el-input 
          v-model="cnName" 
          placeholder="搜索中药材名称..." 
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <button class="search-btn" @click="herbList()">
          搜索
        </button>
      </div>

      <!-- 筛选标签 -->
      <div class="filter-tags">
        <div class="filter-group">
          <span class="filter-label">药味：</span>
          <div class="tag-list">
            <span 
              class="tag-item" 
              :class="{ active: flavor === '' }" 
              @click="flavor = ''; herbList()"
            >全部</span>
            <span 
              v-for="item in ['苦', '甘', '涩', '辛', '酸', '咸', '淡']" 
              :key="item"
              class="tag-item" 
              :class="{ active: flavor === item }" 
              @click="flavor = item; herbList()"
            >{{ item }}</span>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">药性：</span>
          <div class="tag-list">
            <span 
              class="tag-item" 
              :class="{ active: property === '' }" 
              @click="property = ''; herbList()"
            >全部</span>
            <span 
              v-for="item in ['热', '温', '寒', '凉', '平']" 
              :key="item"
              class="tag-item" 
              :class="{ active: property === item }" 
              @click="property = item; herbList()"
            >{{ item }}</span>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">归经：</span>
          <div class="tag-list tag-scrollable">
            <span 
              class="tag-item" 
              :class="{ active: meridianTropism === '' }" 
              @click="meridianTropism = ''; herbList()"
            >全部</span>
            <span 
              v-for="item in ['心', '胃', '脾', '肾', '肺', '肝', '胆', '膀胱', '大肠', '小肠', '三焦', '心包']" 
              :key="item"
              class="tag-item" 
              :class="{ active: meridianTropism === item }" 
              @click="meridianTropism = item; herbList()"
            >{{ item }}经</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content-area">
      <!-- 中药列表 -->
      <div class="herb-list-section">
        <div v-if="herbs.length > 0" class="herb-grid">
          <div 
            v-for="h in herbs" 
            :key="h.id" 
            class="herb-card hover-lift"
            @click="herbDetail(h.id)"
          >
            <div class="card-image">
              <img :src="h.herbPic || '/default.png'" :alt="h.cnName" />
              <div class="image-overlay"></div>
            </div>
            
            <div class="card-body">
              <h3 class="herb-name">{{ h.cnName }}</h3>
              
              <div class="herb-meta">
                <span v-if="h.property" class="meta-tag">{{ h.property }}</span>
                <span v-if="h.flavor" class="meta-tag">{{ h.flavor }}</span>
                <span v-if="h.meridianTropism" class="meta-tag light">{{ h.meridianTropism }}经</span>
              </div>

              <p class="herb-desc">
                {{ (h.trait || '') + ' ' + (h.efficacy || '') }}
              </p>
            </div>

            <div class="card-footer">
              <span class="view-detail">查看详情 →</span>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">🌱</div>
          <p class="empty-text">暂无符合条件的药材</p>
          <p class="empty-hint">试试调整筛选条件吧</p>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[8, 12, 16, 24]"
            layout="total, sizes, prev, pager, next"
            background
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
            class="custom-pagination"
          />
        </div>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar-section">
        <!-- 中药传说 -->
        <div class="stories-panel">
          <div class="panel-header">
            <span class="panel-icon">📖</span>
            <h3 class="panel-title">中药传说</h3>
          </div>
          
          <div class="panel-content">
            <div 
              v-for="(story, index) in [
                { title: '人参的传说', id: 1 },
                { title: '地龙的传说', id: 2 },
                { title: '马齿苋的传说', id: 3 },
                { title: '梅花的传说', id: 4 },
                { title: '麦冬的传说', id: 5 },
                { title: '芍药的传说', id: 6 },
                { title: '茵陈的传说', id: 7 },
                { title: '杏仁的传说', id: 8 }
              ]" 
              :key="story.id"
              class="story-item"
              @click="story(story.id)"
            >
              <span class="story-number">{{ String(story.id).padStart(2, '0') }}</span>
              <span class="story-title">{{ story.title }}</span>
            </div>
          </div>
        </div>

        <!-- 快速统计 -->
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-value text-gradient">{{ total }}</div>
            <div class="stat-label">收录药材</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">12</div>
            <div class="stat-label">药性分类</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value">7</div>
            <div class="stat-label">归经系统</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.herb-page {
  min-height: 100%;
  background: linear-gradient(180deg, #f9fbf7 0%, #f5f8f3 40%, $bg-base 100%);
}

// 自然有机风格头部
.nature-hero {
  position: relative;
  padding: 56px 40px 64px;
  overflow: hidden;
  background: transparent;
}

.bg-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;

  .leaf-decoration {
    position: absolute;
    font-size: 40px;
    opacity: 0.15;
    filter: blur(0.5px);

    &.leaf-1 {
      top: 20px;
      right: 10%;
      animation: leafFloat1 8s ease-in-out infinite;
    }

    &.leaf-2 {
      bottom: 30%;
      left: 5%;
      font-size: 32px;
      animation: leafFloat2 10s ease-in-out infinite;
    }

    &.leaf-3 {
      top: 50%;
      right: 25%;
      font-size: 28px;
      animation: leafFloat3 12s ease-in-out infinite;
    }
  }

  @keyframes leafFloat1 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(-20px, -15px) rotate(10deg); }
    66% { transform: translate(15px, 10px) rotate(-5deg); }
  }

  @keyframes leafFloat2 {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(25px, -20px) rotate(15deg); }
  }

  @keyframes leafFloat3 {
    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.12; }
    50% { transform: translate(-15px, 15px) scale(1.1); opacity: 0.18; }
  }

  .floating-particles {
    .particle {
      position: absolute;
      width: 6px;
      height: 6px;
      background: rgba(74, 124, 89, 0.3);
      border-radius: 50%;
      animation: particleFloat 6s ease-in-out infinite;

      &.p1 { top: 15%; left: 15%; animation-delay: 0s; }
      &.p2 { top: 25%; right: 20%; animation-delay: 1.2s; width: 4px; height: 4px; }
      &.p3 { bottom: 30%; left: 25%; animation-delay: 2.4s; width: 8px; height: 8px; }
      &.p4 { top: 60%; right: 15%; animation-delay: 3.6s; width: 5px; height: 5px; }
      &.p5 { bottom: 20%; right: 35%; animation-delay: 4.8s; }
    }
  }

  @keyframes particleFloat {
    0%, 100% {
      transform: translateY(0) translateX(0);
      opacity: 0.3;
    }
    50% {
      transform: translateY(-30px) translateX(15px);
      opacity: 0.7;
    }
  }

  .wave-svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;
    animation: waveMove 15s ease-in-out infinite;
  }

  @keyframes waveMove {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-20px); }
  }
}

.hero-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 40px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

// 左侧植物图标区
.plant-icon-section {
  position: relative;

  .icon-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 160px;
    height: 160px;
    background: radial-gradient(circle, rgba(74, 124, 89, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    animation: glowPulse 4s ease-in-out infinite;
  }

  @keyframes glowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
    50% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
  }

  .main-plant-wrapper {
    position: relative;
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;

    .plant-main {
      font-size: 72px;
      position: relative;
      z-index: 3;
      animation: plantSway 5s ease-in-out infinite;
      filter: drop-shadow(0 4px 16px rgba(74, 124, 89, 0.3));
    }

    @keyframes plantSway {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(3deg) translateY(-3px); }
      75% { transform: rotate(-2deg) translateY(-2px); }
    }

    .plant-ring {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(74, 124, 89, 0.15);

      &.ring-1 {
        width: 110px;
        height: 110px;
        animation: ringExpand 6s ease-in-out infinite;
      }

      &.ring-2 {
        width: 130px;
        height: 130px;
        animation: ringExpand 6s ease-in-out infinite reverse;
        border-style: dashed;
        opacity: 0.6;
      }
    }

    @keyframes ringExpand {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.6; }
    }

    .growing-leaves {
      position: absolute;
      width: 100%;
      height: 100%;

      .small-leaf {
        position: absolute;
        font-size: 20px;
        opacity: 0;

        &.leaf-l {
          top: 10px;
          left: -5px;
          animation: leafGrowL 4s ease-in-out infinite;
        }

        &.leaf-r {
          top: 10px;
          right: -5px;
          animation: leafGrowR 4s ease-in-out infinite 0.5s;
        }
      }
    }

    @keyframes leafGrowL {
      0%, 100% { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
      50% { transform: translate(-8px, -5px) rotate(-15deg) scale(1); opacity: 0.7; }
    }

    @keyframes leafGrowR {
      0%, 100% { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
      50% { transform: translate(8px, -5px) rotate(15deg) scale(1); opacity: 0.7; }
    }
  }
}

// 中间标题信息区
.title-info-section {
  .badge-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .nature-badge {
      display: inline-block;
      padding: 5px 14px;
      background: linear-gradient(135deg, #4A7C59, #6B8E6B);
      color: white;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 2px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(74, 124, 89, 0.25);
    }

    .divider-dot {
      color: rgba(74, 124, 89, 0.3);
      font-size: 6px;
    }

    .subtitle-tag {
      font-size: 13px;
      color: #6B8E6B;
      font-weight: 500;
      letter-spacing: 1px;
    }
  }

  .main-title {
    margin: 0 0 16px;
    display: flex;
    gap: 8px;

    .title-char {
      font-size: 42px;
      font-weight: 800;
      color: #2D5016;
      display: inline-block;
      animation: charReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #4A7C59, #8FBC8F);
        border-radius: 2px;
        transform: scaleX(0);
        animation: underlineGrow 0.6s ease forwards;
        animation-delay: calc(var(--char-index, 0) * 0.15s + 0.3s);
      }
    }
  }

  @keyframes charReveal {
    from {
      opacity: 0;
      transform: translateY(20px) rotate(-5deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotate(0);
    }
  }

  @keyframes underlineGrow {
    to { transform: scaleX(1); }
  }

  .description-text {
    margin: 0 0 24px;
    line-height: 1.8;

    .desc-line {
      font-size: 15px;
      color: #4A5568;
      font-weight: 400;

      &.light {
        font-size: 14px;
        color: #718096;
      }
    }
  }

  .quick-stats {
    display: flex;
    gap: 20px;
    padding: 18px 24px;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid rgba(74, 124, 89, 0.12);
    box-shadow: 0 4px 20px rgba(74, 124, 89, 0.06);
    width: fit-content;

    .stat-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 16px;
      position: relative;

      &:not(:last-child)::after {
        content: '';
        position: absolute;
        right: 0;
        top: 20%;
        height: 60%;
        width: 1px;
        background: linear-gradient(180deg, transparent, rgba(74, 124, 89, 0.2), transparent);
      }

      .stat-icon {
        font-size: 24px;
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-num {
          font-size: 22px;
          font-weight: 700;
          color: #4A7C59;
          line-height: 1;
        }

        .stat-txt {
          font-size: 11px;
          color: #718096;
          font-weight: 500;
        }
      }
    }
  }
}

// 右侧装饰区
.decoration-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  .organic-shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;

    &.shape-1 {
      width: 120px;
      height: 120px;
      background: #4A7C59;
      top: -20px;
      right: -20px;
      animation: organicFloat 12s ease-in-out infinite;
    }

    &.shape-2 {
      width: 80px;
      height: 80px;
      background: #8FBC8F;
      bottom: 20px;
      right: 30px;
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      animation: organicMorph 15s ease-in-out infinite;
    }
  }

  @keyframes organicFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(15px, -20px) rotate(45deg); }
  }

  @keyframes organicMorph {
    0%, 100% {
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      transform: rotate(0deg);
    }
    50% {
      border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
      transform: rotate(180deg);
    }
  }

  .zen-circle {
    width: 90px;
    height: 90px;
    border: 3px solid rgba(74, 124, 89, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    animation: zenRotate 20s linear infinite;

    &::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 2px solid rgba(74, 124, 89, 0.12);
      border-radius: 50%;
    }

    .zen-text {
      font-size: 13px;
      font-weight: 700;
      color: #4A7C59;
      text-align: center;
      line-height: 1.4;
      letter-spacing: 2px;
      writing-mode: vertical-rl;
      text-orientation: upright;
    }
  }

  @keyframes zenRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

// 筛选区域
.filter-section {
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;

  .search-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;

    .search-input {
      flex: 1;

      :deep(.el-input__wrapper) {
        border-radius: $radius-md;
        box-shadow: 0 0 0 1px $border-default;
        
        &:hover, &.is-focus {
          box-shadow: 0 0 0 2px rgba(107, 68, 35, 0.2), $shadow-sm;
        }

        .el-input__inner {
          height: 44px;
        }
      }
    }

    .search-btn {
      padding: 0 28px;
      height: 44px;
      background: $color-primary-gradient;
      color: white;
      border: none;
      border-radius: $radius-md;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all $transition-normal;
      white-space: nowrap;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }
    }
  }

  .filter-tags {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .filter-group {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .filter-label {
      font-size: 13px;
      font-weight: 600;
      color: $text-secondary;
      min-width: 48px;
      line-height: 30px;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      flex: 1;

      &.tag-scrollable {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 4px;

        &::-webkit-scrollbar {
          height: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(107, 68, 35, 0.2);
          border-radius: $radius-full;
        }
      }
    }

    .tag-item {
      display: inline-flex;
      align-items: center;
      padding: 6px 14px;
      font-size: 13px;
      color: $text-secondary;
      background: $bg-base;
      border-radius: $radius-full;
      cursor: pointer;
      transition: all $transition-fast;
      border: 1px solid transparent;
      white-space: nowrap;

      &:hover {
        color: $color-primary;
        background: rgba(107, 68, 35, 0.06);
        border-color: $border-light;
      }

      &.active {
        background: linear-gradient(135deg, rgba(107, 68, 35, 0.1) 0%, rgba(166, 124, 82, 0.08) 100%);
        color: $color-primary;
        font-weight: 600;
        border-color: rgba(107, 68, 35, 0.2);
      }
    }
  }
}

// 主内容区
.main-content-area {
  display: flex;
  gap: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

// 药材列表
.herb-list-section {
  flex: 1;
  min-width: 0;
}

.herb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.herb-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-normal;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: rgba(107, 68, 35, 0.25);

    .card-image img {
      transform: scale(1.08);
    }

    .image-overlay {
      opacity: 1;
    }

    .view-detail {
      color: $color-primary;
      transform: translateX(4px);
    }
  }

  .card-image {
    width: 100%;
    height: 180px;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(44, 36, 22, 0.15));
      opacity: 0;
      transition: opacity $transition-normal;
    }
  }

  .card-body {
    padding: 18px 20px 14px;
    flex: 1;

    .herb-name {
      font-size: 18px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 10px 0;
    }

    .herb-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 10px;

      .meta-tag {
        display: inline-block;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        color: $color-primary;
        background: rgba(107, 68, 35, 0.08);
        border-radius: $radius-full;
        letter-spacing: 0.5px;

        &.light {
          color: $color-success;
          background: $color-success-bg;
        }
      }
    }

    .herb-desc {
      font-size: 13px;
      color: $text-muted;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    padding: 12px 20px 16px;
    border-top: 1px solid $border-light;

    .view-detail {
      font-size: 13px;
      font-weight: 500;
      color: $text-muted;
      transition: all $transition-fast;
      display: inline-block;
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: $text-secondary;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 13px;
    color: $text-muted;
    margin: 0;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;

  :deep(.custom-pagination) {
    .el-pagination__sizes {
      .el-select {
        .el-input__wrapper {
          border-radius: $radius-md;
        }
      }
    }

    .btn-prev,
    .btn-next,
    .el-pager li {
      border-radius: $radius-sm;
      margin: 0 2px;
      
      &.is-active {
        background: $color-primary-gradient !important;
      }
    }
  }
}

// 右侧边栏
.sidebar-section {
  width: 320px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
}

.stories-panel {
  background: $bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  margin-bottom: 20px;

  .panel-header {
    background: $color-primary-gradient;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 10px;

    .panel-icon {
      font-size: 20px;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin: 0;
    }
  }

  .panel-content {
    padding: 12px;
  }

  .story-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: rgba(107, 68, 35, 0.04);

      .story-title {
        color: $color-primary;
      }
    }

    .story-number {
      font-size: 13px;
      font-weight: 700;
      color: $color-primary-lighter;
      min-width: 24px;
    }

    .story-title {
      font-size: 14px;
      color: $text-secondary;
      transition: color $transition-fast;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// 统计卡片
.stats-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  align-items: center;
  justify-content: space-around;

  .stat-item {
    text-align: center;
    flex: 1;

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: $color-primary;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: $text-muted;
    }
  }

  .stat-divider {
    width: 1px;
    height: 40px;
    background: $border-light;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .nature-hero {
    padding: 44px 32px 52px;
  }

  .hero-container {
    gap: 32px;
  }

  .plant-icon-section .main-plant-wrapper {
    width: 120px;
    height: 120px;

    .plant-main {
      font-size: 60px;
    }

    .plant-ring.ring-1 { width: 95px; height: 95px; }
    .plant-ring.ring-2 { width: 112px; height: 112px; }
  }

  .title-info-section .main-title .title-char {
    font-size: 36px;
  }

  .decoration-section .zen-circle {
    width: 75px;
    height: 75px;

    .zen-text { font-size: 11px; }
  }
}

@media (max-width: 1024px) {
  .main-content-area {
    flex-direction: column;
  }

  .sidebar-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .herb-page {
    background: $bg-base;
  }

  .nature-hero {
    padding: 36px 20px 44px;
  }

  .hero-container {
    grid-template-columns: 1fr;
    gap: 28px;
    text-align: center;
  }

  .plant-icon-section {
    display: flex;
    justify-content: center;

    .icon-glow {
      width: 130px;
      height: 130px;
    }

    .main-plant-wrapper {
      width: 110px;
      height: 110px;

      .plant-main {
        font-size: 56px;
      }

      .plant-ring.ring-1 { width: 85px; height: 85px; }
      .plant-ring.ring-2 { width: 102px; height: 102px; }

      .growing-leaves .small-leaf {
        font-size: 16px;
      }
    }
  }

  .title-info-section {
    .badge-row {
      justify-content: center;
      flex-wrap: wrap;
    }

    .main-title {
      justify-content: center;

      .title-char {
        font-size: 32px;
      }
    }

    .quick-stats {
      margin: 0 auto;
      flex-wrap: wrap;
      justify-content: center;
      padding: 14px 20px;

      .stat-box {
        padding: 8px 14px;

        &:not(:last-child)::after {
          display: none;
        }

        .stat-icon { font-size: 20px; }

        .stat-content .stat-num {
          font-size: 18px;
        }
      }
    }
  }

  .decoration-section {
    flex-direction: row;
    justify-content: center;
    gap: 24px;

    .organic-shape { display: none; }

    .zen-circle {
      width: 70px;
      height: 70px;

      .zen-text {
        font-size: 10px;
        writing-mode: horizontal-tb;
      }
    }
  }

  .bg-layer {
    .leaf-decoration {
      &.leaf-1 { font-size: 28px; top: 10px; right: 5%; }
      &.leaf-2 { font-size: 24px; bottom: 25%; left: 2%; }
      &.leaf-3 { display: none; }
    }

    .particle { display: none; }

    .wave-svg { height: 50px; }
  }
}
</style>
