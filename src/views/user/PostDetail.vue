<script setup>
import { useRouter } from "vue-router";
import { Delete, Edit, Plus, CaretRight, StarFilled, ArrowLeft, View, Star, ChatDotRound } from "@element-plus/icons-vue";
import avatar from '@/assets/default.png'
import { ref } from "vue";
import {
  postAddService,
  postListService,
  postDeleteService,
  postDetailService,
} from "@/api/post.js";
import { 
  isPostCollService,
  postCollNumAddService, 
  postCollAddService, 
  postCollDeleteService, 
  postCollNumSubtractService,
} from "@/api/collections";
import {
  commentAddService,
  commentDeleteService,
  commentListService,
  getCommentByIdService,
} from "@/api/comment.js";

import { getUserByIdService } from "@/api/user.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import {useUserInfoStore} from "@/stores/userInfo";
import { ElMessage, ElMessageBox } from "element-plus";

import { computed } from "vue";

//帖子数据模型
const post = ref({});

const router = useRouter();

//获取query携带的postId
const id = Number(router.currentRoute.value.query.id);

//获取帖子详情
const postDetail = async () => {
    let result = await postDetailService(id);
    post.value = result.data;
    // console.log(post.value);
    getPoster();
};
postDetail();

//获取发帖人的信息
const posterId = ref(0);
const poster = ref({});
const getPoster = async () => {
    posterId.value = post.value.posterId;
    // console.log(post.value)
    let result = await getUserByIdService(posterId.value);
    poster.value = result.data;
}

//是否收藏了
const state = ref(true);
const userInfoStore = useUserInfoStore();
const collection = ref({
    "postId":0,
    "userId":0,
});
const isCollect = async () => {
    collection.value.postId = Number(id);
    collection.value.userId = userInfoStore.userInfo.id;
    let result = await isPostCollService(collection.value);
    if(result.data == null){
        state.value = true;
    }
    else{
        state.value = false;
    }
}
isCollect();

//收藏帖子
const addCollection = async () => {
    await postCollNumAddService(id);
    await postCollAddService(id);
    ElMessage.success("收藏成功");
    await postDetail();
    await isCollect();
}

//取消收藏
const deleteCollection = async () => {
    collection.value.userId = userInfoStore.userInfo.id;
    collection.value.postId = id;
    let result = await isPostCollService(collection.value);
    let collId = result.data.id;
    console.log(result.data.id);
    await postCollDeleteService(collId);
    await postCollNumSubtractService(id);
    ElMessage.success("取消收藏成功");
    state.value = true;
    await postDetail();
    await isCollect();
}

//返回
const backToForum = async () => {
  await router.push({ path: "/user/forum" });
};

//根据id找到发评论者的信息
const publisher = ref({});
const getPublisherInfo = async(publisherId) => {
  let result = await getUserByIdService(publisherId);
  publisher.value = result.data;
}

//根据回复评论id找到评论
const com = ref({}); //被回复的评论
// const getCommentById = async (replyCommentId) => {
//   let result = await getCommentByIdService(replyCommentId);
// }

// -------------------------评论区----------------------------

//评论列表
const comments = ref([]);
const commentList = async() => {
  let result = await commentListService(id);
  // console.log(result.data.length);
  comments.value = result.data; //publisherId,postId,content,publishTime,replyContentId,commentRank

  for(let c of comments.value){
    await getPublisherInfo(c.publisherId);
    c.nickname = publisher.value.nickname;
    c.userPic = publisher.value.userPic;
    //如果这条评论是回复别人的评论，就要找出他回复的是哪条评论和是谁
    if(c.replyCommentId != 0 ){
      let com = ref({});
      let result1 = await getCommentByIdService(c.replyCommentId); //根据replyCommentId找到被回复的评论
      com.value = result1.data;
      console.log(com.value)
      await getPublisherInfo(com.value.publisherId); //获取被回复的评论的发评人
      
      c.replyedNickname = publisher.value.nickname;
    } 
  }

}
commentList();

//发评论
const inputComment = ref("");
const comment = ref({});
const publish = async () => {
  comment.value.content = inputComment.value;
  comment.value.postId = id;
  comment.value.replyCommentId = 0;
  comment.value.commentRank = 1;
  await commentAddService(comment.value);
  ElMessage.success("评论成功");
  commentList();
  inputComment.value = ""; 
  comment.value.content = "";
}

