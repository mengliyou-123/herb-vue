<script setup>
import { Delete, Edit } from "@element-plus/icons-vue";
import { ref } from "vue";
import { userListService, userDeleteService } from "@/api/user.js";
import { deletePreByUserIdService, deleteBookByUserIdService, deletePostByUserIdService} from "@/api/collections.js"
import { deleteCommentsByUserIdService } from "@/api/comment.js"
import { ElMessage, ElMessageBox } from "element-plus";
import avatar from '@/assets/default.png'
const users = ref([

]);

// //控制添加分类弹窗
// const dialogVisible = ref(false)

//添加分类数据模型
const userModel = ref({
  username: "",
  nickname: "",
  email: "",
  userPic: "",
  createTime: "",
  updateTime: "",
  role: "",
});

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(10)//每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size
  userList()
}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num
  userList()
}

const userList = async () => {
    const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  }
  const result = await userListService(params);
  users.value = result.data.items
  total.value = result.data.total
};
userList();

const deleteUser = async (id) => {
 
  ElMessageBox.confirm("你确认要删除该用户吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    //先删全部的收藏，再删评论、帖子，最后删用户
    await deletePreByUserIdService(id);
    await deleteBookByUserIdService(id);
    await deletePostByUserIdService(id);
    await deleteCommentsByUserIdService(id);
    await deletePostByUserIdService(id);
    await userDeleteService(id);
    ElMessage.success("删除成功");
    await userList();
  });
}
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>用户列表</span>
      </div>
    </template>

    <el-table :data="users" style="width: 100%">
      <el-table-column label="序号" width="60" type="index"></el-table-column>
      <el-table-column label="头像" prop="userPic"  width="80px">
        <template v-slot="scope">   
          <img :src="scope.row.userPic?scope.row.userPic:avatar" alt=""  style="height: 40px; border-radius:50%; " />
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username"></el-table-column>
      <el-table-column label="昵称" prop="nickname"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="创建时间" prop="createTime"></el-table-column>
      <el-table-column label="修改时间" prop="updateTime"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Delete"
            circle
            plain
            type="danger"
            @click="deleteUser(row.id)"
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
</style>
