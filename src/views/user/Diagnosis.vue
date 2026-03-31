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

const quickQuestion = (question) => {
  symptoms.value = question;
  startDiagnosis();
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span> 中医智能问诊系统</span>
      </div>
    </template>

    <div class="diagnosis-container">
      <div class="left-panel">
        <div class="input-section">
          <div class="section-title">症状描述</div>
          <el-input
            v-model="symptoms"
            type="textarea"
            :rows="6"
            placeholder="请详细描述您的症状，例如：头痛、发热、咳嗽、痰黄稠、口渴、咽痛等"
            class="symptoms-input"
          />
          <el-button
            @click="startDiagnosis()"
            type="primary"
            class="diagnosis-button"
            :loading="loading"
            :disabled="loading"
          >
            开始问诊
          </el-button>
        </div>

        <div class="quick-questions">
          <div class="section-title">常见症状快速提问</div>
          <div class="question-tags">
            <el-tag
              v-for="q in ['感冒发热', '头痛头晕', '咳嗽痰多', '胃痛腹胀', '失眠多梦', '腰膝酸软']"
              :key="q"
              @click="quickQuestion(q)"
              class="question-tag"
            >
              {{ q }}
            </el-tag>
          </div>
        </div>

        <div class="current-result" v-if="diagnosisResult || loading">
          <div class="section-title">当前诊断结果</div>
          <div v-if="loading && !diagnosisResult" class="loading-container">
            <div class="loading-text">正在连接AI服务...</div>
            <div class="loading-spinner"></div>
          </div>
          <div
            v-else
            class="result-textarea"
            v-html="formatText(diagnosisResult)"
          ></div>
        </div>
      </div>

      <div class="right-panel">
        <div class="section-title">
          <span>问诊历史记录</span>
          <el-button @click="loadHistory" size="small" type="primary" link>刷新</el-button>
        </div>
        <div class="history-container">
          <el-skeleton v-if="historyLoading" :rows="5" animated />
          <div v-else-if="historyList.length === 0" class="empty-history">
            暂无问诊记录
          </div>
          <div v-else class="history-list">
            <div
              v-for="item in historyList"
              :key="item.id"
              class="history-card"
            >
              <div class="card-header">
                <span class="card-time">{{ formatTime(item.createTime) }}</span>
                <el-button
                  @click="deleteHistoryItem(item.id)"
                  type="danger"
                  size="small"
                  link
                >
                  删除
                </el-button>
              </div>
              <div class="card-question">
                <span class="label">症状：</span>
                <span class="content">{{ item.question }}</span>
              </div>
              <div class="card-answer">
                <span class="label">诊断：</span>
                <div class="content" v-html="formatText(item.answer)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="disclaimer">
      <el-alert
        title="温馨提示"
        type="warning"
        :closable="false"
      >
        本系统提供的诊断结果仅供参考，不能替代专业医生的诊断。如有严重症状，请及时就医。
      </el-alert>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  background-color: #FFF8DC;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    font-weight: 600;
  }
}

.diagnosis-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 180px);
  min-height: 600px;
  max-height: 800px;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden;
}

.right-panel {
  width: 400px;
  height: 100%;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #8B4513;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 3px solid #8B4513;
}

.input-section {
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.symptoms-input {
  :deep(.el-textarea__inner) {
    border: 2px solid #8B4513;
    border-radius: 8px;
    background-color: #fff;
    font-size: 14px;
  }
}

.diagnosis-button {
  width: 100%;
  margin-top: 15px;
  background-color: #8B4513;
  border-color: #8B4513;
  font-weight: 600;
  height: 45px;
  font-size: 16px;

  &:hover {
    background-color: #A0522D;
    border-color: #A0522D;
  }
}

.quick-questions {
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-tag {
  cursor: pointer;
  background-color: #FFF8DC;
  border: 1px solid #8B4513;
  color: #8B4513;

  &:hover {
    background-color: #8B4513;
    color: #fff;
  }
}

.current-result {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  
  .section-title {
    flex-shrink: 0;
  }
}

.loading-container {
  flex: 1;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.loading-text {
  font-size: 16px;
  color: #8B4513;
  font-weight: 600;
  margin-bottom: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #D2691E;
  border-top: 4px solid #8B4513;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-textarea {
  flex: 1;
  min-height: 150px;
  background-color: #f5f5f5;
  border: 2px solid #8B4513;
  border-radius: 8px;
  padding: 15px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #8B4513;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0522D;
  }

  strong {
    font-weight: bold;
    color: #8B4513;
  }
}

.history-container {
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #8B4513;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #A0522D;
  }
}

.empty-history {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.history-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.card-time {
  font-size: 12px;
  color: #999;
}

.card-question {
  margin-bottom: 10px;
  font-size: 14px;
}

.card-answer {
  font-size: 14px;
  background-color: #fff;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #8B4513;
}

.label {
  font-weight: 600;
  color: #8B4513;
  margin-right: 5px;
}

.content {
  color: #333;
  line-height: 1.6;

  :deep(strong) {
    font-weight: bold;
    color: #8B4513;
  }
}

.disclaimer {
  margin-top: 20px;
}
</style>
