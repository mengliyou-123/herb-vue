<script setup>
import { ref } from "vue";
import { EditPen, Plus } from '@element-plus/icons-vue'
import {
  postAddService,
  postListService,
  postDeleteService,
  postDetailService,
  addViewService,
  myPostService,
  hotPostService
} from "@/api/post.js";
import { postCollListService } from "@/api/collections.js"
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token";
import {useUserInfoStore} from "@/stores/userInfo";
import { QuillEditor } from "@vueup/vue-quill";
import { ElMessage, ElMessageBox } from "element-plus";


const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();
const router = useRouter();

const posts = ref([]);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(10);

const onSizeChange = (size) => {
  pageSize.value = size;
  postList();
};

const onCurrentChange = (num) => {
  pageNum.value = num;
  postList();
};

const myPostNum = ref(0);
const myPosts = ref([]);

const postList = async() => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  };
  const result = await postListService(params);
  posts.value = result.data.items;
  total.value = result.data.total;  

  const params2 = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    posterId: userInfoStore.userInfo.id
  };
  const result2 = await myPostService(params2);
  myPosts.value = result2.data.items;
  myPostNum.value = myPosts.value.length;
};
postList();

const detail = async(id) => {
  addViewService(id);
  router.push({ path: "/user/postDetail", query: { id: id } });
}

const visibleDrawer = ref(false);
const postModel = ref({});
const uploadSuccess = (result) => { 
  postModel.value.coverImg = result.data;
};
const addPost = async () => {
  await postAddService(postModel.value);
  ElMessage.success("发布成功");
  visibleDrawer.value = false;
  await postList();
};
const showDrawer = () => {
  postModel.value = {
    title: "",
    content: "",
    coverImg: "",
    
  }
  visibleDrawer.value = true;
};

const myPost = async() => {
  router.push({ path: "/user/myPost"});
}

const showCollections = async() => {
    router.push({ path: "/mine/collections"});
}

const collNum = ref(0);
const postColl = async () => {
    const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    userId: userInfoStore.userInfo.id
  };
  const result = await postCollListService(params);
  const c = ref([]);
  c.value = result.data.items;
  collNum.value = c.value.length;
  
}
postColl();

const hotPosts = ref([]);
const getHotPosts = async () => {
  let result = await hotPostService();
  hotPosts.value = result.data;
}
getHotPosts();

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 16).replace('T', ' ');
};

// 截取内容
const truncateContent = (content) => {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > 120 ? text.substring(0, 120) + '...' : text;
};
</script>

