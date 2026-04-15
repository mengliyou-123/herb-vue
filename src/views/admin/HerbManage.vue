<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
  herbAddService,
  herbListService,
  herbDeleteService,
  herbUpdateService,
} from "@/api/herb";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";

const tokenStore = useTokenStore();

//用户搜索时选中的科
const family = ref("");

//用户搜索时选中的类型
const category = ref("");

//用户搜索时选中的性
const property = ref("");

//用户搜索时选中的味
const flavor = ref("");

//用户搜索时选中的归经
const meridianTropism = ref("");

//用户搜索时填写的中文名
const cnName = ref("");

//中药模型
const herbs = ref([]);

//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  herbList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  herbList();
};


const herbList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    // 如果为空字符串，可以这样写
    family: family.value ? family.value : null,
    category: category.value ? category.value : null,
    property: property.value ? property.value : null,
    flavor: flavor.value ? flavor.value : null,
    meridianTropism: meridianTropism.value ? meridianTropism.value : null,
    cnName: cnName.value ? cnName.value : null,
  };
  const result = await herbListService(params);
  herbs.value = result.data.items;
  total.value = result.data.total;
};
herbList();

//控制抽屉是否显示
const visibleDrawer = ref(false);
const drawerTitle = ref("");
//添加表单数据模型
const herbModel = ref({
  cnName: "",
  latinName: "",
  enName: "",
  family: "",
  habitat: "",
  part: "",
  catrgory: "",
  property: "",
  flavor: "",
  meridianTropism: "",
  efficacy: "",
  trait: "",
  indications: "",
  herbPic: "",
});

const uploadSuccess = (result) => {
  herbModel.value.herbPic = result.data;
};

const addHerb = async () => {
  await herbAddService(herbModel.value);
  ElMessage.success("添加成功");
  visibleDrawer.value = false;
  await herbList();
};

// 修改与删除
const showEditDialog = (row, title) => {
  visibleDrawer.value = true;
  drawerTitle.value = title;
  herbModel.value = {
    ...row,
  };
};

const showAddDialog = (title) => {
  clearData();
  drawerTitle.value = title;
  visibleDrawer.value = true;
};
const clearData = () => {
  herbModel.value = {
    cnName: "",
    latinName: "",
    enName: "",
    family: "",
    habitat: "",
    part: "",
    catrgory: "",
    property: "",
    flavor: "",
    meridianTropism: "",
    efficacy: "",
    trait: "",
    indications: "",
    herbPic: "",
  };
};

const updateHerb = async () => {
  await herbUpdateService(herbModel.value);
  ElMessage.success("修改成功");
  visibleDrawer.value = false;
  await herbList();
};

const deleteHerb = (row) => {
  ElMessageBox.confirm("你确认要删除该中药吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await herbDeleteService(row.id);
    ElMessage.success("删除成功");
    await herbList();
  });
};
</script>

