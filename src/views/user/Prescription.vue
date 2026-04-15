<script setup>
import { ref, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import {
  preListService,
} from "@/api/prescription.js";
import { prescriptionAnalysisStreamService, getDiagnosisHistoryByTypeService, deleteHistoryService } from "@/api/ai.js";
import { useUserInfoStore } from "@/stores/userInfo";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();
const userInfoStore = useUserInfoStore();

const dosageForm = ref("");
const preName = ref("");
const pres = ref([]);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(10);

const onSizeChange = (size) => {
  pageSize.value = size;
  preList();
};
const onCurrentChange = (num) => {
  pageNum.value = num;
  preList();
};

const preList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    dosageForm: dosageForm.value ? dosageForm.value : null,
    preName: preName.value ? preName.value : null,
  };
  const result = await preListService(params);
  pres.value = result.data.items;
  total.value = result.data.total;
};
preList();

const preDetail = async (id) => {
  router.push({ path: "/user/preDetail", query: { id: id } });
}

const story = async (index) => {
  await router.push({ path: "/user/preStories", query: { index: index } });
}

const analysisInput = ref("");
const analysisResult = ref("");
const analysisLoading = ref(false);
const analysisHistoryList = ref([]);
const historyLoading = ref(false);

onMounted(() => {
  loadAnalysisHistory();
});

const loadAnalysisHistory = async () => {
  historyLoading.value = true;
  try {
    let result = await getDiagnosisHistoryByTypeService('prescription_analysis');
    analysisHistoryList.value = result.data || [];
  } catch (error) {
    console.error("加载分析历史失败", error);
  } finally {
    historyLoading.value = false;
  }
};

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

const analyzePrescription = async () => {
  if (!analysisInput.value.trim()) {
    ElMessage.warning("请输入方剂信息");
    return;
  }
  analysisLoading.value = true;
  analysisResult.value = "";
  try {
    await prescriptionAnalysisStreamService(
      analysisInput.value,
      (chunk) => {
        analysisResult.value += chunk;
      },
      async () => {
        analysisLoading.value = false;
        analysisInput.value = "";
        await loadAnalysisHistory();
        ElMessage.success("分析完成");
      },
      (error) => {
        analysisLoading.value = false;
        analysisResult.value = "方剂分析失败，请稍后重试";
        ElMessage.error("方剂分析失败");
        console.error(error);
      }
    );
  } catch (error) {
    analysisLoading.value = false;
    analysisResult.value = "方剂分析失败，请稍后重试";
    ElMessage.error("方剂分析失败");
  }
};

const deleteHistoryItem = async (historyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条分析记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteHistoryService(historyId);
    ElMessage.success("删除成功");
    await loadAnalysisHistory();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("删除失败");
    }
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatAnswer = (answer) => {
  if (!answer) return '';
  let formatted = String(answer);
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/^(\d+)\.\s+/gm, '<strong>$1.</strong> ');
  formatted = formatted.replace(/^-\s+/gm, '• ');
  formatted = formatted.replace(/\n+/g, '<br>');
  return formatted;
};

const dosageForms = [
  ['全部', '饼剂', '茶剂', '搽剂', '醋剂', '丹剂', '点眼剂', '锭剂', '敷剂', '膏剂'],
  ['膏药剂', '糕剂', '羹剂', '含漱剂', '糊剂', '胶剂', '疚剂', '酒剂', '露剂', '片剂'],
  ['曲剂', '塞鼻剂', '塞耳剂', '散剂', '霜剂', '汤剂', '条剂', '丸剂', '煨剂', '洗剂'],
  ['吸入烟剂', '线剂', '嗅剂', '熏洗剂', '熏烟剂', '油剂', '熨剂', '粥剂', '其他剂型']
];

