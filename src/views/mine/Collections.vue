<script setup>
import { ref } from "vue";
import { StarFilled } from "@element-plus/icons-vue";
import {
  preCollListService,
  preCollDeleteService,
  preCollNumSubtractService,
  isPreCollService,
  bookCollListService,
  bookCollDeleteService,
  bookCollNumSubtractService,
  isBookCollService,
  postCollListService,
  postCollDeleteService,
  postCollNumSubtractService,
  isPostCollService,
} from "@/api/collections.js";
import { addViewService } from "@/api/post.js"
import { ElMessage, ElMessageBox } from "element-plus";
import { useUserInfoStore } from "@/stores/userInfo";
import { useRouter } from "vue-router";

const userInfoStore = useUserInfoStore();
const router = useRouter();
const activeTab = ref('prescription');

const pres = ref([]);
const pageNum1 = ref(1);
const total1 = ref(20);
const pageSize1 = ref(10);

const onSizeChange1 = (size) => { pageSize1.value = size; preCollList(); };
const onCurrentChange1 = (num) => { pageNum1.value = num; preCollList(); };

const preCollList = async () => {
  const params = { pageNum: pageNum1.value, pageSize: pageSize1.value, userId: userInfoStore.userInfo.id };
  const result = await preCollListService(params);
  pres.value = result.data.items;
  total1.value = result.data.total;
};
preCollList();

const preDetail = async (id) => { router.push({ path: "/user/preDetail", query: { id: id } }); }

const deletePre = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该方剂吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const collIdResult = await isPreCollService({ userId: userInfoStore.userInfo.id, preId: id });
    await preCollDeleteService(collIdResult.data.id);
    await preCollNumSubtractService(id);
    ElMessage.success("取消收藏成功");
    await preCollList();
  } catch (error) { if (error !== 'cancel') ElMessage.error("操作失败"); }
};

const books = ref([]);
const pageNum2 = ref(1);
const total2 = ref(20);
const pageSize2 = ref(10);

const onSizeChange2 = (size) => { pageSize2.value = size; bookCollList(); };
const onCurrentChange2 = (num) => { pageNum2.value = num; bookCollList(); };

const bookCollList = async () => {
  const params = { pageNum: pageNum2.value, pageSize: pageSize2.value, userId: userInfoStore.userInfo.id };
  const result = await bookCollListService(params);
  books.value = result.data.items;
  total2.value = result.data.total;
};
bookCollList();

const chapterList = async (id) => { router.push({ path: "/user/chapter", query: { bookId: id } }); };

const deleteBook = async (bookId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该典籍吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const collIdResult = await isBookCollService({ bookId, userId: userInfoStore.userInfo.id });
    await bookCollDeleteService(collIdResult.data.id);
    await bookCollNumSubtractService(bookId);
    ElMessage.success("取消收藏成功");
    await bookCollList();
  } catch (error) { if (error !== 'cancel') ElMessage.error("操作失败"); }
};

const posts = ref([]);
const pageNum3 = ref(1);
const total3 = ref(20);
const pageSize3 = ref(10);

const onSizeChange3 = (size) => { pageSize3.value = size; postCollList(); };
const onCurrentChange3 = (num) => { pageNum3.value = num; postCollList(); };

const postCollList = async () => {
  const params = { pageNum: pageNum3.value, pageSize: pageSize3.value, userId: userInfoStore.userInfo.id };
  const result = await postCollListService(params);
  posts.value = result.data.items;
  total3.value = result.data.total;
};
postCollList();

const detail = async (id) => {
  addViewService(id);
  router.push({ path: "/user/postDetail", query: { id: id } });
}

const deletePost = async (postId) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏该讨论帖吗？', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' });
    const collIdResult = await isPostCollService({ postId, userId: userInfoStore.userInfo.id });
    await postCollDeleteService(collIdResult.data.id);
    await postCollNumSubtractService(postId);
    ElMessage.success("取消收藏成功");
    await postCollList();
  } catch (error) { if (error !== 'cancel') ElMessage.error("操作失败"); }
};
</script>

