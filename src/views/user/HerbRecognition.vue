<script setup>
import { ref } from "vue";
import { herbRecognitionStreamService, getDiagnosisHistoryService, deleteHistoryService } from "@/api/ai.js";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Delete, Refresh } from "@element-plus/icons-vue";
import request from "@/utils/request.js";

const previewUrl = ref("");
const uploadedUrl = ref("");
const recognitionResult = ref("");
const loading = ref(false);
const uploading = ref(false);
const historyList = ref([]);
const historyLoading = ref(false);
const activeHistoryId = ref(null);

const loadHistory = async () => {
  historyLoading.value = true;
  try {
    let result = await getDiagnosisHistoryService();
    historyList.value = (result.data || []).filter(item => item.type === 'herb_recognition');
  } catch (error) {
    console.error("加载历史记录失败", error);
  } finally {
    historyLoading.value = false;
  }
};

loadHistory();

const handleFileChange = async (file) => {
  const rawFile = file.raw || file;
  if (!rawFile) return;
  
  if (!rawFile.type.startsWith('image/')) {
    ElMessage.warning("请上传图片文件");
    return;
  }
  
  if (rawFile.size > 5 * 1024 * 1024) {
    ElMessage.warning("图片大小不能超过5MB");
    return;
  }

  previewUrl.value = URL.createObjectURL(rawFile);
  uploadedUrl.value = "";
  recognitionResult.value = "";
  
  uploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', rawFile);
    const result = await request.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    uploadedUrl.value = result.data;
    ElMessage.success("图片上传成功");
  } catch (error) {
    console.error("图片上传失败", error);
    ElMessage.error("图片上传失败");
    previewUrl.value = "";
  } finally {
    uploading.value = false;
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

const startRecognition = async () => {
  if (!uploadedUrl.value) {
    ElMessage.warning("请先上传花草或药材照片");
    return;
  }
  loading.value = true;
  recognitionResult.value = "";
  try {
    await herbRecognitionStreamService(
      uploadedUrl.value,
      (chunk) => { recognitionResult.value += chunk; },
      async () => {
        loading.value = false;
        await loadHistory();
        ElMessage.success("识别完成");
      },
      (error) => {
        loading.value = false;
        recognitionResult.value = "识别失败，请稍后重试";
        ElMessage.error("识别失败");
      }
    );
  } catch (error) {
    loading.value = false;
    recognitionResult.value = "识别失败，请稍后重试";
    ElMessage.error("识别失败");
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
  return `${month}/${day} ${hour}:${min}`
};

const viewHistory = (item) => {
  activeHistoryId.value = item.id;
  recognitionResult.value = item.answer;
  previewUrl.value = item.question;
  uploadedUrl.value = item.question;
};

const clearImage = () => {
  previewUrl.value = "";
  uploadedUrl.value = "";
  recognitionResult.value = "";
};
</script>

<template>
  <div class="herb-recognition-page">
    <div class="bg-decoration">
      <div class="gradient-orb orb1"></div>
      <div class="gradient-orb orb2"></div>
      <div class="gradient-orb orb3"></div>
      <div class="floating-elements">
        <span class="float-item leaf1">🌿</span>
        <span class="float-item leaf2">🍃</span>
        <span class="float-item yin-yang">🌸</span>
        <span class="float-item herb">🌱</span>
        <span class="float-item pill">🔍</span>
      </div>
      <div class="dot-pattern"></div>
    </div>

    <header class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <span class="icon-main">🌿</span>
          <div class="icon-ring ring-a"></div>
          <div class="icon-ring ring-b"></div>
        </div>
        <h1 class="page-title">AI 中草药识别</h1>
        <p class="page-subtitle">拍照识草药 · AI 智能科普 · 传承中医药智慧</p>
        <div class="header-tags">
          <span class="tag"><i>✓</i> 拍照识别</span>
          <span class="tag"><i>✓</i> 功效解析</span>
          <span class="tag"><i>✓</i> 禁忌提醒</span>
        </div>
      </div>
    </header>

    <main class="main-layout">
      <div class="interaction-area">
        <div class="card upload-card">
          <div class="card-top">
            <div class="card-label">
              <span class="label-icon">📷</span>
              <span class="label-text">上传花草/药材照片</span>
            </div>
            <div class="status-indicator">
              <span class="dot online"></span>
              <span class="status-text">AI 识别就绪</span>
            </div>
          </div>
          <div class="upload-section">
            <div v-if="!previewUrl" class="upload-placeholder" @click="$refs.fileInput.click()">
              <div class="upload-icon">
                <span class="upload-emoji">📸</span>
                <div class="upload-circle"></div>
              </div>
              <p class="upload-text">点击上传花草或药材照片</p>
              <small class="upload-hint">支持 JPG、PNG 格式，最大 5MB</small>
              <div class="upload-features">
                <span class="uf-item">🌿 新鲜草药</span>
                <span class="uf-item">🍂 干燥药材</span>
                <span class="uf-item">🌸 花卉植物</span>
              </div>
            </div>
            
            <div v-else class="preview-container">
              <div class="preview-image">
                <img :src="previewUrl" alt="预览图片" />
                <div v-if="uploading" class="uploading-overlay">
                  <div class="upload-spinner"></div>
                  <span>上传中...</span>
                </div>
              </div>
              <div class="preview-actions">
                <button class="action-btn clear-btn" @click="clearImage">
                  <span class="btn-icon">🗑️</span>
                  重新选择
                </button>
                <button
                  class="action-btn recognize-btn"
                  @click="startRecognition"
                  :disabled="loading || !uploadedUrl"
                >
                  <span v-if="!loading">
                    <span class="btn-icon">🔍</span>
                    开始识别
                  </span>
                  <span v-else class="btn-loading-state">
                    <i class="load-dot d1"></i>
                    <i class="load-dot d2"></i>
                    <i class="load-dot d3"></i>
                    <span>AI 识别中...</span>
                  </span>
                </button>
              </div>
            </div>
            
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileChange($event.target.files[0])"
              style="display: none"
            />
          </div>
        </div>

        <div class="card result-card" v-if="recognitionResult || loading">
          <div class="card-top">
            <div class="card-label">
              <span class="label-icon">{{ loading ? '⏳' : '✅' }}</span>
              <span class="label-text">{{ loading ? '正在识别分析...' : '识别结果报告' }}</span>
            </div>
            <div class="result-badge" :class="{ analyzing: loading, done: !loading }">
              {{ loading ? '分析中' : '已完成' }}
            </div>
          </div>
          <div class="result-body">
            <div v-if="loading && !recognitionResult" class="analyzing-ui">
              <div class="thinking-box">
                <div class="brain-container">
                  <span class="brain-icon">🔬</span>
                  <div class="think-waves">
                    <span class="wave w1"></span>
                    <span class="wave w2"></span>
                    <span class="wave w3"></span>
                  </div>
                </div>
                <p class="thinking-msg">AI 正在运用中医药知识进行识别分析...</p>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-track">
                  <div class="progress-fill"></div>
                </div>
                <div class="progress-steps">
                  <span class="step active">图像分析</span>
                  <span class="step">物种识别</span>
                  <span class="step">生成报告</span>
                </div>
              </div>
            </div>
            <div v-else class="result-content" v-html="formatText(recognitionResult)"></div>
          </div>
        </div>

        <div class="disclaimer-bar">
          <span class="disclaimer-icon">⚠️</span>
          <div class="disclaimer-body">
            <strong>温馨提示：</strong>AI 识别结果仅供参考学习，不能作为用药依据。使用中草药前请务必咨询专业中医师。
          </div>
        </div>
      </div>

      <aside class="sidebar-panel">
        <div class="panel history-panel">
          <div class="panel-head">
            <h3 class="panel-title">
              <span class="pt-icon">📝</span>
              识别记录
            </h3>
            <button class="refresh-btn" @click="loadHistory" :class="{ spinning: historyLoading }">↻</button>
          </div>
          <div class="panel-body">
            <div v-if="historyLoading" class="skeleton-loader">
              <div class="sk-line" v-for="i in 3" :key="i"></div>
            </div>
            <div v-else-if="historyList.length === 0" class="empty-panel">
              <span class="empty-icon">📋</span>
              <p>暂无识别记录</p>
              <small>开始您的第一次 AI 识药吧！</small>
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
                <p class="hist-question">{{ item.answer?.substring(0, 60) }}...</p>
              </div>
            </div>
          </div>
        </div>

        <div class="panel tips-panel">
          <div class="panel-head tips-head">
            <h3 class="panel-title">
              <span class="pt-icon">💡</span>
              拍照小贴士
            </h3>
          </div>
          <div class="panel-body tips-body">
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #D1FAE5, #A7F3D0);">
                <span>📸</span>
              </div>
              <div class="tip-info">
                <strong>光线充足</strong>
                <small>在自然光下拍摄更清晰</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #FEF3C7, #FDE68A);">
                <span>🎯</span>
              </div>
              <div class="tip-info">
                <strong>主体突出</strong>
                <small>让植物占据画面主要部分</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #DBEAFE, #BFDBFE);">
                <span>🌿</span>
              </div>
              <div class="tip-info">
                <strong>多角度拍摄</strong>
                <small>包含叶、花、果实等特征</small>
              </div>
            </div>
            <div class="tip-entry">
              <div class="tip-icon-wrap" style="background: linear-gradient(135deg, #FCE7F3, #FBCFE8);">
                <span>✨</span>
              </div>
              <div class="tip-info">
                <strong>背景简洁</strong>
                <small>避免杂乱背景干扰识别</small>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style lang="scss" scoped>
$bg-base: #FAFBFD;
$bg-warm: #FFF9F0;
$bg-green: #F0FDF4;
$card-bg: #FFFFFF;
$primary: #10B981;
$primary-light: #D1FAE5;
$primary-dark: #059669;
$secondary: #06B6D4;
$secondary-light: #CFFAFE;
$accent-orange: #F97316;
$accent-orange-light: #FFF7ED;
$text-dark: #1E293B;
$text-medium: #475569;
$text-light: #94A3B8;
$border-light: rgba(0, 0, 0, 0.06);
$border-medium: rgba(0, 0, 0, 0.1);
$shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
$shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03);
$shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 8px rgba(0, 0, 0, 0.04);

.herb-recognition-page {
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-green 0%, $bg-base 30%, $bg-warm 70%, $bg-base 100%);
  position: relative;
  overflow-x: hidden;
}

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