const stories = [
  { title: '清代叶天士与白虎汤的故事', index: 1 },
  { title: '北宋名医钱乙与六味地黄丸的故事', index: 2 },
  { title: '清代名医王清任与补阳还五汤的故事', index: 3 },
  { title: '一代医宗朱丹溪的医案趣事', index: 4 },
  { title: '华佗炼制青苔膏', index: 5 },
  { title: '张仲景用蜂蜜治疗便秘', index: 6 },
  { title: '程钟龄施计治"足痿"', index: 7 },
  { title: '张景岳急智救吞钉小儿', index: 8 },
  { title: '孙思邈巧治脚气', index: 9 },
  { title: '孙一奎便方治难症', index: 10 },
];
</script>

<template>
  <div class="prescription-page">
    <!-- 页面头部 - 古典书卷水墨风格 -->
    <div class="ink-wash-hero">
      <!-- 水墨背景层 -->
      <div class="ink-bg">
        <!-- 山水意境 -->
        <svg class="mountain-svg" viewBox="0 0 1200 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountainGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(62, 62, 62, 0.08)"/>
              <stop offset="100%" style="stop-color:rgba(62, 62, 62, 0.02)"/>
            </linearGradient>
            <linearGradient id="mountainGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:rgba(80, 70, 60, 0.06)"/>
              <stop offset="100%" style="stop-color:rgba(80, 70, 60, 0.01)"/>
            </linearGradient>
          </defs>
          <path d="M0,200 Q200,120 400,180 T800,150 T1200,190 L1200,300 L0,300 Z" fill="url(#mountainGrad1)" class="mountain-1"/>
          <path d="M0,230 Q300,170 600,210 T1200,220 L1200,300 L0,300 Z" fill="url(#mountainGrad2)" class="mountain-2"/>
        </svg>

        <!-- 墨点装饰 -->
        <div class="ink-dots">
          <span class="dot dot-1"></span>
          <span class="dot dot-2"></span>
          <span class="dot dot-3"></span>
          <span class="dot dot-4"></span>
        </div>

        <!-- 笔触装饰 -->
        <div class="brush-strokes">
          <span class="stroke stroke-1"></span>
          <span class="stroke stroke-2"></span>
        </div>

        <!-- 印章 -->
        <div class="seal-decoration">
          <div class="seal seal-main">方</div>
          <div class="seal seal-sub">劑</div>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="hero-content-wrapper">
        <!-- 左侧卷轴图标 -->
        <div class="scroll-section">
          <div class="scroll-container">
            <div class="scroll-left"></div>
            <div class="scroll-body">
              <span class="scroll-icon">📜</span>
              <div class="scroll-text-vertical">
                <span v-for="(char, i) in '君臣佐使'.split('')" :key="i" :style="{ animationDelay: `${i * 0.3}s` }">{{ char }}</span>
              </div>
            </div>
            <div class="scroll-right"></div>
          </div>
          <div class="scroll-shadow"></div>
        </div>

        <!-- 中间标题信息 -->
        <div class="title-section">
          <!-- 顶部装饰线 -->
          <div class="top-ornament">
            <span class="ornament-line left"></span>
            <span class="ornament-diamond">◆</span>
            <span class="ornament-line right"></span>
          </div>

          <!-- 主标题 -->
          <h1 class="main-title">
            <span class="title-prefix">千古</span>
            <span class="title-main" v-for="(char, index) in '方剂堂'.split('')" :key="index" :class="`char-${index}`">
              {{ char }}
            </span>
          </h1>

          <!-- 副标题 -->
          <p class="subtitle">
            <span class="brush-brush">探寻名方</span>
            <span class="separator">·</span>
            <span class="brush-brush">领悟配伍奥妙</span>
          </p>

          <!-- 数据展示 -->
          <div class="data-scrolls">
            <div class="mini-scroll">
              <div class="scroll-top"></div>
              <div class="scroll-content">
                <span class="data-num">{{ total }}</span>
                <span class="data-label">经典方剂</span>
              </div>
              <div class="scroll-bottom"></div>
            </div>
            <div class="mini-scroll">
              <div class="scroll-top"></div>
              <div class="scroll-content">
                <span class="data-num">{{ dosageForms.flat().length }}</span>
                <span class="data-label">传统剂型</span>
              </div>
              <div class="scroll-bottom"></div>
            </div>
            <div class="mini-scroll">
              <div class="scroll-top"></div>
              <div class="scroll-content">
                <span class="data-num">{{ stories.length }}</span>
                <span class="data-label">名医传说</span>
              </div>
              <div class="scroll-bottom"></div>
            </div>
          </div>

          <!-- 底部装饰线 -->
          <div class="bottom-ornament">
            <span class="ornament-line left"></span>
            <span class="ornament-symbol">☯</span>
            <span class="ornament-line right"></span>
          </div>
        </div>

        <!-- 右侧阴阳/太极装饰 -->
        <div class="taichi-section">
          <div class="taichi-circle">
            <div class="taichi-yin"></div>
            <div class="taichi-yang"></div>
            <div class="taichi-dot dot-yin"></div>
            <div class="taichi-dot dot-yang"></div>
          </div>
          <div class="ancient-text">
            <span class="text-char" v-for="(c, i) in '阴阳调和'.split('')" :key="i" :style="{ animationDelay: `${i * 0.4}s` }">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="main-area">
        <div class="search-bar">
          <el-input v-model="preName" placeholder="按方剂名检索..." :prefix-icon="Search" clearable @keyup.enter="preList" />
          <el-button type="primary" @click="preList">搜索</el-button>
        </div>

        <div class="filter-section">
          <div class="filter-label">剂型筛选</div>
          <div class="filter-tags">
            <span
              v-for="form in dosageForms.flat()"
              :key="form"
              class="filter-tag"
              :class="{ active: dosageForm === (form === '全部' ? '' : form) }"
              @click="dosageForm = form === '全部' ? '' : form; preList()"
            >{{ form }}</span>
          </div>
        </div>

        <div class="prescription-list" v-if="pres.length > 0">
          <div v-for="p in pres" :key="p.id" class="prescription-card" @click="preDetail(p.id)">
            <div class="card-main">
              <h3 class="card-title">{{ p.preName }}</h3>
              <div class="card-meta">
                <span class="meta-tag">{{ p.dosageForm }}</span>
              </div>
              <p class="card-desc">{{ p.originalText }}</p>
            </div>
            <div class="card-arrow">→</div>
          </div>
        </div>

        <div v-else class="empty-state">
          <span class="empty-icon">🔍</span>
          <p>暂无方剂数据</p>
        </div>

        <div class="pagination-wrap">
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
        <div class="panel stories-panel">
          <div class="panel-header">
            <span class="panel-title">📖 名医名方</span>
          </div>
          <div class="panel-body">
            <div v-for="s in stories" :key="s.index" class="story-item" @click="story(s.index)">
              <span class="story-index">{{ String(s.index).padStart(2, '0') }}</span>
              <span class="story-title">{{ s.title }}</span>
            </div>
          </div>
        </div>

        <div class="panel analysis-panel">
          <div class="panel-header">
            <span class="panel-title">🤖 方剂智能分析</span>
          </div>
          <div class="panel-body">
            <el-input
              v-model="analysisInput"
              type="textarea"
              :rows="3"
              placeholder="输入方剂信息，如：麻黄汤：麻黄9g，桂枝6g..."
              class="analysis-input"
            />
            <el-button
              @click="analyzePrescription"
              type="primary"
              class="analysis-btn"
              :loading="analysisLoading"
              :disabled="analysisLoading"
            >开始分析</el-button>
            <div class="result-section">
              <div class="result-label">分析结果</div>
              <div v-if="analysisLoading && !analysisResult" class="loading-box">
                <div class="spinner"></div>
                <span>正在连接AI服务...</span>
              </div>
              <div v-else-if="analysisResult" class="result-content" v-html="formatText(analysisResult)"></div>
              <div v-else class="placeholder-box">输入方剂信息后，AI将为您分析组成、配伍、功效等</div>
            </div>
          </div>
        </div>

        <div class="panel history-panel">
          <div class="panel-header">
            <span class="panel-title">📊 分析历史</span>
            <el-button size="small" link @click="loadAnalysisHistory">刷新</el-button>
          </div>
          <div class="panel-body scrollable">
            <el-skeleton v-if="historyLoading" :rows="3" animated />
            <div v-else-if="analysisHistoryList.length === 0" class="empty-text">暂无分析记录</div>
            <div v-else class="history-list">
              <div v-for="item in analysisHistoryList" :key="item.id" class="history-item">
                <div class="hist-top">
                  <span class="hist-time">{{ formatTime(item.createTime) }}</span>
                  <el-button size="small" link type="danger" @click="deleteHistoryItem(item.id)">删除</el-button>
                </div>
                <div class="hist-q"><span class="lbl">方剂：</span>{{ item.question }}</div>
                <div class="hist-a" v-html="formatAnswer(item.answer)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prescription-page {
  min-height: 100%;
  background: linear-gradient(180deg, #FAF8F5 0%, #F5F3EF 30%, $bg-base 100%);
  position: relative;
}

