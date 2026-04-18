<script setup>
import { ref } from "vue";
import { EditPen, Plus, Delete } from '@element-plus/icons-vue'
import {
  postAddService,
  postListService,
  postDeleteService,
  postDetailService,
  addViewService,
  myPostService,
  hotPostService,
  postUpdateService
} from "@/api/post.js";
import { postCollListService, deleteByPostIdService } from "@/api/collections.js"
import { deleteCommentsByPostIdService } from "@/api/comment.js"
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
const isEditMode = ref(false);
const currentEditPostId = ref(null);
const uploadSuccess = (result) => {
  postModel.value.coverImg = result.data;
};
const addPost = async () => {
  if (isEditMode.value) {
    await postUpdateService(postModel.value);
    ElMessage.success("编辑成功");
  } else {
    await postAddService(postModel.value);
    ElMessage.success("发布成功");
  }
  visibleDrawer.value = false;
  await postList();
  // 重置编辑模式状态
  isEditMode.value = false;
  currentEditPostId.value = null;
};
const showDrawer = () => {
  postModel.value = {
    title: "",
    content: "",
    coverImg: "",

  }
  visibleDrawer.value = true;
};

// 编辑帖子
const editPost = (event, post) => {
  event.stopPropagation();
  isEditMode.value = true;
  currentEditPostId.value = post.id;
  postModel.value = {
    id: post.id,
    title: post.title,
    content: post.content,
    coverImg: post.coverImg
  };
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

// 判断是否是自己的帖子
const isMyPost = (post) => {
  return post.posterId === userInfoStore.userInfo.id;
};

// 删除帖子
const deletePost = (event, id) => {
  event.stopPropagation();
  ElMessageBox.confirm("确定要删除这篇帖子吗？删除后无法恢复。", "删除确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger"
  }).then(async () => {
    await deleteByPostIdService(id);
    await deleteCommentsByPostIdService(id);
    await postDeleteService(id);
    ElMessage.success("删除成功");
    await postList();
  }).catch(() => {});
};
</script>

