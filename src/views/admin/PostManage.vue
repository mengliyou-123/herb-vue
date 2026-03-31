<script setup>
import { Delete, Edit, Plus, More } from "@element-plus/icons-vue";

import { ref } from "vue";
import { postListService, postDeleteService } from "@/api/post.js";
import { postCollListService, deleteByPostIdService } from "@/api/collections.js";
import { deleteCommentsByPostIdService } from "@/api/comment.js";
import { getUserByIdService } from "@/api/user.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

//模型
const posts = ref([]);


//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  postList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  postList();
};

const postList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  };
  const result = await postListService(params);
  posts.value = result.data.items;
  total.value = result.data.total;

  for(let i in posts.value){
    let p = posts.value[i];
    let poster = await getUserByIdService(p.posterId);
    posts.value[i].username = poster.data.username;
  }
  
};
postList();

//删帖
const deletePost = (id) => {
  ElMessageBox.confirm("你确认要删除该讨论帖吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    //先删收藏，再删评论，再删帖子
    await deleteByPostIdService(id);
    await deleteCommentsByPostIdService(id);
    await postDeleteService(id);
    ElMessage.success("删除成功");
    await postList();
  });
};

//展示评论信息（跳转）
const showComments = async(id) => {
  router.push({ path: "/admin/comment", query: { postId: id } });
}
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>讨论帖管理</span>
      </div>
    </template>

    <!-- 帖子列表 -->
    <el-table :data="posts" style="width: 100%">

      <el-table-column label="序号" width="60" type="index"></el-table-column>
      <el-table-column label="标题" prop="title"></el-table-column>
      <el-table-column label="内容" prop="content" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="发贴人用户名" prop="username"></el-table-column>
      <el-table-column label="发布时间" prop="postTime" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="浏览量" prop="viewNum" width="80px"></el-table-column>
      <el-table-column label="收藏数" prop="collNum" width="80px"></el-table-column>
      <el-table-column label="图片" prop="coverImg"  width="120">
        <template v-slot="scope">   
          <img :src="scope.row.coverImg" alt="" style="height: 80px; transform: scale" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="More"
            circle
            plain
            type="primary"
            @click="showComments(row.id)"
          ></el-button>
          
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deletePost(row.id)"
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