// 古典书卷水墨风格头部
.ink-wash-hero {
  position: relative;
  padding: 52px 40px 60px;
  overflow: hidden;
  background: transparent;
}

// 水墨背景层
.ink-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .mountain-svg {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 200px;
    opacity: 0.6;

    .mountain-1 {
      animation: mountainFloat1 20s ease-in-out infinite;
    }

    .mountain-2 {
      animation: mountainFloat2 25s ease-in-out infinite reverse;
    }
  }

  @keyframes mountainFloat1 {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(-15px); }
  }

  @keyframes mountainFloat2 {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(10px); }
  }

  // 墨点装饰
  .ink-dots {
    .dot {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(62, 62, 62, 0.15) 0%, transparent 70%);
      animation: inkSpread 4s ease-in-out infinite;

      &.dot-1 {
        width: 80px; height: 80px;
        top: 10%; left: 8%;
        animation-delay: 0s;
      }

      &.dot-2 {
        width: 50px; height: 50px;
        top: 25%; right: 15%;
        animation-delay: 1.3s;
      }

      &.dot-3 {
        width: 60px; height: 60px;
        bottom: 25%; left: 18%;
        animation-delay: 2.6s;
      }

      &.dot-4 {
        width: 40px; height: 40px;
        bottom: 15%; right: 25%;
        animation-delay: 0.7s;
      }
    }
  }

  @keyframes inkSpread {
    0%, 100% {
      transform: scale(1);
      opacity: 0.6;
    }
    50% {
      transform: scale(1.3);
      opacity: 1;
    }
  }

  // 笔触装饰
  .brush-strokes {
    .stroke {
      position: absolute;
      background: linear-gradient(90deg, transparent, rgba(139, 90, 43, 0.08), transparent);
      height: 2px;
      animation: brushStroke 8s ease-in-out infinite;

      &.stroke-1 {
        width: 200px;
        top: 35%;
        right: 10%;
        transform: rotate(-5deg);
        animation-delay: 0s;
      }

      &.stroke-2 {
        width: 150px;
        bottom: 30%;
        left: 12%;
        transform: rotate(3deg);
        animation-delay: 4s;
      }
    }
  }

  @keyframes brushStroke {
    0%, 100% {
      opacity: 0;
      transform: scaleX(0) rotate(var(--rotation, 0deg));
    }
    50% {
      opacity: 1;
      transform: scaleX(1) rotate(var(--rotation, 0deg));
    }
  }

  // 印章装饰
  .seal-decoration {
    position: absolute;
    top: 40px;
    right: 60px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;

    .seal {
      width: 48px;
      height: 48px;
      border: 3px solid #C41E3A;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
      color: #C41E3A;
      font-family: "KaiTi", "STKaiti", serif;
      box-shadow: 0 2px 8px rgba(196, 30, 58, 0.2);
      animation: sealStamp 6s ease-in-out infinite;

      &.seal-main {
        transform: rotate(-8deg);
        background: rgba(196, 30, 58, 0.05);
      }

      &.seal-sub {
        width: 38px;
        height: 38px;
        font-size: 19px;
        transform: rotate(5deg);
        margin-right: 12px;
        margin-top: -16px;
        animation-delay: 3s;
      }
    }
  }

  @keyframes sealStamp {
    0%, 100% {
      opacity: 0.85;
      transform: rotate(var(--rotate, 0deg)) scale(1);
    }
    50% {
      opacity: 1;
      transform: rotate(var(--rotate, 0deg)) scale(1.05);
    }
  }
}

