<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import { contentDetailService, findChapterService } from "@/api/content.js";

import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";


const router = useRouter();
const chapter = ref({});
const book = ref({});

//获取query携带的内容id
const contentId = Number(router.currentRoute.value.query.id);


const content = ref({})

const contentDetail = async (contentId) => {
  let result = await contentDetailService(contentId);
  content.value = result.data;
  // let str = content.value.bookContent.replace(/ /g,' <br/>')
}
contentDetail(contentId);

//获取典籍id，book.value.id
const getBookId = async (contentId) => {
  //根据内容id找到章节
  const result1 = await findChapterService(contentId);
  chapter.value = result1.data;
  // const chapterId = chapter.value.chapterId;
  // const result2 = await findBookService(chapter.value);
  // book.value = result2.data;
  //console.log(chapter.value.bookId)
}
getBookId(contentId);

const backToChapter = async (bookId) => {
  //console.log(bookId)
  await router.push({ path: "/user/chapter", query: { bookId: bookId } });
};


</script>

<template>
  <el-card class="page-container" style="width: 100%">
    <template #header>
      <div class="header">
        <span>章节内容</span>
        <div class="extra">
          <el-button style="background-color:#8B4513;color:white;" @click="backToChapter(chapter.bookId)">返回</el-button>
        </div>
      </div>
    </template>
 
      <div style="width:90%;line-height:30px;margin-left:60px;" v-html="content.bookContent">
        </div>
  
        
      
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  background-color: #FAF8F5;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }


}
</style>
