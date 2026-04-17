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
  await router.push({ path: "/user/book" });
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
        <span class="header-title">《{{book.bookName}}》章节列表</span>
        <div class="extra">

          <el-button class="collect-btn" round v-if="state" @click="addCollection()">
            收藏
          </el-button>

          <el-button class="collect-btn collected" round v-else @click="deleteCollection()">
            已收藏
          </el-button>

          <el-button class="back-btn" @click="backToBook()">返回</el-button>
        </div>
      </div>
    </template>

    <div class="introduction-section">
      <div class="introduction-label">
        <span class="label-icon">📜</span>
        典籍简介
      </div>
      <div class="introduction-content">
        {{book.introduction || '暂无简介'}}
      </div>
    </div>

    <div class="chapters-section">
      <div class="chapters-header">
        <span class="chapters-icon">📚</span>
        <span class="chapters-title">篇章目录</span>
        <span class="chapters-count">共 {{ titles.length }} 篇</span>
      </div>
      
      <div class="chapters-list">
        <div 
          class="chapter-item" 
          v-for="(t, index) in titles" 
          :key="t"
          @click="showContent(t.contentId)"
        >
          <div class="chapter-index">{{ String(index + 1).padStart(2, '0') }}</div>
          <div class="chapter-info">
            <div class="chapter-title">
              <el-icon class="chapter-icon"><Document /></el-icon>
              {{t.title}}
            </div>
            <div class="chapter-hint">点击阅读 →</div>
          </div>
          <div class="chapter-arrow">
            <span>›</span>
          </div>
        </div>
      </div>
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

    .header-title {
      font-size: 22px;
      font-weight: 700;
      color: #6B4423;
      letter-spacing: 1px;
    }
  }

  .collect-btn {
    background: linear-gradient(135deg, #6B4423 0%, #8B5E3C 100%);
    color: white;
    border: none;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #8B5E3C 0%, #A67C52 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
    }

    &.collected {
      background: linear-gradient(135deg, #A67C52 0%, #C4A060 100%);
    }
  }

  .back-btn {
    background: linear-gradient(135deg, #6B4423 0%, #8B5E3C 100%);
    color: white;
    border: none;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #8B5E3C 0%, #A67C52 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 68, 35, 0.3);
    }
  }

  .introduction-section {
    margin: 24px 30px;
    padding: 20px 24px;
    background: linear-gradient(135deg, rgba(107, 68, 35, 0.04), rgba(139, 94, 60, 0.02));
    border-radius: 12px;
    border-left: 4px solid #8B5E3C;

    .introduction-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #6B4423;
      margin-bottom: 12px;

      .label-icon {
        font-size: 18px;
      }
    }

    .introduction-content {
      font-size: 16px;
      line-height: 1.9;
      color: #4A3728;
      text-align: justify;
    }
  }

  .chapters-section {
    margin: 24px 30px;

    .chapters-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px dashed rgba(107, 68, 35, 0.2);

      .chapters-icon {
        font-size: 20px;
      }

      .chapters-title {
        font-size: 18px;
        font-weight: 600;
        color: #6B4423;
      }

      .chapters-count {
        font-size: 14px;
        color: #999;
        background: rgba(107, 68, 35, 0.08);
        padding: 4px 12px;
        border-radius: 12px;
      }
    }

    .chapters-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .chapter-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      background: #fff;
      border-radius: 10px;
      border: 1px solid rgba(107, 68, 35, 0.1);
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #D2B48C, #C4A86A);
        transform: scaleY(0);
        transition: transform 0.3s ease;
      }

      &:hover {
        transform: translateX(8px);
        box-shadow: 0 6px 20px rgba(107, 68, 35, 0.12);
        border-color: rgba(139, 94, 60, 0.3);

        &::before {
          transform: scaleY(1);
        }

        .chapter-index {
          background: linear-gradient(135deg, #6B4423, #8B5E3C);
          color: #fff;
        }

        .chapter-title {
          color: #8B4513;
        }

        .chapter-hint {
          opacity: 1;
          transform: translateX(0);
        }

        .chapter-arrow {
          opacity: 1;
          transform: translateX(4px);
          color: #8B5E3C;
        }
      }

      .chapter-index {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: rgba(107, 68, 35, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 700;
        color: #6B4423;
        flex-shrink: 0;
        transition: all 0.3s ease;
      }

      .chapter-info {
        flex: 1;
        min-width: 0;

        .chapter-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 17px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
          transition: color 0.3s ease;

          .chapter-icon {
            font-size: 18px;
            color: #8B5E3C;
          }
        }

        .chapter-hint {
          font-size: 13px;
          color: #999;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }
      }

      .chapter-arrow {
        font-size: 24px;
        font-weight: 300;
        color: #C4A86A;
        opacity: 0;
        transform: translateX(0);
        transition: all 0.3s ease;
        flex-shrink: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    .header .header-title {
      font-size: 18px;
    }

    .introduction-section {
      margin: 16px;
      padding: 16px;

      .introduction-content {
        font-size: 15px;
      }
    }

    .chapters-section {
      margin: 16px;

      .chapter-item {
        padding: 14px 16px;

        .chapter-index {
          width: 36px;
          height: 36px;
          font-size: 13px;
        }

        .chapter-info .chapter-title {
          font-size: 15px;
        }
      }
    }
  }
}
</style>