// 主内容区布局
.hero-content-wrapper {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 44px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

// 左侧卷轴区
.scroll-section {
  .scroll-container {
    display: flex;
    align-items: stretch;
    gap: 0;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
    animation: scrollUnroll 2s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
  }

  @keyframes scrollUnroll {
    from {
      transform: scaleY(0);
      opacity: 0;
    }
    to {
      transform: scaleY(1);
      opacity: 1;
    }
  }

  .scroll-left,
  .scroll-right {
    width: 18px;
    background: linear-gradient(180deg, #D4A574 0%, #B8956E 50%, #D4A574 100%);
    border-radius: 9px;
    flex-shrink: 0;
    box-shadow:
      inset 2px 0 4px rgba(255, 255, 255, 0.3),
      inset -2px 0 4px rgba(0, 0, 0, 0.2),
      2px 0 6px rgba(0, 0, 0, 0.15);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      background: radial-gradient(circle, #8B6914 0%, #A67C52 100%);
      border-radius: 50%;
      box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.4);
    }
  }

  .scroll-body {
    flex: 1;
    background: linear-gradient(180deg, #FDF9F3 0%, #F5EDE0 50%, #FDF9F3 100%);
    padding: 24px 28px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    border-top: 1px solid rgba(184, 149, 110, 0.3);
    border-bottom: 1px solid rgba(184, 149, 110, 0.3);
    position: relative;
    min-width: 90px;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(139, 105, 67, 0.2), transparent);
    }

    &::before { top: 8px; }
    &::after { bottom: 8px; }

    .scroll-icon {
      font-size: 42px;
      animation: scrollIconFloat 4s ease-in-out infinite;
    }

    @keyframes scrollIconFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .scroll-text-vertical {
      display: flex;
      flex-direction: column;
      writing-mode: vertical-rl;
      text-orientation: upright;
      letter-spacing: 8px;

      span {
        font-family: "KaiTi", "STKaiti", "SimSun", serif;
        font-size: 22px;
        font-weight: 700;
        color: #5D4E37;
        opacity: 0;
        animation: charFadeIn 0.8s ease forwards;

        &:nth-child(1) { animation-delay: 0.5s; }
        &:nth-child(2) { animation-delay: 0.8s; }
        &:nth-child(3) { animation-delay: 1.1s; }
        &:nth-child(4) { animation-delay: 1.4s; }
      }
    }

    @keyframes charFadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  .scroll-shadow {
    height: 8px;
    background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
    border-radius: 50%;
    margin-top: 8px;
    animation: shadowPulse 3s ease-in-out infinite;
  }

  @keyframes shadowPulse {
    0%, 100% { opacity: 0.6; transform: scaleX(0.95); }
    50% { opacity: 1; transform: scaleX(1); }
  }
}

// 中间标题区
.title-section {
  .top-ornament,
  .bottom-ornament {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;

    .ornament-line {
      height: 1px;
      width: 80px;
      background: linear-gradient(90deg, transparent, rgba(139, 90, 43, 0.3), transparent);

      &.left {
        background: linear-gradient(90deg, transparent, rgba(139, 90, 43, 0.3));
      }

      &.right {
        background: linear-gradient(90deg, rgba(139, 90, 43, 0.3), transparent);
      }
    }

    .ornament-diamond,
    .ornament-symbol {
      color: rgba(139, 90, 43, 0.4);
      font-size: 12px;
    }

    .ornament-symbol {
      font-size: 18px;
      animation: taichiSpin 10s linear infinite;
    }
  }

  @keyframes taichiSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .bottom-ornament {
    margin-top: 20px;
    margin-bottom: 0;
  }

  .main-title {
    margin: 0 0 14px;
    display: flex;
    align-items: baseline;
    gap: 10px;
    justify-content: center;

    .title-prefix {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 20px;
      font-weight: 600;
      color: #8B6914;
      letter-spacing: 4px;
      opacity: 0.8;
    }

    .title-main {
      font-family: "KaiTi", "STKaiti", "SimSun", serif;
      font-size: 46px;
      font-weight: 900;
      color: #2C2416;
      letter-spacing: 8px;
      position: relative;
      display: inline-block;
      animation: titleReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;

      &.char-0 { animation-delay: 0.2s; }
      &.char-1 { animation-delay: 0.4s; }
      &.char-2 { animation-delay: 0.6s; }

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #C41E3A, #8B4513, #C41E3A);
        border-radius: 2px;
        transform: scaleX(0);
        animation: underlineDraw 0.8s ease forwards;
        animation-delay: 0.9s;
      }
    }
  }

  @keyframes titleReveal {
    from {
      opacity: 0;
      transform: translateY(20px) rotate(-3deg);
    }
    to {
      opacity: 1;
      transform: translateY(0) rotate(0);
    }
  }

  @keyframes underlineDraw {
    to { transform: scaleX(1); }
  }

  .subtitle {
    text-align: center;
    margin: 0 0 24px;
    font-size: 15px;
    color: #6B5B47;
    letter-spacing: 2px;

    .brush-brush {
      font-family: "KaiTi", "STKaiti", serif;
      font-weight: 500;
    }

    .separator {
      margin: 0 12px;
      color: #C41E3A;
      opacity: 0.5;
    }
  }

  // 数据卷轴卡片
  .data-scrolls {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    .mini-scroll {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(253, 249, 243, 0.9);
      border-radius: 4px;
      box-shadow:
        0 2px 8px rgba(139, 105, 67, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow:
          0 6px 16px rgba(139, 105, 67, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8);
      }

      .scroll-top,
      .scroll-bottom {
        width: 100%;
        height: 8px;
        background: linear-gradient(180deg, #D4A574 0%, #C49B6C 100%);
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
      }

      .scroll-bottom {
        background: linear-gradient(180deg, #C49B6C 0%, #D4A574 100%);
      }

      .scroll-content {
        padding: 14px 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;

        .data-num {
          font-size: 26px;
          font-weight: 800;
          color: #8B4513;
          font-family: "Georgia", serif;
          line-height: 1;
        }

        .data-label {
          font-size: 11px;
          color: #8B7355;
          font-weight: 500;
          letter-spacing: 1px;
        }
      }
    }
  }
}

// 右侧太极阴阳区
.taichi-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  .taichi-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(to right, #2C2416 50%, #FDF9F3 50%);
    position: relative;
    animation: taichiRotate 12s linear infinite;
    box-shadow:
      0 4px 16px rgba(44, 36, 22, 0.2),
      inset 0 0 20px rgba(0, 0, 0, 0.1);

    .taichi-yin,
    .taichi-yang {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }

    .taichi-yin {
      top: 0;
      left: 25px;
      background: #FDF9F3;
    }

    .taichi-yang {
      bottom: 0;
      left: 25px;
      background: #2C2416;
    }

    .taichi-dot {
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;

      &.dot-yin {
        top: 15px;
        left: 40px;
        background: #2C2416;
      }

      &.dot-yang {
        bottom: 15px;
        left: 40px;
        background: #FDF9F3;
      }
    }
  }

  @keyframes taichiRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .ancient-text {
    display: flex;
    gap: 6px;

    .text-char {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 18px;
      font-weight: 700;
      color: #5D4E37;
      opacity: 0;
      animation: ancientCharFade 1s ease forwards;

      &:nth-child(1) { animation-delay: 1.2s; }
      &:nth-child(2) { animation-delay: 1.5s; }
      &:nth-child(3) { animation-delay: 1.8s; }
      &:nth-child(4) { animation-delay: 2.1s; }
    }
  }

  @keyframes ancientCharFade {
    from {
      opacity: 0;
      transform: scale(0.8) rotate(-10deg);
    }
    to {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
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
  .el-input {
    flex: 1;
  }
  .el-button {
    width: 90px;
    height: 40px;
    border-radius: $radius-md;
    background: $color-primary;
    border-color: $color-primary;
    &:hover {
      background: $color-primary-light;
      border-color: $color-primary-light;
    }
  }
}

.filter-section {
  margin-bottom: 20px;
  .filter-label {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 10px;
  }
  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .filter-tag {
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: $bg-surface;
    color: $text-secondary;
    border: 1px solid $border-color;
    &:hover {
      color: $color-primary;
      border-color: $color-primary;
    }
    &.active {
      background: $color-primary;
      color: #fff;
      border-color: $color-primary;
    }
  }
}

.prescription-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prescription-card {
  display: flex;
  align-items: center;
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 18px 22px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  box-shadow: $shadow-sm;
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
    border-color: rgba($color-primary, 0.2);
    .card-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
  .card-main {
    flex: 1;
    min-width: 0;
  }
  .card-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 8px;
  }
  .card-meta {
    margin-bottom: 8px;
    .meta-tag {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      background: rgba($color-primary, 0.08);
      color: $color-primary;
    }
  }
  .card-desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .card-arrow {
    font-size: 20px;
    color: $color-primary;
    opacity: 0;
    transition: all 0.3s ease;
    flex-shrink: 0;
    margin-left: 16px;
  }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
  }
  p {
    color: $text-placeholder;
    font-size: 15px;
  }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.panel-header {
  background: $color-primary-gradient;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .panel-title {
    color: #fff;
    font-size: 15px;
    font-weight: 600;
  }
}

.panel-body {
  padding: 16px;
}

.stories-panel .panel-body {
  max-height: 300px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.3); border-radius: 2px; }
}

