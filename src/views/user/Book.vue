<script setup>
import { ref, onMounted } from "vue";
import { Search } from "@element-plus/icons-vue";
import { bookListService } from "@/api/book.js";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const router = useRouter();

const type = ref("");
const bookName = ref("");
const books = ref([]);
const loading = ref(false);
const error = ref(null);

const pageNum = ref(1);
const total = ref(20);
const pageSize = ref(9);

let searchTimer = null;

const debounceSearch = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    pageNum.value = 1;
    bookList();
  }, 300);
};

const onSizeChange = (size) => {
  pageSize.value = size;
  pageNum.value = 1;
  bookList();
};

const onCurrentChange = (num) => {
  pageNum.value = num;
  bookList();
};

const bookList = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: type.value || null,
      bookName: bookName.value || null,
    };
    const result = await bookListService(params);
    books.value = result.data?.items || [];
    total.value = result.data?.total || 0;
  } catch (err) {
    console.error("获取典籍列表失败:", err);
    error.value = "加载失败，请稍后重试";
    books.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  bookList();
});

const chapterList = (id) => {
  router.push({ path: "/user/chapter", query: { bookId: id } });
};

const categoryOptions = [
  '全部典籍', '本草纲目', '黄帝内经', '伤寒杂病论', '金匮要略',
  '温病条辨', '神农本草经', '千金方', '景岳全书', '医宗金鉴',
  '其他典籍'
];

const showAllCategories = ref(false);
const displayedCategories = () => {
  return showAllCategories.value ? categoryOptions : categoryOptions.slice(0, 6);
};

const toggleCategoryExpand = () => {
  showAllCategories.value = !showAllCategories.value;
};

const recommendBooks = [
  { name: '黄帝内经', desc: '中医理论基础' },
  { name: '本草纲目', desc: '中药学巨著' },
  { name: '伤寒论', desc: '辨证论治经典' },
  { name: '傅青主女科', desc: '妇科专著经典' }
];

const getRecommendBookInfo = (bookName) => {
  const book = books.value.find(b => b.bookName === bookName || b.bookName.includes(bookName));
  return book || { id: null, bookName: bookName, coverImg: null };
};

const goToRecommendBook = (bookName) => {
  const book = books.value.find(b => b.bookName === bookName || b.bookName.includes(bookName));
  if (book) {
    chapterList(book.id);
  } else {
    ElMessage.warning(`暂未收录《${bookName}》，敬请期待`);
  }
};
</script>

