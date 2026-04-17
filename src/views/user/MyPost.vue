<script setup>
import { ref } from "vue";
import { EditPen, Delete, Plus } from '@element-plus/icons-vue'
import {
  postAddService,
  postListService,
  postDeleteService,
  postDetailService,
  addViewService,
  myPostService
} from "@/api/post.js";
import { postCollListService, deleteByPostIdService } from "@/api/collections.js";
import { deleteCommentsByPostIdService } from "@/api/comment.js";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token";
import {useUserInfoStore} from "@/stores/userInfo";
const userInfoStore = useUserInfoStore();
import { ElMessage, ElMessageBox } from "element-plus";
import { QuillEditor } from "@vueup/vue-quill";



const tokenStore = useTokenStore();
const router = useRouter();

const posts = ref([]);

//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  postList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  postList();
};

//记录我的帖子数量
const myPostNum = ref(0);

//帖子列表
const postList = async() => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    posterId: userInfoStore.userInfo.id
  };
  const result = await myPostService(params);
  posts.value = result.data.items;
  total.value = result.data.total;  
  myPostNum.value = posts.value.length;
};
postList();

//帖子详情
const detail = async(id) => {
  addViewService(id);
  router.push({ path: "/user/postDetail", query: { id: id } });
}


//跳转到我的帖子
const myPost = async() => {
  router.push({ path: "/user/myPost"});
}

//跳转到收藏
const showCollections = async() => {
    router.push({ path: "/mine/collections"});
}

//收藏量
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

//删帖
const deletePost = (id) => {
  ElMessageBox.confirm("你确认要删除该讨论帖吗？", "温馨提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    //先删收藏，再删评论，再删帖子
    await deleteByPostIdService(id);
    await deleteCommentsByPostIdService(id);
    await postDeleteService(id);
    ElMessage.success("删除成功");
    await postList();
  });
};

//发帖
const visibleDrawer = ref(false); //抽屉是否显示
const postModel = ref({});
const uploadSuccess = (result) => { //图片回显
  postModel.value.coverImg = result.data;
};
const showDrawer = () => {
  postModel.value = {
    title: "",
    content: "",
    coverImg: ""
  }
  // postModel.value.conten.setHTML('');
  // console.log(postModel.value.content)
  visibleDrawer.value = true;
};
const addPost = async () => {
  await postAddService(postModel.value);
  ElMessage.success("添加成功");
  visibleDrawer.value = false;
  await postList();
};
</script>


