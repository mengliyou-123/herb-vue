<script setup>
import { Delete, Edit, Plus, More } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
    chapterAddService,
    chapterListService,
    chapterDeleteService,
    chapterUpdateService,
    findChapterByIdService
} from "@/api/chapter.js";
import {
    contentAddService,
    contentDeleteService,
    contentUpdateService,
    contentDetailService,
    findIdByContentService
} from "@/api/content.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

//中成药模型
const chapters = ref([]);

//获取query携带的典籍id
const bookId = Number(router.currentRoute.value.query.bookId);

const chapterList = async (bookId) => {

  const result = await chapterListService(bookId);
  chapters.value = result.data;
};
chapterList(bookId);

//控制抽屉是否显示
const visibleDrawer = ref(false);
const drawerTitle = ref("");

//添加表单数据模型
const chapterModel = ref({});

//章节数据模型(title,bookId,contentId)
const chapter = ref({
    title: "",
    bookId: 0,
    contentId: 0
});

//内容数据模型
const content = ref({
    bookContent: ""
})

const tokenStore = useTokenStore();


//添加章节
const addChapter = async () => {
    
        content.value.bookContent = chapterModel.value.content;
        let text = content.value.bookContent;
        await contentAddService(content.value);    
          
        let result = await findIdByContentService(text);

        chapter.value.title = chapterModel.value.title;
        chapter.value.contentId = result.data.id;
        chapter.value.bookId = bookId;
        let result2 = await chapterAddService(chapter.value);
        console.log(result2);
        ElMessage.success("添加成功");
        visibleDrawer.value = false;
        await chapterList(bookId);
        
        
};

const showAddDialog = (title) => {
  clearData();
  drawerTitle.value = title;
  visibleDrawer.value = true;
};

// 修改与删除
const showEditDialog = async (row, title) => {
  visibleDrawer.value = true;
  drawerTitle.value = title;
  //根据id获得章节
  let result1 = await findChapterByIdService(row.id);
  //根据内容id获得内容
  let result2 = await contentDetailService(result1.data.contentId);

  chapterModel.value.title = result1.data.title;
  chapterModel.value.content = result2.data.bookContent;
  chapterModel.value.id = row.id; //章节id
  chapterModel.value.contentId = result1.data.contentId; //内容id
  chapterModel.value.bookId = result1.data.bookId
};


 const clearData = () => {
     chapterModel.value = {
     title: "",
     content: "",
   };
 };

const updateChapter = async () => {
    
      //先更新content
      content.value.id = chapterModel.value.contentId;
      content.value.bookContent = chapterModel.value.content;
      await contentUpdateService(content.value);
        
        //再更新chapter
        chapter.value.bookId = chapterModel.value.bookId;
        chapter.value.contentId = chapterModel.value.contentId;
        chapter.value.title = chapterModel.value.title;
        chapter.value.id = chapterModel.value.id

         await chapterUpdateService(chapter.value);
         ElMessage.success("修改成功");
         visibleDrawer.value = false;
         await chapterList(bookId);
};

const deleteChapter = (row) => {
  ElMessageBox.confirm("你确认要删除该章节吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    let result = await findChapterByIdService(row.id);

    //先删章节，再删内容，有外键约束
    
    await chapterDeleteService(row.id);
    await contentDeleteService(result.data.contentId);
    
    ElMessage.success("删除成功");
    await chapterList(bookId);
  });
};

</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>章节管理</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="showAddDialog('添加章节')"
            >添加章节</el-button
          >
        </div>
      </div>
    </template>

    <!-- 章节列表 -->
    <el-table :data="chapters" style="width: 100%">

    <el-table-column label="序号" width="170" type="index"></el-table-column>

      <el-table-column label="章节名" width="800" prop="title"></el-table-column>

      <!-- <el-table-column label="内容" prop="content" :show-overflow-tooltip="true"></el-table-column> -->
     
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            type="primary"
            @click="showEditDialog(row, '编辑章节')"
          ></el-button>
          
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteChapter(row)"
          ></el-button>
        </template>
      </el-table-column>
      
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

  </el-card>

  <!-- 抽屉 -->
  <el-drawer
    v-model="visibleDrawer"
    :title="drawerTitle"
    direction="rtl"
    size="50%"
  >
    <!-- 添加章节表单 -->
    <el-form :model="chapterModel" label-width="100px">

        <el-form-item label="章节名">
        <el-input
          v-model="chapterModel.title"
          placeholder="请输入章节名"
        ></el-input>
      </el-form-item>

      <el-form-item label="内容">
        <div class="editor">
          <quill-editor
              theme="snow"
              v-model:content="chapterModel.content"
              contentType="html"
          >
          </quill-editor>

        </div>
      </el-form-item>
      
      <el-form-item>
        <el-button style="background-color:#8B4513;color:white;" @click=" drawerTitle === '添加章节' ? addChapter() : updateChapter()">
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