<template>
  <div class="collections-page">
    <div class="page-header">
      <div class="header-content">
        <span class="header-icon">⭐</span>
        <div class="header-text">
          <h1>我的收藏</h1>
          <p>方剂、典籍、讨论帖，您珍藏的中医知识</p>
        </div>
      </div>
    </div>

    <div class="page-body">
      <el-tabs v-model="activeTab" class="collections-tabs">

        <el-tab-pane name="prescription">
          <template #label>
            <span class="tab-label"><span class="tab-icon">📜</span> 方剂</span>
          </template>

          <div v-if="pres.length > 0" class="collection-list">
            <div v-for="p in pres" :key="p.id" class="collection-card" @click="preDetail(p.id)">
              <div class="card-body">
                <h3 class="card-title">{{ p.preName }}</h3>
                <div class="card-meta">
                  <span class="meta-tag">{{ p.dosageForm }}</span>
                </div>
                <p class="card-desc">{{ p.originalText }}</p>
              </div>
              <el-button
                :icon="StarFilled"
                circle
                class="unfav-btn"
                @click.stop="deletePre(p.id)"
              />
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📜</span>
            <p>暂无方剂收藏</p>
          </div>

          <div class="pagination-wrap" v-if="total1 > 0">
            <el-pagination
              v-model:current-page="pageNum1"
              v-model:page-size="pageSize1"
              :page-sizes="[5, 10, 20, 30]"
              layout="jumper, total, sizes, prev, pager, next"
              background
              :total="total1"
              @size-change="onSizeChange1"
              @current-change="onCurrentChange1"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="book">
          <template #label>
            <span class="tab-label"><span class="tab-icon">📚</span> 典籍</span>
          </template>

          <div v-if="books.length > 0" class="book-grid">
            <div v-for="b in books" :key="b.id" class="book-card">
              <div class="book-cover-wrap" @click="chapterList(b.id)">
                <img :src="b.coverImg" class="book-cover" />
                <div class="book-overlay">
                  <span>查看详情</span>
                </div>
              </div>
              <div class="book-info">
                <h4 class="book-name">{{ b.bookName }}</h4>
                <span class="book-author">{{ b.author }}</span>
                <el-button link type="danger" size="small" class="unfav-link" @click="deleteBook(b.id)">
                  取消收藏
                </el-button>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📚</span>
            <p>暂无典籍收藏</p>
          </div>

          <div class="pagination-wrap" v-if="total2 > 0">
            <el-pagination
              v-model:current-page="pageNum2"
              v-model:page-size="pageSize2"
              :page-sizes="[5, 10, 20, 30]"
              layout="jumper, total, sizes, prev, pager, next"
              background
              :total="total2"
              @size-change="onSizeChange2"
              @current-change="onCurrentChange2"
            />
          </div>
        </el-tab-pane>

        <el-tab-pane name="post">
          <template #label>
            <span class="tab-label"><span class="tab-icon">💬</span> 讨论帖</span>
          </template>

          <div v-if="posts.length > 0" class="post-list">
            <div v-for="p in posts" :key="p.id" class="post-card" @click="detail(p.id)">
              <div class="post-cover-wrap">
                <img :src="p.coverImg" class="post-cover" />
              </div>
              <div class="post-body">
                <div class="post-top">
                  <h3 class="post-title">{{ p.title }}</h3>
                  <el-button
                    :icon="StarFilled"
                    circle
                    class="unfav-btn-small"
                    @click.stop="deletePost(p.id)"
                  />
                </div>
                <div class="post-meta">
                  <span class="meta-item">📅 {{ p.postTime?.substring(0, 10) }} {{ p.postTime?.substring(11, 19) }}</span>
                  <span class="meta-item">👁️ {{ p.viewNum }} 人浏览</span>
                </div>
                <p class="post-excerpt" v-html="p.content"></p>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">💬</span>
            <p>暂无讨论帖收藏</p>
          </div>

          <div class="pagination-wrap" v-if="total3 > 0">
            <el-pagination
              v-model:current-page="pageNum3"
              v-model:page-size="pageSize3"
              :page-sizes="[5, 10, 20, 30]"
              layout="jumper, total, sizes, prev, pager, next"
              background
              :total="total3"
              @size-change="onSizeChange3"
              @current-change="onCurrentChange3"
            />
          </div>
        </el-tab-pane>

      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.collections-page {
  min-height: 100%;
  background: $bg-base;
}