<template>
<el-card style="background-color: #FAF8F5">

    <div style="display: flex;width: 95%;margin: 0 auto;background-color: #FAF8F5;border-radius: 5px;">
      <div style="flex: 1;border-right: 1px solid #cccccc;">
 
        <div v-for="p in posts" :key="p" style="height: 170px;display: flex;margin: 10px 20px;border-bottom: 1px solid #cccccc;" class="item">
            <div style="margin: 20px 0;width: 200px;" @click="detail(p.id)">
                <el-image :src="p.coverImg" style="height: 130px;width: 200px;object-fit: cover;cursor: pointer;"></el-image>
            </div>
            <div style="margin: 30px 20px;">
                <div style="display: flex">
                    <div style="font-size: 18px;color: #000000;cursor: pointer;width:390px"> {{p.title}} </div>
                <div style="width:30px">
                <el-button
                :icon="Delete"
                circle
                plain
                type="danger"
                @click="deletePost(p.id)"
                ></el-button>
                </div> 
                </div>
                
                <div style="display: flex;color: #cccccc;line-height: 30px;margin-top: 10px;" @click="detail(p.id)">
                <span style="color:grey">{{p.postTime.substring(0,10)}} {{p.postTime.substring(11,20)}}</span>
                <span style="margin-left: 10px;color:grey">{{p.viewNum}}人浏览过</span>
                </div>
                <div class="content" v-html="p.content" @click="detail(p.id)">
                </div>
            </div>
        </div>
      </div>

      <div style="width: 376px;">
        <div style="height: 290px;margin: 30px 20px;border: 2px solid #cccccc;border-radius: 5PX;">

          <div style="text-align: center;margin-top: 15px;" class="face-pic">
            <el-image :src="userInfoStore.userInfo.userPic" style="width: 100px;height: 100px;object-fit: cover;border-radius: 50%;"></el-image>
          </div>
          <div style="text-align: center;color: #626262;">
            <div style="font-size: 18px;line-height: 40px;">{{userInfoStore.userInfo.nickname}}</div>
            <el-button style="width: 220px;margin: 5px 0;background-color:#8B4513;color:white;" @click="showDrawer()">
              <el-icon>
                <EditPen/>
              </el-icon>
              发帖
              </el-button>
          </div>
          
          <div style="display: flex;text-align: center;margin-top: 20px;">
            <div style="width: 50%;">
              <div style="line-height: 30px;font-size: 18px;">
                {{myPostNum}}
              </div>
              <div style="font-size: 12px;">
                已发帖
              </div>
            </div>
            
            <div style="flex: 1;" @click="showCollections()">
              <div style="line-height: 30px;font-size: 18px;">
                {{collNum}}
              </div>
              <div style="font-size: 12px;">
                收藏
              </div>
            </div>
          </div>
        </div>

        <div style="margin: 30px 20px;border-radius: 5PX;">
          <el-calendar style="height: 640px;">
          </el-calendar>
        </div>
 
      </div>
    </div>

  <!-- 分页条 -->
    <el-pagination
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :page-sizes="[5, 10, 20, 30]"
      layout="jumper, total, sizes, prev, pager, next"
      background
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: center"
    />
</el-card>
<el-drawer
    v-model="visibleDrawer"
    title="发布讨论帖"
    direction="rtl"
    size="50%"
  >
    
    <el-form :model="postModel" label-width="100px">
      <el-form-item label="标题">
        <el-input
          v-model="postModel.title"
          placeholder="请输入标题"
        ></el-input>
      </el-form-item>

      <el-form-item label="内容">
        <div class="editor">
          <quill-editor
              theme="snow"
              v-model:content="postModel.content"
              contentType="html"
          >
          </quill-editor>

        </div>
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
          class="avatar-uploader"
          :auto-upload="true"
          :show-file-list="false"
          action="/api/upload"
          name="file"
          :headers="{ Authorization: tokenStore.token }"
          :on-success="uploadSuccess"
        >
          <el-image
            v-if="postModel.coverImg"
            :src="postModel.coverImg"
            class="avatar"
          />
          <el-icon v-else class="avatar-uploader-icon">
            <Plus />
          </el-icon>
        </el-upload>
      </el-form-item>
      
      <el-form-item>
        <el-button @click="addPost()" style="background-color:#8B4513;color:white;">
          确认
        </el-button>
    
      </el-form-item>
    </el-form>
  </el-drawer>
</template>
 

 
<style lang="scss" scoped>

  .item img {
    width: 100%;
    height: auto;
    transform: scale(1);
    transition: transform 1s ease 0s;
  }
 
  .item:hover img{
    transform: scale(1.1);
  }
  .face-pic:hover img{
    transform:rotate(360deg);
    -ms-transform:rotate(360deg); /* Internet Explorer */
    -moz-transform:rotate(360deg); /* Firefox */
    -webkit-transform:rotate(360deg); /* Safari 和 Chrome */
    -o-transform:rotate(360deg); /* Opera */
    transition: transform 0.6s ease 0s;
  }
  .el-calendar-day{
    height: 30px!important;
    text-align: center!important;
  }
  .content{
    height: 62px;
    overflow:hidden;  
    text-overflow:ellipsis; 
    display:-webkit-box;
    /* autoprefixer: off */
    -webkit-box-orient:vertical;
    /* autoprefixer: on */
    -webkit-line-clamp:2;
    line-clamp: 2;
    line-height: 25px;
    color: gray;
  }

  .editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}

.avatar-uploader {
  :deep {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}
</style>