@keyframes uploadFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

@keyframes spinnerRotate {
  to { transform: rotate(360deg); }
}

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
      background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 70%);
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
        background: $accent-orange-light;
        color: #EA580C;
        animation-delay: 0.2s;
      }
    }
  }
}

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

.upload-card {
  .upload-section {
    padding: 24px;
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 48px 24px;
    background: linear-gradient(135deg, #F0FDF4, #ECFDF5, #F0F9FF);
    border-radius: 16px;
    border: 2px dashed rgba(16, 185, 129, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: $primary;
      background: linear-gradient(135deg, #D1FAE5, #CFFAFE, #E0F2FE);
      transform: translateY(-2px);
    }

    .upload-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      .upload-emoji {
        font-size: 56px;
        display: block;
        animation: uploadFloat 3s ease-in-out infinite;
        position: relative;
        z-index: 1;
      }

      .upload-circle {
        position: absolute;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.1);
        animation: pulseRing 2s ease-out infinite;
      }
    }

    .upload-text {
      font-size: 16px;
      font-weight: 600;
      color: $text-dark;
      margin: 0;
    }

    .upload-hint {
      font-size: 12px;
      color: $text-light;
    }

    .upload-features {
      display: flex;
      gap: 12px;
      margin-top: 8px;

      .uf-item {
        padding: 6px 14px;
        background: white;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        color: $text-medium;
        box-shadow: $shadow-sm;
      }
    }
  }

  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 18px;

    .preview-image {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      background: #F8FAFC;
      box-shadow: $shadow-sm;

      img {
        width: 100%;
        max-height: 400px;
        object-fit: contain;
        display: block;
      }

      .uploading-overlay {
        position: absolute;
        inset: 0;
        background: rgba(255, 255, 255, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;

        .upload-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(16, 185, 129, 0.2);
          border-top-color: $primary;
          border-radius: 50%;
          animation: spinnerRotate 0.8s linear infinite;
        }

        span {
          font-size: 14px;
          font-weight: 600;
          color: $primary-dark;
        }
      }
    }

    .preview-actions {
      display: flex;
      gap: 12px;

      .action-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 20px;
        border-radius: 14px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;

        .btn-icon { font-size: 16px; }

        &.clear-btn {
          background: linear-gradient(135deg, #F1F5F9, #E2E8F0);
          color: $text-medium;

          &:hover {
            background: linear-gradient(135deg, #E2E8F0, #CBD5E1);
            transform: translateY(-2px);
          }
        }

        &.recognize-btn {
          background: linear-gradient(135deg, $primary, $secondary);
          color: white;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);

          &:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 10px 28px rgba(16, 185, 129, 0.4);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
          }

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
          }
        }
      }
    }
  }
}

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

    :deep(br) { margin-bottom: 8px; }
  }
}

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
  }
}

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

@media (max-width: 1280px) {
  .sidebar-panel { width: 320px; }
}

@media (max-width: 1024px) {
  .main-layout { flex-direction: column; }
  .sidebar-panel { width: 100%; }
}

@media (max-width: 768px) {
  .herb-recognition-page { background: linear-gradient(180deg, $bg-green 0%, $bg-base 50%); }

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

  .main-layout { padding: 0 20px 40px; }

  .result-card .result-body .result-content { max-height: 350px; }

  .upload-card .preview-container .preview-actions {
    flex-direction: column;

    .action-btn { width: 100%; }
  }
}
</style>
