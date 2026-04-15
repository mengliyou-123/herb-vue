<script setup>
import { ref, onMounted } from "vue";
import { diagnosisStreamService, getDiagnosisHistoryService, deleteHistoryService } from "@/api/ai.js";
import { ElMessage, ElMessageBox } from "element-plus";
import VirtualDoctor from "@/components/VirtualDoctor.vue";

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
  if (!text) return '';
  let s = String(text);
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  s = s.replace(/^(\d+)\.\s+/gm, '<strong>$1.</strong> ');
  s = s.replace(/^-\s+/gm, '• ');
  s = s.replace(/\n+/g, '<br>');
  return s;
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
  { text: '疲劳乏力', icon: '😫' },
  { text: '口干舌燥', icon: '🏜️' },
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
  <div class="diag-page">
    <!-- 顶部 -->
    <header class="diag-hero">
      <div class="hero-bg">
        <div class="hero-ink ink-1"></div>
        <div class="hero-ink ink-2"></div>
        <div class="hero-ink ink-3"></div>
      </div>
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-badge">AI 智能辨证</div>
          <h1 class="hero-title">智能问诊</h1>
          <p class="hero-desc">基于中医辨证论治体系，AI 辅助分析症状，提供个性化健康参考</p>
        </div>
        <button class="hero-video-btn" @click="showVirtualDoctor = true">
          <div class="video-btn-glow"></div>
          <span class="video-btn-icon">👨‍⚕️</span>
          <div class="video-btn-text">
            <span class="video-btn-title">视频问诊</span>
            <span class="video-btn-sub">与老中医面对面</span>
          </div>
          <span class="video-btn-arrow">→</span>
        </button>
      </div>
    </header>

    <VirtualDoctor :show="showVirtualDoctor" @close="showVirtualDoctor = false" />

    <!-- 主体 -->
    <div class="diag-body">
      <!-- 左侧主区域 -->
      <div class="diag-main">
        <!-- 输入区 -->
        <div class="diag-card input-section">
          <div class="section-label">
            <span class="label-dot"></span>
            <span>描述您的症状</span>
          </div>
          <el-input
            v-model="symptoms"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您的症状，如：头痛、发热、咳嗽、痰黄稠、口渴、咽痛…"
            class="sym-input"
          />
          <div class="input-footer">
            <span class="input-hint">💡 描述越详细，辨证越准确</span>
            <el-button
              @click="startDiagnosis()"
              type="primary"
              class="diag-btn"
              :loading="loading"
              :disabled="loading || !symptoms.trim()"
            >
              <template #loading>
                <span class="btn-loading-dot"></span>
                辨证分析中
              </template>
              {{ loading ? '' : '开始辨证' }}
            </el-button>
          </div>
        </div>

        <!-- 快捷提问 -->
        <div class="diag-card quick-section" v-if="!diagnosisResult && !loading">
          <div class="section-label">
            <span class="label-dot"></span>
            <span>常见症状</span>
          </div>
          <div class="quick-grid">
            <button
              v-for="q in quickQuestions"
              :key="q.text"
              class="quick-item"
              @click="quickQuestion(q.text)"
            >
              <span class="quick-icon">{{ q.icon }}</span>
              <span class="quick-text">{{ q.text }}</span>
            </button>
          </div>
        </div>

        <!-- 结果区 -->
        <div class="diag-card result-section" v-if="diagnosisResult || loading">
          <div class="section-label">
            <span class="label-dot" :class="{ active: !loading }"></span>
            <span>辨证结果</span>
            <span v-if="loading" class="result-status analyzing">
              <span class="status-dot"></span>分析中
            </span>
            <span v-else class="result-status done">✓ 已完成</span>
          </div>

          <div v-if="loading && !diagnosisResult" class="loading-area">
            <div class="loading-anim">
              <svg class="loading-svg" viewBox="0 0 50 50">
                <circle class="loading-path" cx="25" cy="25" r="20" fill="none" stroke-width="3" />
              </svg>
            </div>
            <p class="loading-label">AI 正在辨证分析…</p>
          </div>

          <div v-else class="result-body" v-html="formatText(diagnosisResult)"></div>
        </div>

        <!-- 免责 -->
        <div class="diag-disclaimer">
          <span>⚠️</span>
          <p>本系统提供的辨证结果仅供参考，不能替代专业医师诊断。如有严重症状，请及时就医。</p>
        </div>
      </div>

      <!-- 右侧历史 -->
      <aside class="diag-aside">
        <div class="aside-inner">
          <div class="aside-head">
            <h3>问诊记录</h3>
            <button class="aside-refresh" @click="loadHistory" :class="{ spinning: historyLoading }">↻</button>
          </div>

          <div class="aside-body">
            <el-skeleton v-if="historyLoading" :rows="3" animated />
            <div v-else-if="historyList.length === 0" class="aside-empty">
              <span class="empty-icon">📋</span>
              <span>暂无记录</span>
            </div>
            <div v-else class="history-list">
              <div
                v-for="item in historyList"
                :key="item.id"
                class="hist-card"
                :class="{ active: activeHistoryId === item.id }"
                @click="viewHistory(item)"
              >
                <div class="hist-head">
                  <span class="hist-time">{{ formatTime(item.createTime) }}</span>
                  <button class="hist-del" @click.stop="deleteHistoryItem(item.id)">✕</button>
                </div>
                <div class="hist-question">{{ item.question }}</div>
                <div class="hist-preview">{{ item.answer?.substring(0, 60) }}…</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.diag-page {
  min-height: 100%;
  background: $bg-base;
}

