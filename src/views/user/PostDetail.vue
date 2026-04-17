<script setup>
import { useRouter } from "vue-router";
import { Delete, Edit, Plus, CaretRight } from "@element-plus/icons-vue";
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
  <div>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span style="font-size:35px;height:60px"> {{post.title}} </span>
        <div class="extra">

          <el-button style="background-color:#8B4513;color:white;" round v-if="state" @click="addCollection()">
            收藏
          </el-button>

          <el-button style="background-color:#8B4513;color:white;" round v-else @click="deleteCollection()">
            已收藏
          </el-button>

          <el-button style="background-color:#8B4513;color:white;" @click="backToForum()">返回</el-button>
        </div>
      </div>
        <div class="divbox">
            <span class="el-dropdown__box">
                <el-avatar :src="poster.userPic?poster.userPic:avatar" :size="30"/>
              </span>
              <div class="nickname"><strong>{{ poster.nickname }}</strong></div>
                <div class="post-time" v-if="post.postTime">
                    发布于{{post.postTime.substring(0,10)}}
                </div>
                <div class="post-time-detail" v-if="post.postTime">
                    {{post.postTime.substring(11,20)}}
                </div>
                <div class="view-num">
                    浏览量{{post.viewNum}}
                </div>
                <div class="coll-num">
                    收藏量{{post.collNum}}
                </div>
        </div>
    </template>

    <div v-html="post.content">
    </div>

    <div class="imgBox"> 
      <img
      class="devImg"
      fit="fill"
      :src="post.coverImg"
      />
    </div>
   
  
    
   
    
    <!-- --------------------------------------------------评论区------------------------------------ -->
    <div class="publish-box">
      <div class="com-avatar">
        <el-avatar :src="userInfoStore.userInfo.userPic?userInfoStore.userInfo.userPic:avatar" :size="30"/>
      </div>
      <div class="input">
        <el-input v-model="inputComment" autosize type="textarea" placeholder="请输入评论..." />
      </div>
      <el-button @click="publish()">评论</el-button>
    </div>

    <div class="comment-list">
      <div v-for="c in comments" :key="c">
        
        <div v-if="c.commentRank==1" class="comment-box">
          <div class="publisher-avatar">
            <el-avatar :src="c.userPic?c.userPic:avatar" :size="30"/>
          </div>

          <div class="comment-info">
            <div class="publisher-info">
              <div class="name">{{c.nickname}}</div>
              <div class="time">
                <div class="time-date">{{c.publishTime.substring(0,10)}}</div>
                <div class="time-detail">{{c.publishTime.substring(11,20)}}</div>
              </div>
              <div class="button">
                <el-button link @click="showReplyDrawer(c.id, 2)">回复</el-button>
              </div>
            </div>

            <div class="content">{{c.content}}</div>
          </div>
        </div>

<!-- reply-box和comment-box并列 -->
        <div v-for="com in comments" :key="com">
          <div class="reply-box" v-if="com.replyCommentId == c.id && com.commentRank == 2">
            <div class="publisher-avatar">
              <el-avatar :src="com.userPic?com.userPic:avatar" :size="30"/>
            </div>

            <div class="reply-info">

              <div class="publisher-info">
                <div class="name">{{com.nickname}}</div>
                <div class="time">
                  <div class="time-date">{{com.publishTime.substring(0,10)}}</div>
                  <div class="time-detail">{{com.publishTime.substring(11,20)}}</div>
                </div>
                <div class="button">
                  <el-button link @click="showReplyDrawer(com.id, 3)">回复</el-button>
                </div>
              </div>

              <div class="content">
                <div v-if="com.commentRank==3">
                  回复@{{com.replyedNickname}}:
                </div>
                <div>
                  {{com.content}}
                </div>
              </div>

            </div>

          </div>
        
            <div v-for="cc in comments" :key="cc">
              <div class="reply-box" v-if="com.id == cc.replyCommentId && com.replyCommentId == c.id && cc.commentRank == 3">
                <div class="publisher-avatar">
                  <el-avatar :src="cc.userPic?com.userPic:avatar" :size="30"/>
                </div>

                <div class="reply-info">

                  <div class="publisher-info">
                    <div class="name">{{cc.nickname}}</div>
                    <div class="time">
                      <div class="time-date">{{cc.publishTime.substring(0,10)}}</div>
                      <div class="time-detail">{{cc.publishTime.substring(11,20)}}</div>
                    </div>
                    <div class="button">
                      <el-button link @click="showReplyDrawer(cc.id, 3)">回复</el-button>
                    </div>
                  </div>

                  <div class="content">
                    <div v-if="cc.commentRank==3">
                      回复@{{cc.replyedNickname}}:
                    </div>
                    <div>
                      {{cc.content}}
                    </div>
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
    title="回复"
    direction="btt"
    size="30%">
    <el-form :model="replyComment" label-width="100px">

        <el-form-item label="">
        <el-input
          v-model="replyComment.content"
          placeholder="请输入回复内容..."
          style="width:1200px"
          autosize
          type="textarea"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="reply()" style="width:80px;height:40px;margin-left:10px;color:white;background-color:#8B4513">
          确认
        </el-button>
      </el-form-item>

    </el-form>
  </el-drawer>
  </div>
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
    font-size: 20px;
  }
}