<template>
  <div class="forum-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">💬 老茶馆</h1>
          <p class="page-desc">分享中医养生心得，交流健康生活智慧</p>
        </div>
        <button class="create-post-btn" @click="showDrawer()">
          <el-icon><EditPen/></el-icon>
          <span>发帖</span>
        </button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-layout">
      <!-- 帖子列表 -->
      <div class="posts-section">
        <!-- 帖子卡片 -->
        <div v-if="posts.length > 0" class="posts-list">
          <article 
            v-for="p in posts" 
            :key="p.id" 
            class="post-card hover-lift"
            @click="detail(p.id)"
          >
            <div class="post-cover">
              <img :src="p.coverImg || '/default.png'" :alt="p.title" />
              <div class="cover-overlay"></div>
            </div>
            
            <div class="post-content">
              <h2 class="post-title">{{ p.title }}</h2>
              
              <div class="post-meta">
                <span class="meta-item">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  {{ formatTime(p.postTime) }}
                </span>
                <span class="meta-item">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  {{ p.viewNum }} 次浏览
                </span>
              </div>

              <div class="post-excerpt" v-html="truncateContent(p.content)"></div>
            </div>

            <div class="post-action">
              <span class="read-more">阅读全文 →</span>
            </div>
          </article>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-icon">📝</div>
          <p class="empty-text">还没有任何帖子</p>
          <button class="empty-btn" @click="showDrawer()">发布第一个帖子</button>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 15, 20]"
            layout="total, sizes, prev, pager, next"
            background
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧边栏 -->
      <aside class="sidebar">
        <!-- 用户信息卡 -->
        <div class="user-card">
          <div class="user-avatar-wrapper">
            <el-image 
              :src="userInfoStore.userInfo.userPic || '/default.png'" 
              class="user-avatar"
              fit="cover"
            />
            <div class="avatar-ring"></div>
          </div>
          
          <h3 class="user-name">{{ userInfoStore.userInfo.nickname }}</h3>
          <p class="user-role">{{ userInfoStore.userInfo.role === 'ROLE_USER' ? '中医爱好者' : '管理员' }}</p>
          
          <button class="action-btn primary" @click="showDrawer()">
            <el-icon><EditPen /></el-icon>
            发布帖子
          </button>

          <div class="user-stats">
            <div class="stat-item" @click="myPost()">
              <div class="stat-value">{{ myPostNum }}</div>
              <div class="stat-label">我的帖子</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item" @click="showCollections()">
              <div class="stat-value">{{ collNum }}</div>
              <div class="stat-label">我的收藏</div>
            </div>
          </div>
        </div>

        <!-- 热门讨论 -->
        <div class="hot-posts-panel">
          <div class="panel-header">
            <span class="panel-icon">🔥</span>
            <h3 class="panel-title">热门讨论</h3>
          </div>
          
          <div class="panel-list">
            <div 
              v-for="(post, index) in hotPosts.slice(0, 8)" 
              :key="post.id"
              class="hot-post-item"
              @click="detail(post.id)"
            >
              <span class="rank-badge" :class="{ top: index < 3 }">{{ index + 1 }}</span>
              <span class="post-title-text">{{ post.title }}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- 发帖抽屉 -->
    <el-drawer
      v-model="visibleDrawer"
      title="发布新帖"
      direction="rtl"
      size="480px"
      class="custom-drawer"
    >  
      <el-form :model="postModel" label-position="top">
        <el-form-item label="标题">
          <el-input
            v-model="postModel.title"
            placeholder="请输入帖子标题"
            size="large"
          ></el-input>
        </el-form-item>

        <el-form-item label="内容">
          <div class="editor-container">
            <quill-editor
                theme="snow"
                v-model:content="postModel.content"
                contentType="html"
            />
          </div>
        </el-form-item>

        <el-form-item label="封面图片">
          <el-upload
            class="cover-uploader"
            :auto-upload="true"
            :show-file-list="false"
            action="/api/upload"
            name="file"
            :headers="{ Authorization: tokenStore.token }"
            :on-success="uploadSuccess"
          >
            <div v-if="postModel.coverImg" class="cover-preview">
              <el-image :src="postModel.coverImg" fit="cover" />
              <div class="preview-overlay">
                <el-icon><Plus /></el-icon>
                <span>更换图片</span>
              </div>
            </div>
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>上传封面</span>
            </div>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <button type="button" class="submit-btn" @click="addPost()">
            发布帖子
          </button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.forum-page {
  min-height: 100%;
}

// 页面头部
.page-header {
  background: linear-gradient(135deg, #6B4423 0%, #8B5E3C 50%, #A67C52 100%);
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .create-post-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: white;
    color: $color-primary;
    border: none;
    border-radius: $radius-md;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-normal;
    box-shadow: $shadow-md;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-lg;
    }
  }
}

// 主布局
.main-layout {
  display: flex;
  gap: 24px;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

// 帖子区域
.posts-section {
  flex: 1;
  min-width: 0;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.post-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  cursor: pointer;
  transition: all $transition-normal;
  border: 1px solid $border-light;
  display: flex;
  gap: 24px;
  padding: 24px;

  &:hover {
    border-color: rgba(107, 68, 35, 0.25);
    box-shadow: $shadow-md;

    .post-cover img {
      transform: scale(1.05);
    }

    .read-more {
      color: $color-primary;
    }
  }

  .post-cover {
    width: 220px;
    height: 160px;
    flex-shrink: 0;
    border-radius: $radius-md;
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
      background: linear-gradient(to bottom, transparent 60%, rgba(44, 36, 22, 0.1));
    }
  }

  .post-content {
    flex: 1;
    display: flex;
    flex-direction: column;

    .post-title {
      font-size: 19px;
      font-weight: 700;
      color: $text-primary;
      margin: 0 0 12px 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-meta {
      display: flex;
      gap: 20px;
      margin-bottom: 14px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: $text-muted;

        .icon {
          width: 16px;
          height: 16px;
        }
      }
    }

    .post-excerpt {
      font-size: 14px;
      color: $text-secondary;
      line-height: 1.7;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;

      :deep(p) {
        margin: 0;
      }
    }
  }

  .post-action {
    padding-top: 12px;
    border-top: 1px solid $border-light;

    .read-more {
      font-size: 13px;
      font-weight: 500;
      color: $text-muted;
      transition: color $transition-fast;
    }
  }
}