<template>
  <div class="library-page">
    <!-- 古典书院风格头部 -->
    <div class="classical-hero">
      <!-- 背景装饰层 -->
      <div class="hero-bg">
        <!-- 墨韵光晕 -->
        <div class="ink-orbs">
          <div class="ink-orb orb-1"></div>
          <div class="ink-orb orb-2"></div>
          <div class="ink-orb orb-3"></div>
        </div>

        <!-- 云纹装饰 -->
        <svg class="cloud-pattern" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,100 Q150,60 300,100 T600,100 T900,100 T1200,100 L1200,200 L0,200 Z"
                fill="rgba(26, 35, 126, 0.03)" class="cloud c1"/>
          <path d="M0,120 Q200,80 400,120 T800,120 T1200,120 L1200,200 L0,200 Z"
                fill="rgba(40, 53, 147, 0.02)" class="cloud c2"/>
        </svg>

        <!-- 浮动字符 -->
        <div class="floating-chars">
          <span class="fchar fc1">經</span>
          <span class="fchar fc2">史</span>
          <span class="fchar fc3">子</span>
          <span class="fchar fc4">集</span>
        </div>

        <!-- 竹简点缀 -->
        <div class="bamboo-decor">
          <span class="bamboo b1">🎋</span>
          <span class="bamboo b2">📜</span>
          <span class="bamboo b3">🖌️</span>
        </div>
      </div>

      <!-- 主内容区 -->
      <div class="hero-content">
        <!-- 左侧灯笼 -->
        <div class="lantern-section">
          <div class="lantern-glow"></div>
          <div class="lantern">
            <div class="lantern-top"></div>
            <div class="lantern-body">
              <span class="lantern-text">藏</span>
            </div>
            <div class="lantern-bottom"></div>
            <div class="lantern-tassel">
              <span class="tassel-line"></span>
              <span class="tassel-knot"></span>
            </div>
          </div>
        </div>

        <!-- 中间卷轴标题 -->
        <div class="scroll-section">
          <!-- 顶部标签 -->
          <div class="scroll-badges">
            <span class="badge ancient-badge">
              <span class="badge-icon">📚</span>
              千年典籍
            </span>
            <span class="badge sub-badge">Classical Medical Library</span>
          </div>

          <!-- 卷轴主标题 -->
          <div class="scroll-title-wrapper">
            <div class="scroll-left-decor"></div>
            <h1 class="scroll-main-title">
              <span class="title-char" v-for="(char, index) in '藏经阁'.split('')" :key="index"
                    :style="{ animationDelay: `${index * 0.25}s` }">{{ char }}</span>
            </h1>
            <div class="scroll-right-decor"></div>
          </div>

          <!-- 副标题 -->
          <p class="scroll-subtitle">
            <span class="sub-text">博览群书 · 汲取智慧 · 传承医道</span>
          </p>

          <!-- 数据展示 -->
          <div class="ancient-stats">
            <div class="stat-item">
              <div class="stat-icon-wrap">
                <span class="stat-icon">📖</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">{{ total }}</span>
                <span class="stat-label">部典籍</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon-wrap">
                <span class="stat-icon">🏮</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">{{ categoryOptions.length - 1 }}</span>
                <span class="stat-label">个分类</span>
              </div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-icon-wrap">
                <span class="stat-icon">✨</span>
              </div>
              <div class="stat-info">
                <span class="stat-num">珍本</span>
                <span class="stat-label">孤本秘籍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧笔墨元素 -->
        <div class="brush-section">
          <div class="inkstone">
            <div class="stone-body"></div>
            <div class="stone-ink"></div>
          </div>
          <div class="brush">
            <div class="brush-handle"></div>
            <div class="brush-bristle"></div>
          </div>
          <div class="seal-stamp">
            <span class="seal-char" v-for="(c, i) in '翰墨'.split('')" :key="i"
                  :style="{ animationDelay: `${i * 0.4}s` }">{{ c }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="main-area">
        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="bookName"
            placeholder="检索典籍名称..."
            :prefix-icon="Search"
            clearable
            @input="debounceSearch"
            @keyup.enter="bookList"
          />
          <el-button type="primary" @click="bookList" :loading="loading">检索</el-button>
        </div>

        <!-- 分类筛选 -->
        <div class="filter-section">
          <div class="filter-header">
            <div class="filter-label">
              <span class="label-icon">📑</span>
              典籍分类
            </div>
            <el-button
              text
              size="small"
              type="primary"
              @click="toggleCategoryExpand"
              class="expand-btn"
            >
              {{ showAllCategories ? '收起' : '展开更多' }}
              <span class="expand-icon" :class="{ expanded: showAllCategories }">▼</span>
            </el-button>
          </div>
          <transition name="filter-fade">
            <div class="filter-tags" v-show="true">
              <span
                v-for="cat in displayedCategories()"
                :key="cat"
                class="filter-tag"
                :class="{ active: type === (cat === '全部典籍' ? '' : cat) }"
                @click="type = cat === '全部典籍' ? '' : cat; pageNum = 1; bookList()"
              >{{ cat }}</span>
              <template v-if="showAllCategories">
                <span
                  v-for="cat in categoryOptions.slice(6)"
                  :key="'more-'+cat"
                  class="filter-tag"
                  :class="{ active: type === cat }"
                  @click="type = cat; pageNum = 1; bookList()"
                >{{ cat }}</span>
              </template>
            </div>
          </transition>
        </div>

        <!-- 典籍列表 -->
        <div class="books-grid" v-if="!loading && books.length > 0 && !error">
          <transition-group name="book-list" tag="div" class="grid-wrapper">
            <div v-for="(book, index) in books" :key="book.id"
                 class="ancient-book-card"
                 :style="{ animationDelay: `${index * 0.08}s` }"
                 @click="chapterList(book.id)">
              <!-- 书脊装饰 -->
              <div class="book-spine">
                <div class="spine-decoration"></div>
                <span class="spine-text">典</span>
              </div>

              <!-- 封面区域 -->
              <div class="book-cover">
                <img :src="book.coverImg || '/default.png'" :alt="book.bookName" />
                <div class="cover-overlay">
                  <div class="overlay-pattern"></div>
                </div>
                <div class="cover-seal">
                  <span class="seal-mark">藏</span>
                </div>
              </div>

              <!-- 书籍信息 -->
              <div class="book-content">
                <h3 class="book-title">{{ book.bookName }}</h3>

                <div class="book-meta">
                  <span class="meta-author">
                    <span class="author-icon">✍️</span>
                    {{ book.author || '佚名' }}
                  </span>
                  <span class="meta-type">{{ book.type || '典籍' }}</span>
                </div>

                <p class="book-intro" v-if="book.introduction">
                  {{ book.introduction.substring(0, 60) }}{{ book.introduction.length > 60 ? '...' : '' }}
                </p>

                <div class="book-footer">
                  <span class="read-hint">翻阅典籍 →</span>
                </div>
              </div>

              <!-- 页角装饰 -->
              <div class="corner-decor top-right"></div>
              <div class="corner-decor bottom-left"></div>
            </div>
          </transition-group>
        </div>

        <!-- 加载状态 -->
        <div v-else-if="loading" class="loading-grid">
          <div v-for="i in 6" :key="i" class="skeleton-book">
            <div class="skeleton-spine"></div>
            <div class="skeleton-cover"></div>
            <div class="skeleton-info">
              <div class="skeleton-title"></div>
              <div class="skeleton-meta"></div>
              <div class="skeleton-text"></div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="error-state">
          <span class="error-icon">⚠️</span>
          <p class="error-message">{{ error }}</p>
          <el-button type="primary" @click="bookList" :loading="loading">重新加载</el-button>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <div class="empty-illustration">
            <span class="empty-icon">📚</span>
            <div class="empty-dust-particles">
              <span class="dust d1"></span>
              <span class="dust d2"></span>
              <span class="dust d3"></span>
            </div>
          </div>
          <h3>书架空空如也</h3>
          <p>暂无符合条件的典籍，换个关键词试试？</p>
          <el-button type="primary" link @click="type = ''; bookName = ''; bookList()">清除筛选条件</el-button>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrap" v-if="total > 0 && !loading">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[6, 9, 12, 18]"
            layout="jumper, total, sizes, prev, pager, next"
            background
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>

      <!-- 侧边栏 -->
      <div class="sidebar">
        <!-- 推荐阅读面板 -->
        <div class="panel recommend-panel">
          <div class="panel-header">
            <span class="panel-title">🏮 推荐阅读</span>
          </div>
          <div class="panel-body">
            <div class="recommend-list">
              <div 
                class="recommend-item" 
                v-for="(book, index) in recommendBooks" 
                :key="index"
                @click="goToRecommendBook(book.name)"
              >
                <div class="rec-rank" :class="{ top: index < 3 }">{{ index + 1 }}</div>
                <div class="rec-cover">
                  <img 
                    :src="getRecommendBookInfo(book.name).coverImg || '/default.png'" 
                    :alt="book.name"
                  />
                  <div class="rec-cover-overlay"></div>
                </div>
                <div class="rec-info">
                  <h4 class="rec-title">《{{ book.name }}》</h4>
                  <p class="rec-desc">{{ book.desc }}</p>
                </div>
                <div class="rec-arrow">→</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 阅读小贴士 -->
        <div class="panel tips-panel">
          <div class="panel-header tips-header">
            <span class="panel-title">📖 阅读指南</span>
          </div>
          <div class="panel-body tips-body">
            <ul class="tips-list">
              <li>🔍 使用搜索快速定位典籍</li>
              <li>📑 通过分类精准筛选书籍</li>
              <li>📚 点击卡片即可进入章节</li>
              <li>✨ 珍本典籍值得反复研读</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.library-page {
  min-height: 100%;
  background: linear-gradient(180deg, #F8F6F1 0%, #FAF8F5 30%, #FFFFFF 100%);
  position: relative;
}

// ==================== 关键帧动画定义 ====================

@keyframes inkFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
  33% { transform: translate(-30px, -25px) scale(1.08); opacity: 0.9; }
  66% { transform: translate(20px, 18px) scale(0.95); opacity: 0.75; }
}

@keyframes inkFloat2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(25px, -20px); }
}