//删除评论
const deleteComment = (commentId) => {
  ElMessageBox.confirm("确定要删除这条评论吗？", "删除确认", {
    confirmButtonText: "确定删除",
    cancelButtonText: "取消",
    type: "warning",
    confirmButtonClass: "el-button--danger"
  }).then(async () => {
    await commentDeleteService(commentId);
    ElMessage.success("删除成功");
    await commentList();
  }).catch(() => {});
};

//回复评论
const replyComment = ref({});
const visibleDrawer = ref(false);

const showReplyDrawer = async(replyId, commentRank) => {
  visibleDrawer.value = true;
  replyComment.value.replyCommentId = replyId;
  replyComment.value.commentRank = commentRank;
  // console.log(replyComment.value);
}
const reply = async() => {
  replyComment.value.postId = id;
  await commentAddService(replyComment.value);
  ElMessage.success("回复成功");
  visibleDrawer.value = false;
  commentList();
  
  replyComment.value.content = "";
  replyComment.value.postId = 0;
  replyComment.value.replyCommentId = 0;
  replyComment.value.commentRank = 0;
}

</script>

<template>
  <div class="post-detail-wrapper">
  <el-card class="post-detail-card" shadow="never">
    <template #header>
      <div class="post-header">
        <div class="header-top">
          <h1 class="post-title">{{post.title}}</h1>
          <div class="header-actions">
            <el-button 
              :type="state ? 'default' : 'warning'" 
              :class="['action-btn', state ? '' : 'collected']"
              @click="state ? addCollection() : deleteCollection()"
            >
              <el-icon><StarFilled /></el-icon>
              {{ state ? '收藏' : '已收藏' }}
            </el-button>
            <el-button class="action-btn back-btn" @click="backToForum()">
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
          </div>
        </div>
        
        <div class="post-meta-bar">
          <div class="author-info">
            <el-avatar 
              class="author-avatar" 
              :src="poster.userPic || avatar" 
              :size="40"
            />
            <div class="author-details">
              <span class="author-name">{{ poster.nickname }}</span>
              <div class="publish-info">
                <span v-if="post.postTime" class="publish-date">
                  {{ post.postTime.substring(0, 10) }}
                </span>
                <span v-if="post.postTime" class="publish-time">
                  {{ post.postTime.substring(11, 20) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="post-stats">
            <div class="stat-item">
              <el-icon><View /></el-icon>
              <span>{{ post.viewNum || 0 }}</span>
              <span class="stat-label">浏览</span>
            </div>
            <div class="stat-item">
              <el-icon><Star /></el-icon>
              <span>{{ post.collNum || 0 }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div class="post-content" v-html="post.content"></div>

    <div class="post-image" v-if="post.coverImg">
      <img :src="post.coverImg" alt="帖子封面" />
    </div>

    <div class="comment-section">
      <div class="section-title">
        <el-icon><ChatDotRound /></el-icon>
        <span>评论区 ({{ comments.length }})</span>
      </div>

      <div class="comment-input-box">
        <el-avatar 
          class="input-avatar" 
          :src="userInfoStore.userInfo.userPic || avatar" 
          :size="40"
        />
        <div class="input-wrapper">
          <el-input 
            v-model="inputComment" 
            type="textarea" 
            :autosize="{ minRows: 2, maxRows: 4 }"
            placeholder="写下你的评论..." 
            class="comment-textarea"
          />
          <div class="input-actions">
            <el-button 
              type="primary" 
              class="submit-comment-btn"
              @click="publish()"
            >
              发表评论
            </el-button>
          </div>
        </div>
      </div>

      <div class="comment-list">
        <div v-for="c in comments" :key="c.id" class="comment-thread">
          <div v-if="c.commentRank == 1" class="comment-item">
            <el-avatar 
              class="comment-avatar" 
              :src="c.userPic || avatar" 
              :size="36"
            />
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ c.nickname }}</span>
                <span class="comment-time">{{ c.publishTime?.substring(0, 10) }}</span>
              </div>
              <div class="comment-text">{{ c.content }}</div>
              <div class="comment-actions">
                <el-button 
                  link 
                  class="reply-btn"
                  @click="showReplyDrawer(c.id, 2)"
                >
                  回复
                </el-button>
                <el-button 
                  v-if="c.publisherId == userInfoStore.userInfo.id || posterId == userInfoStore.userInfo.id"
                  link 
                  class="delete-btn"
                  @click="deleteComment(c.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <div class="replies-container">
            <div 
              v-for="com in comments" 
              :key="com.id" 
              v-show="com.replyCommentId == c.id && com.commentRank == 2"
              class="reply-item"
            >
              <el-avatar 
                class="reply-avatar" 
                :src="com.userPic || avatar" 
                :size="28"
              />
              <div class="reply-body">
                <div class="reply-header">
                  <span class="reply-author">{{ com.nickname }}</span>
                  <span class="reply-time">{{ com.publishTime?.substring(0, 10) }}</span>
                </div>
                <div class="reply-text">{{ com.content }}</div>
                <div class="reply-actions">
                  <el-button 
                    link 
                    class="reply-btn-small"
                    @click="showReplyDrawer(com.id, 3)"
                  >
                    回复
                  </el-button>
                  <el-button 
                    v-if="com.publisherId == userInfoStore.userInfo.id || posterId == userInfoStore.userInfo.id"
                    link 
                    class="delete-btn-small"
                    @click="deleteComment(com.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>

            <div 
              v-for="cc in comments" 
              :key="cc.id"
              v-show="cc.replyCommentId && comments.some(com => com.id == cc.replyCommentId && com.replyCommentId == c.id)"
              class="reply-item nested-reply"
            >
              <el-avatar 
                class="reply-avatar" 
                :src="cc.userPic || avatar" 
                :size="24"
              />
              <div class="reply-body">
                <div class="reply-header">
                  <span class="reply-author">{{ cc.nickname }}</span>
                  <span v-if="cc.replyedNickname" class="reply-target">回复 @{{ cc.replyedNickname }}</span>
                  <span class="reply-time">{{ cc.publishTime?.substring(0, 10) }}</span>
                </div>
                <div class="reply-text">{{ cc.content }}</div>
                <div class="reply-actions">
                  <el-button 
                    link 
                    class="reply-btn-small"
                    @click="showReplyDrawer(cc.id, 3)"
                  >
                    回复
                  </el-button>
                  <el-button 
                    v-if="cc.publisherId == userInfoStore.userInfo.id || posterId == userInfoStore.userInfo.id"
                    link 
                    class="delete-btn-small"
                    @click="deleteComment(cc.id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>

  <el-drawer 
    v-model="visibleDrawer"
    title="回复评论"
    direction="btt"
    size="280px"
    class="reply-drawer"
  >
    <div class="reply-drawer-content">
      <el-input
        v-model="replyComment.content"
        type="textarea"
        :autosize="{ minRows: 3, maxRows: 6 }"
        placeholder="写下你的回复..."
        class="reply-textarea"
      />
      <div class="reply-drawer-actions">
        <el-button @click="visibleDrawer = false">取消</el-button>
        <el-button type="primary" @click="reply()">发表回复</el-button>
      </div>
    </div>
  </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.post-detail-wrapper {
  min-height: 100vh;
  padding: 24px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
}

.post-detail-card {
  max-width: 1400px;
  margin: 0 auto;
  border-radius: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  :deep(.el-card__header) {
    padding: 24px 28px 20px;
    border-bottom: 1px solid #e5e7eb;
    background: #fff;
    border-radius: 16px 16px 0 0;
  }

  :deep(.el-card__body) {
    padding: 0 28px 32px;
  }
}

.post-header {
  .header-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
    gap: 20px;

    .post-title {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.4;
      margin: 0;
      flex: 1;
    }

    .header-actions {
      display: flex;
      gap: 10px;
      flex-shrink: 0;

      .action-btn {
        border-radius: 8px;
        font-weight: 500;
        padding: 8px 16px;
        transition: all 0.2s ease;

        &.collected {
          background: #fef3c7;
          border-color: #f59e0b;
          color: #d97706;

          &:hover {
            background: #fde68a;
            border-color: #f59e0b;
          }
        }

        &.back-btn {
          background: #f3f4f6;
          border-color: #d1d5db;
          color: #374151;

          &:hover {
            background: #e5e7eb;
            border-color: #9ca3af;
          }
        }
      }
    }
  }

  .post-meta-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid #e5e7eb;

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-avatar {
        border: 2px solid #e5e7eb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .author-details {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .author-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .publish-info {
          display: flex;
          align-items: center;
          gap: 8px;

          .publish-date {
            font-size: 13px;
            color: #6b7280;
          }

          .publish-time {
            font-size: 12px;
            color: #9ca3af;
          }
        }
      }
    }

    .post-stats {
      display: flex;
      gap: 20px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        font-size: 14px;
        color: #4b5563;

        .el-icon {
          font-size: 16px;
          color: #6b7280;
        }

        .stat-label {
          font-size: 12px;
          color: #9ca3af;
        }
      }
    }
  }
}