.story-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px dashed $border-color;
  cursor: pointer;
  &:last-child { border-bottom: none; }
  &:hover .story-title {
    color: $color-primary;
  }
  .story-index {
    font-size: 11px;
    font-weight: 700;
    color: $color-primary;
    background: rgba($color-primary, 0.08);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .story-title {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.4;
    transition: color 0.2s;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.analysis-input {
  margin-bottom: 12px;
  :deep(.el-textarea__inner) {
    border-radius: $radius-md;
    border: 1.5px solid $border-color;
    resize: none;
    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 2px rgba($color-primary, 0.1);
    }
  }
}

.analysis-btn {
  width: 100%;
  border-radius: $radius-md;
  background: $color-primary;
  border-color: $color-primary;
  font-weight: 600;
  &:hover { background: $color-primary-light; border-color: $color-primary-light; }
}

.result-section {
  margin-top: 14px;
  .result-label {
    font-size: 13px;
    font-weight: 600;
    color: $color-primary;
    margin-bottom: 8px;
  }
}

.result-content {
  min-height: 120px;
  max-height: 240px;
  overflow-y: auto;
  padding: 12px;
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  border-left: 3px solid $color-primary;
  font-size: 13px;
  line-height: 1.7;
  color: $text-primary;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.3); border-radius: 2px; }
  :deep(strong) { color: $color-primary; font-weight: 600; }
}