/* ====== Hero ====== */
.diag-hero {
  position: relative;
  background: $color-primary-gradient;
  padding: 36px 40px;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-ink {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
  background: #fff;
}

.ink-1 { width: 300px; height: 300px; top: -120px; right: -60px; }
.ink-2 { width: 200px; height: 200px; bottom: -80px; left: 10%; }
.ink-3 { width: 120px; height: 120px; top: 20px; right: 30%; opacity: 0.04; }

.hero-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.hero-left {
  .hero-badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 20px;
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.9);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    margin-bottom: 12px;
    backdrop-filter: blur(4px);
  }

  .hero-title {
    color: #fff;
    font-size: 32px;
    font-weight: 800;
    margin: 0 0 8px;
    letter-spacing: 3px;
  }

  .hero-desc {
    color: rgba(255,255,255,0.7);
    font-size: 14px;
    margin: 0;
    letter-spacing: 0.5px;
  }
}

.hero-video-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  padding: 14px 24px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
  overflow: hidden;

  .video-btn-glow {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(193,68,67,0.3), rgba(232,90,89,0.15));
    opacity: 0;
    transition: opacity 0.35s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(193,68,67,0.3);
    border-color: rgba(255,255,255,0.35);

    .video-btn-glow { opacity: 1; }
    .video-btn-arrow { transform: translateX(4px); }
  }

  .video-btn-icon {
    font-size: 32px;
    position: relative;
    z-index: 1;
  }

  .video-btn-text {
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 1;

    .video-btn-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .video-btn-sub {
      font-size: 11px;
      opacity: 0.75;
      margin-top: 2px;
    }
  }

  .video-btn-arrow {
    font-size: 20px;
    position: relative;
    z-index: 1;
    transition: transform 0.3s;
    opacity: 0.7;
  }
}

/* ====== Body ====== */
.diag-body {
  display: flex;
  gap: 24px;
  padding: 28px;
  max-width: 1400px;
  margin: 0 auto;
}

.diag-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ====== Card ====== */
.diag-card {
  background: $bg-surface;
  border-radius: 16px;
  padding: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  transition: box-shadow 0.3s;

  &:hover {
    box-shadow: $shadow-md;
  }
}

.section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 16px;

  .label-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $color-primary;
    transition: all 0.3s;

    &.active {
      background: $color-success;
      box-shadow: 0 0 8px rgba($color-success, 0.4);
    }
  }
}

/* ====== Input ====== */
.sym-input {
  :deep(.el-textarea__inner) {
    border-radius: 12px;
    border: 1.5px solid $border-color;
    font-size: 14px;
    line-height: 1.7;
    resize: none;
    background: $bg-warm;
    padding: 14px 16px;
    transition: all 0.3s;

    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.08);
      background: #fff;
    }

    &::placeholder {
      color: $text-placeholder;
    }
  }
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;

  .input-hint {
    font-size: 12px;
    color: $text-muted;
  }
}

