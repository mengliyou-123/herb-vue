<script setup>
import { ref, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { pcmListService } from "@/api/pcm.js";
import { pcmRecommendStreamService } from "@/api/recommend.js"
import { useTokenStore } from "@/stores/token";
import { ElMessage } from "element-plus";

const tokenStore = useTokenStore();

const dosageForm = ref("");
const type = ref("");
const pcmName = ref("");
const pcms = ref([]);
const loading = ref(false);
const error = ref(null);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(10);

let searchTimer = null;

const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pageNum.value = 1;
    pcmList();
  }, 300);
};

const onSizeChange = (size) => {
  pageSize.value = size;
  pageNum.value = 1;
  pcmList();
};
const onCurrentChange = (num) => {
  pageNum.value = num;
  pcmList();
};

const pcmList = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      dosageForm: dosageForm.value || null,
      type: type.value || null,
      pcmName: pcmName.value || null,
    };
    const result = await pcmListService(params);
    pcms.value = result.data?.items || [];
    total.value = result.data?.total || 0;
  } catch (err) {
    console.error("获取中成药列表失败:", err);
    error.value = "加载失败，请稍后重试";
    ElMessage.error("获取数据失败");
    pcms.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  pcmList();
});

const question = ref("");
const answer = ref("");
const recommendLoading = ref(false);

const formatText = (text) => {
  if (!text) return '';
  let formatted = String(text);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^(\d+)\.\s+/gm, '<strong>$1.</strong> ');
  formatted = formatted.replace(/^-\s+/gm, '• ');
  formatted = formatted.replace(/\n+/g, '<br>');
  return formatted;
};

const recommend = async() => {
  if (!question.value.trim()) {
    ElMessage.warning("请输入病症");
    return;
  }
  recommendLoading.value = true;
  answer.value = "";
  try {
    await pcmRecommendStreamService(
      question.value,
      (chunk) => {
        answer.value += chunk;
      },
      () => {
        recommendLoading.value = false;
        ElMessage.success("推荐完成");
      },
      (error) => {
        recommendLoading.value = false;
        answer.value = "推荐失败，请稍后重试";
        ElMessage.error("推荐失败");
        console.error(error);
      }
    );
  } catch (error) {
    recommendLoading.value = false;
    answer.value = "推荐失败，请稍后重试";
    ElMessage.error("推荐失败");
  }
}

const typeOptions = [
  ['全部类型', '安神药', '表里双解药', '补肾壮骨药', '补虚药', '补益药'],
  ['疮疡消药', '调和药', '调止药', '扶正药', '固涩药', '和血药'],
  ['化湿药', '化痰药', '止咳药', '平喘药', '活血化瘀药', '活血通络药'],
  ['接骨续筋药', '理气药', '理血药', '解表药', '开窍药', '民族药'],
  ['清热祛暑药', '清热药', '祛风活络药', '祛风药', '祛湿药', '祛瘀药'],
  ['散结药', '收涩药', '温经活血药', '温理药', '消导药', '消食化积药'],
  ['泻下药', '燥湿药', '止血药', '治风药', '其他']
];

const showAllTypes = ref(false);
const displayedTypes = () => {
  return showAllTypes.value ? typeOptions.flat() : typeOptions[0];
};

const toggleTypeExpand = () => {
  showAllTypes.value = !showAllTypes.value;
}
</script>

