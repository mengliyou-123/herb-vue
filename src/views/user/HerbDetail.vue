<script setup>
import { useRouter } from "vue-router";
import { Delete, Edit, Plus, CaretRight } from "@element-plus/icons-vue";

import { ref, onMounted } from "vue";
import { herbDetailService } from "@/api/herb";
import { herbQAStreamService, getDiagnosisHistoryByTypeService, deleteHistoryService } from "@/api/ai";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";

import { computed } from "vue";
import {
  Iphone,
  Location,
  OfficeBuilding,
  Tickets,
  User,
} from "@element-plus/icons-vue";

const size = ref("default");
const iconStyle = computed(() => {
  const marginMap = {
    large: "8px",
    default: "6px",
    small: "4px",
  };
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  };
});
const blockMargin = computed(() => {
  const marginMap = {
    large: "32px",
    default: "28px",
    small: "24px",
  };
  return {
    marginTop: marginMap[size.value] || marginMap.default,
  };
});

const herb = ref({
  cnName: "",
  latinName: "",
  en_name: "",
  family: "",
  habitat: "",
  part: "",
  catrgory: "",
  property: "",
  flavor: "",
  meridian_tropism: "",
  efficacy: "",
  trait: "",
  indications: "",
  herbPic: "",
});

const tokenStore = useTokenStore();
const router = useRouter();

const id = router.currentRoute.value.query.id;

const detail = async () => {
  let result = await herbDetailService(id);
  herb.value = result.data;
  console.log(herb.value);
};
detail();

const backToHerb = async () => {
  await router.push("/user/herb");
};

const aiQuestion = ref("");
const aiAnswer = ref("");
const aiLoading = ref(false);
const qaHistoryList = ref([]);
const historyLoading = ref(false);

onMounted(() => {
  loadQAHistory();
});

