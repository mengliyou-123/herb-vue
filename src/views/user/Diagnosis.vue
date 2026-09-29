<script setup>
import { ref, onMounted } from "vue";
import { diagnosisStreamService, getDiagnosisHistoryService, deleteHistoryService } from "@/api/ai.js";
import { ElMessage, ElMessageBox } from "element-plus";
import VirtualDoctor from "@/components/VirtualDoctor.vue";
import { formatAiText } from "@/utils/formatAiText.js";

const symptoms = ref("");
const diagnosisResult = ref("");
const loading = ref(false);
const historyList = ref([]);
const historyLoading = ref(false);
const showVirtualDoctor = ref(false);
const activeHistoryId = ref(null);

onMounted(() => {
  loadHistory();
});

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    let result = await getDiagnosisHistoryService();
    historyList.value = (result.data || []).filter(item => item.type === 'diagnosis');
  } catch (error) {
    console.error("加载历史记录失败", error);
  } finally {
    historyLoading.value = false;
  }
};

const formatText = (text) => {
  return formatAiText(text);
};

const startDiagnosis = async () => {
  if (!symptoms.value.trim()) {
    ElMessage.warning("请输入症状描述");
    return;
  }
  loading.value = true;
  diagnosisResult.value = "";
  try {
    await diagnosisStreamService(
      symptoms.value,
      (chunk) => { diagnosisResult.value += chunk; },
      async () => {
        loading.value = false;
        symptoms.value = "";
        await loadHistory();
        ElMessage.success("问诊完成");
      },
      (error) => {
        loading.value = false;
        diagnosisResult.value = "智能问诊失败，请稍后重试";
        ElMessage.error("智能问诊失败");
      }
    );
  } catch (error) {
    loading.value = false;
    diagnosisResult.value = "智能问诊失败，请稍后重试";
    ElMessage.error("智能问诊失败");
  }
};