<template>
  <div class="pcm-page">
    <!-- 温暖药膳养生风格头部 -->
    <div class="warmth-hero">
      <!-- 背景装饰层 -->
      <div class="warm-bg">
        <!-- 温暖光晕 -->
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
        <div class="glow-orb orb-3"></div>

        <!-- 蒸汽/热气效果 -->
        <div class="steam-particles">
          <span class="steam s1"></span>
          <span class="steam s2"></span>
          <span class="steam s3"></span>
          <span class="steam s4"></span>
          <span class="steam s5"></span>
          <span class="steam s6"></span>
        </div>

        <!-- 温度波纹 -->
        <svg class="temp-waves" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 Q150,30 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(232, 168, 124, 0.08)" class="wave w1"/>
          <path d="M0,70 Q200,40 400,70 T800,70 T1200,70 L1200,120 L0,120 Z" fill="rgba(212, 165, 116, 0.06)" class="wave w2"/>
        </svg>

        <!-- 药材点缀 -->
        <div class="herb-spots">
          <span class="spot spot-1">🫖</span>
          <span class="spot spot-2">🍵</span>
          <span class="spot spot-3">🌸</span>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="hero-content">
        <!-- 左侧药罐图标 -->
        <div class="pot-section">
          <div class="pot-glow"></div>
          <div class="medicine-pot">
            <div class="pot-body">
              <div class="pot-lid"></div>
              <div class="pot-handle left"></div>
              <div class="pot-handle right"></div>
              <div class="pot-inner">
                <span class="pot-icon">💊</span>
                <div class="pot-steam">
                  <span class="vapor v1">~</span>
                  <span class="vapor v2">~</span>
                  <span class="vapor v3">~</span>
                </div>
              </div>
            </div>
            <div class="pot-base"></div>
          </div>
          <div class="pot-flame">
            <span class="flame f1"></span>
            <span class="flame f2"></span>
            <span class="flame f3"></span>
          </div>
        </div>

        <!-- 中间标题信息 -->
        <div class="title-section">
          <!-- 顶部标签 -->
          <div class="top-badges">
            <span class="badge warm-badge">
              <span class="badge-icon">🔥</span>
              滋补养生
            </span>
            <span class="badge sub-badge">Chinese Patent Medicine</span>
          </div>

          <!-- 主标题 -->
          <h1 class="main-title">
            <span class="title-char" v-for="(char, index) in '中成药'.split('')" :key="index" :style="{ animationDelay: `${index * 0.2}s` }">{{ char }}</span>
          </h1>

          <!-- 副标题 -->
          <p class="subtitle">
            <span class="sub-text">千年传承 · 温润滋养 · 守护健康</span>
          </p>

          <!-- 数据展示 -->
          <div class="data-cards">
            <div class="data-card">
              <div class="card-icon-wrap">
                <span class="card-icon">💊</span>
              </div>
              <div class="card-info">
                <span class="card-num">{{ total }}</span>
                <span class="card-label">种药品</span>
              </div>
            </div>
            <div class="data-card">
              <div class="card-icon-wrap">
                <span class="card-icon">🏷️</span>
              </div>
              <div class="card-info">
                <span class="card-num">{{ typeOptions.flat().length }}</span>
                <span class="card-label">个分类</span>
              </div>
            </div>
            <div class="data-card highlight">
              <div class="card-icon-wrap">
                <span class="card-icon">⚕️</span>
              </div>
              <div class="card-info">
                <span class="card-num">AI</span>
                <span class="card-label">智能推荐</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧温度计/养生元素 -->
        <div class="wellness-section">
          <div class="thermometer">
            <div class="thermo-body">
              <div class="thermo-fill" :style="{ height: '75%' }"></div>
              <div class="thermo-bulb"></div>
              <div class="thermo-scale">
                <span class="scale-mark" v-for="i in 5" :key="i"></span>
              </div>
            </div>
            <div class="thermo-label">温</div>
          </div>

          <div class="wellness-icons">
            <span class="w-icon w1" title="调理">🧘</span>
            <span class="w-icon w2" title="滋养">🍯</span>
            <span class="w-icon w3" title="平衡">☯️</span>
          </div>

          <div class="fortune-text">
            <span class="fortune-char" v-for="(c, i) in '温补调和'.split('')" :key="i" :style="{ animationDelay: `${i * 0.35}s` }">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="main-area">
        <div class="search-bar">
          <el-input
            v-model="pcmName"
            placeholder="按中成药名检索..."
            :prefix-icon="Search"
            clearable
            @input="debounceSearch"
            @keyup.enter="pcmList"
          />
          <el-button type="primary" @click="pcmList" :loading="loading">搜索</el-button>
        </div>

        <div class="filter-section">
          <div class="filter-header">
            <div class="filter-label">
              <span class="label-icon">🏷️</span>
              类型筛选
              <span class="type-count" v-if="type">{{ displayedTypes().filter(t => t === type || (t === '全部类型' && !type)).length > 0 ? '' : `(${type})` }}</span>
            </div>
            <el-button
              text
              size="small"
              type="primary"
              @click="toggleTypeExpand"
              class="expand-btn"
            >
              {{ showAllTypes ? '收起' : '展开更多' }}
              <span class="expand-icon" :class="{ expanded: showAllTypes }">▼</span>
            </el-button>
          </div>
          <transition name="filter-fade">
            <div class="filter-tags" v-show="showAllTypes || true">
              <span
                v-for="t in displayedTypes()"
                :key="t"
                class="filter-tag"
                :class="{ active: type === (t === '全部类型' ? '' : t) }"
                @click="type = t === '全部类型' ? '' : t; pageNum = 1; pcmList()"
              >{{ t }}</span>
              <template v-if="showAllTypes">
                <span
                  v-for="t in typeOptions.slice(1).flat()"
                  :key="'more-'+t"
                  class="filter-tag"
                  :class="{ active: type === t }"
                  @click=" type = t; pageNum = 1; pcmList()"
                >{{ t }}</span>
              </template>
            </div>
          </transition>
        </div>

        <div class="pcm-list" v-if="!loading && pcms.length > 0 && !error">
          <transition-group name="card-list" tag="div" class="cards-wrapper">
            <div v-for="(p, index) in pcms" :key="p.id" class="pcm-card" :style="{ animationDelay: `${index * 0.05}s` }">
              <div class="card-icon">💊</div>
              <div class="card-main">
                <div class="card-header">
                  <h3 class="card-title">{{ p.pcmName }}</h3>
                  <div class="card-meta">
                    <span class="meta-tag">{{ p.dosageForm }}</span>
                    <span class="meta-tag meta-type">{{ p.type }}</span>
                  </div>
                </div>
                <p class="card-desc">{{ p.composition }}</p>
                <div class="card-footer">
                  <p class="card-usage"><span class="usage-icon">📋</span><span class="usage-label">用法用量：</span>{{ p.pcmUsage }}</p>
                </div>
              </div>
              <div class="card-status">
                <span class="status-dot"></span>
              </div>
            </div>
          </transition-group>
        </div>

        <div v-else-if="loading" class="loading-state">
          <div v-for="i in 3" :key="i" class="skeleton-card">
            <div class="skeleton-icon"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-meta"></div>
              <div class="skeleton-text"></div>
              <div class="skeleton-text short"></div>
            </div>
          </div>
        </div>

        <div v-else-if="error" class="error-state">
          <span class="error-icon">⚠️</span>
          <p class="error-message">{{ error }}</p>
          <el-button type="primary" @click="pcmList" :loading="loading">重新加载</el-button>
        </div>

        <div v-else class="empty-state">
          <span class="empty-icon">🔍</span>
          <h3>暂无中成药数据</h3>
          <p>尝试调整筛选条件或搜索关键词</p>
          <el-button type="primary" link @click="type = ''; dosageForm = ''; pcmName = ''; pcmList()">清除所有筛选</el-button>
        </div>

        <div class="pagination-wrap" v-if="total > 0 && !loading">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 30]"
            layout="jumper, total, sizes, prev, pager, next"
            background
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>

      <div class="sidebar">
        <div class="panel recommend-panel">
          <div class="panel-header">
            <span class="panel-title">🤖 中成药智能推荐</span>
          </div>
          <div class="panel-body">
            <el-input
              v-model="question"
              placeholder="输入病症，如：咳嗽痰多..."
              class="recommend-input"
              clearable
              @keyup.enter="recommend"
            />
            <el-button
              @click="recommend"
              type="primary"
              class="recommend-btn"
              :loading="recommendLoading"
              :disabled="recommendLoading"
            >
              <span v-if="!recommendLoading">开始推荐</span>
              <span v-else>推荐中...</span>
            </el-button>
            <div class="result-section">
              <div class="result-label">
                <span class="result-icon">📝</span>
                推荐结果
              </div>
              <div v-if="recommendLoading && !answer" class="loading-box">
                <div class="spinner"></div>
                <span>正在连接AI服务...</span>
              </div>
              <div v-else-if="answer" class="result-content" v-html="formatText(answer)"></div>
              <div v-else class="placeholder-box">
                <span class="placeholder-icon">💡</span>
                输入病症后，AI将为您推荐合适的中成药
              </div>
            </div>
          </div>
        </div>

        <div class="panel tips-panel">
          <div class="panel-header tips-header">
            <span class="panel-title">📚 使用小贴士</span>
          </div>
          <div class="panel-body tips-body">
            <ul class="tips-list">
              <li>💡 使用上方搜索快速定位中成药</li>
              <li>🏷️ 通过类型标签精准筛选</li>
              <li>🤖 右侧AI助手可智能推荐用药</li>
              <li>🌡️ 中成药温和滋补，适合长期调理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pcm-page {
  min-height: 100%;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFF5EE 25%, #FFFBF7 50%, $bg-base 100%);
  position: relative;
}