<template>
  <div class="herb-manage-page">
    <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>中药管理</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="showAddDialog('添加中药')"
            >添加中药</el-button
          >
        </div>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="药性：">
        <el-select placeholder="请选择" v-model="property" style="width:150px;">
          <el-option label="热" value="热"></el-option>
          <el-option label="温" value="温"></el-option>
          <el-option label="寒" value="寒"></el-option>
          <el-option label="凉" value="凉"></el-option>
          <el-option label="平" value="平"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="药味：">
        <el-select placeholder="请选择" v-model="flavor" style="width:150px;">
          <el-option label="苦" value="苦"></el-option>
          <el-option label="甘" value="甘"></el-option>
          <el-option label="涩" value="涩"></el-option>
          <el-option label="辛" value="辛"></el-option>
          <el-option label="酸" value="酸"></el-option>
          <el-option label="咸" value="咸"></el-option>
          <el-option label="淡" value="淡"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="归经：">
        <el-select placeholder="请选择" v-model="meridianTropism" style="width:150px;">
          <el-option label="心经" value="心"></el-option>
          <el-option label="胃经" value="胃"></el-option>
          <el-option label="脾经" value="脾"></el-option>
          <el-option label="肾经" value="肾"></el-option>
          <el-option label="肺经" value="肺"></el-option>
          <el-option label="肝经" value="肝"></el-option>
          <el-option label="胆经" value="胆"></el-option>
          <el-option label="膀胱经" value="膀胱"></el-option>
          <el-option label="大肠经" value="大肠"></el-option>
          <el-option label="小肠经" value="小肠"></el-option>
          <el-option label="三焦经" value="三焦"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="中文名：">
        <el-input v-model="cnName" style="width:150px;"/>
      </el-form-item>

      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click="herbList()">搜索</el-button>
        <el-button @click="family='';category='';property='';flavor='';meridianTropism='';cnName='';herbList();">重置</el-button>
      </el-form-item>

    </el-form>

    <!-- 中药列表 -->
    <el-table :data="herbs" style="width: 100%">
      <el-table-column label="序号" width="70" type="index"></el-table-column>
      <el-table-column label="中文名" prop="cnName"></el-table-column>
      <!-- <el-table-column label="拉丁名" prop="latinName" :show-overflow-tooltip="true"></el-table-column> -->
      <!-- <el-table-column label="英文名" prop="enName" :show-overflow-tooltip="true"></el-table-column> -->
      <el-table-column label="科" prop="family"></el-table-column>
      <el-table-column label="产地" prop="habitat" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="部位" prop="part"></el-table-column>
      <el-table-column label="类型" prop="category"></el-table-column>
      <el-table-column label="性" prop="property"></el-table-column>
      <el-table-column label="味" prop="flavor"></el-table-column>
      <el-table-column label="归经" prop="meridianTropism"></el-table-column>
      <el-table-column label="功效" prop="efficacy" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="性状" prop="trait" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="规格" prop="indications" :show-overflow-tooltip="true"></el-table-column>
      <!-- <el-table-column label="图片" prop="herbPic"  width="120">
        <template v-slot="scope">
            
          <img :src="scope.row.herbPic" alt="" style="height: 80px; transform: scale" />
        </template>
      </el-table-column> -->
     
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showEditDialog(row, '编辑中药')"
          ></el-button>
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteHerb(row)"
          ></el-button>
        </template>
      </el-table-column>
      
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>


    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: flex-end"
    />
  </el-card>


  <el-drawer
    v-model="visibleDrawer"
    :title="drawerTitle"
    direction="rtl"
    size="50%"
  >

    <el-form :model="herbModel" label-width="100px">
      <el-form-item label="中文名">
        <el-input
          v-model="herbModel.cnName"
          placeholder="请输入中文名"
        ></el-input>
      </el-form-item>

      <el-form-item label="拉丁名">
        <el-input
          v-model="herbModel.latinName"
          placeholder="请输入拉丁名"
        ></el-input>
      </el-form-item>

      <el-form-item label="英文名">
        <el-input
          v-model="herbModel.enName"
          placeholder="请输入英文名"
        ></el-input>
      </el-form-item>

      <el-form-item label="科">
        <el-input
          v-model="herbModel.family"
          placeholder="请输入科"
        ></el-input>
      </el-form-item>

      <el-form-item label="产地">
        <el-input
          v-model="herbModel.habitat"
          placeholder="请输入产地"
        ></el-input>
      </el-form-item>

      <el-form-item label="部位">
        <el-input
          v-model="herbModel.part"
          placeholder="请输入部位"
        ></el-input>
      </el-form-item>

      <el-form-item label="类型">
        <el-input
          v-model="herbModel.category"
          placeholder="请输入类型"
        ></el-input>
      </el-form-item>

      <el-form-item label="性">
        <el-input
          v-model="herbModel.property"
          placeholder="请输入药性"
        ></el-input>
      </el-form-item>

      <el-form-item label="味">
        <el-input
          v-model="herbModel.flavor"
          placeholder="请输入药味"
        ></el-input>
      </el-form-item>

      <el-form-item label="归经">
        <el-input
          v-model="herbModel.meridianTropism"
          placeholder="请输入归经"
        ></el-input>
      </el-form-item>

      <el-form-item label="功效">
        <el-input
          v-model="herbModel.efficacy"
          placeholder="请输入功效"
        ></el-input>
      </el-form-item>

      <el-form-item label="性状">
        <el-input
          v-model="herbModel.trait"
          placeholder="请输入性状"
        ></el-input>
      </el-form-item>

      <el-form-item label="规格">
        <el-input
          v-model="herbModel.indications"
          placeholder="请输入规格"
        ></el-input>
      </el-form-item>

      <el-form-item label="中药图片">
        <el-upload
          class="avatar-uploader"
          :auto-upload="true"
          :show-file-list="false"
          action="/api/upload"
          name="file"
          :headers="{ Authorization: tokenStore.token }"
          :on-success="uploadSuccess"
        >
          <el-image
            v-if="herbModel.herbPic"
            :src="herbModel.herbPic"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click=" drawerTitle === '添加中药' ? addHerb('已添加') : updateHerb('已修改')">
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