const deleteHistoryItem = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    });
    await deleteHistoryService(id);
    ElMessage.success("已删除");
    await loadHistory();
  } catch (error) {
    if (error !== 'cancel') ElMessage.error("删除失败");
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${min}`;
};

const quickQuestions = [
  { text: '感冒发热', icon: '🤒' },
  { text: '头痛头晕', icon: '😵' },
  { text: '咳嗽痰多', icon: '😷' },
  { text: '胃痛腹胀', icon: '🤢' },
  { text: '失眠多梦', icon: '😩' },
  { text: '腰膝酸软', icon: '🦴' },
  { text: '食欲不振', icon: '😣' },
  { text: '手脚冰凉', icon: '🥶' },
];

const quickQuestion = (question) => {
  symptoms.value = question;
  startDiagnosis();
};

const viewHistory = (item) => {
  activeHistoryId.value = item.id;
  diagnosisResult.value = item.answer;
  symptoms.value = item.question;
};
</script>

<template>
  <div class="diagnosis-page">
    <!-- 背景装饰层 -->
    <div class="bg-decoration">
      <div class="gradient-orb orb1"></div>
      <div class="gradient-orb orb2"></div>
      <div class="gradient-orb orb3"></div>
      <div class="floating-elements">
        <span class="float-item leaf1">🌿</span>
        <span class="float-item leaf2">🍃</span>
        <span class="float-item yin-yang">☯️</span>
        <span class="float-item herb">🌸</span>
        <span class="float-item pill">💊</span>
      </div>
      <div class="dot-pattern"></div>
    </div>

    <!-- 头部区域 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <span class="icon-main">⚕️</span>
          <div class="icon-ring ring-a"></div>
          <div class="icon-ring ring-b"></div>
        </div>
        <h1 class="page-title">智能问诊</h1>
        <p class="page-subtitle">融合千年中医智慧 · AI 精准辨证论治</p>
        <div class="header-tags">
          <span class="tag"><i>✓</i> 秒级响应</span>
          <span class="tag"><i>✓</i> 专业辨证</span>
          <span class="tag"><i>✓</i> 隐私安全</span>
        </div>
      </div>
    </header>

    <!-- 视频问诊核心亮点 -->
    <section class="video-section">
      <div class="video-card" @click="showVirtualDoctor = true">
        <div class="video-bg-glow"></div>
        <div class="video-inner">
          <div class="video-left">
            <div class="doctor-avatar-wrapper">
              <span class="doctor-avatar">👨‍⚕️</span>
              <div class="avatar-pulse p1"></div>
              <div class="avatar-pulse p2"></div>
              <div class="avatar-pulse p3"></div>
            </div>
          </div>
          <div class="video-center">
            <div class="video-badge">⭐ 核心功能</div>
            <h2 class="video-title">视频问诊</h2>
            <p class="video-desc">与资深老中医面对面交流，实时视频诊断，专业处方开具</p>
            <div class="video-features">
              <div class="feature-card">
                <span class="fc-icon">📹</span>
                <span class="fc-text">实时高清视频</span>
              </div>
              <div class="feature-card">
                <span class="fc-icon">💬</span>
                <span class="fc-text">在线即时咨询</span>
              </div>
              <div class="feature-card">
                <span class="fc-icon">📋</span>
                <span class="fc-text">电子处方开具</span>
              </div>
            </div>
          </div>
          <div class="video-right">
            <button class="cta-button">
              <span class="cta-text">立即体验</span>
              <span class="cta-arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- VirtualDoctor 组件 -->
    <VirtualDoctor :show="showVirtualDoctor" @close="showVirtualDoctor = false" />

    <!-- 主内容区 -->
    <main class="main-layout">
      <!-- 左侧交互区 -->
      <div class="interaction-area">
        <!-- 输入卡片 -->
        <div class="card input-card">
          <div class="card-top">
            <div class="card-label">
              <span class="label-icon">🤖</span>
              <span class="label-text">AI 智能辨证系统</span>
            </div>
            <div class="status-indicator">
              <span class="dot online"></span>
              <span class="status-text">在线服务中</span>
            </div>
          </div>
          <div class="input-section">
            <el-input
              v-model="symptoms"
              type="textarea"
              :rows="4"
              placeholder="请详细描述您的症状，例如：&#10;• 头痛、发热三天，体温38.5°C&#10;• 咳嗽、痰黄稠、咽痛&#10;• 口渴、食欲不振、乏力…&#10;&#10;描述越详细，辨证分析越准确 ✨"
              class="symptom-input"
            />
            <div class="input-bottom">
              <span class="input-hint">
                <span class="hint-icon">💡</span>
                支持自然语言智能识别症状
              </span>
              <button
                @click="startDiagnosis()"
                class="submit-btn"
                :class="{ loading }"
                :disabled="loading || !symptoms.trim()"
              >
                <span v-if="!loading" class="btn-normal">
                  <span class="btn-icon">🔍</span>
                  开始辨证分析
                </span>
                <span v-else class="btn-loading-state">
                  <i class="load-dot d1"></i>
                  <i class="load-dot d2"></i>
                  <i class="load-dot d3"></i>
                  <span>AI 分析中...</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- 快捷症状选择 -->
        <div class="quick-section" v-if="!diagnosisResult && !loading">
          <div class="quick-header">
            <span class="quick-title">常见症状快捷选</span>
            <span class="quick-hint">点击即可开始问诊</span>
          </div>
          <div class="quick-grid">
            <button
              v-for="(q, index) in quickQuestions"
              :key="q.text"
              class="quick-btn"
              :style="{ animationDelay: `${index * 0.05}s` }"
              @click="quickQuestion(q.text)"
            >
              <span class="qb-icon">{{ q.icon }}</span>
              <span class="qb-text">{{ q.text }}</span>
              <span class="qb-arrow">›</span>
            </button>
          </div>
        </div>

        <!-- 结果展示 -->
        <div class="card result-card" v-if="diagnosisResult || loading">
          <div class="card-top">
            <div class="card-label">
              <span class="label-icon">{{ loading ? '⏳' : '✅' }}</span>
              <span class="label-text">{{ loading ? '正在分析中...' : '辨证结果报告' }}</span>
            </div>
            <div class="result-badge" :class="{ analyzing: loading, done: !loading }">
              {{ loading ? '分析中' : '已完成' }}
            </div>
          </div>
          <div class="result-body">
            <div v-if="loading && !diagnosisResult" class="analyzing-ui">
              <div class="thinking-box">
                <div class="brain-container">
                  <span class="brain-icon">🧠</span>
                  <div class="think-waves">
                    <span class="wave w1"></span>
                    <span class="wave w2"></span>
                    <span class="wave w3"></span>
                  </div>
                </div>
                <p class="thinking-msg">AI 正在运用中医理论进行辨证分析...</p>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-track">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">收集症状</span>
                  <span class="step">辨证推理</span>
                  <span class="step">生成报告</span>
                </div>
              </div>
            </div>
            <div v-else class="result-content" v-html="formatText(diagnosisResult)"></div>
          </div>
        </div>

        <!-- 免责声明 -->
        <div class="disclaimer-bar">
          <span class="disclaimer-icon">⚠️</span>
          <div class="disclaimer-body">
            <strong>健康提示：</strong>本系统提供的辨证结果仅供参考学习，不能替代专业医师的面诊。如有严重或持续不适的症状，请及时就医。
          </div>
        </div>
      </div>

      <!-- 右侧边栏 -->
      <aside class="sidebar-panel">
        <!-- 问诊历史 -->
        <div class="panel history-panel">
          <div class="panel-head">
            <h3 class="panel-title">
              <span class="pt-icon">📝</span>
              问诊记录
            </h3>
            <button class="refresh-btn" @click="loadHistory" :class="{ spinning: historyLoading }">↻</button>
          </div>
          <div class="panel-body">
            <div v-if="historyLoading" class="skeleton-loader">
              <div class="sk-line" v-for="i in 3" :key="i"></div>
            </div>
            <div v-else-if="historyList.length === 0" class="empty-panel">
              <span class="empty-icon">📋</span>
              <p>暂无问诊记录</p>
              <small>开始您的第一次智能问诊吧！</small>
            </div>
            <div v-else class="history-items">
              <div
                v-for="item in historyList"
                :key="item.id"
                class="hist-item"
                :class="{ active: activeHistoryId === item.id }"
                @click="viewHistory(item)"
              >
                <div class="hist-meta">
                  <span class="hist-time">{{ formatTime(item.createTime) }}</span>
                  <button class="hist-delete" @click.stop="deleteHistoryItem(item.id)">✕</button>
                </div>
                <p class="hist-question">{{ item.question }}</p>
                <div class="hist-preview">{{ item.answer?.substring(0, 60) }}...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 养生建议 -->
        <div class="panel tips-panel">
          <div class="panel-head tips-head">
            <h3 class="panel-title">
              <span class="pt-icon">💡</span>
              中医养生建议
            </h3>
          </div>
          <div class="panel-body tips-body">
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #D1FAE5, #A7F3D0);">
                <span>🌿</span>
              </div>
              <div class="tip-info">
                <strong>顺时而养</strong>
                <small>根据四季变化调整作息饮食</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #FEF3C7, #FDE68A);">
                <span>🍵</span>
              </div>
              <div class="tip-info">
                <strong>食疗调理</strong>
                <small>药补不如食补，温和滋养</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #DBEAFE, #BFDBFE);">
                <span>🧘</span>
              </div>
              <div class="tip-info">
                <strong>动静结合</strong>
                <small>适度运动，气血通畅</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #FCE7F3, #FBCFE8);">
                <span>😴</span>
              </div>
              <div class="tip-info">
                <strong>起居有常</strong>
                <small>规律作息，不熬夜伤身</small>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style lang="scss" scoped>
// ==================== 配色变量 ====================
$bg-base: #FAFBFD;
$bg-warm: #FFF9F0;
$bg-mint: #F0FDF4;
$card-bg: #FFFFFF;
$primary: #10B981;
$primary-light: #D1FAE5;
$primary-dark: #059669;
$secondary: #06B6D4;
$secondary-light: #CFFAFE;
$accent-red: #F43F5E;
$accent-red-light: #FFE4E6;
$text-dark: #1E293B;
$text-medium: #475569;
$text-light: #94A3B8;
$border-light: rgba(0, 0, 0, 0.06);
$border-medium: rgba(0, 0, 0, 0.1);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03);
$shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);

.diagnosis-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-mint 0%, $bg-base 30%, $bg-warm 70%, $bg-base 100%);
  position: relative;
  overflow-x: hidden;
}

// ==================== 动画定义 ====================
@keyframes floatSlow {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(8deg); }
}

@keyframes floatMedium {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(15px, -15px); }
  66% { transform: translate(-10px, 10px); }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0; }
}

@keyframes glowBreath {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

@keyframes arrowMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(5px); }
}

@keyframes dotJump {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}

@keyframes brainPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}

@keyframes waveExpand {
  0% { transform: scale(0.8); opacity: 0.7; }
  100% { transform: scale(2.5); opacity: 0; }
}

@keyframes progressGrow {
  from { width: 0%; }
  to { width: 65%; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmerLoad {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spinRefresh {
  to { transform: rotate(360deg); }
}

@keyframes tagPop {
  0% { transform: scale(0.9); opacity: 0; }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
}

// ==================== 背景装饰 ====================
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;

  .gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.35;

    &.orb1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
      top: -150px;
      right: -100px;
      animation: floatSlow 20s ease-in-out infinite;
    }

    &.orb2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%);
      bottom: -120px;
      left: -80px;
      animation: floatMedium 25s ease-in-out infinite reverse;
    }

    &.orb3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%);
      top: 40%;
      left: 45%;
      animation: glowBreath 15s ease-in-out infinite;
    }
  }

  .floating-elements {
    .float-item {
      position: absolute;
      font-size: 24px;
      opacity: 0.18;
      filter: blur(0.5px);
      animation: floatSlow 12s ease-in-out infinite;

      &.leaf1 { top: 15%; left: 8%; font-size: 28px; animation-delay: 0s; }
      &.leaf2 { top: 60%; right: 10%; font-size: 22px; animation-delay: 3s; }
      &.yin-yang { top: 25%; right: 18%; font-size: 26px; animation-delay: 5s; animation-duration: 18s; }
      &.herb { bottom: 25%; left: 15%; font-size: 20px; animation-delay: 2s; }
      &.pill { top: 55%; left: 6%; font-size: 18px; animation-delay: 7s; }
    }
  }

  .dot-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
    background-size: 32px 32px;
    opacity: 0.5;
  }
}

// ==================== 头部 ====================
.page-header {
  position: relative;
  z-index: 1;
  padding: 52px 40px 36px;
  text-align: center;

  .header-content {
    max-width: 700px;
    margin: 0 auto;
  }

  .header-icon {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;

    .icon-main {
      font-size: 48px;
      display: block;
      filter: drop-shadow(0 4px 12px rgba(16, 185, 129, 0.25));
    }

    .icon-ring {
      position: absolute;
      border-radius: 50%;
      border: 2px solid rgba(16, 185, 129, 0.3);

      &.ring-a {
        inset: -14px;
        animation: pulseRing 3s ease-out infinite;
      }

      &.ring-b {
        inset: -26px;
        animation: pulseRing 3s ease-out infinite 0.8s;
      }
    }
  }

  .page-title {
    font-size: 38px;
    font-weight: 700;
    color: $text-dark;
    margin: 0 0 12px;
    letter-spacing: 3px;
  }

  .page-subtitle {
    font-size: 15px;
    color: $text-medium;
    margin: 0 0 24px;
    letter-spacing: 1.5px;
    font-weight: 400;
  }

  .header-tags {
    display: flex;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;

    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      background: $primary-light;
      color: $primary-dark;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      animation: tagPop 0.5s ease-out backwards;

      i {
        font-style: normal;
        font-weight: 700;
      }

      &:nth-child(2) {
        background: $secondary-light;
        color: #0891B2;
        animation-delay: 0.1s;
      }

      &:nth-child(3) {
        background: $accent-red-light;
        color: #BE123C;
        animation-delay: 0.2s;
      }
    }
  }
}

// ==================== 视频问诊卡片 ====================
.video-section {
  position: relative;
  z-index: 1;
  padding: 0 40px 32px;
}

.video-card {
  position: relative;
  background: linear-gradient(135deg, #DC2626 0%, #EF4444 40%, #F87171 70%, #FCA5A5 100%);
  border-radius: 24px;
  padding: 36px 44px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    $shadow-lg,
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;

  &:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow:
      0 24px 48px rgba(220, 38, 38, 0.3),
      0 0 0 2px rgba(255, 255, 255, 0.2) inset;

    .video-bg-glow { opacity: 1; }
    .cta-arrow { transform: translateX(6px); }
    .doctor-avatar-wrapper .avatar-pulse { animation-duration: 1.5s; }
  }

  .video-bg-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
    animation: glowBreath 4s ease-in-out infinite;
    opacity: 0.6;
    transition: opacity 0.4s;
  }

  .video-inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 36px;
    align-items: center;
  }

  .video-left {
    .doctor-avatar-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .doctor-avatar {
        font-size: 64px;
        display: block;
        filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.25));
        position: relative;
        z-index: 2;
      }

      .avatar-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.4);

        &.p1 {
          width: 90px;
          height: 90px;
          animation: pulseRing 2.5s ease-out infinite;
        }

        &.p2 {
          width: 120px;
          height: 120px;
          animation: pulseRing 2.5s ease-out infinite 0.5s;
        }

        &.p3 {
          width: 150px;
          height: 150px;
          animation: pulseRing 2.5s ease-out infinite 1s;
        }
      }
    }
  }

  .video-center {
    .video-badge {
      display: inline-block;
      padding: 5px 16px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: white;
      margin-bottom: 14px;
      letter-spacing: 0.5px;
    }

    .video-title {
      font-size: 30px;
      font-weight: 800;
      color: white;
      margin: 0 0 8px;
      letter-spacing: 2px;
    }

    .video-desc {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.88);
      margin: 0 0 18px;
      line-height: 1.5;
    }

    .video-features {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;

      .feature-card {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.15);
        backdrop-filter: blur(8px);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.12);

        .fc-icon { font-size: 16px; }
        .fc-text {
          font-size: 13px;
          font-weight: 600;
          color: white;
        }
      }
    }
  }

  .video-right {
    .cta-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 18px 28px;
      background: white;
      border: none;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .cta-text {
        font-size: 14px;
        font-weight: 700;
        color: #DC2626;
        letter-spacing: 1px;
      }

      .cta-arrow {
        font-size: 24px;
        color: #DC2626;
        font-weight: 700;
        transition: transform 0.3s;
        animation: arrowMove 1.5s ease-in-out infinite;
      }
    }
  }
}

// ==================== 主布局 ====================
.main-layout {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 24px;
  padding: 0 40px 56px;
  max-width: 1440px;
  margin: 0 auto;
}

.interaction-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-panel {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ==================== 通用卡片 ====================
.card {
  background: $card-bg;
  border-radius: 20px;
  border: 1px solid $border-light;
  overflow: hidden;
  transition: all 0.35s ease;
  box-shadow: $shadow-sm;

  &:hover {
    box-shadow: $shadow-md;
    border-color: $border-medium;
    transform: translateY(-2px);
  }

  .card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.04), rgba(6, 182, 212, 0.02));
    border-bottom: 1px solid $border-light;
  }

  .card-label {
    display: flex;
    align-items: center;
    gap: 10px;

    .label-icon { font-size: 19px; }
    .label-text {
      font-size: 15px;
      font-weight: 700;
      color: $primary-dark;
    }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    color: $primary;

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $primary;
      animation: dotJump 1.6s ease-in-out infinite;

      &.online { background: $primary; }
    }

    .status-text { font-weight: 600; }
  }

  .result-badge {
    padding: 5px 14px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 700;

    &.analyzing {
      background: rgba(245, 158, 11, 0.1);
      color: #D97706;
    }

    &.done {
      background: $primary-light;
      color: $primary-dark;
    }
  }
}

// ==================== 输入卡片 ====================
.input-card {
  .input-section {
    padding: 22px 24px;
  }

  .symptom-input {
    :deep(.el-textarea__inner) {
      background: #FAFBFC;
      border: 2px solid $border-medium;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.85;
      color: $text-dark;
      resize: none;
      padding: 16px;
      transition: all 0.3s ease;

      &:focus {
        border-color: $primary;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.12), 0 4px 16px rgba(16, 185, 129, 0.08);
        background: white;
      }

      &::placeholder {
        color: $text-light;
      }
    }
  }

  .input-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 18px;
    gap: 16px;
  }

  .input-hint {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: $text-light;

    .hint-icon { font-size: 16px; }
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 36px;
    background: linear-gradient(135deg, $primary, $secondary);
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(16, 185, 129, 0.4);
      background: linear-gradient(135deg, $primary-dark, $primary);
    }

    &:active:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      box-shadow: none;
    }

    &.loading {
      background: linear-gradient(135deg, #0891B2, #06B6D4);
    }

    .btn-icon { font-size: 18px; }

    .btn-loading-state {
      display: flex;
      align-items: center;
      gap: 6px;

      .load-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: white;
        animation: dotJump 1.4s ease-in-out infinite;

        &.d1 { animation-delay: 0s; }
        &.d2 { animation-delay: 0.15s; }
        &.d3 { animation-delay: 0.3s; }
      }

      span { font-size: 14px; }
    }
  }
}

// ==================== 快捷症状 ====================
.quick-section {
  background: $card-bg;
  border-radius: 20px;
  border: 1px solid $border-light;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: all 0.35s ease;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
  }

  .quick-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: linear-gradient(135deg, rgba(6, 182, 212, 0.04), transparent);
    border-bottom: 1px solid $border-light;

    .quick-title {
      font-size: 15px;
      font-weight: 700;
      color: $text-dark;
    }

    .quick-hint {
      font-size: 12px;
      color: $text-light;
    }
  }

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    padding: 18px 24px;
  }

  .quick-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: linear-gradient(135deg, #F0FDF4, #ECFDF5);
    border: 1.5px solid rgba(16, 185, 129, 0.15);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13px;
    color: $text-medium;
    font-weight: 500;
    animation: tagPop 0.4s ease-out backwards;

    .qb-icon { font-size: 19px; flex-shrink: 0; }
    .qb-text { flex: 1; }
    .qb-arrow {
      font-size: 16px;
      color: $text-light;
      opacity: 0;
      transform: translateX(-5px);
      transition: all 0.3s;
    }

    &:hover {
      background: linear-gradient(135deg, $primary, $secondary);
      color: white;
      border-color: transparent;
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);

      .qb-arrow {
        opacity: 1;
        transform: translateX(0);
        color: white;
      }
    }

    &:active {
      transform: translateY(-2px);
    }
  }
}

// ==================== 结果卡片 ====================
.result-card {
  animation: fadeInUp 0.5s ease-out;

  .result-body {
    padding: 22px 24px;
  }

  .analyzing-ui {
    .thinking-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 36px 0;

      .brain-container {
        position: relative;

        .brain-icon {
          font-size: 52px;
          display: block;
          animation: brainPulse 2.5s ease-in-out infinite;
        }

        .think-waves {
          position: absolute;
          inset: -20px;

          .wave {
            position: absolute;
            border-radius: 50%;
            border: 2px solid rgba(16, 185, 129, 0.3);

            &.w1 { inset: 0; animation: waveExpand 2.2s ease-out infinite; }
            &.w2 { inset: 10px; animation: waveExpand 2.2s ease-out infinite 0.4s; }
            &.w3 { inset: 20px; animation: waveExpand 2.2s ease-out infinite 0.8s; }
          }
        }
      }

      .thinking-msg {
        font-size: 14px;
        color: $text-medium;
        margin: 0;
      }
    }

    .progress-bar-wrap {
      margin-top: 28px;

      .progress-track {
        height: 8px;
        background: rgba(16, 185, 129, 0.1);
        border-radius: 4px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, $primary, $secondary);
          border-radius: 4px;
          animation: progressGrow 3s ease-in-out forwards;
        }
      }

      .progress-steps {
        display: flex;
        justify-content: space-between;
        margin-top: 14px;
        padding: 0 4px;

        .step {
          font-size: 12px;
          color: $text-light;
          font-weight: 500;

          &.active {
            color: $primary-dark;
            font-weight: 700;
          }
        }
      }
    }
  }

  .result-content {
    background: linear-gradient(135deg, $primary-light, rgba(207, 250, 254, 0.3));
    border-left: 4px solid $primary;
    border-radius: 0 14px 14px 0;
    padding: 22px;
    font-size: 14px;
    line-height: 1.95;
    color: $text-dark;
    max-height: 480px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 5px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 3px; }

    :deep(strong) {
      color: $primary-dark;
      font-weight: 700;
      padding: 0 3px;
    }

    :deep(.ai-line) { margin: 5px 0; }
    :deep(.ai-spacer) { height: 9px; }

    :deep(.ai-section-title) {
      margin: 16px 0 8px;
      padding: 8px 12px;
      border-left: 3px solid $primary;
      border-radius: 6px 10px 10px 6px;
      background: rgba(16, 185, 129, 0.09);
      color: $primary-dark;
      font-size: 15px;
      font-weight: 800;
      line-height: 1.55;
    }

    :deep(.ai-section-title:first-child) { margin-top: 0; }
    :deep(.ai-label) { color: #0F766E; font-weight: 750; }
    :deep(.ai-emphasis) { color: #047857; font-weight: 750; }

    :deep(.ai-list-item),
    :deep(.ai-numbered) {
      display: flex;
      align-items: flex-start;
      gap: 9px;
    }

    :deep(.ai-bullet) {
      color: $primary;
      font-size: 18px;
      font-weight: 900;
      line-height: 1.45;
    }

    :deep(.ai-number) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 23px;
      height: 23px;
      margin-top: 2px;
      border-radius: 7px;
      background: rgba(16, 185, 129, 0.14);
      color: #047857;
      font-size: 12px;
      font-weight: 800;
    }

    :deep(.ai-advice) {
      padding: 6px 10px;
      border-left: 2px solid rgba(16, 185, 129, 0.45);
      background: rgba(255, 255, 255, 0.48);
      border-radius: 0 8px 8px 0;
    }

    :deep(.ai-warning) {
      padding: 8px 11px;
      border: 1px solid rgba(245, 158, 11, 0.22);
      border-left: 3px solid #F59E0B;
      border-radius: 8px;
      background: rgba(255, 247, 237, 0.82);
      color: #9A3412;
    }

    :deep(.ai-warning-title) {
      border-left-color: #F59E0B;
      background: rgba(255, 247, 237, 0.9);
      color: #B45309;
    }
  }
}

// ==================== 免责声明 ====================
.disclaimer-bar {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), rgba(251, 191, 36, 0.02));
  border: 1.5px solid rgba(245, 158, 11, 0.15);
  border-radius: 16px;

  .disclaimer-icon { font-size: 20px; flex-shrink: 0; }

  .disclaimer-body {
    font-size: 13px;
    color: $text-medium;
    line-height: 1.7;
    margin: 0;

    strong { color: #D97706; }
  }
}

// ==================== 侧边栏面板 ====================
.panel {
  background: $card-bg;
  border-radius: 20px;
  border: 1px solid $border-light;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: all 0.35s ease;

  &:hover {
    box-shadow: $shadow-md;
  }

  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 17px 20px;
    background: linear-gradient(135deg, $primary, $secondary);
    border-bottom: 1px solid $border-light;

    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 700;
      color: white;
      margin: 0;

      .pt-icon { font-size: 17px; }
    }

    .refresh-btn {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      cursor: pointer;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.35);
        transform: rotate(180deg);
      }

      &.spinning {
        animation: spinRefresh 0.8s linear infinite;
      }
    }
  }

  .tips-head {
    background: linear-gradient(135deg, #059669, $primary);
  }

  .panel-body {
    padding: 14px;
    max-height: calc(100vh - 420px);
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 2px; }
  }
}

// ==================== 历史记录面板 ====================
.history-panel {
  .skeleton-loader {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;

    .sk-line {
      height: 82px;
      background: linear-gradient(90deg,
        rgba(16, 185, 129, 0.06) 25%,
        rgba(16, 185, 129, 0.12) 50%,
        rgba(16, 185, 129, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: shimmerLoad 1.5s infinite;
      border-radius: 12px;
    }
  }

  .empty-panel {
    text-align: center;
    padding: 40px 16px;

    .empty-icon {
      font-size: 42px;
      display: block;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
      color: $text-medium;
      margin: 0 0 6px;
      font-weight: 500;
    }

    small {
      font-size: 12px;
      color: $text-light;
    }
  }

  .history-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hist-item {
    padding: 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, $primary-light, rgba(207, 250, 254, 0.2));
      border-color: rgba(16, 185, 129, 0.25);
      transform: translateX(4px);
      box-shadow: $shadow-sm;
    }

    &.active {
      background: linear-gradient(135deg, $primary-light, rgba(207, 250, 254, 0.3));
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .hist-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .hist-time {
        font-size: 11px;
        color: $text-light;
        font-variant-numeric: tabular-nums;
        font-weight: 500;
      }

      .hist-delete {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: transparent;
        border: none;
        color: $text-light;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: all 0.25s;

        .hist-item:hover & { opacity: 1; }

        &:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
        }
      }
    }

    .hist-question {
      font-size: 13px;
      font-weight: 600;
      color: $text-dark;
      margin: 0 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .hist-preview {
      font-size: 12px;
      color: $text-light;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

// ==================== 养生建议面板 ====================
.tips-panel {
  .tips-body {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
  }

  .tip-entry {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px;
    background: #FAFBFC;
    border-radius: 14px;
    border: 1px solid $border-light;
    transition: all 0.3s ease;

    &:hover {
      background: white;
      border-color: $border-medium;
      transform: translateX(4px);
      box-shadow: $shadow-sm;
    }

    .tip-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 22px;
    }

    .tip-info {
      strong {
        display: block;
        font-size: 13px;
        color: $text-dark;
        font-weight: 700;
        margin-bottom: 3px;
      }

      small {
        font-size: 11px;
        color: $text-light;
      }
    }
  }
}

// ==================== 响应式设计 ====================
@media (max-width: 1280px) {
  .sidebar-panel { width: 320px; }
  .video-card { padding: 30px 36px; }
  .quick-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 1024px) {
  .main-layout { flex-direction: column; }
  .sidebar-panel { width: 100%; }
}

@media (max-width: 768px) {
  .diagnosis-page { background: linear-gradient(180deg, $bg-mint 0%, $bg-base 50%); }

  .bg-decoration {
    .gradient-orb { opacity: 0.2; }
    .float-item { display: none; }
    .dot-pattern { opacity: 0.3; }
  }

  .page-header {
    padding: 36px 20px 28px;

    .header-icon .icon-main { font-size: 38px; }
    .page-title { font-size: 30px; letter-spacing: 2px; }
    .page-subtitle { font-size: 13px; }
    .header-tags { gap: 10px; .tag { font-size: 12px; padding: 6px 12px; } }
  }

  .video-section { padding: 0 20px 24px; }

  .video-card {
    padding: 26px 20px;
    border-radius: 20px;

    .video-inner {
      grid-template-columns: 1fr;
      gap: 24px;
      text-align: center;
    }

    .video-center {
      .video-features { justify-content: center; flex-wrap: wrap; }
    }

    .video-right {
      .cta-button {
        flex-direction: row;
        padding: 14px 32px;
      }
    }
  }

  .main-layout { padding: 0 20px 40px; }

  .quick-grid { grid-template-columns: repeat(2, 1fr); }

  .result-card .result-body .result-content { max-height: 350px; }

  .input-card .input-bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .submit-btn { width: 100%; }
  }
}
</style>