@keyframes inkPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.85; }
}

@keyframes cloudDrift {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-30px); }
}

@keyframes charFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.15; }
  50% { transform: translateY(-15px) rotate(5deg); opacity: 0.25; }
}

@keyframes bambooSway {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(3deg); }
  75% { transform: rotate(-3deg); }
}

@keyframes lanternSwing {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes lanternGlow {
  0%, 100% { opacity: 0.6; box-shadow: 0 0 30px rgba(212, 175, 55, 0.4); }
  50% { opacity: 1; box-shadow: 0 0 50px rgba(212, 175, 55, 0.7); }
}

@keyframes tasselSwing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes scrollUnfold {
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
}

@keyframes charReveal {
  from { opacity: 0; transform: translateY(30px) scale(0.7) rotate(-10deg); }
  to { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
}

@keyframes brushStroke {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(8deg); }
  75% { transform: rotate(-5deg); }
}

@keyframes sealStamp {
  from { opacity: 0; transform: scale(1.5) rotate(-15deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes dustFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  50% { opacity: 0.6; }
  100% { transform: translateY(-40px) translateX(20px); opacity: 0; }
}

// ==================== 样式定义 ====================

.classical-hero {
  position: relative;
  padding: 56px 40px 64px;
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

  .ink-orbs {
    .ink-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(90px);

      &.orb-1 {
        width: 550px;
        height: 550px;
        background: radial-gradient(circle, rgba(26, 35, 126, 0.12) 0%, transparent 70%);
        top: -200px;
        right: -150px;
        animation: inkFloat1 20s ease-in-out infinite;
      }

      &.orb-2 {
        width: 420px;
        height: 420px;
        background: radial-gradient(circle, rgba(40, 53, 147, 0.09) 0%, transparent 70%);
        bottom: -140px;
        left: -120px;
        animation: inkFloat2 24s ease-in-out infinite reverse;
      }

      &.orb-3 {
        width: 280px;
        height: 280px;
        background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
        top: 48%;
        left: 52%;
        transform: translate(-50%, -50%);
        animation: inkPulse 14s ease-in-out infinite;
      }
    }
  }

  .cloud-pattern {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 120px;

    .cloud {
      animation: cloudDrift 16s ease-in-out infinite;

      &.c2 {
        animation-duration: 20s;
        animation-direction: reverse;
      }
    }
  }

  .floating-chars {
    .fchar {
      position: absolute;
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 72px;
      font-weight: 900;
      color: #1a237e;
      opacity: 0.15;
      filter: blur(0.5px);
      animation: charFloat 8s ease-in-out infinite;

      &.fc1 { top: 15%; left: 5%; animation-delay: 0s; }
      &.fc2 { top: 25%; right: 8%; animation-delay: 2s; }
      &.fc3 { bottom: 30%; left: 12%; font-size: 58px; animation-delay: 4s; }
      &.fc4 { bottom: 22%; right: 15%; font-size: 64px; animation-delay: 6s; }
    }
  }

  .bamboo-decor {
    .bamboo {
      position: absolute;
      font-size: 32px;
      opacity: 0.12;
      filter: blur(0.3px);
      animation: bambooSway 6s ease-in-out infinite;

      &.b1 { top: 20%; right: 25%; animation-delay: 0s; }
      &.b2 { bottom: 32%; left: 8%; font-size: 26px; animation-delay: 2s; }
      &.b3 { top: 60%; right: 6%; font-size: 28px; animation-delay: 4s; }
    }
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 48px;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

// ==================== 灯笼区域 ====================
.lantern-section {
  position: relative;

  .lantern-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.2) 0%, transparent 70%);
    border-radius: 50%;
    animation: lanternGlow 3s ease-in-out infinite;
  }

  .lantern {
    position: relative;
    z-index: 2;
    animation: lanternSwing 4s ease-in-out infinite;
    transform-origin: top center;

    .lantern-top {
      width: 50px;
      height: 14px;
      background: linear-gradient(180deg, #D4AF37 0%, #B8860B 100%);
      border-radius: 4px 4px 0 0;
      margin: 0 auto;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .lantern-body {
      width: 90px;
      height: 110px;
      background: linear-gradient(135deg, #C62828 0%, #B71C1C 50%, #8B0000 100%);
      border-radius: 45px 45px 50px 50px;
      margin: 0 auto;
      position: relative;
      box-shadow:
        inset 0 0 30px rgba(0, 0, 0, 0.3),
        0 8px 24px rgba(198, 40, 40, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;

      &::before {
        content: '';
        position: absolute;
        inset: 8px;
        border: 2px solid rgba(255, 215, 0, 0.3);
        border-radius: 38px 38px 42px 42px;
      }

      .lantern-text {
        font-family: "KaiTi", "STKaiti", serif;
        font-size: 42px;
        font-weight: 900;
        color: #FFD700;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }
    }

    .lantern-bottom {
      width: 54px;
      height: 10px;
      background: linear-gradient(180deg, #D4AF37 0%, #B8860B 100%);
      border-radius: 0 0 4px 4px;
      margin: 0 auto;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .lantern-tassel {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 4px;
      animation: tasselSwing 3s ease-in-out infinite;

      .tassel-line {
        width: 2px;
        height: 35px;
        background: linear-gradient(180deg, #D4AF37, #B8860B);
      }

      .tassel-knot {
        width: 12px;
        height: 12px;
        background: radial-gradient(circle, #D4AF37, #B8860B);
        border-radius: 50%;
        margin-top: -2px;
      }
    }
  }
}

// ==================== 卷轴标题区 ====================
.scroll-section {
  .scroll-badges {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 18px;

    .ancient-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 18px;
      background: linear-gradient(135deg, #1a237e, #283593);
      color: #FFD700;
      font-size: 13px;
      font-weight: 700;
      border-radius: 20px;
      box-shadow: 0 4px 14px rgba(26, 35, 126, 0.35);
      letter-spacing: 0.5px;

      .badge-icon { font-size: 15px; }
    }

    .sub-badge {
      font-size: 12px;
      color: #5C6BC0;
      font-weight: 500;
      letter-spacing: 1px;
      font-style: italic;
    }
  }

  .scroll-title-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 16px;

    .scroll-left-decor,
    .scroll-right-decor {
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
      animation: scrollUnfold 0.8s ease backwards;
    }

    .scroll-right-decor {
      animation-delay: 0.3s;
    }
  }

  .scroll-main-title {
    margin: 0;
    display: flex;
    gap: 10px;
    justify-content: center;

    .title-char {
      font-family: "KaiTi", "STKaiti", "SimSun", serif;
      font-size: 52px;
      font-weight: 900;
      background: linear-gradient(135deg, #1a237e 0%, #3949AB 40%, #5C6BC0 70%, #1a237e 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: inline-block;
      animation: charReveal 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
      position: relative;
      filter: drop-shadow(0 2px 4px rgba(26, 35, 126, 0.2));

      &::after {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, #D4AF37, #FFD700, #B8860B);
        border-radius: 2px;
        transform: scaleX(0);
        animation: scrollUnfold 0.7s ease forwards;
        animation-delay: calc(var(--char-index, 0) * 0.25s + 0.9s);
      }
    }
  }

  .scroll-subtitle {
    text-align: center;
    margin: 0 0 26px;

    .sub-text {
      font-size: 15px;
      color: #5C6BC0;
      letter-spacing: 3px;
      font-weight: 500;
    }
  }

  .ancient-stats {
    display: flex;
    gap: 18px;
    justify-content: center;
    flex-wrap: wrap;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 22px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(26, 35, 126, 0.12);
      box-shadow: 0 4px 16px rgba(26, 35, 126, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(26, 35, 126, 0.12);
        border-color: rgba(26, 35, 126, 0.25);
      }

      &.highlight {
        background: linear-gradient(135deg, rgba(26, 35, 126, 0.06), rgba(92, 107, 192, 0.04));
        border-color: rgba(212, 175, 55, 0.3);
      }

      .stat-icon-wrap {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #E8EAF6, #C5CAE9);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;

        .stat-icon { font-size: 22px; }
      }

      .stat-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .stat-num {
          font-size: 24px;
          font-weight: 800;
          color: #1a237e;
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          color: #5C6BC0;
          font-weight: 500;
        }
      }
    }
  }
}

// ==================== 笔墨区域 ====================
.brush-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  .inkstone {
    position: relative;

    .stone-body {
      width: 70px;
      height: 36px;
      background: linear-gradient(180deg, #424242 0%, #212121 100%);
      border-radius: 8px;
      box-shadow:
        inset 0 2px 6px rgba(255, 255, 255, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.3);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: 8px;
        left: 12px;
        right: 12px;
        height: 16px;
        background: linear-gradient(180deg, #1a1a1a, #0d0d0d);
        border-radius: 4px;
      }
    }

    .stone-ink {
      position: absolute;
      top: 10px;
      left: 16px;
      width: 38px;
      height: 12px;
      background: linear-gradient(180deg, #1a1a1a, #000);
      border-radius: 50%;
      opacity: 0.9;
      animation: inkPulse 4s ease-in-out infinite;
    }
  }

  .brush {
    transform: rotate(-25deg);
    animation: brushStroke 5s ease-in-out infinite;
    transform-origin: bottom center;

    .brush-handle {
      width: 12px;
      height: 85px;
      background: linear-gradient(90deg, #8D6E63, #A1887F, #8D6E63);
      border-radius: 4px;
      box-shadow: 2px 0 6px rgba(0, 0, 0, 0.2);
    }

    .brush-bristle {
      width: 16px;
      height: 28px;
      background: linear-gradient(180deg, #1a1a1a, #000);
      border-radius: 0 0 8px 8px;
      margin: -2px auto 0;
      margin-left: -2px;
    }
  }

  .seal-stamp {
    display: flex;
    gap: 4px;
    padding: 8px 12px;
    background: linear-gradient(135deg, #C62828, #B71C1C);
    border-radius: 6px;
    box-shadow: 0 3px 10px rgba(198, 40, 40, 0.4);
    animation: sealStamp 0.6s ease backwards;
    animation-delay: 1.5s;

    .seal-char {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 20px;
      font-weight: 900;
      color: #FFD700;
      opacity: 0;
      animation: sealStamp 0.5s ease forwards;
    }
  }
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

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .el-input { flex: 1; }

  .el-button {
    width: 90px;
    height: 40px;
    border-radius: 8px;
    background: linear-gradient(135deg, #1a237e, #3949AB);
    border: none;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #283593, #5C6BC0);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(26, 35, 126, 0.35);
    }

    &:disabled { opacity: 0.7; }
  }
}

.filter-section {
  margin-bottom: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(26, 35, 126, 0.08);

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .filter-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a237e;
    display: flex;
    align-items: center;
    gap: 6px;

    .label-icon { font-size: 16px; }
  }

  .expand-btn {
    font-size: 13px;
    padding: 4px 8px;
    color: #5C6BC0;

    .expand-icon {
      display: inline-block;
      margin-left: 4px;
      transition: transform 0.3s ease;
      font-size: 10px;

      &.expanded { transform: rotate(180deg); }
    }
  }

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-tag {
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: #F8F6F1;
    color: #5C6BC0;
    border: 1px solid rgba(26, 35, 126, 0.15);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(26, 35, 126, 0.08);
      transform: translate(-50%, -50%);
      transition: all 0.35s ease;
    }

    &:hover {
      color: #1a237e;
      border-color: #3949AB;
      transform: translateY(-1px);

      &::before { width: 150%; height: 150%; padding-top: 150%; }
    }

    &.active {
      background: linear-gradient(135deg, #1a237e, #3949AB);
      color: #FFD700;
      border-color: transparent;
      box-shadow: 0 3px 10px rgba(26, 35, 126, 0.3);
      font-weight: 600;

      &:hover { transform: translateY(-1px); box-shadow: 0 5px 14px rgba(26, 35, 126, 0.4); }
    }
  }
}

.filter-fade-enter-active,
.filter-fade-leave-active { transition: all 0.3s ease; overflow: hidden; }
.filter-fade-enter-from,
.filter-fade-leave-to { opacity: 0; max-height: 0; margin-top: 0; }

// ==================== 典籍网格 ====================
.books-grid { margin-bottom: 24px; }
.grid-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.ancient-book-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(26, 35, 126, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  display: flex;
  animation: slideUp 0.5s ease backwards;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 32px rgba(26, 35, 126, 0.15);
    border-color: rgba(212, 175, 55, 0.4);

    .book-cover img {
      transform: scale(1.08);
    }

    .cover-seal {
      transform: scale(1.1) rotate(-5deg);
      opacity: 1;
    }

    .book-spine {
      background: linear-gradient(180deg, #C62828, #8B0000);
    }

    .read-hint {
      color: #1a237e;
      transform: translateX(6px);
    }

    .corner-decor {
      opacity: 1;
    }
  }

  // 书脊
  .book-spine {
    width: 8px;
    background: linear-gradient(180deg, #D32F2F, #B71C1C);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    transition: all 0.3s ease;

    .spine-decoration {
      position: absolute;
      top: 15px;
      bottom: 15px;
      left: 2px;
      width: 2px;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255, 215, 0, 0.4) 0px,
        rgba(255, 215, 0, 0.4) 4px,
        transparent 4px,
        transparent 8px
      );
    }

    .spine-text {
      font-family: "KaiTi", "STKaiti", serif;
      font-size: 16px;
      font-weight: 900;
      color: #FFD700;
      writing-mode: vertical-rl;
      text-orientation: upright;
    }
  }

  // 封面
  .book-cover {
    width: 110px;
    height: 160px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    background: linear-gradient(135deg, #E8EAF6, #C5CAE9);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .cover-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(26, 35, 126, 0.05) 0%,
        transparent 50%,
        rgba(0, 0, 0, 0.1) 100%
      );

      .overlay-pattern {
        position: absolute;
        inset: 0;
        opacity: 0.03;
        background-image:
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(26, 35, 126, 0.5) 10px,
            rgba(26, 35, 126, 0.5) 11px
          );
      }
    }

    .cover-seal {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 32px;
      height: 32px;
      background: rgba(198, 40, 40, 0.9);
      border: 2px solid #FFD700;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      opacity: 0.85;

      .seal-mark {
        font-family: "KaiTi", "STKaiti", serif;
        font-size: 18px;
        font-weight: 900;
        color: #FFD700;
      }
    }
  }

  // 内容区
  .book-content {
    flex: 1;
    padding: 16px 18px 14px;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .book-title {
      font-size: 17px;
      font-weight: 700;
      color: #1a237e;
      margin: 0 0 10px;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.3s ease;

      .ancient-book-card:hover & { color: #D32F2F; }
    }

    .book-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 8px;

      .meta-author {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #5C6BC0;

        .author-icon { font-size: 13px; }
      }

      .meta-type {
        display: inline-block;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 600;
        color: #D4AF37;
        background: rgba(212, 175, 55, 0.1);
        border: 1px solid rgba(212, 175, 55, 0.25);
        border-radius: 12px;
      }
    }

    .book-intro {
      font-size: 12px;
      color: #666;
      line-height: 1.6;
      margin: 0 0 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .book-footer {
      padding-top: 10px;
      border-top: 1px solid rgba(26, 35, 126, 0.08);

      .read-hint {
        font-size: 13px;
        font-weight: 600;
        color: #5C6BC0;
        transition: all 0.3s ease;
        display: inline-block;
      }
    }
  }

  // 角落装饰
  .corner-decor {
    position: absolute;
    width: 24px;
    height: 24px;
    opacity: 0;
    transition: opacity 0.3s ease;

    &.top-right {
      top: 8px;
      right: 8px;
      border-top: 2px solid rgba(212, 175, 55, 0.4);
      border-right: 2px solid rgba(212, 175, 55, 0.4);
    }

    &.bottom-left {
      bottom: 8px;
      left: 8px;
      border-bottom: 2px solid rgba(212, 175, 55, 0.4);
      border-left: 2px solid rgba(212, 175, 55, 0.4);
    }
  }
}

.book-list-enter-active,
.book-list-leave-active { transition: all 0.4s ease; }
.book-list-enter-from,
.book-list-leave-to { opacity: 0; transform: scale(0.9); }

// ==================== 加载状态 ====================
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.skeleton-book {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  border: 1px solid rgba(26, 35, 126, 0.08);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  .skeleton-spine {
    width: 8px;
    background: linear-gradient(180deg, #EF5350, #E53935);
    flex-shrink: 0;
  }

  .skeleton-cover {
    width: 110px;
    height: 160px;
    background: linear-gradient(90deg, #F8F6F1 25%, #E8EAF6 50%, #F8F6F1 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    flex-shrink: 0;
  }

  .skeleton-info {
    flex: 1;
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    .skeleton-title { height: 22px; width: 65%; border-radius: 4px; background: linear-gradient(90deg, #F8F6F1 25%, #E8EAF6 50%, #F8F6F1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-meta { height: 24px; width: 50%; border-radius: 12px; background: linear-gradient(90deg, #F8F6F1 25%, #E8EAF6 50%, #F8F6F1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-text { height: 14px; width: 100%; border-radius: 4px; background: linear-gradient(90deg, #F8F6F1 25%, #E8EAF6 50%, #F8F6F1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
  }
}

// ==================== 错误和空状态 ====================
.error-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(26, 35, 126, 0.08);

  .error-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  .error-message { color: #666; font-size: 15px; margin: 0 0 20px; }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(26, 35, 126, 0.08);

  .empty-illustration {
    position: relative;
    display: inline-block;
    margin-bottom: 16px;

    .empty-icon {
      font-size: 64px;
      display: block;
      animation: float 3s ease-in-out infinite;
    }

    .empty-dust-particles {
      position: absolute;
      inset: 0;

      .dust {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(26, 35, 126, 0.2);
        border-radius: 50%;
        animation: dustFloat 4s ease-in-out infinite;

        &.d1 { top: 20%; left: 10%; animation-delay: 0s; }
        &.d2 { top: 40%; right: 15%; animation-delay: 1.5s; }
        &.d3 { bottom: 25%; left: 25%; animation-delay: 3s; }
      }
    }
  }

  h3 { color: #1a237e; font-size: 18px; margin: 0 0 8px; }
  p { color: #999; font-size: 14px; margin: 0 0 16px; }
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
    border-radius: 12px;
    padding: 8px 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(26, 35, 126, 0.08);
  }
}

// ==================== 侧边栏 ====================
.sidebar {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(26, 35, 126, 0.08);

  &:hover { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); }
}

.panel-header {
  background: linear-gradient(135deg, #1a237e, #3949AB);
  padding: 16px 20px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, transparent 70%);
  }

  .panel-title { color: #FFD700; font-size: 15px; font-weight: 600; position: relative; z-index: 1; }

  &.tips-header { background: linear-gradient(135deg, #5C6BC0, #7986CB); }
}

.panel-body { padding: 20px; }

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 14px;

  .recommend-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: linear-gradient(135deg, rgba(26, 35, 126, 0.03), transparent);
    border-radius: 10px;
    border-left: 3px solid transparent;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      background: linear-gradient(135deg, rgba(26, 35, 126, 0.08), transparent);
      border-left-color: #D4AF37;
      transform: translateX(6px);
      box-shadow: 0 4px 12px rgba(26, 35, 126, 0.1);

      .rec-arrow {
        opacity: 1;
        transform: translateX(4px);
        color: #D4AF37;
      }

      .rec-title {
        color: #D32F2F;
      }

      .rec-cover img {
        transform: scale(1.1);
      }
    }

    .rec-rank {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      background: #F5F5F5;
      color: #999;
      flex-shrink: 0;

      &.top {
        background: linear-gradient(135deg, #FFD700, #FFA000);
        color: #fff;
        box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
      }
    }

    .rec-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, rgba(26, 35, 126, 0.06), rgba(92, 107, 192, 0.04));
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .rec-cover {
      width: 42px;
      height: 56px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(26, 35, 126, 0.1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .rec-cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(
          135deg,
          rgba(26, 35, 126, 0.05) 0%,
          transparent 50%,
          rgba(0, 0, 0, 0.1) 100%
        );
        pointer-events: none;
      }
    }

    .rec-info {
      flex: 1;
      min-width: 0;

      .rec-title {
        font-size: 14px;
        font-weight: 600;
        color: #1a237e;
        margin: 0 0 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.3s ease;
      }

      .rec-desc {
        font-size: 12px;
        color: #999;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .rec-arrow {
      font-size: 16px;
      font-weight: 600;
      color: #5C6BC0;
      opacity: 0;
      transform: translateX(0);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }
  }
}

.tips-panel {
  .tips-body { padding: 16px 20px; }

  .tips-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    li {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
      padding: 10px 14px;
      background: linear-gradient(135deg, rgba(26, 35, 126, 0.03), transparent);
      border-radius: 8px;
      border-left: 3px solid rgba(92, 107, 192, 0.25);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, rgba(26, 35, 126, 0.06), transparent);
        border-left-color: #5C6BC0;
        transform: translateX(4px);
      }
    }
  }
}

// ==================== 响应式设计 ====================
@media (max-width: 1200px) {
  .classical-hero { padding: 48px 32px 56px; }
  .hero-content { gap: 36px; }
  .lantern-section .lantern .lantern-body { width: 82px; height: 100px; .lantern-text { font-size: 38px; } }
  .scroll-section .scroll-main-title .title-char { font-size: 46px; }
  .brush-section .inkstone .stone-body { width: 62px; height: 32px; }
}

@media (max-width: 1024px) {
  .page-body { flex-direction: column; }
  .sidebar { width: 100%; }
}

@media (max-width: 768px) {
  .library-page { background: #fff; }
  .classical-hero { padding: 40px 20px 48px; }
  .hero-content { grid-template-columns: 1fr; gap: 32px; text-align: center; }

  .lantern-section {
    display: flex;
    justify-content: center;
    .lantern .lantern-body { width: 76px; height: 92px; .lantern-text { font-size: 34px; } }
    .lantern .lantern-tassel { display: none; }
  }

  .scroll-section {
    .scroll-badges { justify-content: center; flex-wrap: wrap; }
    .scroll-title-wrapper { justify-content: center; .scroll-left-decor, .scroll-right-decor { width: 40px; } }
    .scroll-main-title { justify-content: center; .title-char { font-size: 38px; } }
    .ancient-stats { justify-content: center; flex-wrap: wrap; .stat-item { padding: 12px 18px; .stat-num { font-size: 20px; } } }
  }

  .brush-section { flex-direction: row; justify-content: center; gap: 16px; }

  .hero-bg {
    .ink-orb { display: none; }
    .floating-chars .fchar { display: none; }
    .cloud-pattern { height: 60px; }
    .bamboo-decor .bamboo { display: none; }
  }

  .page-body { flex-direction: column; padding: 16px; }
  .sidebar { width: 100%; }

  .ancient-book-card {
    .book-cover { width: 90px; height: 130px; }
    .book-content { padding: 14px 16px 12px; .book-title { font-size: 15px; } .book-intro { -webkit-line-clamp: 1; } }
  }

  .grid-wrapper { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }

  .search-bar { flex-direction: column; .el-button { width: 100%; } }
  .filter-section { padding: 14px; }
  .filter-tag { padding: 5px 12px; font-size: 12px; }
}
</style>