// 空状态
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: $bg-surface;
  border-radius: $radius-lg;
  border: 1px solid $border-light;

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 17px;
    color: $text-secondary;
    margin: 0 0 20px 0;
  }

  .empty-btn {
    padding: 12px 28px;
    background: $color-primary-gradient;
    color: white;
    border: none;
    border-radius: $radius-md;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-normal;

    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
  }
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

// 右侧边栏
.sidebar {
  width: 340px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    width: 100%;
  }
}

// 用户卡片
.user-card {
  background: $bg-surface;
  border-radius: $radius-lg;
  padding: 28px 24px;
  text-align: center;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;
  margin-bottom: 20px;

  .user-avatar-wrapper {
    position: relative;
    width: 88px;
    height: 88px;
    margin: 0 auto 18px;

    .user-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: $shadow-md;
    }

    .avatar-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px dashed rgba(107, 68, 35, 0.25);
      animation: rotate 20s linear infinite;
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .user-name {
    font-size: 19px;
    font-weight: 700;
    color: $text-primary;
    margin: 0 0 4px 0;
  }

  .user-role {
    font-size: 13px;
    color: $text-muted;
    margin: 0 0 20px 0;
  }

  .action-btn {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: $radius-md;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all $transition-normal;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;

    &.primary {
      background: $color-primary-gradient;
      color: white;

      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }
    }
  }

  .user-stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding-top: 20px;
    border-top: 1px solid $border-light;

    .stat-item {
      flex: 1;
      cursor: pointer;
      transition: opacity $transition-fast;

      &:hover {
        opacity: 0.7;
      }

      .stat-value {
        font-size: 22px;
        font-weight: 700;
        color: $color-primary;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        color: $text-muted;
      }
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: $border-light;
    }
  }
}

// 热门帖子面板
.hot-posts-panel {
  background: $bg-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  border: 1px solid $border-light;

  .panel-header {
    background: $color-primary-gradient;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 10px;

    .panel-icon {
      font-size: 18px;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin: 0;
    }
  }

  .panel-list {
    padding: 12px;
  }

  .hot-post-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: rgba(107, 68, 35, 0.04);

      .post-title-text {
        color: $color-primary;
      }
    }

    .rank-badge {
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: $text-muted;
      background: $bg-base;
      border-radius: $radius-sm;
      flex-shrink: 0;

      &.top {
        background: $color-accent-bg;
        color: $color-accent;
      }
    }

    .post-title-text {
      font-size: 14px;
      color: $text-secondary;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color $transition-fast;
    }
  }
}

// 抽屉样式
:deep(.custom-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 20px 24px;
    border-bottom: 1px solid $border-light;

    .el-drawer__title {
      font-size: 18px;
      font-weight: 700;
      color: $text-primary;
    }
  }

  .el-drawer__body {
    padding: 24px;
  }
}

.editor-container {
  width: 100%;
  border: 1px solid $border-default;
  border-radius: $radius-md;
  overflow: hidden;

  :deep(.ql-editor) {
    min-height: 200px;
    font-size: 14px;
  }
}

.cover-uploader {
  :deep(.el-upload) {
    border: 2px dashed $border-default;
    border-radius: $radius-md;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all $transition-normal;

    &:hover {
      border-color: $color-primary-light;
    }
  }
}

.cover-preview {
  width: 200px;
  height: 140px;
  position: relative;
  border-radius: $radius-md;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
  }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: white;
    font-size: 13px;
    opacity: 0;
    transition: opacity $transition-fast;

    .el-icon {
      font-size: 24px;
    }
  }

  &:hover .preview-overlay {
    opacity: 1;
  }
}

.upload-placeholder {
  width: 200px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $text-muted;

  .upload-icon {
    font-size: 32px;
    color: $text-light;
  }
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: $color-primary-gradient;
  color: white;
  border: none;
  border-radius: $radius-md;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all $transition-normal;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-md;
  }
}
</style>
