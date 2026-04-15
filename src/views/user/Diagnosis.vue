<script setup>
import { ref, onMounted } from "vue";
import { diagnosisStreamService, getDiagnosisHistoryService, deleteHistoryService } from "@/api/ai.js";
import { ElMessage, ElMessageBox } from "element-plus";

const symptoms = ref("");
const diagnosisResult = ref("");
const loading = ref(false);
const historyList = ref([]);
const historyLoading = ref(false);

onMounted(() => {
  loadHistory();
});

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    let result = await getDiagnosisHistoryService();
    historyList.value = result.data || [];
    historyList.value = historyList.value.filter(item => item.type === 'diagnosis');
  } catch (error) {
    console.error("加载历史记录失败", error);
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
      (chunk) => {
        diagnosisResult.value += chunk;
      },
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
        console.error(error);
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
    await ElMessageBox.confirm('确定要删除这条问诊记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteHistoryService(id);
    ElMessage.success("删除成功");
    await loadHistory();
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

const quickQuestions = [
  '感冒发热', '头痛头晕', '咳嗽痰多', '胃痛腹胀',
  '失眠多梦', '腰膝酸软', '食欲不振', '便秘腹泻',
  '手脚冰凉', '口干舌燥', '疲劳乏力', '皮肤过敏'
];

const quickQuestion = (question) => {
  symptoms.value = question;
  startDiagnosis();
};
</script>

<template>
  <div class="diagnosis-page">
    <div class="page-header">
      <div class="header-content">
        <span class="header-icon">🏥</span>
        <div class="header-text">
          <h1>智能问诊</h1>
          <p>AI 辅助中医辨证，为您提供健康参考建议</p>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="main-area">
        <div class="input-card">
          <div class="card-title-bar">
            <span class="title-icon">✍️</span>
            <span>症状描述</span>
          </div>
          <el-input
            v-model="symptoms"
            type="textarea"
            :rows="5"
            placeholder="请详细描述您的症状，例如：头痛、发热、咳嗽、痰黄稠、口渴、咽痛等"
            class="symptoms-input"
          />
          <el-button
            @click="startDiagnosis()"
            type="primary"
            class="diagnose-btn"
            :loading="loading"
            :disabled="loading"
          >
            <template #loading>问诊中...</template>
            {{ loading ? '' : '开始问诊' }}
          </el-button>
        </div>

        <div class="quick-card" v-if="!diagnosisResult && !loading">
          <div class="card-title-bar">
            <span class="title-icon">⚡</span>
            <span>常见症状快速提问</span>
          </div>
          <div class="quick-tags">
            <span
              v-for="q in quickQuestions"
              :key="q"
              class="quick-tag"
              @click="quickQuestion(q)"
            >{{ q }}</span>
          </div>
        </div>

        <div class="result-card" v-if="diagnosisResult || loading">
          <div class="card-title-bar">
            <span class="title-icon">📋</span>
            <span>诊断结果</span>
            <span v-if="loading" class="result-badge analyzing">分析中...</span>
            <span v-else class="result-badge done">已完成</span>
          </div>
          <div v-if="loading && !diagnosisResult" class="loading-box">
            <div class="pulse-ring"></div>
            <div class="pulse-ring delay"></div>
            <div class="pulse-center"></div>
            <p class="loading-text">正在连接AI服务，请稍候...</p>
          </div>
          <div
            v-else
            class="result-content"
            v-html="formatText(diagnosisResult)"
          ></div>
        </div>

        <div class="disclaimer">
          <span class="disclaimer-icon">⚠️</span>
          <p>本系统提供的诊断结果仅供参考，不能替代专业医生的诊断。如有严重症状，请及时就医。</p>
        </div>
      </div>

      <div class="sidebar">
        <div class="panel history-panel">
          <div class="panel-header">
            <span class="panel-title">📜 问诊历史</span>
            <el-button size="small" link @click="loadHistory">刷新</el-button>
          </div>
          <div class="panel-body scrollable">
            <el-skeleton v-if="historyLoading" :rows="4" animated />
            <div v-else-if="historyList.length === 0" class="empty-text">
              <span class="empty-icon">📭</span>
              暂无问诊记录
            </div>
            <div v-else class="history-list">
              <div
                v-for="item in historyList"
                :key="item.id"
                class="history-item"
              >
                <div class="hist-top">
                  <span class="hist-time">{{ formatTime(item.createTime) }}</span>
                  <el-button size="small" link type="danger" @click="deleteHistoryItem(item.id)">删除</el-button>
                </div>
                <div class="hist-q"><span class="lbl">症状：</span>{{ item.question }}</div>
                <div class="hist-a" v-html="formatText(item.answer)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.diagnosis-page {
  min-height: 100%;
  background: $bg-base;
}

.page-header {
  background: $color-primary-gradient;
  padding: 32px 40px;
  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    .header-icon {
      font-size: 42px;
    }
    .header-text {
      h1 {
        color: #fff;
        font-size: 26px;
        margin: 0 0 6px;
        letter-spacing: 2px;
      }
      p {
        color: rgba(255,255,255,0.8);
        font-size: 14px;
        margin: 0;
      }
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar {
  width: 380px;
  flex-shrink: 0;
}

.input-card,
.quick-card,
.result-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 22px 26px;
  box-shadow: $shadow-sm;
}

.card-title-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 14px;
  .title-icon {
    font-size: 18px;
  }
}

.symptoms-input {
  margin-bottom: 16px;
  :deep(.el-textarea__inner) {
    border-radius: $radius-md;
    border: 1.5px solid $border-color;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    &:focus {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
  }
}

.diagnose-btn {
  width: 100%;
  height: 46px;
  border-radius: $radius-md;
  background: $color-primary;
  border-color: $color-primary;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  &:hover {
    background: $color-primary-light;
    border-color: $color-primary-light;
    transform: translateY(-1px);
    box-shadow: $shadow-md;
  }
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-tag {
  padding: 7px 18px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: lighten($bg-base, 1%);
  color: $text-secondary;
  border: 1.5px solid $border-color;
  &:hover {
    background: $color-primary;
    color: #fff;
    border-color: $color-primary;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba($color-primary, 0.25);
  }
}

.result-badge {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  padding: 3px 12px;
  border-radius: 12px;
  &.analyzing {
    background: rgba($color-accent, 0.08);
    color: $color-accent;
    animation: pulse-badge 1.5s ease infinite;
  }
  &.done {
    background: rgba($color-success, 0.08);
    color: $color-success;
  }
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
  position: relative;
  min-height: 180px;
}

.pulse-ring,
.pulse-center {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
}

.pulse-ring {
  width: 80px;
  height: 80px;
  border-top-color: $color-primary;
  animation: pulse-spin 1.5s linear infinite;
  opacity: 0.3;
}

.pulse-ring.delay {
  width: 60px;
  height: 60px;
  border-right-color: $color-primary-light;
  animation: pulse-spin 1.5s linear infinite reverse;
  animation-delay: 0.3s;
  opacity: 0.5;
}

.pulse-center {
  width: 30px;
  height: 30px;
  background: $color-primary;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes pulse-spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 70px;
  font-size: 14px;
  color: $color-primary;
  font-weight: 500;
}

.result-content {
  min-height: 150px;
  max-height: 500px;
  overflow-y: auto;
  padding: 18px;
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  border-left: 4px solid $color-primary;
  font-size: 14px;
  line-height: 1.8;
  color: $text-primary;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.3); border-radius: 3px; }
  :deep(strong) { color: $color-primary; font-weight: 700; }
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 20px;
  background: rgba($color-accent, 0.04);
  border: 1px solid rgba($color-accent, 0.15);
  border-radius: $radius-md;
  .disclaimer-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  p {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
    margin: 0;
  }
}

.panel {
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.panel-header {
  background: $color-primary-gradient;
  padding: 14px 18px;
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

.scrollable {
  max-height: calc(100vh - 320px);
  overflow-y: auto;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: rgba($color-primary, 0.3); border-radius: 2px; }
}

.empty-text {
  text-align: center;
  padding: 40px 0;
  color: $text-placeholder;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  .empty-icon { font-size: 32px; }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  padding: 14px;
  border: 1px solid $border-color;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: $shadow-sm; }
  .hist-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .hist-time { font-size: 11px; color: $text-placeholder; }
  }
  .hist-q {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .lbl { font-weight: 600; color: $color-primary; }
  }
  .hist-a {
    font-size: 12px;
    color: $text-primary;
    line-height: 1.6;
    background: $bg-surface;
    padding: 10px;
    border-radius: $radius-sm;
    border-left: 3px solid $color-primary;
    max-height: 120px;
    overflow-y: auto;
    :deep(strong) { color: $color-primary; font-weight: 600; }
  }
}

@media (max-width: 768px) {
  .page-body {
    flex-direction: column;
    padding: 16px;
  }
  .sidebar {
    width: 100%;
  }
}
</style>