.diag-btn {
  height: 42px;
  padding: 0 32px;
  border-radius: 10px;
  background: $color-primary;
  border-color: $color-primary;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover:not(:disabled) {
    background: $color-primary-light;
    border-color: $color-primary-light;
    transform: translateY(-1px);
    box-shadow: $shadow-md;
  }

  &:disabled {
    opacity: 0.5;
  }
}

.btn-loading-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  margin-right: 8px;
  animation: dot-pulse 1.2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ====== Quick ====== */
.quick-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  background: $bg-warm;
  border: 1px solid $border-light;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 13px;
  color: $text-secondary;

  .quick-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .quick-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background: $color-primary;
    color: #fff;
    border-color: $color-primary;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($color-primary, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

/* ====== Result ====== */
.result-status {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 5px;

  &.analyzing {
    background: rgba($color-accent, 0.06);
    color: $color-accent;

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $color-accent;
      animation: dot-pulse 1.2s ease-in-out infinite;
    }
  }

  &.done {
    background: rgba($color-success, 0.06);
    color: $color-success;
  }
}

.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
}

.loading-svg {
  width: 48px;
  height: 48px;
  animation: loading-rotate 1.4s linear infinite;
}

.loading-path {
  stroke: $color-primary;
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: loading-dash 1.4s ease-in-out infinite;
}

@keyframes loading-rotate {
  100% { transform: rotate(360deg); }
}

@keyframes loading-dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

.loading-label {
  margin-top: 18px;
  font-size: 13px;
  color: $text-muted;
  letter-spacing: 0.5px;
}

.result-body {
  padding: 20px;
  background: $bg-warm;
  border-radius: 12px;
  border-left: 3px solid $color-primary;
  font-size: 14px;
  line-height: 1.85;
  color: $text-primary;
  max-height: 480px;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.2); border-radius: 2px; }

  :deep(strong) {
    color: $color-primary;
    font-weight: 700;
  }
}

/* ====== Disclaimer ====== */
.diag-disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: rgba($color-accent, 0.03);
  border: 1px solid rgba($color-accent, 0.1);
  border-radius: 10px;

  span {
    font-size: 14px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  p {
    font-size: 12px;
    color: $text-muted;
    line-height: 1.6;
    margin: 0;
  }
}

/* ====== Aside ====== */
.diag-aside {
  width: 340px;
  flex-shrink: 0;
}

.aside-inner {
  background: $bg-surface;
  border-radius: 16px;
  border: 1px solid $border-light;
  box-shadow: $shadow-sm;
  overflow: hidden;
  position: sticky;
  top: 24px;
}

.aside-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid $border-light;

  h3 {
    font-size: 15px;
    font-weight: 700;
    color: $text-primary;
    margin: 0;
    letter-spacing: 0.5px;
  }
}

.aside-refresh {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: $bg-warm;
  border: 1px solid $border-light;
  cursor: pointer;
  font-size: 14px;
  color: $text-muted;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &:hover {
    background: $color-primary;
    color: #fff;
    border-color: $color-primary;
  }

  &.spinning {
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.aside-body {
  padding: 12px;
  max-height: calc(100vh - 240px);
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.15); border-radius: 2px; }
}

.aside-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;
  color: $text-placeholder;
  font-size: 13px;

  .empty-icon { font-size: 28px; opacity: 0.6; }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hist-card {
  padding: 12px 14px;
  border-radius: 10px;
  background: $bg-warm;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    border-color: $border-color;
    box-shadow: $shadow-sm;
  }

  &.active {
    border-color: $color-primary;
    background: rgba($color-primary, 0.04);
  }
}

.hist-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.hist-time {
  font-size: 11px;
  color: $text-placeholder;
  font-variant-numeric: tabular-nums;
}

.hist-del {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 10px;
  color: $text-placeholder;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;

  .hist-card:hover & {
    opacity: 1;
  }

  &:hover {
    background: rgba($color-accent, 0.1);
    color: $color-accent;
  }
}

.hist-question {
  font-size: 13px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hist-preview {
  font-size: 12px;
  color: $text-muted;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ====== Responsive ====== */
@media (max-width: 900px) {
  .diag-hero { padding: 24px 20px; }

  .hero-inner { flex-direction: column; gap: 16px; align-items: flex-start; }

  .hero-video-btn { align-self: stretch; justify-content: center; }

  .diag-body { flex-direction: column; padding: 16px; }

  .diag-aside { width: 100%; }

  .aside-inner { position: static; }

  .quick-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 480px) {
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