.page-header {
  background: $color-primary-gradient;
  padding: 32px 40px;
  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    .header-icon { font-size: 42px; }
    .header-text {
      h1 { color: #fff; font-size: 26px; margin: 0 0 6px; letter-spacing: 2px; }
      p { color: rgba(255,255,255,0.8); font-size: 14px; margin: 0; }
    }
  }
}

.page-body {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.collections-tabs {
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: 24px;

  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    .el-tabs__nav-wrap::after { display: none; }
    .el-tabs__item {
      font-size: 15px;
      font-weight: 500;
      color: $text-secondary;
      transition: all 0.25s ease;
      &.is-active { color: $color-primary; font-weight: 600; }
      &:hover { color: $color-primary; }
    }
    .el-tabs__active-bar {
      background: $color-primary;
      height: 3px;
      border-radius: 2px;
    }
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 6px;
    .tab-icon { font-size: 16px; }
  }
}

.collection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collection-card {
  display: flex;
  align-items: center;
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
    border-color: rgba($color-primary, 0.15);
  }
  .card-body {
    flex: 1;
    min-width: 0;
  }
  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 8px;
  }
  .card-meta { margin-bottom: 8px; }
  .meta-tag {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 12px;
    background: rgba($color-primary, 0.08);
    color: $color-primary;
  }
  .card-desc {
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.5;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .unfav-btn {
    flex-shrink: 0;
    margin-left: 16px;
    color: $color-accent;
    border-color: rgba($color-accent, 0.3);
    &:hover { background: rgba($color-accent, 0.08); color: $color-accent; }
  }
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.book-card {
  background: $bg-surface;
  border-radius: $radius-md;
  overflow: hidden;
  box-shadow: $shadow-sm;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: $shadow-md;
  }
}

.book-cover-wrap {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  .book-cover {
    width: 100%;
    height: 240px;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }
  .book-overlay {
    position: absolute;
    inset: 0;
    background: rgba($color-primary, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    span { color: #fff; font-weight: 500; font-size: 14px; }
  }
  &:hover {
    .book-cover { transform: scale(1.05); }
    .book-overlay { opacity: 1; }
  }
}

.book-info {
  padding: 14px;
  .book-name {
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
    margin: 0 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .book-author {
    font-size: 12px;
    color: $text-placeholder;
    display: block;
    margin-bottom: 8px;
  }
  .unfav-link { font-size: 12px; padding: 0; }
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  display: flex;
  background: lighten($bg-base, 1%);
  border-radius: $radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
  &:hover {
    transform: translateY(-1px);
    box-shadow: $shadow-sm;
    border-color: rgba($color-primary, 0.15);
  }
}

.post-cover-wrap {
  flex-shrink: 0;
  width: 200px;
  .post-cover {
    width: 200px;
    height: 140px;
    object-fit: cover;
    display: block;
  }
}

.post-body {
  flex: 1;
  padding: 16px 18px;
  min-width: 0;
}

.post-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
  .post-title {
    font-size: 17px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100% - 40px);
  }
  .unfav-btn-small {
    color: $color-accent;
    border-color: rgba($color-accent, 0.3);
    flex-shrink: 0;
    &:hover { background: rgba($color-accent, 0.08); color: $color-accent; }
  }
}

.post-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  .meta-item { font-size: 12px; color: $text-placeholder; }
}

.post-excerpt {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  :deep(strong), :deep(b) { font-weight: 600; }
  :deep(img) { max-width: 100%; border-radius: $radius-sm; }
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  .empty-icon { font-size: 44px; display: block; margin-bottom: 12px; }
  p { color: $text-placeholder; font-size: 15px; }
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid $border-color;
}

@media (max-width: 768px) {
  .page-body { padding: 16px; }
  .collections-tabs { padding: 16px; }
  .book-grid { grid-template-columns: repeat(2, 1fr); }
  .post-card { flex-direction: column; }
  .post-cover-wrap { width: 100%; }
  .post-cover { width: 100%; height: 180px; }
}
</style>
