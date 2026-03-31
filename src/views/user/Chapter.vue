<script setup>
import { Document } from "@element-plus/icons-vue";

import { ref } from "vue";
import { contentDetailService } from "@/api/content.js";
import { chapterListService } from "@/api/chapter.js"
import { bookDetailService } from "@/api/book.js"
import { isBookCollService, bookCollNumAddService, bookCollAddService, bookCollDeleteService, bookCollNumSubtractService } from "@/api/collections";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {useUserInfoStore} from "@/stores/userInfo";

const router = useRouter();

const backToBook = async () => {
  await router.back();
};

//获取query携带的典籍id
const bookId = Number(router.currentRoute.value.query.bookId);

const titles = ref([]);

const titleList = async (bookId) => {
  let result = await chapterListService(bookId);
  titles.value = result.data; 
}

titleList(bookId);

const showContent = async (id) => {
  await router.push({ path: "/user/content", query: { id: id } });
};

//----------------------收藏典籍--------------------------
const state = ref(true);
const userInfoStore = useUserInfoStore();
const collection = ref({
    "bookId":0,
    "userId":0,
});

const isCollect = async () => {
    collection.value.userId = userInfoStore.userInfo.id;
    collection.value.bookId = Number(bookId);
    let result = await isBookCollService(collection.value);
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
    await bookCollNumAddService(Number(bookId));
    await bookCollAddService(Number(bookId));
    ElMessage.success("收藏成功");
    await titleList(bookId);
    await isCollect();
}

const deleteCollection = async () => {
    collection.value.userId = userInfoStore.userInfo.id;
    collection.value.bookId = Number(bookId);
    let result = await isBookCollService(collection.value);
    let collId = result.data.id;
    console.log(result.data.id);
    await bookCollDeleteService(collId);
    await bookCollNumSubtractService(Number(bookId));
    ElMessage.success("取消收藏成功");
    await titleList(bookId);
    await isCollect();
}

const book = ref({});
const getBookById = async () => {
  let result = await bookDetailService(bookId);
  book.value = result.data;
}
getBookById();
</script>

<template>
  <el-card class="page-container" style="width: 100%">
    <template #header>
      <div class="header">
        <span>《{{book.bookName}}》章节列表</span>
        <div class="extra">

          <el-button style="background-color:#8B4513;color:white;" round v-if="state" @click="addCollection()">
            收藏
          </el-button>

          <el-button style="background-color:#8B4513;color:white;" round v-else @click="deleteCollection()">
            已收藏
          </el-button>

          <el-button style="background-color:#8B4513;color:white;" @click="backToBook()">返回</el-button>
        </div>
      </div>
    </template>

    <div class="introduction">
      简介：{{book.introduction}}
    </div>

    <div class="titles" v-for="t in titles" :key="t">
            <div class="title" @click="showContent(t.contentId)">
                •<el-icon><Document /></el-icon>
                {{t.title}}
            </div> 

      </div>
  </el-card>
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

  .introduction {
    margin-left: 30px;
    margin-right: 25px;
    margin-top: 10px;
    line-height: 30px;
  }

  .titles {
    margin-left: 50px;
    margin-top: 20px;
    .title {
      margin-top: 20px;
    }
  }
}
</style>
