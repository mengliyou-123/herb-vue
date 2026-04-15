<script setup>
import { useRouter } from "vue-router";
import { Delete, Edit, Plus, CaretRight } from "@element-plus/icons-vue";

import { ref } from "vue";
import { preDetailService } from "@/api/prescription";
import { isPreCollService, preCollNumAddService, preCollAddService, preCollDeleteService, preCollNumSubtractService } from "@/api/collections";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import {useUserInfoStore} from "@/stores/userInfo";
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

//添加表单数据模型
const pre = ref({

});

const tokenStore = useTokenStore();
const router = useRouter();

//获取query携带的方剂id
const id = router.currentRoute.value.query.id;

const detail = async () => {
  let result = await preDetailService(id);
  pre.value = result.data;
//   console.log(pre.value);
};
detail();

const state = ref(true);
const userInfoStore = useUserInfoStore();
const collection = ref({
    "userId":0,
    "preId":0,
});

const isCollect = async () => {
    collection.value.userId = userInfoStore.userInfo.id;
    collection.value.preId = Number(id);
    let result = await isPreCollService(collection.value);
    if(result.data == null){
        state.value = true;
    }
    else{
        state.value = false;
    }
// console.log(collection.value)
}
isCollect();

const addCollection = async () => {
    await preCollNumAddService(Number(id));
    await preCollAddService(Number(id));
    ElMessage.success("收藏成功");
    await detail();
    await isCollect();
}

const deleteCollection = async () => {
    collection.value.userId = userInfoStore.userInfo.id;
    collection.value.preId = Number(id);
    let result = await isPreCollService(collection.value);
    let collId = result.data.id;
    console.log(result.data.id);
    await preCollDeleteService(collId);
    await preCollNumSubtractService(Number(id));
    ElMessage.success("取消收藏成功");
    await detail();
    await isCollect();
}

const backToPre = async () => {
  await router.push({ path: "/user/prescription" });
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span> {{pre.preName}}详情 </span>
        <div class="extra">

          <el-button style="background-color:#8B4513;color:white;" round v-if="state" @click="addCollection()">
            收藏
          </el-button>

          <el-button style="background-color:#8B4513;color:white;" round v-else @click="deleteCollection()">
            已收藏
          </el-button>


          <el-button style="background-color:#8B4513;color:white;" @click="backToPre()">返回</el-button>
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
          :data="pre"  
        >
          <el-descriptions-item label-class-name="my-label" >
            <template #label>
              <div class="cell-item">
                方剂名
              </div>
            </template>
            {{ pre.preName }}
          </el-descriptions-item>

          <el-descriptions-item lable="latinName" label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                剂型
              </div>
            </template>
            {{ pre.dosageForm }}
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                病因病机及症候
              </div>
            </template>
            {{ pre.syndromes }}
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                症状
              </div>
            </template>
            {{ pre.symptom }}
            <!-- <el-tag size="small">{{ herb.family }}</el-tag> -->
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
        <template #label>
          <div class="cell-item">
            处方来源
          </div>
        </template>
        {{ pre.preSource }}
      </el-descriptions-item>

      <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
               原文
              </div>
            </template>
            {{ pre.originalText }}
            <!-- <el-tag size="small">{{ herb.family }}</el-tag> -->
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                功能主治
              </div>
            </template>
            {{ pre.treatment }}
            <!-- <el-tag size="small">{{ herb.family }}</el-tag> -->
          </el-descriptions-item>

          <el-descriptions-item label-class-name="my-label">
            <template #label>
              <div class="cell-item">
                收藏数
              </div>
            </template>
            {{ pre.collNum }}
            <!-- <el-tag size="small">{{ herb.family }}</el-tag> -->
          </el-descriptions-item>

        </el-descriptions>
      </el-col>
    </el-row>

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

//表格
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
  // background: var(--el-color-success-light-9) !important;
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
</style>