// ==================== 关键帧动画定义（必须在顶层）====================

@keyframes glowFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
  33% { transform: translate(-25px, -20px) scale(1.05); opacity: 1; }
  66% { transform: translate(15px, 15px) scale(0.95); opacity: 0.85; }
}

@keyframes glowFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -18px); }
}

@keyframes glowPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}

@keyframes steamRise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  20% { opacity: 0.6; }
  100% { transform: translateY(-80px) scale(1.8); opacity: 0; }
}

@keyframes waveMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-25px); }
}

@keyframes spotFloat1 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-12px, -10px) rotate(8deg); }
}

@keyframes spotFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(10px, -12px); }
}

@keyframes spotFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-8px, 8px) scale(1.1); }
}

@keyframes potGlow {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}

@keyframes potBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes iconSway {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(3deg); }
}

@keyframes vaporRise {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(-6px); }
}

@keyframes flameFlicker {
  from { transform: scaleY(1) scaleX(1); opacity: 0.9; }
  to { transform: scaleY(1.2) scaleX(0.85); opacity: 1; }
}

@keyframes charWarmReveal {
  from { opacity: 0; transform: translateY(25px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes underlineWarmGrow {
  to { transform: scaleX(1); }
}

@keyframes thermoRise {
  0%, 100% { height: 75% !important; }
  50% { height: 85% !important; }
}

@keyframes wellIconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes fortuneFadeIn {
  from { opacity: 0; transform: scale(0.8) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// ==================== 样式定义 ====================

.warmth-hero {
  position: relative;
  padding: 52px 40px 60px;
  overflow: hidden;
  background: transparent;
}

.warm-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .glow-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);

    &.orb-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(232, 168, 124, 0.25) 0%, transparent 70%);
      top: -180px;
      right: -120px;
      animation: glowFloat1 18s ease-in-out infinite;
    }

    &.orb-2 {
      width: 380px;
      height: 380px;
      background: radial-gradient(circle, rgba(245, 160, 100, 0.2) 0%, transparent 70%);
      bottom: -120px;
      left: -100px;
      animation: glowFloat2 22s ease-in-out infinite reverse;
    }

    &.orb-3 {
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(255, 183, 77, 0.15) 0%, transparent 70%);
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: glowPulse 12s ease-in-out infinite;
    }
  }

  .steam-particles {
    .steam {
      position: absolute;
      width: 8px;
      height: 8px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      animation: steamRise 4s ease-in-out infinite;

      &.s1 { bottom: 15%; left: 8%; width: 12px; height: 12px; animation-delay: 0s; }
      &.s2 { bottom: 28%; left: 15%; animation-delay: 0.8s; }
      &.s3 { bottom: 22%; right: 18%; width: 10px; height: 10px; animation-delay: 1.6s; }
      &.s4 { bottom: 35%; right: 10%; animation-delay: 2.4s; }
      &.s5 { top: 25%; left: 25%; animation-delay: 3.2s; }
      &.s6 { top: 32%; right: 28%; animation-delay: 0.4s; }
    }
  }

  .temp-waves {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;

    .wave {
      animation: waveMove 14s ease-in-out infinite;

      &.w2 {
        animation-duration: 18s;
        animation-direction: reverse;
      }
    }
  }

  .herb-spots {
    .spot {
      position: absolute;
      font-size: 36px;
      opacity: 0.12;
      filter: blur(0.5px);

      &.spot-1 {
        top: 18%;
        right: 8%;
        animation: spotFloat1 10s ease-in-out infinite;
      }

      &.spot-2 {
        bottom: 28%;
        left: 6%;
        font-size: 28px;
        animation: spotFloat2 13s ease-in-out infinite;
      }

      &.spot-3 {
        top: 55%;
        right: 22%;
        font-size: 24px;
        animation: spotFloat3 11s ease-in-out infinite;
      }
    }
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 44px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.pot-section {
  position: relative;

  .pot-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(255, 140, 66, 0.25) 0%, transparent 70%);
    border-radius: 50%;
    animation: potGlow 3s ease-in-out infinite;
  }

  .medicine-pot {
    position: relative;
    z-index: 2;
    animation: potBounce 4s ease-in-out infinite;
  }

  .pot-body {
    width: 110px;
    height: 90px;
    background: linear-gradient(180deg, #D4956E 0%, #C48B62 50%, #B87D54 100%);
    border-radius: 12px 12px 20px 20px;
    position: relative;
    box-shadow:
      inset 0 4px 8px rgba(255, 255, 255, 0.2),
      inset 0 -4px 8px rgba(0, 0, 0, 0.15),
      0 8px 24px rgba(184, 125, 84, 0.3);

    .pot-lid {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 16px;
      background: linear-gradient(180deg, #E8A87C 0%, #D4956E 100%);
      border-radius: 8px 8px 4px 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    }

    .pot-handle {
      position: absolute;
      top: 20px;
      width: 16px;
      height: 40px;
      background: linear-gradient(90deg, #C48B62, #D4A574, #C48B62);
      border-radius: 8px;
      box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);

      &.left { left: -10px; }
      &.right { right: -10px; }
    }

    .pot-inner {
      position: absolute;
      top: 8px;
      left: 8px;
      right: 8px;
      bottom: 8px;
      background: linear-gradient(180deg, #4A3728 0%, #3D2D20 100%);
      border-radius: 8px 8px 14px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;

      .pot-icon {
        font-size: 38px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        animation: iconSway 3s ease-in-out infinite;
      }

      .pot-steam {
        display: flex;
        gap: 6px;

        .vapor {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          animation: vaporRise 2s ease-in-out infinite;

          &.v1 { animation-delay: 0s; }
          &.v2 { animation-delay: 0.4s; font-size: 11px; }
          &.v3 { animation-delay: 0.8s; font-size: 16px; }
        }
      }
    }
  }

  .pot-base {
    width: 130px;
    height: 14px;
    background: linear-gradient(180deg, #8B6914 0%, #6B5210 100%);
    border-radius: 0 0 8px 8px;
    margin: -4px auto 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .pot-flame {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 4px;

    .flame {
      width: 8px;
      height: 16px;
      background: linear-gradient(to top, #FF6B35, #F7931E, #FFD700);
      border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
      animation: flameFlicker 0.5s ease-in-out infinite alternate;

      &.f1 { height: 18px; animation-delay: 0s; }
      &.f2 { height: 14px; animation-delay: 0.15s; }
      &.f3 { height: 12px; animation-delay: 0.3s; }
    }
  }
}

.title-section {
  .top-badges {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .warm-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      background: linear-gradient(135deg, #FF8C42, #FFA54F);
      color: white;
      font-size: 13px;
      font-weight: 700;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(255, 140, 66, 0.35);
      letter-spacing: 0.5px;

      .badge-icon { font-size: 15px; }
    }

    .sub-badge {
      font-size: 12px;
      color: #C9915E;
      font-weight: 500;
      letter-spacing: 1px;
      font-style: italic;
    }
  }

  .main-title {
    margin: 0 0 14px;
    display: flex;
    gap: 8px;
    justify-content: center;

    .title-char {
      font-size: 44px;
      font-weight: 900;
      background: linear-gradient(135deg, #D4763C 0%, #E8945A 40%, #F5B77A 70%, #D4763C 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
      animation: charWarmReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #FF8C42, #F7931E, #FFD700);
        border-radius: 2px;
        transform: scaleX(0);
        animation: underlineWarmGrow 0.6s ease forwards;
        animation-delay: calc(var(--char-index, 0) * 0.2s + 0.6s);
      }
    }
  }

  .subtitle {
    text-align: center;
    margin: 0 0 24px;

    .sub-text {
      font-size: 15px;
      color: #A67C52;
      letter-spacing: 2px;
      font-weight: 500;
    }
  }

  .data-cards {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    .data-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(232, 168, 124, 0.2);
      box-shadow: 0 4px 16px rgba(212, 118, 60, 0.08);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(212, 118, 60, 0.15);
        border-color: rgba(232, 168, 124, 0.4);
      }

      &.highlight {
        background: linear-gradient(135deg, rgba(255, 140, 66, 0.1), rgba(255, 183, 77, 0.08));
        border-color: rgba(255, 140, 66, 0.3);
      }

      .card-icon-wrap {
        width: 42px;
        height: 42px;
        background: linear-gradient(135px, #FFE4CC, #FFD9BF);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .card-icon { font-size: 22px; }
      }

      .card-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .card-num {
          font-size: 24px;
          font-weight: 800;
          color: #D4763C;
          line-height: 1;
        }

        .card-label {
          font-size: 11px;
          color: #A67C52;
          font-weight: 500;
        }
      }
    }
  }
}

.wellness-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;

  .thermometer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;

    .thermo-body {
      width: 24px;
      height: 100px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 12px;
      border: 2px solid rgba(212, 118, 60, 0.3);
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.08);

      .thermo-fill {
        position: absolute;
        bottom: 0;
        left: 2px;
        right: 2px;
        background: linear-gradient(to top, #FF6B35, #F7931E, #FFD700);
        border-radius: 0 0 8px 8px;
        transition: height 1s ease;
        animation: thermoRise 3s ease-in-out infinite;
      }

      .thermo-bulb {
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #FF6B35, #F7931E);
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 8px rgba(255, 107, 53, 0.4);
      }

      .thermo-scale {
        position: absolute;
        right: -8px;
        top: 8px;
        bottom: 15px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .scale-mark {
          width: 4px;
          height: 4px;
          background: rgba(212, 118, 60, 0.4);
          border-radius: 50%;
        }
      }
    }

    .thermo-label {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 16px;
      font-weight: 700;
      color: #D4763C;
    }
  }

  .wellness-icons {
    display: flex;
    gap: 12px;

    .w-icon {
      font-size: 26px;
      animation: wellIconBounce 3s ease-in-out infinite;

      &.w1 { animation-delay: 0s; }
      &.w2 { animation-delay: 0.5s; }
      &.w3 { animation-delay: 1s; }
    }
  }

  .fortune-text {
    display: flex;
    gap: 6px;

    .fortune-char {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 19px;
      font-weight: 700;
      color: #A67C52;
      opacity: 0;
      animation: fortuneFadeIn 1s ease forwards;
    }

    &:nth-child(1) .fortune-char { animation-delay: 1s; }
    &:nth-child(2) .fortune-char { animation-delay: 1.35s; }
    &:nth-child(3) .fortune-char { animation-delay: 1.7s; }
    &:nth-child(4) .fortune-char { animation-delay: 2.05s; }
  }
}

.page-body {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-area {
  flex: 1;
  min-width: 0;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .el-input { flex: 1; }

  .el-button {
    width: 90px;
    height: 40px;
    border-radius: $radius-md;
    background: linear-gradient(135deg, #FF8C42, #F7931E);
    border: none;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #FA7A2A, #F08820);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 140, 66, 0.35);
    }

    &:disabled { opacity: 0.7; }
  }
}

.filter-section {
  margin-bottom: 20px;
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 16px;
  box-shadow: $shadow-sm;

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .filter-label {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    display: flex;
    align-items: center;
    gap: 6px;

    .label-icon { font-size: 16px; }
    .type-count { font-size: 12px; color: #E8945A; font-weight: normal; }
  }

  .expand-btn {
    font-size: 13px;
    padding: 4px 8px;
    color: #E8945A;

    .expand-icon {
      display: inline-block;
      margin-left: 4px;
      transition: transform 0.3s ease;
      font-size: 10px;

      &.expanded { transform: rotate(180deg); }
    }
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-tag {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: #FFF9F5;
    color: #A67C52;
    border: 1px solid rgba(232, 148, 90, 0.2);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 140, 66, 0.12);
      transform: translate(-50%, -50%);
      transition: all 0.35s ease;
    }

    &:hover {
      color: #D4763C;
      border-color: #FF8C42;
      transform: translateY(-1px);

      &::before { width: 150%; height: 150%; padding-top: 150%; }
    }

    &.active {
      background: linear-gradient(135deg, #FF8C42, #F7931E);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 3px 10px rgba(255, 140, 66, 0.35);
      font-weight: 500;

      &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(255, 140, 66, 0.45); }
    }
  }
}

.filter-fade-enter-active,
.filter-fade-leave-active { transition: all 0.3s ease; overflow: hidden; }
.filter-fade-enter-from,
.filter-fade-leave-to { opacity: 0; max-height: 0; margin-top: 0; }

.pcm-list { display: flex; flex-direction: column; gap: 12px; }
.cards-wrapper { display: flex; flex-direction: column; gap: 12px; }

.pcm-card {
  display: flex;
  align-items: center;
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 20px 24px;
  cursor: default;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  box-shadow: $shadow-sm;
  position: relative;
  overflow: hidden;
  animation: slideIn 0.4s ease backwards;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #FF8C42, #F7931E, #FFD700);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
    border-color: rgba(255, 140, 66, 0.2);
    background: rgba(255, 255, 255, 0.95);

    &::before { opacity: 1; }
    .card-icon { transform: scale(1.1) rotate(5deg); }
    .card-status .status-dot { background: #4CAF50; box-shadow: 0 0 8px rgba(76, 175, 80, 0.5); }
  }

  .card-icon {
    font-size: 36px;
    margin-right: 18px;
    flex-shrink: 0;
    transition: all 0.3s ease;
    filter: drop-shadow(0 2px 4px rgba(212, 118, 60, 0.15));
  }

  .card-main {
    flex: 1;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
    gap: 12px;
  }

  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
    line-height: 1.3;
    transition: color 0.3s ease;

    .pcm-card:hover & { color: #D4763C; }
  }

  .card-meta {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    .meta-tag {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(255, 140, 66, 0.1);
      color: #E8945A;
      border: 1px solid rgba(255, 140, 66, 0.2);
    }

    .meta-type {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
      border-color: rgba(76, 175, 80, 0.2);
    }
  }

  .card-desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .card-footer { display: flex; align-items: center; }

  .card-usage {
    font-size: 12px;
    color: $text-placeholder;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;

    .usage-icon { font-size: 14px; flex-shrink: 0; }
    .usage-label { font-weight: 500; color: $text-secondary; flex-shrink: 0; }
  }

  .card-status {
    flex-shrink: 0;
    margin-left: 16px;
    display: flex;
    align-items: center;

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #E8945A;
      transition: all 0.3s ease;
    }
  }
}

.card-list-enter-active,
.card-list-leave-active { transition: all 0.3s ease; }
.card-list-enter-from,
.card-list-leave-to { opacity: 0; transform: translateX(-10px); }

.loading-state { display: flex; flex-direction: column; gap: 12px; }

.skeleton-card {
  display: flex;
  align-items: center;
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 20px 24px;
  gap: 18px;

  .skeleton-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    background: linear-gradient(90deg, #FFF9F5 25%, #FFE8D6 50%, #FFF9F5 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skeleton-title { height: 22px; width: 35%; border-radius: 4px; background: linear-gradient(90deg, #FFF9F5 25%, #FFE8D6 50%, #FFF9F5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-meta { height: 26px; width: 45%; border-radius: 13px; background: linear-gradient(90deg, #FFF9F5 25%, #FFE8D6 50%, #FFF9F5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  .skeleton-text { height: 14px; width: 100%; border-radius: 4px; background: linear-gradient(90deg, #FFF9F5 25%, #FFE8D6 50%, #FFF9F5 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; &.short { width: 65%; } }
}

.error-state {
  text-align: center;
  padding: 60px 20px;
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  .error-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  .error-message { color: $text-secondary; font-size: 15px; margin: 0 0 20px; }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  .empty-icon { font-size: 56px; display: block; margin-bottom: 16px; animation: bounce 2s infinite; }
  h3 { color: $text-primary; font-size: 18px; margin: 0 0 8px; }
  p { color: $text-placeholder; font-size: 14px; margin: 0 0 16px; }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
  padding: 16px 0;

  :deep(.el-pagination) {
    --el-pagination-bg-color: #{$bg-surface};
    --el-pagination-button-bg-color: #{$bg-surface};
    border-radius: $radius-lg;
    padding: 8px 16px;
    box-shadow: $shadow-sm;
  }
}

.sidebar {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover { box-shadow: $shadow-md; }
}

.panel-header {
  background: linear-gradient(135deg, #FF8C42, #F7931E);
  padding: 16px 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  }

  .panel-title { color: #fff; font-size: 15px; font-weight: 600; position: relative; z-index: 1; }

  &.tips-header { background: linear-gradient(135deg, #FFB347, #FF9933); }
}

.panel-body { padding: 20px; }

.recommend-input {
  margin-bottom: 14px;

  :deep(.el-input__wrapper) {
    border-radius: $radius-md;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    transition: all 0.3s ease;

    &:focus { box-shadow: 0 0 0 3px rgba(255, 140, 66, 0.15), 0 2px 12px rgba(0,0,0,0.08); }
  }
}

.recommend-btn {
  width: 100%;
  border-radius: $radius-md;
  background: linear-gradient(135deg, #FF8C42, #F7931E);
  border: none;
  font-weight: 600;
  padding: 12px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(255, 140, 66, 0.25);

  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(255, 140, 66, 0.35); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.7; cursor: not-allowed; }
}

.result-section {
  margin-top: 16px;

  .result-label {
    font-size: 13px;
    font-weight: 600;
    color: #E8945A;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;

    .result-icon { font-size: 14px; }
  }
}

.result-content {
  min-height: 220px;
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: linear-gradient(135deg, #FFF9F5 0%, #FFF5EE 100%);
  border-radius: $radius-md;
  border-left: 4px solid #FF8C42;
  font-size: 13px;
  line-height: 1.8;
  color: $text-primary;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);

  &::-webkit-scrollbar { width: 6px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba(255, 140, 66, 0.25); border-radius: 3px; &:hover { background: rgba(255, 140, 66, 0.4); } }

  :deep(strong) { color: #E8945A; font-weight: 600; padding: 0 2px; }
  :deep(br) { margin-bottom: 6px; }
}

.placeholder-box {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px dashed rgba(232, 148, 90, 0.3);
  border-radius: $radius-md;
  font-size: 13px;
  color: $text-placeholder;
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.02) 0%, transparent 100%);
  transition: all 0.3s ease;

  &:hover { border-color: rgba(255, 140, 66, 0.5); background: linear-gradient(135deg, rgba(255, 140, 66, 0.04) 0%, transparent 100%); }
  .placeholder-icon { font-size: 32px; opacity: 0.7; }
}

.loading-box {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  border: 1.5px solid $border-color;
  border-radius: $radius-md;
  background: linear-gradient(135deg, rgba(255, 140, 66, 0.02) 0%, transparent 100%);

  span { font-size: 13px; color: #E8945A; font-weight: 500; }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 140, 66, 0.15);
  border-top-color: #FF8C42;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.tips-panel {
  .tips-body { padding: 16px 20px; }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.6;
      padding: 10px 14px;
      background: linear-gradient(135deg, rgba(255, 140, 66, 0.04) 0%, transparent 100%);
      border-radius: $radius-md;
      border-left: 3px solid rgba(255, 140, 66, 0.25);
      transition: all 0.3s ease;

      &:hover { background: linear-gradient(135deg, rgba(255, 140, 66, 0.08) 0%, transparent 100%); border-left-color: #FF8C42; transform: translateX(4px); }
    }
  }
}

@media (max-width: 1200px) {
  .warmth-hero { padding: 44px 32px 52px; }
  .hero-content { gap: 32px; }
  .pot-section .medicine-pot .pot-body { width: 95px; height: 82px; .pot-icon { font-size: 34px; } }
  .title-section .main-title .title-char { font-size: 38px; }
  .wellness-section .thermometer .thermo-body { height: 85px; }
}

@media (max-width: 1024px) {
  .page-body { flex-direction: column; }
  .sidebar { width: 100%; }
}

@media (max-width: 768px) {
  .pcm-page { background: $bg-base; }
  .warmth-hero { padding: 36px 20px 44px; }
  .hero-content { grid-template-columns: 1fr; gap: 28px; text-align: center; }

  .pot-section {
    display: flex;
    justify-content: center;
    .medicine-pot .pot-body { width: 85px; height: 74px; .pot-icon { font-size: 30px; }
    .pot-base { width: 105px; }
    .pot-flame { display: none; }
  }

  .title-section {
    .top-badges { justify-content: center; flex-wrap: wrap; }
    .main-title { justify-content: center; .title-char { font-size: 32px; } }
    .data-cards { justify-content: center; flex-wrap: wrap; .data-card { padding: 10px 16px; .card-num { font-size: 20px; } } }
  }

  .wellness-section { flex-direction: row; justify-content: center; gap: 16px; .thermometer .thermo-body { height: 65px; } .fortune-text { font-size: 15px; } }

  .warm-bg {
    .glow-orb { display: none; }
    .herb-spots .spot { display: none; }
    .temp-waves { height: 50px; }
    .steam-particles .steam { display: none; }
  }

  .page-body { flex-direction: column; padding: 16px; }
  .sidebar { width: 100%; }
  .pcm-card { padding: 16px 18px; .card-icon { font-size: 28px; margin-right: 14px; } .card-title { font-size: 16px; } .card-desc { -webkit-line-clamp: 1; } }
  .search-bar { flex-direction: column; .el-button { width: 100%; } }
  .filter-section { padding: 14px; }
  .filter-tag { padding: 5px 12px; font-size: 12px; }
}
}</style>
