<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
  pcmAddService,
  pcmListService,
  pcmDeleteService,
  pcmUpdateService,
} from "@/api/pcm";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";


//用户搜索时选中的剂型
const dosageForm = ref("");

//用户搜索时选中的类型
const type = ref("");

//用户搜索时输入的药名
const pcmName = ref("");

//中成药模型
const pcms = ref([]);


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
  pcmList();
};


const pcmList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    // 如果为空字符串，可以这样写
    dosageForm: dosageForm.value ? dosageForm.value : null,
    type: type.value ? type.value : null,
    pcmName: pcmName.value ? pcmName.value : null,
  };
  const result = await pcmListService(params);
  pcms.value = result.data.items;
  total.value = result.data.total;
};
pcmList();

//控制抽屉是否显示
const visibleDrawer = ref(false);
const drawerTitle = ref("");
//添加表单数据模型
const pcmModel = ref({
  dosageForm: "",
  type: "",
});

const tokenStore = useTokenStore();


const addPcm = async () => {
  await pcmAddService(pcmModel.value);
  ElMessage.success("添加成功");
  visibleDrawer.value = false;
  await pcmList();
};

// 修改与删除
const showEditDialog = (row, title) => {
  visibleDrawer.value = true;
  drawerTitle.value = title;
  pcmModel.value = {
    ...row,
  };
};

const showAddDialog = (title) => {
  clearData();
  drawerTitle.value = title;
  visibleDrawer.value = true;
};
const clearData = () => {
  pcmModel.value = {
    dosageForm: "",
    type: "",
  };
};

const updatePcm = async () => {
  await pcmUpdateService(pcmModel.value);
  ElMessage.success("修改成功");
  visibleDrawer.value = false;
  await pcmList();
};

const deletePcm = async (row) => {
  ElMessageBox.confirm("你确认要删除该中成药吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await pcmDeleteService(row.id);
    ElMessage.success("删除成功");
    await pcmList();
  });
};
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>中成药管理</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="showAddDialog('添加中成药')"
            >添加中成药</el-button
          >
        </div>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="功效类型：">
        <el-select placeholder="请选择" v-model="type">
          <el-option label="安神药" value="安神"></el-option>
          <el-option label="表里双解药" value="表里双解"></el-option>
          <el-option label="补肾壮骨药" value="补肾壮骨"></el-option>
          <el-option label="补虚药" value="补虚"></el-option>
          <el-option label="补益药" value="补益"></el-option>
          <el-option label="疮疡消药" value="疮疡消"></el-option>
          <el-option label="调和药" value="调和"></el-option>
          <el-option label="调止药" value="调止"></el-option>
          <el-option label="扶正药" value="扶正"></el-option>
          <el-option label="固涩药" value="固涩"></el-option>
          <el-option label="和血药" value="和血"></el-option>
          <el-option label="化湿药" value="化湿"></el-option>
          <el-option label="化痰药" value="化痰"></el-option>
          <el-option label="止咳药" value="止咳"></el-option>
          <el-option label="平喘药" value="平喘"></el-option>
          <el-option label="活血化瘀药" value="活血化瘀"></el-option>
          <el-option label="活血通络药" value="活血通络"></el-option>
          <el-option label="接骨续筋药" value="接骨续筋"></el-option>
          <el-option label="理气药" value="理气"></el-option>
          <el-option label="理血药" value="理血"></el-option>
          <el-option label="解表药" value="解表"></el-option>
          <el-option label="开窍药" value="开窍"></el-option>
          <el-option label="民族药" value="民族"></el-option>
          <el-option label="清热祛暑药" value="清热祛暑"></el-option>
          <el-option label="清热药" value="清热"></el-option>
          <el-option label="祛风活络药" value="祛风活络"></el-option>
          <el-option label="祛风药" value="祛风"></el-option>
          <el-option label="祛湿药" value="祛湿"></el-option>
          <el-option label="祛瘀药" value="祛瘀"></el-option>
          <el-option label="散结药" value="散结"></el-option>
          <el-option label="收涩药" value="收涩"></el-option>
          <el-option label="温经活血药" value="温经活血"></el-option>
          <el-option label="消食化积药" value="消食化积"></el-option>
          <el-option label="泻下药" value="泻下"></el-option>
          <el-option label="燥湿药" value="燥湿"></el-option>
          <el-option label="治风药" value="治风"></el-option>
          <el-option label="其他" value="其他"></el-option>



        </el-select>
      </el-form-item>

      <el-form-item label="药名：">
        <el-input v-model="pcmName" />
      </el-form-item>

      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click="pcmList()">搜索</el-button>
        <el-button @click="dosageForm='';type='';pcmName='';pcmList();">重置</el-button>
      </el-form-item>

    </el-form>

    <!-- 中药列表 -->
    <el-table :data="pcms" style="width: 100%">

      <el-table-column label="序号" width="70" type="index"></el-table-column>
      <el-table-column label="药名" prop="pcmName"></el-table-column>
      <el-table-column label="剂型" prop="dosageForm"></el-table-column>
      <el-table-column label="组成" prop="composition" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="用法用量" prop="pcmUsage" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="功效类型" prop="type" :show-overflow-tooltip="true"></el-table-column>
      
      <!-- <el-table-column label="图片路径" prop="herbPic" :show-overflow-tooltip="true"></el-table-column> -->
     
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showEditDialog(row, '编辑中成药')"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deletePcm(row)"
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
      :page-sizes="[3, 5, 10, 15]"
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
    <el-form :model="pcmModel" label-width="100px">

      <el-form-item label="药名">
        <el-input
          v-model="pcmModel.pcmName"
          placeholder="请输入药名"
        ></el-input>
      </el-form-item>

      <el-form-item label="剂型">
        <el-input
          v-model="pcmModel.dosageForm"
          placeholder="请输入剂型"
        ></el-input>
      </el-form-item>

      <el-form-item label="组成">
        <el-input
          v-model="pcmModel.composition"
          placeholder="请输入组成"
        ></el-input>
      </el-form-item>

      <el-form-item label="用法用量">
        <el-input
          v-model="pcmModel.pcmUsage"
          placeholder="请输入用法用量"
        ></el-input>
      </el-form-item>

      <el-form-item label="类型">
        <el-input
          v-model="pcmModel.type"
          placeholder="请输入类型"
        ></el-input>
      </el-form-item>
        
      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click=" drawerTitle === '添加中成药' ? addPcm('已添加') : updatePcm('已修改')">
          确认
        </el-button>
    
      </el-form-item>
    </el-form>
  </el-drawer>
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