<template>
  <div class="teahouse-page">
    <!-- 复古茶馆风格头部 -->
    <div class="teahouse-hero">
      <!-- 背景装饰层 -->
      <div class="hero-bg">
        <!-- 温暖光晕 -->
        <div class="warm-orbs">
          <div class="warm-orb orb-1"></div>
          <div class="warm-orb orb-2"></div>
          <div class="warm-orb orb-3"></div>
        </div>

        <!-- 木质纹理叠加 -->
        <div class="wood-texture"></div>

        <!-- 飘落茶叶 -->
        <div class="falling-leaves">
          <span class="leaf leaf-1">🍃</span>
          <span class="leaf leaf-2">🍂</span>
          <span class="leaf leaf-3">🍃</span>
          <span class="leaf leaf-4">🍂</span>
          <span class="leaf leaf-5">🍃</span>
          <span class="leaf leaf-6">🍂</span>
        </div>

        <!-- 蒸汽效果 -->
        <div class="steam-effects">
          <span class="steam s1">~</span>
          <span class="steam s2">~</span>
          <span class="steam s3">~</span>
          <span class="steam s4">~</span>
        </div>

        <!-- 茶水波纹 -->
        <svg class="tea-waves" viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0,50 Q150,30 300,50 T600,50 T900,50 T1200,50 L1200,100 L0,100 Z"
                fill="rgba(139, 90, 43, 0.04)" class="wave w1"/>
          <path d="M0,60 Q200,40 400,60 T800,60 T1200,60 L1200,100 L0,100 Z"
                fill="rgba(160, 110, 55, 0.03)" class="wave w2"/>
        </svg>
      </div>

      <!-- 主内容区 -->
      <div class="hero-content">
        <!-- 左侧茶壶 -->
        <div class="teapot-section">
          <div class="teapot-glow"></div>
          <div class="teapot">
            <div class="pot-handle left"></div>
            <div class="pot-body">
              <div class="pot-lid">
                <div class="lid-knob"></div>
              </div>
              <div class="pot-spout"></div>
              <div class="pot-inner">
                <span class="pot-icon">🫖</span>
                <div class="pot-steam-group">
                  <span class="pot-steam ps1">♨️</span>
                  <span class="pot-steam ps2">♨️</span>
                  <span class="pot-steam ps3">♨️</span>
                </div>
              </div>
              <div class="pot-pattern"></div>
            </div>
            <div class="pot-handle right"></div>
          </div>
          <div class="teacups">
            <span class="cup c1">🍵</span>
            <span class="cup c2">🍵</span>
          </div>
        </div>

        <!-- 中间招牌标题 -->
        <div class="signboard-section">
          <!-- 顶部标签 -->
          <div class="sign-badges">
            <span class="badge teahouse-badge">
              <span class="badge-icon">🍵</span>
              闲话家常
            </span>
            <span class="badge sub-badge">Traditional Teahouse Forum</span>
          </div>

          <!-- 木制招牌 -->
          <div class="wooden-sign">
            <div class="sign-frame">
              <h1 class="sign-title">
                <span class="title-char" v-for="(char, index) in '老茶馆'.split('')" :key="index"
                      :style="{ animationDelay: `${index * 0.2}s` }">{{ char }}</span>
              </h1>
            </div>
            <div class="sign-nails">
              <span class="nail n1"></span>
              <span class="nail n2"></span>
              <span class="nail n3"></span>
              <span class="nail n4"></span>
            </div>
          </div>

          <!-- 副标语 -->
          <p class="sign-subtitle">
            <span class="sub-text">一盏清茶 · 谈天说地 · 分享智慧</span>
          </p>

          <!-- 数据统计 -->
          <div class="teahouse-stats">
            <div class="stat-item">
              <div class="stat-icon-wrap">
                <span class="stat-icon">💬</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">{{ total }}</span>
                <span class="stat-label">篇帖子</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-wrap">
                <span class="stat-icon">👥</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">活跃</span>
                <span class="stat-label">茶客云集</span>
              </div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-icon-wrap">
                <span class="stat-icon">🔥</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">热聊</span>
                <span class="stat-label">精彩话题</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧竹简/菜单元素 -->
        <div class="bamboo-menu-section">
          <div class="bamboo-scroll">
            <div class="scroll-line" v-for="i in 5" :key="i"></div>
            <div class="scroll-text">
              <span class="scroll-char" v-for="(c, idx) in '品茗论道'.split('')" :key="idx"
                    :style="{ animationDelay: `${idx * 0.3}s` }">{{ c }}</span>
            </div>
          </div>
          <div class="tea-caddy">
            <div class="caddy-body"></div>
            <div class="caddy-label">茶</div>
          </div>
        </div>
      </div>

      <!-- 发帖按钮（悬浮在右上角） -->
      <button class="floating-post-btn" @click="showDrawer()">
        <el-icon><EditPen /></el-icon>
        <span>发新帖</span>
      </button>
    </div>

    <div class="page-body">
      <div class="main-area">
        <!-- 帖子列表 -->
        <div class="posts-section">
          <div v-if="posts.length > 0" class="posts-list">
            <transition-group name="post-list" tag="div" class="list-wrapper">
              <article
                v-for="(p, index) in posts"
                :key="p.id"
                class="teahouse-post-card"
                :style="{ animationDelay: `${index * 0.08}s` }"
                @click="detail(p.id)"
              >
                <!-- 左侧装饰条 -->
                <div class="card-decor-bar">
                  <div class="bar-pattern"></div>
                </div>

                <!-- 封面图 -->
                <div class="post-cover">
                  <img :src="p.coverImg || '/default.png'" :alt="p.title" />
                  <div class="cover-overlay">
                    <div class="overlay-grain"></div>
                  </div>
                  <div class="cover-corner top-right"></div>
                  <div class="cover-corner bottom-left"></div>
                </div>

                <!-- 内容区 -->
                <div class="post-content">
                  <div class="post-title-row">
                    <h2 class="post-title">{{ p.title }}</h2>
                    <div class="post-actions">
                      <el-button
                        v-if="isMyPost(p)"
                        class="edit-btn"
                        :icon="EditPen"
                        circle
                        size="small"
                        @click="editPost($event, p)"
                      />
                      <el-button
                        v-if="isMyPost(p)"
                        class="delete-btn"
                        :icon="Delete"
                        circle
                        size="small"
                        @click="deletePost($event, p.id)"
                      />
                    </div>
                  </div>

                  <div class="post-meta">
                    <span class="meta-item time-meta">
                      <span class="meta-icon">🕐</span>
                      {{ formatTime(p.postTime) }}
                    </span>
                    <span class="meta-item view-meta">
                      <span class="meta-icon">👁️</span>
                      {{ p.viewNum }} 次浏览
                    </span>
                  </div>

                  <div class="post-excerpt" v-html="truncateContent(p.content)"></div>

                  <div class="post-footer">
                    <span class="read-more">
                      <span class="read-text">进茶馆聊聊 →</span>
                      <span class="tea-drop">🍵</span>
                    </span>
                  </div>
                </div>

                <!-- 右侧装饰 -->
                <div class="card-side-decor">
                  <div class="decor-dot" v-for="i in 3" :key="i"></div>
                </div>
              </article>
            </transition-group>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <div class="empty-tea-scene">
              <span class="empty-teapot">🫖</span>
              <div class="empty-steam-circle">
                <span class="empty-steam es1">~</span>
                <span class="empty-steam es2">~</span>
              </div>
            </div>
            <h3>茶馆还空着呢</h3>
            <p>快来发布第一个帖子，开启话题吧！</p>
            <button class="empty-post-btn" @click="showDrawer()">
              <el-icon><EditPen /></el-icon>
              发第一个帖子
            </button>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap" v-if="total > 0">
            <el-pagination
              v-model:current-page="pageNum"
              v-model:page-size="pageSize"
              :page-sizes="[5, 10, 15, 20]"
              layout="jumper, total, sizes, prev, pager, next"
              background
              :total="total"
              @size-change="onSizeChange"
              @current-change="onCurrentChange"
            />
          </div>
        </div>
      </div>

      <!-- 侧边栏 -->
      <aside class="sidebar">
        <!-- 茶客信息卡 -->
        <div class="guest-card">
          <div class="card-header">
            <div class="header-decoration"></div>
            <span class="header-title">🧑‍🤝‍🧑 本店茶客</span>
          </div>
          <div class="card-body">
            <div class="guest-avatar-wrap">
              <el-image
                :src="userInfoStore.userInfo.userPic || '/default.png'"
                class="guest-avatar"
                fit="cover"
              />
              <div class="avatar-border"></div>
              <div class="online-indicator"></div>
            </div>

            <h3 class="guest-name">{{ userInfoStore.userInfo.nickname }}</h3>
            <p class="guest-role">
              {{ userInfoStore.userInfo.role === 'ROLE_USER' ? '🍵 品茶常客' : '👨‍🍳 茶馆掌柜' }}
            </p>

            <button class="action-btn primary-btn" @click="showDrawer()">
              <el-icon><EditPen /></el-icon>
              发帖畅聊
            </button>

            <div class="guest-stats">
              <div class="gstat-item" @click="myPost()">
                <div class="gstat-value">{{ myPostNum }}</div>
                <div class="gstat-label">我的帖子</div>
              </div>
              <div class="gstat-divider"></div>
              <div class="gstat-item" @click="showCollections()">
                <div class="gstat-value">{{ collNum }}</div>
                <div class="gstat-label">收藏夹</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门话题榜 -->
        <div class="hot-topics-panel">
          <div class="panel-header hot-header">
            <span class="panel-icon">🔥</span>
            <span class="panel-title">热门话题</span>
            <span class="panel-badge">HOT</span>
          </div>
          <div class="panel-body">
            <div class="topic-list">
              <div
                v-for="(post, index) in hotPosts.slice(0, 8)"
                :key="post.id"
                class="topic-item"
                @click="detail(post.id)"
              >
                <div class="topic-rank" :class="{ top3: index < 3 }">
                  <span v-if="index < 3" class="rank-crown">
                    {{ ['🥇', '🥈', '🥉'][index] }}
                  </span>
                  <span v-else class="rank-num">{{ index + 1 }}</span>
                </div>
                <div class="topic-info">
                  <h4 class="topic-title">{{ post.title }}</h4>
                  <div class="topic-meta">
                    <span class="topic-heat">
                      <span class="heat-bar" :style="{ width: `${80 - index * 8}%` }"></span>
                    </span>
                    <span class="topic-views">{{ post.viewNum }}浏览</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 茶馆小贴士 -->
        <div class="tips-panel">
          <div class="panel-header tips-header">
            <span class="panel-title">📜 茶馆规矩</span>
          </div>
          <div class="panel-body tips-body">
            <ul class="tips-list">
              <li>🍵 有话慢慢说，帖子要用心写</li>
              <li>💬 尊重每位茶客的发言</li>
              <li>🔥 热门话题值得参与讨论</li>
              <li>⭐ 好帖子记得收藏起来</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>

    <!-- 发帖抽屉 -->
    <el-drawer
      v-model="visibleDrawer"
      title=""
      direction="rtl"
      size="480px"
      class="teahouse-drawer"
    >
      <template #header>
        <div class="drawer-custom-header">
          <span class="drawer-title-icon">✍️</span>
          <h3 class="drawer-title">{{ isEditMode ? '编辑帖子' : '撰写新帖' }}</h3>
          <p class="drawer-subtitle">{{ isEditMode ? '修改您的帖子内容' : '分享您的见解与心得' }}</p>
        </div>
      </template>

      <el-form :model="postModel" label-position="top">
        <el-form-item label="帖子标题">
          <el-input
            v-model="postModel.title"
            placeholder="给您的帖子起个响亮的标题..."
            size="large"
          ></el-input>
        </el-form-item>

        <el-form-item label="帖子内容">
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
          <button type="button" class="submit-post-btn" @click="addPost()">
            <span class="btn-icon">{{ isEditMode ? '💾' : '📮' }}</span>
            {{ isEditMode ? '保存修改' : '发布帖子' }}
          </button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.teahouse-page {
  min-height: 100%;
  background: linear-gradient(180deg, #FBF8F3 0%, #F5F1E8 25%, #FAF8F5 50%, #fff 100%);
  position: relative;
}

// ==================== 关键帧动画定义 ====================

@keyframes warmFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  33% { transform: translate(-28px, -22px) scale(1.06); opacity: 0.9; }
  66% { transform: translate(18px, 16px) scale(0.96); opacity: 0.75; }
}

