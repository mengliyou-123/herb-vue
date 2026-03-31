<script setup>
import { Delete, Edit, Plus ,Star} from "@element-plus/icons-vue";

import { ref, onMounted } from "vue";
import {
  preAddService,
  preListService,
  preDeleteService,
  preUpdateService,
} from "@/api/prescription.js";
import { prescriptionAnalysisStreamService, getDiagnosisHistoryByTypeService, deleteHistoryService } from "@/api/ai.js";
// import {preDetail} from "@/api/collections.js"
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import {useUserInfoStore} from "@/stores/userInfo";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";


//用户搜索时选中的剂型
const dosageForm = ref("");

//用户搜索时输入的方剂名
const preName = ref("");

//方剂模型
const pres = ref([]);

//收藏方剂模型
const collPre = ref({
  userId:"",
  preId:""
});

//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  preList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  preList();
};


const preList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    // 如果为空字符串，可以这样写
    dosageForm: dosageForm.value ? dosageForm.value : null,
    preName: preName.value ? preName.value : null,
  };
  const result = await preListService(params);
  pres.value = result.data.items;
  total.value = result.data.total;
};
preList();

const router = useRouter();
const preDetail = async (id) => {
  router.push({ path: "/user/preDetail", query: { id: id } });
}


const clearData = () => {
  preModel.value = {
    dosageForm: "",
    type: "",
  };
};

const story = async (index) => {
  await router.push({ path: "/user/preStories", query: { index: index } });
}

const analysisInput = ref("");
const analysisResult = ref("");
const analysisLoading = ref(false);
const analysisHistoryList = ref([]);
const historyLoading = ref(false);

// 页面加载时获取历史记录
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
</script>

<template>
  <el-card class="page-container">
    <!-- 上部分div -->
    <div>
<!-- 搜索框div -->
       <div style="margin-left:30px;margin-top:10px;">
        <el-input v-model="preName" placeholder="按方剂名检索" style="width:90%;height:40px;font-size:15px;"> </el-input>
        <el-button @click="preList()" style="width:80px;height:40px;margin-left:10px;color:white;background-color:#8B4513">搜索</el-button>
      </div>

<!-- 筛选栏div -->
      <div style="margin-left:30px;">
        <table class="select-table">
          <tr class="tr">
            <td class="td-left">剂型</td>
            <td class="td" @click="dosageForm = '';preList()">
              <el-button link>全部</el-button>
            </td>
            <td class="td" @click="dosageForm = '饼剂';preList()">
              <el-button link>饼剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '茶剂';preList()">
              <el-button link>茶剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '搽剂';preList()">
              <el-button link>搽剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '醋剂';preList()">
              <el-button link>醋剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '丹剂';preList()">
              <el-button link>丹剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '点眼剂';preList()">
              <el-button link>点眼剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '锭剂';preList()">
              <el-button link>锭剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '敷剂';preList()">
              <el-button link>敷剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '膏剂';preList()">
              <el-button link>膏剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '膏药剂';preList()">
              <el-button link>膏药剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '糕剂';preList()">
              <el-button link>糕剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '羹剂';preList()">
              <el-button link>羹剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '含漱剂';preList()">
              <el-button link>含漱剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '糊剂';preList()">
              <el-button link>糊剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '胶剂';preList()">
              <el-button link>胶剂</el-button>
             </td>
            <td class="td" @click="dosageForm = '疚剂';preList()">
              <el-button link>疚剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '酒剂';preList()">
              <el-button link>酒剂</el-button>
            </td>
          </tr>
          <tr class="tr">
            <td class="td" @click="dosageForm = '露剂';preList()">
              <el-button link>露剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '片剂';preList()">
              <el-button link>片剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '曲剂';preList()">
              <el-button link>曲剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '塞鼻剂';preList()">
              <el-button link>塞鼻剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '塞耳剂';preList()">
              <el-button link>塞耳剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '散剂';preList()">
              <el-button link>散剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '霜剂';preList()">
              <el-button link>霜剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '汤剂';preList()">
              <el-button link>汤剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '敷剂';preList()">
              <el-button link>敷剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '条剂';preList()">
              <el-button link>条剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '丸剂';preList()">
              <el-button link>丸剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '煨剂';preList()">
              <el-button link>煨剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '洗剂';preList()">
              <el-button link>洗剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '吸入烟剂';preList()">
              <el-button link>吸入烟剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '线剂';preList()">
              <el-button link>线剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '嗅剂';preList()">
              <el-button link>嗅剂</el-button>
             </td>
            <td class="td" @click="dosageForm = '熏洗剂';preList()">
              <el-button link>熏洗剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '熏烟剂';preList()">
              <el-button link>熏烟剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '油剂';preList()">
              <el-button link>油剂</el-button>
            </td>
          </tr>
          <tr class="tr">
            <td class="td" @click="dosageForm = '熨剂';preList()">
              <el-button link>熨剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '粥剂';preList()">
              <el-button link>粥剂</el-button>
            </td>
            <td class="td" @click="dosageForm = '其他剂型';preList()">
              <el-button link>其他剂型</el-button>
            </td>
          </tr>

        </table>
      </div>
    </div>

