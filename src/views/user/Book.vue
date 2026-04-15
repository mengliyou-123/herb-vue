<script setup>
import { ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import { bookListService, bookDetailService } from "@/api/book.js";
import { useTokenStore } from "@/stores/token";
import { useRouter } from "vue-router";
import {useUserInfoStore} from "@/stores/userInfo";

const type = ref("");
const bookName = ref("");
const books = ref([]);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(10);

const onSizeChange = (size) => {
  pageSize.value = size;
  bookList();
};

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

const router = useRouter();

const chapterList = async (id) => {
  router.push({ path: "/user/chapter", query: { bookId: id } });
};
</script>

<template>
  <div class="book-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">📚 藏经阁</h1>
          <p class="page-desc">探寻中医典籍智慧，传承千年医学精华</p>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input 
        v-model="bookName" 
        placeholder="搜索典籍名称..." 
        class="search-input"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <button class="search-btn" @click="bookList()">
        搜索
      </button>
    </div>

    <!-- 典籍列表 -->
    <div v-if="books.length > 0" class="books-grid">
      <div 
        v-for="b in books" 
        :key="b.id" 
        class="book-card hover-lift"
        @click="chapterList(b.id)"
      >
        <div class="card-cover">
          <img :src="b.coverImg || '/default.png'" :alt="b.bookName" />
          <div class="cover-overlay"></div>
        </div>
        
        <div class="card-body">
          <h3 class="book-name">{{ b.bookName }}</h3>
          
          <div class="book-meta">
            <span class="meta-item">
              <span class="meta-label">作者</span>
              <span class="meta-value">{{ b.author || '佚名' }}</span>
            </span>
            <span class="meta-tag">{{ b.type || '典籍' }}</span>
          </div>

          <p class="book-intro" v-if="b.introduction">
            {{ b.introduction.substring(0, 80) }}{{ b.introduction.length > 80 ? '...' : '' }}
          </p>
        </div>

        <div class="card-footer">
          <span class="view-chapters">查看章节 →</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">📖</div>
      <p class="empty-text">暂无符合条件的典籍</p>
      <p class="empty-hint">试试调整搜索条件吧</p>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 18, 24]"
        layout="total, sizes, prev, pager, next"
        background
        :total="total"
        @size-change="onSizeChange"
        @current-change="onCurrentChange"
        class="custom-pagination"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.book-page {
  min-height: 100%;
}

// 页面头部
.page-header {
  background: $color-primary-gradient;
  border-radius: $radius-lg;
  padding: 28px 32px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -15%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .header-content {
    position: relative;
    z-index: 1;
  }

  .page-title {
    font-size: 26px;
    font-weight: 700;
    color: white;
    margin: 0 0 6px 0;
  }

  .page-desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }
}

// 搜索区域
.search-section {
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  display: flex;
  gap: 12px;

  .search-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      border-radius: $radius-md;
      box-shadow: 0 0 0 1px $border-default;
      
      &:hover, &.is-focus {
        box-shadow: 0 0 0 2px rgba(107, 68, 35, 0.2), $shadow-sm;
      }

      .el-input__inner {
        height: 44px;
      }
    }
  }

  .search-btn {
    padding: 0 28px;
    height: 44px;
    background: $color-primary-gradient;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-normal;
    white-space: nowrap;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }
}

// 典籍网格
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.book-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-normal;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: rgba(107, 68, 35, 0.25);

    .card-cover img {
      transform: scale(1.05);
    }

    .view-chapters {
      color: $color-primary;
      transform: translateX(4px);
    }
  }

  .card-cover {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 50%, rgba(44, 36, 22, 0.15));
      opacity: 0;
      transition: opacity $transition-normal;
    }

    &:hover .cover-overlay {
      opacity: 1;
    }
  }

  .card-body {
    padding: 16px 18px 12px;
    flex: 1;

    .book-name {
      font-size: 17px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 10px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .book-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;

        .meta-label {
          color: $text-muted;
        }

        .meta-value {
          color: $text-secondary;
          font-weight: 500;
        }
      }

      .meta-tag {
        display: inline-block;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        color: $color-success;
        background: $color-success-bg;
        border-radius: $radius-full;
      }
    }

    .book-intro {
      font-size: 13px;
      color: $text-muted;
      line-height: 1.6;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    padding: 10px 18px 14px;
    border-top: 1px solid $border-light;

    .view-chapters {
      font-size: 13px;
      font-weight: 500;
      color: $text-muted;
      transition: all $transition-fast;
      display: inline-block;
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: $bg-surface;
  border-radius: $radius-lg;
  border: 1px solid $border-light;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: $text-secondary;
    margin: 0 0 8px 0;
  }

  .empty-hint {
    font-size: 13px;
    color: $text-muted;
    margin: 0;
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
</style>
