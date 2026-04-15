<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
  preAddService,
  preListService,
  preDeleteService,
  preUpdateService,
} from "@/api/prescription.js";
import { deleteByPreIdService } from "@/api/collections.js"
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";


//用户搜索时选中的剂型
const dosageForm = ref("");

//用户搜索时输入的方剂名
const preName = ref("");

//方剂模型
const pres = ref([]);


//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  pcmList();
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

//控制抽屉是否显示
const visibleDrawer = ref(false);
const drawerTitle = ref("");
//添加表单数据模型
const preModel = ref({
  dosageForm: "",
  preName: "",
});

const tokenStore = useTokenStore();


const addPre = async () => {
  await preAddService(preModel.value);
  ElMessage.success("添加成功");
  visibleDrawer.value = false;
  await preList();
};

// 修改与删除
const showEditDialog = (row, title) => {
  visibleDrawer.value = true;
  drawerTitle.value = title;
  preModel.value = {
    ...row,
  };
};

const showAddDialog = (title) => {
  clearData();
  drawerTitle.value = title;
  visibleDrawer.value = true;
};
const clearData = () => {
  preModel.value = {
    dosageForm: "",
    type: "",
  };
};

const updatePre = async () => {
  await preUpdateService(preModel.value);
  ElMessage.success("修改成功");
  visibleDrawer.value = false;
  await preList();
};

const deletePre = (row) => {
  ElMessageBox.confirm("你确认要删除该方剂吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    //先删收藏，再删方剂
    await deleteByPreIdService(row.id);
    await preDeleteService(row.id);
    ElMessage.success("删除成功");
    await preList();
  });
};
</script>

<template>
  <div class="pre-manage-page">
    <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>方剂管理</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="showAddDialog('添加方剂')"
            >添加方剂</el-button>
        </div>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form inline>

      <el-form-item label="剂型：">
        <el-select placeholder="请选择" v-model="dosageForm">
          <el-option label="饼剂" value="饼剂"></el-option>
          <el-option label="茶剂" value="茶剂"></el-option>
          <el-option label="搽剂" value="搽剂"></el-option>
          <el-option label="醋剂" value="醋剂"></el-option>
          <el-option label="丹剂" value="丹剂"></el-option>
          <el-option label="点眼剂" value="点眼剂"></el-option>
          <el-option label="锭剂" value="锭剂"></el-option>
          <el-option label="敷剂" value="敷剂"></el-option>
          <el-option label="膏剂" value="膏剂"></el-option>
          <el-option label="糕剂" value="糕剂"></el-option>
          <el-option label="羹剂" value="羹剂"></el-option>
          <el-option label="含漱剂" value="含漱剂"></el-option>
          <el-option label="糊剂" value="糊剂"></el-option>
          <el-option label="胶剂" value="胶剂"></el-option>
          <el-option label="疚剂" value="疚剂"></el-option>
          <el-option label="酒剂" value="酒剂"></el-option>
          <el-option label="露剂" value="露剂"></el-option>
          <el-option label="片剂" value="片剂"></el-option>
          <el-option label="曲剂" value="曲剂"></el-option>
          <el-option label="塞鼻剂" value="塞鼻剂"></el-option>
          <el-option label="塞耳剂" value="塞耳剂"></el-option>
          <el-option label="散剂" value="散剂"></el-option>
          <el-option label="霜剂" value="霜剂"></el-option>
          <el-option label="汤剂" value="汤剂"></el-option>
          <el-option label="敷剂" value="敷剂"></el-option>
          <el-option label="条剂" value="条剂"></el-option>
          <el-option label="丸剂" value="丸剂"></el-option>
          <el-option label="煨剂" value="煨剂"></el-option>
          <el-option label="洗剂" value="洗剂"></el-option>
          <el-option label="吸入烟剂" value="吸入烟剂"></el-option>
          <el-option label="线剂" value="线剂"></el-option>
          <el-option label="嗅剂" value="嗅剂"></el-option>
          <el-option label="熏洗剂" value="熏洗剂"></el-option>
          <el-option label="油剂" value="油剂"></el-option>
          <el-option label="熨剂" value="熨剂"></el-option>
          <el-option label="粥剂" value="粥剂"></el-option>
          <el-option label="其他剂型" value="其他剂型"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="方剂名：">
        <el-input v-model="preName" />
      </el-form-item>

      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click="preList()">搜索</el-button>
        <el-button @click="dosageForm='';preName='';preList();">重置</el-button>
      </el-form-item>

    </el-form>

    <!-- 中药列表 -->
    <el-table :data="pres" style="width: 100%">

      <el-table-column label="序号" width="70" type="index"></el-table-column>
      <el-table-column label="方剂名" prop="preName"></el-table-column>
      <el-table-column label="剂型" prop="dosageForm"></el-table-column>
      <el-table-column label="主治疾病" prop="syndromes" :show-overflow-tooltip="true"></el-table-column>
      <!-- <el-table-column label="病因病机或主治证候" prop="syndromes" :show-overflow-tooltip="true"></el-table-column> -->
      <el-table-column label="症状" prop="symptom" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="处方来源" prop="preSource" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="组成原文" prop="originalText" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="功能主治" prop="treatment" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="收藏数" prop="collNum" ></el-table-column>
      
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showEditDialog(row, '编辑方剂')"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deletePre(row)"
          ></el-button>
        </template>
      </el-table-column>
      
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

    <!-- 分页条 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 15, 20]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </el-card>

  <!-- 抽屉 -->
  <el-drawer
    v-model="visibleDrawer"
    :title="drawerTitle"
    direction="rtl"
    size="50%"
  >
    <!-- 添加文章表单 -->
    <el-form :model="preModel" label-width="100px">

      <el-form-item label="方剂名">
        <el-input
          v-model="preModel.preName"
          placeholder="请输入方剂名"
        ></el-input>
      </el-form-item>

      <el-form-item label="剂型">
        <el-input
          v-model="preModel.dosageForm"
          placeholder="请输入剂型"
        ></el-input>
      </el-form-item>

      <el-form-item label="主治疾病">
        <el-input
          v-model="preModel.syndromes"
          placeholder="请输入主治疾病"
        ></el-input>
      </el-form-item>

      <el-form-item label="症状">
        <el-input
          v-model="preModel.symptom"
          placeholder="请输入症状"
        ></el-input>
      </el-form-item>

      <el-form-item label="处方来源">
        <el-input
          v-model="preModel.preSource"
          placeholder="请输入处方来源"
        ></el-input>
      </el-form-item>

      <el-form-item label="原文">
        <el-input
          v-model="preModel.originalText"
          placeholder="请输入原文"
        ></el-input>
      </el-form-item>

      <el-form-item label="功能主治">
        <el-input
          v-model="preModel.treatment"
          placeholder="请输入功能主治"
        ></el-input>
      </el-form-item>
      
      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click=" drawerTitle === '添加方剂' ? addPre('已添加') : updatePre('已修改')">
          确认
        </el-button>
    
      </el-form-item>
    </el-form>
  </el-drawer>
  </div>
</template>
<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

/* 抽屉样式 */
.avatar-uploader {
  :deep {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

.editor {
  width: 100%;

  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