<!-- 下部分div -->
<div style="display: flex;width: 95%;margin: 0 auto;background-color: #FFF8DC;;border-radius: 5px;">
        <!-- 方剂列表div -->
    <div style="flex: 1;border-right: 1px solid #cccccc;; margin-top:20px;">
      <div v-for="p in pres" :key="p" @click="preDetail(p.id)" class="item">
          <div style="margin-left:18px;margin-top:10px;margin-right:10px;">
            <div class="name"> {{p.preName}} </div>
            <div class="text" style="">
              <div >剂型：{{p.dosageForm}}</div>
              <div>组成：{{p.originalText}}</div>
            </div>
            </div>
          </div>
    </div>

      <div style="width: 420px;">

        <div style="margin: 20px 15px;">
          <div class="stories-panel">
            <div class="stories-header">
              <span>名医名方</span>
            </div>
            <div class="stories-content">
              <div class="row">
                    <div class="title" @click="story(1)">清代叶天士与白虎汤的故事</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(2)">北宋名医钱乙与六味地黄丸的故事</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(3)">清代名医王清任与补阳还五汤的故事</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(4)">一代医宗朱丹溪的医案趣事</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(5)">华佗炼制青苔膏</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(6)">张仲景用蜂蜜治疗便秘</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(7)">程钟龄施计治"足痿"</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(8)">张景岳急智救吞钉小儿</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(9)">孙思邈巧治脚气</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(10)">孙一奎便方治难症</div>
                  </div>
            </div>
          </div>
        </div>

        <div style="margin: 15px 15px 15px 0;">
          <div class="analysis-panel">
            <div class="analysis-header">
              <span> 方剂智能分析</span>
            </div>
            <div class="analysis-content">
              <el-input
                v-model="analysisInput"
                type="textarea"
                :rows="3"
                placeholder="请输入方剂信息，例如：麻黄汤：麻黄9g，桂枝6g，杏仁6g，甘草3g"
                class="analysis-textarea"
              />
              <el-button
                @click="analyzePrescription()"
                type="primary"
                class="analysis-button"
                :loading="analysisLoading"
                :disabled="analysisLoading"
                style="margin-top: 10px; width: 100%;"
              >
                开始分析
              </el-button>
              <div class="analysis-result-section">
                <div class="analysis-result-label">分析结果：</div>
                <div v-if="analysisLoading && !analysisResult" class="analysis-loading-container">
                  <div class="analysis-loading-text">正在连接AI服务...</div>
                  <div class="analysis-loading-spinner"></div>
                </div>
                <div
                  v-else-if="analysisResult"
                  class="analysis-result-textarea"
                  v-html="formatText(analysisResult)"
                ></div>
                <div v-else class="analysis-placeholder">
                  输入方剂信息后，AI将为您分析方剂组成、配伍意义、功效主治等
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="margin: 0 15px 15px 0;">
          <div class="history-panel">
            <div class="history-header">
              <span>📊 分析历史</span>
              <el-button @click="loadAnalysisHistory" size="small" type="primary" link>刷新</el-button>
            </div>
            <div class="history-content">
              <el-skeleton v-if="historyLoading" :rows="4" animated />
              <div v-else-if="analysisHistoryList.length === 0" class="empty-history">
                暂无分析记录
              </div>
              <div v-else class="history-list">
                <div
                  v-for="item in analysisHistoryList"
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
                    <span class="label">方剂：</span>
                    <div class="content">{{ item.question }}</div>
                  </div>
                  <div class="card-answer">
                    <span class="label">分析：</span>
                    <div class="content" v-html="formatAnswer(item.answer)"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