@keyframes warmFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(22px, -18px); }
}

@keyframes warmPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.85; }
}

@keyframes leafFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.7; }
  90% { opacity: 0.5; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
}

@keyframes leafSway {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(15px) rotate(10deg); }
  75% { transform: translateX(-10px) rotate(-8deg); }
}

@keyframes steamRise {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  30% { opacity: 0.7; }
  100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
}

@keyframes waveRipple {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-20px); }
}

@keyframes teapotSteam {
  0%, 100% { opacity: 0.4; transform: translateY(0) scale(1); }
  50% { opacity: 0.9; transform: translateY(-8px) scale(1.1); }
}

@keyframes cupBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes signSwing {
  0%, 100% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
}

@keyframes charFadeIn {
  from { opacity: 0; transform: translateY(20px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes bambooUnroll {
  from { height: 0; opacity: 0; }
  to { height: 100%; opacity: 1; }
}

@keyframes scrollTextReveal {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes floatGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulseRing {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(1.3); opacity: 0; }
}

// ==================== 样式定义 ====================

.teahouse-hero {
  position: relative;
  padding: 52px 40px 60px;
  overflow: hidden;
  background: transparent;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .warm-orbs {
    .warm-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(85px);

      &.orb-1 {
        width: 520px;
        height: 520px;
        background: radial-gradient(circle, rgba(139, 90, 43, 0.18) 0%, transparent 70%);
        top: -190px;
        right: -140px;
        animation: warmFloat1 18s ease-in-out infinite;
      }

      &.orb-2 {
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(160, 110, 55, 0.14) 0%, transparent 70%);
        bottom: -130px;
        left: -110px;
        animation: warmFloat2 22s ease-in-out infinite reverse;
      }

      &.orb-3 {
        width: 260px;
        height: 260px;
        background: radial-gradient(circle, rgba(205, 133, 63, 0.12) 0%, transparent 70%);
        top: 46%;
        left: 51%;
        transform: translate(-50%, -50%);
        animation: warmPulse 13s ease-in-out infinite;
      }
    }
  }

  .wood-texture {
    position: absolute;
    inset: 0;
    opacity: 0.02;
    background-image:
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 2px,
        rgba(139, 90, 43, 0.3) 2px,
        rgba(139, 90, 43, 0.3) 4px
      );
  }

  .falling-leaves {
    .leaf {
      position: absolute;
      font-size: 20px;
      animation: leafFall 12s linear infinite;
      filter: blur(0.3px);

      &.leaf-1 { left: 8%; animation-delay: 0s; font-size: 24px; }
      &.leaf-2 { left: 25%; animation-delay: 2.5s; animation-duration: 14s; }
      &.leaf-3 { right: 20%; animation-delay: 5s; font-size: 18px; }
      &.leaf-4 { right: 8%; animation-delay: 7.5s; animation-duration: 11s; font-size: 22px; }
      &.leaf-5 { left: 45%; animation-delay: 3s; font-size: 16px; animation-duration: 15s; }
      &.leaf-6 { left: 68%; animation-delay: 9s; animation-duration: 13s; }
    }

    .leaf {
      animation-name: leafFall, leafSway;
      animation-timing-function: linear, ease-in-out;
    }
  }

  .steam-effects {
    .steam {
      position: absolute;
      color: rgba(255, 255, 255, 0.35);
      font-size: 28px;
      animation: steamRise 4s ease-in-out infinite;

      &.s1 { bottom: 18%; left: 12%; animation-delay: 0s; }
      &.s2 { bottom: 28%; left: 25%; animation-delay: 1.2s; font-size: 22px; }
      &.s3 { bottom: 22%; right: 20%; animation-delay: 2.4s; }
      &.s4 { bottom: 32%; right: 10%; animation-delay: 3.6s; font-size: 24px; }
    }
  }

  .tea-waves {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80px;

    .wave {
      animation: waveRipple 14s ease-in-out infinite;

      &.w2 {
        animation-duration: 18s;
        animation-direction: reverse;
      }
    }
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 44px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

// ==================== 茶壶区域 ====================
.teapot-section {
  position: relative;

  .teapot-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 190px;
    height: 190px;
    background: radial-gradient(circle, rgba(205, 133, 63, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: warmPulse 3.5s ease-in-out infinite;
  }

  .teapot {
    position: relative;
    z-index: 2;
    animation: signSwing 5s ease-in-out infinite;
    transform-origin: bottom center;

    .pot-handle {
      position: absolute;
      top: 28px;
      width: 14px;
      height: 48px;
      background: linear-gradient(90deg, #A67C52, #C4956A, #A67C52);
      border-radius: 8px;
      box-shadow: 2px 0 6px rgba(0, 0, 0, 0.15);

      &.left { left: -12px; }
      &.right { right: -12px; }
    }

    .pot-body {
      width: 105px;
      height: 82px;
      background: linear-gradient(180deg, #CD853F 0%, #B8860B 50%, #8B6914 100%);
      border-radius: 12px 12px 28px 28px;
      position: relative;
      box-shadow:
        inset 0 4px 10px rgba(255, 255, 255, 0.2),
        inset 0 -4px 8px rgba(0, 0, 0, 0.2),
        0 8px 24px rgba(184, 134, 11, 0.35);

      .pot-lid {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 72px;
        height: 14px;
        background: linear-gradient(180deg, #DEB887, #CD853F);
        border-radius: 8px 8px 4px 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

        .lid-knob {
          position: absolute;
          top: -7px;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 10px;
          background: linear-gradient(180deg, #DEB887, #B8860B);
          border-radius: 6px 6px 3px 3px;
        }
      }

      .pot-spout {
        position: absolute;
        top: 22px;
        right: -18px;
        width: 22px;
        height: 14px;
        background: linear-gradient(180deg, #CD853F, #8B6914);
        border-radius: 0 14px 14px 0;
        transform: rotate(-20deg);
        box-shadow: 2px 0 4px rgba(0, 0, 0, 0.15);
      }

      .pot-inner {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background: linear-gradient(180deg, #654321 0%, #3D2914 100%);
        border-radius: 8px 8px 20px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;

        .pot-icon {
          font-size: 36px;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        }

        .pot-steam-group {
          display: flex;
          gap: 5px;

          .pot-steam {
            font-size: 12px;
            animation: teapotSteam 2s ease-in-out infinite;

            &.ps1 { animation-delay: 0s; }
            &.ps2 { animation-delay: 0.4s; font-size: 10px; }
            &.ps3 { animation-delay: 0.8s; font-size: 14px; }
          }
        }
      }

      .pot-pattern {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: 50px;
        height: 3px;
        background: repeating-linear-gradient(
          90deg,
          rgba(222, 184, 135, 0.5) 0px,
          rgba(222, 184, 135, 0.5) 4px,
          transparent 4px,
          transparent 8px
        );
        border-radius: 2px;
      }
    }
  }

  .teacups {
    position: absolute;
    bottom: -25px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 12px;

    .cup {
      font-size: 26px;
      animation: cupBounce 3s ease-in-out infinite;

      &.c1 { animation-delay: 0s; }
      &.c2 { animation-delay: 0.6s; }
    }
  }
}

// ==================== 招牌区域 ====================
.signboard-section {
  .sign-badges {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;

    .teahouse-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 18px;
      background: linear-gradient(135deg, #8B4513, #A0522D);
      color: #FFF8DC;
      font-size: 13px;
      font-weight: 700;
      border-radius: 20px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.35);
      letter-spacing: 0.5px;

      .badge-icon { font-size: 15px; }
    }

    .sub-badge {
      font-size: 12px;
      color: #8B6914;
      font-weight: 500;
      letter-spacing: 1px;
      font-style: italic;
    }
  }

  .wooden-sign {
    position: relative;
    margin-bottom: 14px;

    .sign-frame {
      background: linear-gradient(180deg, #DEB887 0%, #D2B48C 30%, #C4A86A 70%, #B89A5D 100%);
      padding: 20px 44px;
      border-radius: 8px;
      box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.3),
        inset 0 -3px 6px rgba(0, 0, 0, 0.15),
        0 8px 24px rgba(139, 69, 19, 0.3);
      position: relative;
      border: 3px solid #8B6914;
    }

    .sign-title {
      margin: 0;
      display: flex;
      gap: 10px;
      justify-content: center;

      .title-char {
        font-family: "KaiTi", "STKaiti", "SimSun", serif;
        font-size: 48px;
        font-weight: 900;
        background: linear-gradient(180deg, #5D3A1A 0%, #8B4513 40%, #A0522D 70%, #5D3A1A 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        display: inline-block;
        animation: charFadeIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        filter: drop-shadow(0 2px 3px rgba(93, 58, 26, 0.3));
      }
    }

    .sign-nails {
      .nail {
        position: absolute;
        width: 10px;
        height: 10px;
        background: radial-gradient(circle, #8B6914 0%, #654321 100%);
        border-radius: 50%;
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.3);

        &.n1 { top: 8px; left: 8px; }
        &.n2 { top: 8px; right: 8px; }
        &.n3 { bottom: 8px; left: 8px; }
        &.n4 { bottom: 8px; right: 8px; }
      }
    }
  }

  .sign-subtitle {
    text-align: center;
    margin: 0 0 22px;

    .sub-text {
      font-size: 14px;
      color: #8B6914;
      letter-spacing: 3px;
      font-weight: 500;
    }
  }

  .teahouse-stats {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 14px;
      border: 1px solid rgba(139, 105, 20, 0.15);
      box-shadow: 0 4px 14px rgba(139, 69, 19, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 22px rgba(139, 69, 19, 0.12);
        border-color: rgba(139, 105, 20, 0.3);
      }

      &.highlight {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.06), rgba(160, 82, 45, 0.04));
        border-color: rgba(205, 133, 63, 0.3);
      }

      .stat-icon-wrap {
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #FAF8F5, #FFF9F0);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .stat-icon { font-size: 21px; }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-num {
          font-size: 23px;
          font-weight: 800;
          color: #8B4513;
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          color: #8B6914;
          font-weight: 500;
        }
      }
    }
  }
}

// ==================== 竹简/菜单区域 ====================
.bamboo-menu-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;

  .bamboo-scroll {
    position: relative;
    width: 56px;
    height: 140px;
    background: linear-gradient(180deg, #D2B48C 0%, #C4A86A 50%, #B89A5D 100%);
    border-radius: 6px;
    border: 2px solid #8B6914;
    box-shadow:
      inset 0 2px 4px rgba(255, 255, 255, 0.2),
      0 4px 12px rgba(139, 69, 19, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0;
    overflow: hidden;

    .scroll-line {
      width: 36px;
      height: 2px;
      background: rgba(101, 67, 33, 0.3);
      animation: bambooUnroll 0.6s ease backwards;

      &:nth-child(1) { animation-delay: 0.1s; }
      &:nth-child(2) { animation-delay: 0.2s; }
      &:nth-child(3) { animation-delay: 0.3s; }
      &:nth-child(4) { animation-delay: 0.4s; }
      &:nth-child(5) { animation-delay: 0.5s; }
    }

    .scroll-text {
      position: absolute;
      bottom: 12px;
      display: flex;
      gap: 4px;

      .scroll-char {
        font-family: "KaiTi", "STKaiti", serif;
        font-size: 17px;
        font-weight: 900;
        color: #5D3A1A;
        opacity: 0;
        animation: scrollTextReveal 0.5s ease forwards;

        &:nth-child(1) { animation-delay: 0.8s; }
        &:nth-child(2) { animation-delay: 1.1s; }
        &:nth-child(3) { animation-delay: 1.4s; }
        &:nth-child(4) { animation-delay: 1.7s; }
      }
    }
  }

  .tea-caddy {
    position: relative;

    .caddy-body {
      width: 48px;
      height: 62px;
      background: linear-gradient(180deg, #8B4513 0%, #654321 100%);
      border-radius: 8px 8px 12px 12px;
      box-shadow:
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        0 4px 10px rgba(0, 0, 0, 0.25);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 6px;
        left: 8px;
        right: 8px;
        height: 14px;
        background: linear-gradient(180deg, #3D2914, #2D1F0E);
        border-radius: 4px;
      }
    }

    .caddy-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 20px;
      font-weight: 900;
      color: #DEB887;
    }
  }
}

// ==================== 悬浮发帖按钮 ====================
.floating-post-btn {
  position: absolute;
  top: 24px;
  right: 40px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #FFF8DC;
  border: none;
  border-radius: 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(139, 69, 19, 0.35);

  &:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 24px rgba(139, 69, 19, 0.45);
  }

  .el-icon { font-size: 16px; }
}

// ==================== 主体区域 ====================
.page-body {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.main-area {
  flex: 1;
  min-width: 0;
}

.posts-section { margin-bottom: 24px; }
.list-wrapper { display: flex; flex-direction: column; gap: 16px; }

// ==================== 帖子卡片 ====================
.teahouse-post-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(139, 105, 20, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  display: flex;
  position: relative;
  animation: slideInUp 0.5s ease backwards;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(139, 69, 19, 0.15);
    border-color: rgba(205, 133, 63, 0.35);

    .card-decor-bar {
      background: linear-gradient(180deg, #8B4513, #A0522D);
      .bar-pattern { opacity: 1; }
    }

    .post-cover img {
      transform: scale(1.06);
    }

    .cover-corner { opacity: 1; }

    .read-more {
      color: #8B4513;

      .tea-drop {
        animation: floatGentle 1s ease-in-out infinite;
      }
    }

    .card-side-decor .decor-dot {
      background: #CD853F;
      box-shadow: 0 0 8px rgba(205, 133, 63, 0.5);
    }
  }

  // 左侧装饰条
  .card-decor-bar {
    width: 6px;
    background: linear-gradient(180deg, #D2B48C, #C4A86A);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;

    .bar-pattern {
      width: 2px;
      height: 60%;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.5) 0px,
        rgba(255, 255, 255, 0.5) 4px,
        transparent 4px,
        transparent 8px
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  // 封面图
  .post-cover {
    width: 200px;
    height: 150px;
    flex-shrink: 0;
    overflow: hidden;
    position: relative;
    background: linear-gradient(135deg, #FAF8F5, #FFF9F0);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, transparent 50%, rgba(0, 0, 0, 0.08) 100%);

      .overlay-grain {
        position: absolute;
        inset: 0;
        opacity: 0.03;
        background-image:
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(139, 69, 19, 0.5) 8px,
            rgba(139, 69, 19, 0.5) 9px
          );
      }
    }

    .cover-corner {
      position: absolute;
      width: 20px;
      height: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;

      &.top-right {
        top: 6px;
        right: 6px;
        border-top: 2px solid rgba(205, 133, 63, 0.5);
        border-right: 2px solid rgba(205, 133, 63, 0.5);
      }

      &.bottom-left {
        bottom: 6px;
        left: 6px;
        border-bottom: 2px solid rgba(205, 133, 63, 0.5);
        border-left: 2px solid rgba(205, 133, 63, 0.5);
      }
    }
  }

  // 内容区
  .post-content {
    flex: 1;
    padding: 18px 20px 16px;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .post-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }

    .post-title {
      font-size: 18px;
      font-weight: 700;
      color: #5D3A1A;
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s ease;
      flex: 1;

      .teahouse-post-card:hover & { color: #8B4513; }
    }

    .post-actions {
      display: flex;
      gap: 8px;
    }

    .edit-btn {
      flex-shrink: 0;
      background: rgba(82, 196, 26, 0.08);
      border: 1px solid rgba(82, 196, 26, 0.2);
      color: #4CAF50;
      transition: all 0.3s ease;
      opacity: 0;
      transform: scale(0.8);

      .teahouse-post-card:hover & {
        opacity: 1;
        transform: scale(1);
      }

      &:hover {
        background: #4CAF50;
        border-color: #4CAF50;
        color: #fff;
        transform: scale(1.1);
      }
    }

    .delete-btn {
      flex-shrink: 0;
      background: rgba(220, 76, 100, 0.08);
      border: 1px solid rgba(220, 76, 100, 0.2);
      color: #DC4C64;
      transition: all 0.3s ease;
      opacity: 0;
      transform: scale(0.8);

      .teahouse-post-card:hover & {
        opacity: 1;
        transform: scale(1);
      }

      &:hover {
        background: #DC4C64;
        border-color: #DC4C64;
        color: #fff;
        transform: scale(1.1);
      }
    }

    .post-meta {
      display: flex;
      gap: 18px;
      margin-bottom: 10px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
        color: #8B6914;

        .meta-icon { font-size: 13px; }
      }
    }

    .post-excerpt {
      font-size: 13px;
      color: #666;
      line-height: 1.7;
      flex: 1;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      :deep(p) { margin: 0; }
    }

    .post-footer {
      padding-top: 10px;
      border-top: 1px solid rgba(139, 105, 20, 0.1);

      .read-more {
        font-size: 13px;
        font-weight: 600;
        color: #8B6914;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 6px;

        .tea-drop { font-size: 14px; }
      }
    }
  }

  // 右侧装饰点
  .card-side-decor {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
    flex-shrink: 0;

    .decor-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #D2B48C;
      transition: all 0.3s ease;
    }
  }
}

.post-list-enter-active,
.post-list-leave-active { transition: all 0.4s ease; }
.post-list-enter-from,
.post-list-leave-to { opacity: 0; transform: translateX(-15px); }

// ==================== 空状态 ====================
.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.1);

  .empty-tea-scene {
    position: relative;
    display: inline-block;
    margin-bottom: 18px;

    .empty-teapot {
      font-size: 64px;
      display: block;
      animation: floatGentle 3s ease-in-out infinite;
    }

    .empty-steam-circle {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);

      .empty-steam {
        position: absolute;
        color: rgba(139, 105, 20, 0.3);
        font-size: 20px;
        animation: steamRise 3s ease-in-out infinite;

        &.es1 { left: 20%; animation-delay: 0s; }
        &.es2 { right: 20%; animation-delay: 1.5s; }
      }
    }
  }

  h3 { color: #5D3A1A; font-size: 19px; margin: 0 0 8px; }
  p { color: #999; font-size: 14px; margin: 0 0 20px; }

  .empty-post-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    background: linear-gradient(135deg, #8B4513, #A0522D);
    color: #FFF8DC;
    border: none;
    border-radius: 28px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(139, 69, 19, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
    }

    .el-icon { font-size: 16px; }
  }
}

// ==================== 分页 ====================
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 28px;
  padding: 16px 0;

  :deep(.el-pagination) {
    --el-pagination-bg-color: #fff;
    --el-pagination-button-bg-color: #fff;
    border-radius: 14px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(139, 105, 20, 0.1);
  }
}

// ==================== 侧边栏 ====================
.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

// 茶客信息卡
.guest-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.1);
  transition: all 0.3s ease;

  &:hover { box-shadow: 0 4px 18px rgba(139, 69, 19, 0.1); }

  .card-header {
    background: linear-gradient(135deg, #8B4513, #A0522D);
    padding: 14px 20px;
    position: relative;
    overflow: hidden;

    .header-decoration {
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255, 248, 220, 0.1) 0%, transparent 70%);
    }

    .header-title {
      color: #FFF8DC;
      font-size: 15px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }
  }

  .card-body {
    padding: 24px 20px;
    text-align: center;
  }

  .guest-avatar-wrap {
    position: relative;
    width: 88px;
    height: 88px;
    margin: 0 auto 16px;

    .guest-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 3px solid #FAF8F5;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
    }

    .avatar-border {
      position: absolute;
      inset: -5px;
      border-radius: 50%;
      border: 2px dashed rgba(139, 105, 20, 0.3);
      animation: pulseRing 3s ease-in-out infinite;
    }

    .online-indicator {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 16px;
      height: 16px;
      background: #4CAF50;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 6px rgba(76, 175, 80, 0.4);
    }
  }

  .guest-name {
    font-size: 18px;
    font-weight: 700;
    color: #5D3A1A;
    margin: 0 0 4px;
  }

  .guest-role {
    font-size: 13px;
    color: #8B6914;
    margin: 0 0 18px;
  }

  .primary-btn {
    width: 100%;
    padding: 11px;
    background: linear-gradient(135deg, #8B4513, #A0522D);
    color: #FFF8DC;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-bottom: 18px;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 14px rgba(139, 69, 19, 0.35);
    }

    .el-icon { font-size: 15px; }
  }

  .guest-stats {
    display: flex;
    align-items: center;
    padding-top: 18px;
    border-top: 1px solid rgba(139, 105, 20, 0.1);

    .gstat-item {
      flex: 1;
      cursor: pointer;
      transition: opacity 0.3s ease;

      &:hover { opacity: 0.7; }

      .gstat-value {
        font-size: 22px;
        font-weight: 800;
        color: #8B4513;
        margin-bottom: 3px;
      }

      .gstat-label {
        font-size: 12px;
        color: #999;
      }
    }

    .gstat-divider {
      width: 1px;
      height: 38px;
      background: rgba(139, 105, 20, 0.15);
    }
  }
}