.placeholder-box {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed $border-color;
  border-radius: $radius-md;
  font-size: 13px;
  color: $text-placeholder;
  text-align: center;
  padding: 16px;
}

.loading-box {
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1.5px solid $border-color;
  border-radius: $radius-md;
  span { font-size: 13px; color: $color-primary; font-weight: 500; }
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba($color-primary, 0.15);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.history-panel .scrollable {
  max-height: 280px;
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.3); border-radius: 2px; }
}

.empty-text {
  text-align: center;
  padding: 30px 0;
  color: $text-placeholder;
  font-size: 13px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  padding: 12px;
  border: 1px solid $border-color;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: $shadow-sm; }
  .hist-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    .hist-time { font-size: 11px; color: $text-placeholder; }
  }
  .hist-q {
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .lbl { font-weight: 600; color: $color-primary; }
  }
  .hist-a {
    font-size: 12px;
    color: $text-primary;
    line-height: 1.5;
    background: $bg-surface;
    padding: 8px;
    border-radius: $radius-sm;
    border-left: 3px solid $color-primary;
    max-height: 100px;
    overflow-y: auto;
    :deep(strong) { color: $color-primary; font-weight: 600; }
  }
}

@media (max-width: 1200px) {
  .ink-wash-hero {
    padding: 44px 32px 52px;
  }

  .hero-content-wrapper {
    gap: 32px;
  }

  .scroll-section .scroll-body {
    padding: 20px 22px;
    min-width: 80px;

    .scroll-icon { font-size: 36px; }
    .scroll-text-vertical span { font-size: 19px; }
  }

  .title-section .main-title .title-main {
    font-size: 38px;
    letter-spacing: 6px;
  }

  .taichi-section .taichi-circle {
    width: 85px;
    height: 85px;

    .taichi-yin, .taichi-yang { width: 42.5px; height: 42.5px; left: 21.25px; }
    .taichi-dot { width: 17px; height: 17px; }
    .dot-yin { top: 12.75px; left: 34px; }
    .dot-yang { bottom: 12.75px; left: 34px; }
  }
}