</div>

    <!-- 分页条 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: center"
    />
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
  }

  .select-table {
    border-collapse: collapse;
    margin-left: 10px;
    margin-top: 20px;
    .tr {
      border-bottom: 1px solid rgb(205, 205, 205);
      height: 35px;
      width: 500px;
      .td-left {
        width:54px;
        font-size: 15px;
        font-weight: bold;
      }
      .td {
        width:54px;
        font-size: 13px;
    }
    }
  }

  .item {
    height: 120px;
    display: flex;
    margin: 10px 20px;
    border-bottom: 1px solid #cccccc;
    width: 750px;

    .text{
      color: #cccccc;
      margin-top:10px;height: 45px;
      overflow:hidden;
      text-overflow:ellipsis;
      display:-webkit-box;
      -webkit-box-orient:vertical;
      -webkit-line-clamp:3;
      line-height: 25px;
      color: gray;
      font-size:13px;
      width: 740px;

    }

    .name{
    font-size: 25px;
    color: #000000;
    cursor: pointer;
    width: 960px;
  }

  .name:hover{
    font-size: 1.7em;
  }
  }

  .stories-panel {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .stories-header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 12px 15px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    .stories-content {
      padding: 10px 15px;
    }

    .row{
      padding: 5px 0;
      border-bottom: 1px dashed #cccccc;
      overflow: hidden;
      text-overflow: ellipsis;

      .title{
        color: #707070;
        line-height: 20px;
        font-size: 12px;
        margin-top: 5px;
        cursor: pointer;

        &:hover {
          color: #8B4513;
        }
      }
    }
  }

  .analysis-panel {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .analysis-header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 12px 15px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }

    .analysis-content {
      padding: 15px;
    }

    .analysis-textarea {
      :deep(.el-textarea__inner) {
        border: 2px solid #8B4513;
        border-radius: 8px;
        background-color: #fff;
      }
    }

    .analysis-button {
      background-color: #8B4513;
      border-color: #8B4513;
      font-weight: 600;

      &:hover {
        background-color: #A0522D;
        border-color: #A0522D;
      }
    }

    .analysis-result-section {
      margin-top: 15px;
    }

    .analysis-result-label {
      font-size: 14px;
      font-weight: 600;
      color: #8B4513;
      margin-bottom: 10px;
    }

    .analysis-result-textarea {
      min-height: 200px;
      max-height: 350px;
      overflow-y: auto;
      background-color: #fff;
      border: 2px solid #8B4513;
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      line-height: 1.6;
      color: #333;

      strong {
        font-weight: bold;
        color: #8B4513;
      }
    }

    .analysis-placeholder {
      min-height: 200px;
      background-color: #f5f5f5;
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 12px;
      font-size: 13px;
      color: #999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .analysis-loading-container {
      min-height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      border: 2px solid #8B4513;
      border-radius: 8px;
    }

    .analysis-loading-text {
      font-size: 14px;
      color: #8B4513;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .analysis-loading-spinner {
      width: 35px;
      height: 35px;
      border: 3px solid #D2691E;
      border-top: 3px solid #8B4513;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }

  .history-panel {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .history-header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 12px 15px;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .history-content {
      max-height: 350px;
      overflow-y: auto;
      padding: 10px;
    }

    .empty-history {
      min-height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #999;
      font-size: 13px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-card {
      background-color: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e0e0e0;
    }

    .card-time {
      font-size: 11px;
      color: #999;
    }

    .card-question {
      margin-bottom: 6px;
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }

    .card-answer {
      font-size: 12px;
      background-color: #fff;
      padding: 8px;
      border-radius: 6px;
      border-left: 3px solid #8B4513;
      max-height: 150px;
      overflow-y: auto;
      
      &::-webkit-scrollbar {
        width: 4px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 2px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #8B4513;
        border-radius: 2px;
      }
    }

    .label {
      font-weight: 600;
      color: #8B4513;
      margin-right: 4px;
      font-size: 12px;
    }

    .content {
      color: #333;
      line-height: 1.5;

      :deep(strong) {
        font-weight: bold;
        color: #8B4513;
      }
    }
  }
}

</style>