// 热门话题面板
.hot-topics-panel {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.1);
  transition: all 0.3s ease;

  &:hover { box-shadow: 0 4px 18px rgba(139, 69, 19, 0.1); }

  .panel-header {
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    position: relative;
    overflow: hidden;

    &.hot-header {
      background: linear-gradient(135deg, #FF6B35, #FF8C42);
    }

    .panel-icon { font-size: 17px; }
    .panel-title {
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      margin: 0;
      flex: 1;
    }

    .panel-badge {
      font-size: 10px;
      font-weight: 800;
      color: #FF6B35;
      background: #FAF8F5;
      padding: 3px 8px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
  }

  .panel-body { padding: 12px; }

  .topic-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .topic-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, rgba(255, 107, 53, 0.04), transparent);
        transform: translateX(4px);

        .topic-title { color: #FF6B35; }
      }

      .topic-rank {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: #F5F5F5;
        font-size: 13px;
        font-weight: 700;
        color: #999;

        &.top3 {
          background: linear-gradient(135deg, #FAF8F5, #FFF9F0);
        }

        .rank-crown { font-size: 16px; }
        .rank-num { color: #8B6914; }
      }

      .topic-info {
        flex: 1;
        min-width: 0;

        .topic-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin: 0 0 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
        }

        .topic-meta {
          display: flex;
          align-items: center;
          gap: 8px;

          .topic-heat {
            flex: 1;
            height: 4px;
            background: #F0F0F0;
            border-radius: 2px;
            overflow: hidden;

            .heat-bar {
              height: 100%;
              background: linear-gradient(90deg, #FF6B35, #FF8C42);
              border-radius: 2px;
              transition: width 0.3s ease;
            }
          }

          .topic-views {
            font-size: 11px;
            color: #999;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

// 茶馆规矩面板
.tips-panel {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(139, 105, 20, 0.1);

  .panel-header {
    padding: 14px 18px;
    background: linear-gradient(135deg, #CD853F, #DEB887);

    &.tips-header .panel-title {
      color: #5D3A1A;
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }
  }

  .panel-body { padding: 14px 18px; }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;

    li {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      padding: 9px 12px;
      background: linear-gradient(135deg, rgba(139, 69, 19, 0.03), transparent);
      border-radius: 8px;
      border-left: 3px solid rgba(205, 133, 63, 0.3);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, rgba(139, 69, 19, 0.06), transparent);
        border-left-color: #CD853F;
        transform: translateX(4px);
      }
    }
  }
}

// ==================== 抽屉样式 ====================
:deep(.teahouse-drawer) {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 0;
    border-bottom: none;
  }

  .el-drawer__body {
    padding: 0 24px 24px;
  }
}

.drawer-custom-header {
  padding: 24px 0 20px;
  text-align: center;
  border-bottom: 1px solid rgba(139, 105, 20, 0.1);
  margin-bottom: 20px;

  .drawer-title-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 8px;
  }

  .drawer-title {
    font-size: 20px;
    font-weight: 700;
    color: #5D3A1A;
    margin: 0 0 4px;
  }

  .drawer-subtitle {
    font-size: 13px;
    color: #8B6914;
    margin: 0;
  }
}

.editor-container {
  width: 100%;
  border: 1px solid rgba(139, 105, 20, 0.2);
  border-radius: 10px;
  overflow: hidden;

  :deep(.ql-editor) {
    min-height: 200px;
    font-size: 14px;
  }
}

.cover-uploader {
  :deep(.el-upload) {
    border: 2px dashed rgba(139, 105, 20, 0.3);
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      border-color: #CD853F;
    }
  }
}

.cover-preview {
  width: 200px;
  height: 140px;
  position: relative;
  border-radius: 10px;
  overflow: hidden;

  img { width: 100%; height: 100%; }

  .preview-overlay {
    position: absolute;
    inset: 0;
    background: rgba(93, 58, 26, 0.75);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: #FFF8DC;
    font-size: 13px;
    opacity: 0;
    transition: opacity 0.3s ease;

    .el-icon { font-size: 24px; }
  }

  &:hover .preview-overlay { opacity: 1; }
}

.upload-placeholder {
  width: 200px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #8B6914;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.02), transparent);

  .upload-icon {
    font-size: 32px;
    color: #D2B48C;
  }
}

.submit-post-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: #FFF8DC;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(139, 69, 19, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
  }

  .btn-icon { font-size: 18px; }
}