.post-content {
  padding: 2px 0;
  font-size: 16px;
  line-height: 1.8;
  color: #374151;

  :deep(p) {
    margin-bottom: 16px;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 16px 0;
  }

  :deep(h1), :deep(h2), :deep(h3) {
    margin: 24px 0 12px;
    font-weight: 600;
  }
}

.post-image {
  margin: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;

  img {
    width: 40%;
    height: auto;
    object-fit: contain;
    display: inline-block;
  }
}

.comment-section {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e5e7eb;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 24px;

    .el-icon {
      font-size: 20px;
      color: #6366f1;
    }
  }
}

.comment-input-box {
  display: flex;
  gap: 14px;
  margin-bottom: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;

  .input-avatar {
    border: 2px solid #e5e7eb;
  }

  .input-wrapper {
    flex: 1;

    .comment-textarea {
      margin-bottom: 12px;

      :deep(textarea) {
        border-radius: 8px;
        border: 1px solid #d1d5db;
        resize: none;
      }
    }

    .input-actions {
      display: flex;
      justify-content: flex-end;

      .submit-comment-btn {
        background: #6366f1;
        border-color: #6366f1;
        border-radius: 8px;
        padding: 8px 20px;
        font-weight: 500;

        &:hover {
          background: #4f46e5;
          border-color: #4f46e5;
        }
      }
    }
  }
}