//表格
.el-descriptions {
  margin-top: 20px;
}
.cell-item {
  display: flex;
  align-items: center;
  height: 40px;
}
.margin-top {
  margin-top: 20px;
}

:deep(.my-label) {
  // background: var(--el-color-success-light-9) !important;
  width: 200px;
}

.imgBox {
  width: 1050px;
  text-align: center;
  .devImg {
    width: auto;
    height: 400px;
    
    padding: 10px 10px;
  }
}

// -----------------------------------评论区------------------------------------------------

.publish-box{
  display: flex;
  align-items: center;
  flex-direction:row;
  height: 70px;
  margin-top:80px;
  margin-bottom: 5px;

  .com-avatar{
    display: flex;
    align-items: center;
    width: 40px;
  }
  .input{
  width: 1020px;
  margin-right:10px;
  }
}

.comment-list{
  background-color: #FAEBD7;
  border-radius:8px;

  .reply-box{
    background-color:#FDF5E6;
    display: flex;
    align-items: center;
    flex-direction:row;
    width:1140px;
    height:80px;
    border-bottom: 1px solid #cccccc;

    .publisher-avatar{
    height:70px;
    margin-left: 30px;
    margin-top:10px;
  }

    .reply-info{
      .publisher-info{
        display: flex;
        align-items: center;
        margin-left: 10px;
        margin-top:-10px;
        .name{
          font-size:15px;
          min-width: 80px;
          display: flex;
          align-items: center;
          margin-top:5px;
          margin-right: 15px;
        }
        .time{
          display: flex;
          align-items: center;
          margin-top:5px;
          font-size:14px;
          flex: 1;
          
          .time-date {
            color: grey;
            min-width: 100px;
            display: flex;
            align-items: center;
          }
          
          .time-detail {
            color: grey;
            margin-left: 5px;
            display: flex;
            align-items: center;
          }
        }
        .button{
          font-size:14px;
          margin-left: 10px;
        }
      }
      .content{
        display: flex;
        margin-left:10px;
        margin-top:5px;
        color:black;
        font-size: 15px;
      }
    }
  }



  .comment-box{
    display: flex;
    align-items: center;
    flex-direction:row;
    width:1135px;
    height:80px;
    border-bottom: 1px solid #cccccc;

    .publisher-avatar{
    height:70px;
    margin-left: 10px;
    margin-top:10px;
  }

    .comment-info{
      .publisher-info{
        display: flex;
        align-items: center;
        margin-left: 10px;
        margin-top:-10px;
        .name{
          font-size:15px;
          min-width: 80px;
          display: flex;
          align-items: center;
          margin-top:5px;
          margin-right: 15px;
        }
        .time{
          display: flex;
          align-items: center;
          margin-top:5px;
          font-size:14px;
          flex: 1;
          
          .time-date {
            color: grey;
            min-width: 100px;
            display: flex;
            align-items: center;
          }
          
          .time-detail {
            color: grey;
            margin-left: 5px;
            display: flex;
            align-items: center;
          }
        }
        .button{
          font-size:14px;
          margin-left: 10px;
        }
      }
      .content{
        display: flex;
        margin-left:10px;
        margin-top:5px;
        color:black;
        font-size: 15px;
      }
    }
  }

  
}

.userDis {
    position: relative;
    width: 100%;
    height: 100px;
    background-color: aliceblue;
    margin-bottom: 10px;
    border: 1px solid black;
}

.userDis>div {
    float: left;
}

.userDis .head {
    width: 25%;
    height: 100%;

}

.userDis .dis {
    width: 40%;
    height: 100%;
}
.userDis .showTime{
    position: absolute;
    top: 0;
    right: 0;
    width: 50%;
    height: 100%;
    text-align: right;
    color: #645e5e;
    font-size: 14px;

}
.hide{
    width: 100%;
    height: 100px;
    // background-color: pink;
    text-align: center;
    line-height: 100px;
    // border: 1px solid black;
    color: #BDBDBD;
}
img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}



.divbox {
  display: flex;
  align-items: center;
  flex-direction:row;
  align-items:center;
  background-color:#F5F5F5;
  width:1150px;
  height:40px;
  border-radius:15px;

  .el-dropdown__box {
    margin-left: 15px;
    display: flex;
    align-items: center;
    width: 40px;

    .el-icon {
      color: #999;
      margin-left: 10px;
    }

    &:active,
    &:focus {
      outline: none;
    }
  }

  .nickname {
    font-size: 12px;
    margin-left: 10px;
    min-width: 60px;
    display: flex;
    align-items: center;
  }

  .post-time {
    font-size: 10px;
    margin-left: 15px;
    min-width: 120px;
    display: flex;
    align-items: center;
  }

  .post-time-detail {
    font-size: 10px;
    margin-left: 5px;
    min-width: 80px;
    display: flex;
    align-items: center;
  }

  .view-num {
    font-size: 10px;
    margin-left: 10px;
    min-width: 70px;
    display: flex;
    align-items: center;
  }

  .coll-num {
    font-size: 10px;
    margin-left: 10px;
    min-width: 80px;
    display: flex;
    align-items: center;
  }
}



  
</style>
