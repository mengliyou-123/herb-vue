<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import { bookListService, bookDetailService } from "@/api/book.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {useUserInfoStore} from "@/stores/userInfo";

//用户搜索时选中的类型
const type = ref("");

//用户搜索时填写的书名
const bookName = ref("");

//典籍模型
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

//添加表单数据模型
const bookModel = ref({
  bookName: "",
  author: "",
  introduction: "",
  type: "",
  collNum: 0,
  coverImg: ""
});

const router = useRouter();

const chapterList= async (id) => {
  router.push({ path: "/user/chapter", query: { bookId: id } });
};

</script>

<template>

<el-card class="page-container">
 <div style="margin-left:30px;margin-top:10px;"> 
        <el-input v-model="bookName" placeholder="按书名检索" style="width:90%;height:40px;font-size:15px;"> </el-input>
        <el-button @click="bookList()" style="width:80px;height:40px;margin-left:10px;color:white;background-color:#8B4513">搜索</el-button>
  </div>
  <div style="margin-left:50px;margin-top:30px;">
    <el-row :gutter="20">
      <el-col :span="6" v-for="b in books" :key="b">
          <!-- <div v-for="b in books" :key="b"> -->
            <el-card shadow="hover" @click="chapterList(b.id)" class="card">
              <template #header>{{b.bookName}}</template>
              <img :src=b.coverImg class="image"/>
              <div style="display:flex;">
                <div style="width:125px;">
                  <el-text type="text" > {{b.author}} </el-text>
                </div>
                <div style="justify-content:space-between;">
                  <el-text type="text" > {{b.type}} </el-text>
                </div>
              
              </div>
            </el-card>
          <!-- </div> -->
      </el-col>
    </el-row>
  </div>
  
  
</el-card>

  
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
}

.image {
  width: 100%;
  height: 220px;
  display: block;
  margin-bottom: 10px;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.card {
  margin-top: 10px;
  width: 200px;
  height: 340px;
  background-color: rgba(255, 255, 255, 0.7)
}

.el-row {
  margin-bottom: 20px;
}
</style>