.comment-list {
  .comment-thread {
    margin-bottom: 24px;
  }

  .comment-item {
    display: flex;
    gap: 14px;
    padding: 16px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .comment-avatar {
      flex-shrink: 0;
      border: 1px solid #e5e7eb;
    }

    .comment-body {
      flex: 1;

      .comment-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .comment-author {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .comment-time {
          font-size: 12px;
          color: #9ca3af;
        }
      }

      .comment-text {
        font-size: 15px;
        line-height: 1.6;
        color: #374151;
        margin-bottom: 8px;
      }

      .comment-actions {
        display: flex;
        gap: 8px;
      }

      .reply-btn {
        padding: 4px 8px;
        font-size: 13px;
        color: #6366f1;

        &:hover {
          color: #4f46e5;
        }
      }

      .delete-btn {
        padding: 4px 8px;
        font-size: 13px;
        color: #ef4444;

        &:hover {
          color: #dc2626;
        }
      }
    }
  }

  .replies-container {
    margin-top: 12px;
    margin-left: 50px;
    padding-left: 16px;
    border-left: 2px solid #e5e7eb;
  }

  .reply-item {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    margin-bottom: 8px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: background 0.2s ease;

    &:hover {
      background: #f3f4f6;
    }

    &.nested-reply {
      margin-left: 24px;
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .reply-avatar {
      flex-shrink: 0;
    }

    .reply-body {
      flex: 1;

      .reply-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
        flex-wrap: wrap;

        .reply-author {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .reply-target {
          font-size: 12px;
          color: #6366f1;
        }

        .reply-time {
          font-size: 11px;
          color: #9ca3af;
        }
      }

      .reply-text {
        font-size: 14px;
        line-height: 1.5;
        color: #4b5563;
        margin-bottom: 6px;
      }

      .reply-actions {
        display: flex;
        gap: 6px;
      }

      .reply-btn-small {
        padding: 2px 6px;
        font-size: 12px;
        color: #6366f1;

        &:hover {
          color: #4f46e5;
        }
      }

      .delete-btn-small {
        padding: 2px 6px;
        font-size: 12px;
        color: #ef4444;

        &:hover {
          color: #dc2626;
        }
      }
    }
  }
}

.reply-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  :deep(.el-drawer__body) {
    padding: 0;
  }
}

.reply-drawer-content {
  padding: 20px;

  .reply-textarea {
    margin-bottom: 16px;

    :deep(textarea) {
      border-radius: 8px;
    }
  }

  .reply-drawer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .post-detail-wrapper {
    padding: 12px;
  }

  .post-detail-card {
    border-radius: 12px;

    :deep(.el-card__header) {
      padding: 16px;
    }

    :deep(.el-card__body) {
      padding: 0 16px 20px;
    }
  }

  .post-header {
    .header-top {
      flex-direction: column;
      gap: 16px;

      .post-title {
        font-size: 22px;
      }

      .header-actions {
        width: 100%;

        .action-btn {
          flex: 1;
        }
      }
    }

    .post-meta-bar {
      flex-direction: column;
      gap: 16px;
      align-items: flex-start;

      .post-stats {
        width: 100%;
        justify-content: space-around;
      }
    }
  }

  .replies-container {
    margin-left: 20px;
  }

  .comment-input-box {
    padding: 12px;
  }
}
</style>