@media (max-width: 1024px) {
  .page-body {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .prescription-page {
    background: $bg-base;
  }

  .ink-wash-hero {
    padding: 36px 20px 44px;
  }

  .hero-content-wrapper {
    grid-template-columns: 1fr;
    gap: 28px;
    text-align: center;
  }

  // 卷轴区
  .scroll-section {
    display: flex;
    justify-content: center;

    .scroll-container {
      transform: scale(0.9);
    }

    .scroll-body {
      padding: 18px 20px;
      min-width: 75px;

      .scroll-icon { font-size: 32px; }
      .scroll-text-vertical span { font-size: 17px; letter-spacing: 6px; }
    }
  }

  // 标题区
  .title-section {
    .top-ornament,
    .bottom-ornament {
      .ornament-line { width: 50px; }
    }

    .main-title {
      flex-direction: column;
      gap: 6px;

      .title-prefix {
        font-size: 17px;
        letter-spacing: 3px;
      }

      .title-main {
        font-size: 34px;
        letter-spacing: 6px;
      }
    }

    .subtitle {
      font-size: 13px;

      .separator { margin: 0 8px; }
    }

    .data-scrolls {
      justify-content: center;

      .mini-scroll {
        .scroll-content {
          padding: 12px 18px;

          .data-num { font-size: 22px; }
          .data-label { font-size: 10px; }
        }
      }
    }
  }

  // 太极区
  .taichi-section {
    flex-direction: row;
    justify-content: center;
    gap: 16px;

    .taichi-circle {
      width: 70px;
      height: 70px;

      .taichi-yin, .taichi-yang { width: 35px; height: 35px; left: 17.5px; }
      .taichi-dot { width: 14px; height: 14px; }
      .dot-yin { top: 10.5px; left: 28px; }
      .dot-yang { bottom: 10.5px; left: 28px; }
    }

    .ancient-text {
      .text-char { font-size: 15px; }
    }
  }

  // 背景装饰简化
  .ink-bg {
    .mountain-svg { height: 120px; opacity: 0.4; }

    .seal-decoration {
      top: 15px;
      right: 15px;

      .seal {
        width: 38px;
        height: 38px;
        font-size: 19px;

        &.seal-sub {
          width: 30px;
          height: 30px;
          font-size: 15px;
          margin-right: 8px;
          margin-top: -12px;
        }
      }
    }

    .ink-dots .dot { display: none; }
    .brush-strokes .stroke { display: none; }
  }

  .page-body {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
