<script setup>
import { Delete, Edit, Plus, More } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
    bookAddService,
    bookListService,
    bookDeleteService,
    bookUpdateService,
} from "@/api/book.js";
import { deleteByBookIdService } from "@/api/collections.js";
import { deleteChaptersByBookIdService } from "@/api/chapter.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

//用户搜索时选中的类型
const type = ref("");

//用户搜索时输入的书名
const bookName = ref("");

//中成药模型
const books = ref([]);


//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  bookList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  bookList();
};

const uploadSuccess = (result) => {
  bookModel.value.coverImg = result.data;
};

const bookList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    
    type: type.value ? type.value : null,
    bookName: bookName.value ? bookName.value : null,
  };
  const result = await bookListService(params);
  books.value = result.data.items;
  total.value = result.data.total;
};
bookList();

//控制抽屉是否显示
const visibleDrawer = ref(false);
const drawerTitle = ref("");
//添加表单数据模型
const bookModel = ref({
  bookName: "",
  author: "",
  introduction:"",
  type:"",
  collNum:0,
  coverImg:""
});


const tokenStore = useTokenStore();

//添加书籍
const addBook = async () => {
  await bookAddService(bookModel.value);
  ElMessage.success("添加成功");
  visibleDrawer.value = false;
  await bookList();
};

// 修改与删除
const showEditDialog = (row, title) => {
  visibleDrawer.value = true;
  drawerTitle.value = title;
  bookModel.value = {
    ...row,
  };
};

const showAddDialog = (title) => {
  clearData();
  drawerTitle.value = title;
  visibleDrawer.value = true;
};
const clearData = () => {
    bookModel.value = {
    dosageForm: "",
    type: "",
  };
};

const updateBook = async () => {
  await bookUpdateService(bookModel.value);
  ElMessage.success("修改成功");
  visibleDrawer.value = false;
  await bookList();
};

const deleteBook = (row) => {
  ElMessageBox.confirm("你确认要删除该书籍吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    //先删收藏，再删章节，再删内容，再删书籍
    await deleteByBookIdService(row.id);
    await deleteChaptersByBookIdService(row.id);
    
    await bookDeleteService(row.id);
    ElMessage.success("删除成功");
    await bookList();
  });
};

//展示章节信息（跳转）
const showChapters = async(id) => {
  router.push({ path: "/admin/chapter", query: { bookId: id } });
}

</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>中医典籍管理</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="showAddDialog('添加典籍')"
            >添加典籍</el-button
          >
        </div>
      </div>
    </template>

    <!-- 搜索表单 -->
    <el-form inline>

      <el-form-item label="类型： ">
        <el-select placeholder="请选择" v-model="type">
          <el-option label="本草" value="本草"></el-option>
          <el-option label="医论" value="医论"></el-option>
          <el-option label="妇幼" value="妇幼"></el-option>
          <el-option label="针灸" value="针灸"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="书名：">
        <el-input v-model="bookName" />
      </el-form-item>

      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click="bookList()">搜索</el-button>
        <el-button @click="type='';bookName='';bookList();">重置</el-button>
      </el-form-item>

    </el-form>

    <!-- 中药列表 -->
    <el-table :data="books" style="width: 100%">

      <el-table-column label="序号" width="70" type="index"></el-table-column>
      <el-table-column label="书名" prop="bookName"></el-table-column>
      <el-table-column label="作者" prop="author"></el-table-column>
      <el-table-column label="简介" prop="introduction" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="类型" prop="type" ></el-table-column>
      <el-table-column label="图片路径" prop="coverImg" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="收藏数" prop="collNum" ></el-table-column>
     
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            :icon="More"
            circle
            plain
            type="primary"
            @click="showChapters(row.id)"
          ></el-button>
          
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showEditDialog(row, '编辑典籍信息')"
          ></el-button>
          
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteBook(row)"
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
      :page-sizes="[5, 10, 20, 30]"
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
    <el-form :model="bookModel" label-width="100px">

        <el-form-item label="书名">
        <el-input
          v-model="bookModel.bookName"
          placeholder="请输入书名"
        ></el-input>
      </el-form-item>

      <el-form-item label="作者">
        <el-input
          v-model="bookModel.author"
          placeholder="请输入作者"
        ></el-input>
      </el-form-item>

      <el-form-item label="简介">
        <el-input
          v-model="bookModel.introduction"
          placeholder="请输入简介"
        ></el-input>
      </el-form-item>

      <el-form-item label="类型">
        <el-input
          v-model="bookModel.type"
          placeholder="请输入类型"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="类型">
        <el-select placeholder="请选择" v-model="bookModel.type">
          <el-option v-for="b in books" :key="b.type" :label="b.type" :value="b.type">
          </el-option>
        </el-select>
      </el-form-item> -->

      <el-form-item label="封面图">
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
            v-if="bookModel.coverImg"
            :src="bookModel.coverImg"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click=" drawerTitle === '添加典籍' ? addBook('已添加') : updateBook('已修改')">
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