// ==================== 响应式设计 ====================
@media (max-width: 1200px) {
  .teahouse-hero { padding: 46px 32px 54px; }
  .hero-content { gap: 34px; }
  .teapot-section .teapot .pot-body { width: 95px; height: 76px; .pot-icon { font-size: 32px; } }
  .signboard-section .wooden-sign .sign-frame .sign-title .title-char { font-size: 42px; }
  .bamboo-menu-section .bamboo-scroll { height: 120px; }
}

@media (max-width: 1024px) {
  .page-body { flex-direction: column; }
  .sidebar { width: 100%; }
}

@media (max-width: 768px) {
  .teahouse-page { background: #fff; }
  .teahouse-hero { padding: 38px 20px 46px; }
  .hero-content { grid-template-columns: 1fr; gap: 28px; text-align: center; }

  .teapot-section {
    display: flex;
    justify-content: center;
    .teapot .pot-body { width: 85px; height: 68px; .pot-icon { font-size: 28px; } }
    .teacups { display: none; }
  }

  .signboard-section {
    .sign-badges { justify-content: center; flex-wrap: wrap; }
    .wooden-sign .sign-frame { padding: 16px 36px; .sign-title .title-char { font-size: 36px; } }
    .teahouse-stats { justify-content: center; flex-wrap: wrap; .stat-item { padding: 10px 16px; .stat-num { font-size: 20px; } } }
  }

  .bamboo-menu-section { flex-direction: row; justify-content: center; gap: 16px; }

  .floating-post-btn {
    position: static;
    display: flex;
    margin: 0 auto 20px;
  }

  .hero-bg {
    .warm-orb { display: none; }
    .falling-leaves .leaf { display: none; }
    .tea-waves { height: 50px; }
    .steam-effects .steam { display: none; }
  }

  .page-body { flex-direction: column; padding: 16px; }
  .sidebar { width: 100%; }

  .teahouse-post-card {
    .post-cover { width: 100%; height: 160px; }
    .post-content { padding: 14px 16px 12px; .post-title { font-size: 16px; } .post-excerpt { -webkit-line-clamp: 1; } }
    .card-decor-bar { display: none; }
    .card-side-decor { display: none; }
  }

  .list-wrapper { gap: 12px; }

  .guest-card .guest-avatar-wrap { width: 72px; height: 72px; }
}
</style>
