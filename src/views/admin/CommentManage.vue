<script setup>
import { Delete, Edit, Plus, More } from "@element-plus/icons-vue";

import { ref } from "vue";
import {
    commentListService,
    commentDeleteService,
    getCommentByIdService
} from "@/api/comment.js";
import { getUserByIdService } from "@/api/user.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";

const router = useRouter();

//模型
const comments = ref([]);


//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  commentList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  commentList();
};

//获取query携带的postId
const id = Number(router.currentRoute.value.query.postId);

const commentList = async () => {
  const result = await commentListService(id);
  comments.value = result.data;
  total.value = result.data.total;

  for(let i in comments.value){
    let c = comments.value[i];
    let publisher = await getUserByIdService(c.publisherId);
    comments.value[i].username = publisher.data.username;
  }
  console.log(result);
};
commentList();

//删帖
const deleteComment = (commentId) => {
  ElMessageBox.confirm("你确认要删除该评论吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await commentDeleteService(commentId);
    ElMessage.success("删除成功");
    await commentList();
  });
};

//返回到帖子列表
const backToPost = async() => {
  router.push({ path: "/admin/post" });
}
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>评论管理</span>
      </div>
    </template>

    <!-- 评论列表 -->
    <el-table :data="comments" style="width: 100%">

      <el-table-column label="序号" type="index" width="100px"></el-table-column>
      <el-table-column label="内容" prop="content" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column label="评论人用户名" prop="username" :show-overflow-tooltip="true"></el-table-column>
      <!-- <el-table-column label="帖子id" prop="postId"></el-table-column> -->
      <!-- <el-table-column label="回复评论id" prop="replyCommentId"></el-table-column> -->
      <el-table-column label="发布时间" prop="publishTime"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteComment(row.id)"
          ></el-button>
        </template>
      </el-table-column>
      
      <template #empty>
        <el-empty description="没有数据" />
      </template>
    </el-table>

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