const loadQAHistory = async () => {
  historyLoading.value = true;
  try {
    let result = await getDiagnosisHistoryByTypeService('herb_qa');
    qaHistoryList.value = result.data || [];
    qaHistoryList.value = qaHistoryList.value.filter(item =>
      item.question && item.question.includes(herb.value.cnName)
    );
  } catch (error) {
    console.error("加载问答历史失败", error);
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

const askAI = async () => {
  if (!aiQuestion.value.trim()) {
    ElMessage.warning("请输入问题");
    return;
  }

  aiLoading.value = true;
  aiAnswer.value = "";

  try {
    await herbQAStreamService(
      herb.value.cnName,
      aiQuestion.value,
      (chunk) => {
        aiAnswer.value += chunk;
      },
      async () => {
        aiLoading.value = false;
        aiQuestion.value = "";
        await loadQAHistory();
        ElMessage.success("问答完成");
      },
      (error) => {
        aiLoading.value = false;
        aiAnswer.value = "AI问答失败，请稍后重试";
        ElMessage.error("AI问答失败");
        console.error(error);
      }
    );
  } catch (error) {
    aiLoading.value = false;
    aiAnswer.value = "AI问答失败，请稍后重试";
    ElMessage.error("AI问答失败");
  }
};

const deleteHistoryItem = async (historyId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条问答记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    await deleteHistoryService(historyId);
    ElMessage.success("删除成功");
    await loadQAHistory();
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

const extractQuestion = (question) => {
  if (!question) return '';
  const parts = question.split(':');
  if (parts.length > 1) {
    return parts.slice(1).join(':').trim();
  }
  return question;
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span> {{herb.cnName}}详情 </span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="backToHerb()">返回</el-button>
        </div>
      </div>
    </template>

    <el-row :gutter="0" style="display: flex">

      <el-col :span="18">
        <el-descriptions
          class="margin-top"
          :column="1"
          :size="size"
          border
          :data="herb"
        >
          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                中文名
              </div>
            </template>
            {{ herb.cnName }}
          </el-descriptions-item>

          <el-descriptions-item lable="latinName" label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                拉丁名
              </div>
            </template>
            {{ herb.latinName }}
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                英文名
              </div>
            </template>
            {{ herb.enName }}
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                科
              </div>
            </template>
            {{ herb.family }}
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            产地
          </div>
        </template>
        {{ herb.habitat }}
      </el-descriptions-item>

        </el-descriptions>
      </el-col>

      <el-col :span="6" style="align-items: stretch">
        <div class="imgBox">
          <img
            class="devImg"
            fit="fill"
            :src="herb.herbPic"

          />
        </div>
      </el-col>
    </el-row>

    <el-descriptions class="margin-top"
          :column="1"
          :size="size"
          border
          :data="herb"
          style="margin-top:-1px">


      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            入药部位
          </div>
        </template>
        {{ herb.part }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            类型
          </div>
        </template>
        {{ herb.category }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            性
          </div>
        </template>
        {{ herb.property }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            味
          </div>
        </template>
        {{ herb.flavor }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            归经
          </div>
        </template>
        {{ herb.meridianTropism }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            功效
          </div>
        </template>
        {{ herb.trait }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            规格
          </div>
        </template>
        {{ herb.indications }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="ai-wrapper">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card class="ai-qa-panel">
            <template #header>
              <div class="ai-header">
                <span>🤖 中药知识AI助手</span>
              </div>
            </template>
            <div class="ai-content">
              <div class="ai-input-section">
                <el-input
                  v-model="aiQuestion"
                  placeholder="请输入关于此中药的问题，例如：有什么功效？有什么禁忌？"
                  class="ai-input"
                  clearable
                  @keyup.enter="askAI()"
                />
                <el-button
                  @click="askAI()"
                  type="primary"
                  class="ai-button"
                  :loading="aiLoading"
                  :disabled="aiLoading"
                >
                  提问
                </el-button>
              </div>
              <div class="ai-answer-section">
                <div class="ai-answer-label">AI回答：</div>
                <div v-if="aiLoading && !aiAnswer" class="ai-loading-container">
                  <div class="ai-loading-text">正在连接AI服务...</div>
                  <div class="ai-loading-spinner"></div>
                </div>
                <div
                  v-else-if="aiAnswer"
                  class="ai-answer-textarea"
                  v-html="formatText(aiAnswer)"
                ></div>
                <div v-else class="ai-placeholder">
                  请输入问题，AI将为您解答关于{{ herb.cnName }}的知识
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <el-card class="history-panel">
            <template #header>
              <div class="history-header">
                <span>📚 问答历史</span>
                <el-button @click="loadQAHistory" size="small" type="primary" link>刷新</el-button>
              </div>
            </template>
            <div class="history-content">
              <el-skeleton v-if="historyLoading" :rows="5" animated />
              <div v-else-if="qaHistoryList.length === 0" class="empty-history">
                暂无问答记录
              </div>
              <div v-else class="history-list">
                <div
                  v-for="item in qaHistoryList"
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
                    <span class="label">问题：</span>
                    <span class="content">{{ extractQuestion(item.question) }}</span>
                  </div>
                  <div class="card-answer">
                    <span class="label">回答：</span>
                    <div class="content" v-html="formatAnswer(item.answer)"></div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;


  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
  }
}

.el-descriptions {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
  height: 40px;
}
.margin-top {
  margin-top: 20px;
}

:deep(.my-label) {
  width: 200px;
}

.imgBox {
   margin-top: 20px;
   border: 1px solid #ebeef5;
   width: 99.5%;
   height: 93%;
   position: relative;
   overflow: hidden;
   margin-left: 0%;
   .devImg {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: auto;
    max-height: 100%;
    padding: 10px 10px;
   }
}

.ai-wrapper {
  margin-top: 20px;
}

.ai-qa-panel {
  background-color: #FFF8DC;

  .ai-header {
    font-size: 18px;
    font-weight: 600;
    color: #8B4513;
  }

  .ai-content {
    padding: 10px 0;
  }

  .ai-input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .ai-input {
    flex: 1;
  }

  .ai-button {
    background-color: #8B4513;
    border-color: #8B4513;
    font-weight: 600;
    min-width: 80px;
  }

  .ai-button:hover {
    background-color: #A0522D;
    border-color: #A0522D;
  }

  .ai-answer-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ai-answer-label {
    font-size: 14px;
    font-weight: 600;
    color: #8B4513;
    margin-bottom: 5px;
  }

  .ai-answer-textarea {
    min-height: 300px;
    background-color: #fff;
    border: 2px solid #8B4513;
    border-radius: 8px;
    padding: 15px;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    overflow-y: auto;
  }

  .ai-answer-textarea strong {
    font-weight: bold;
    color: #8B4513;
  }

  .ai-placeholder {
    min-height: 300px;
    background-color: #f5f5f5;
    border: 2px dashed #ccc;
    border-radius: 8px;
    padding: 15px;
    font-size: 14px;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ai-loading-container {
    min-height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border: 2px solid #8B4513;
    border-radius: 8px;
  }

  .ai-loading-text {
    font-size: 16px;
    color: #8B4513;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .ai-loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #D2691E;
    border-top: 3px solid #8B4513;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .ai-input :deep(.el-input__wrapper) {
    border-radius: 8px;
    border: 2px solid #8B4513;
    background-color: #fff;
  }
}

.history-panel {
  .history-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: 600;
    color: #8B4513;
  }

  .history-content {
    max-height: 450px;
    overflow-y: auto;
  }

  .empty-history {
    min-height: 150px;
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
    padding: 12px;
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e0e0e0;
  }

  .card-time {
    font-size: 11px;
    color: #999;
  }

  .card-question {
    margin-bottom: 8px;
    font-size: 13px;
  }

  .card-answer {
    font-size: 13px;
    background-color: #fff;
    padding: 8px;
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
}
</style>
