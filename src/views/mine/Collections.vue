<script setup>
import { ref } from "vue";
import { 
  preCollListService,
  preCollDeleteService, 
  preCollNumSubtractService, 
  findIdService, 
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
import {
  addViewService
} from "@/api/post.js"
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, More, StarFilled } from "@element-plus/icons-vue";
import {useUserInfoStore} from "@/stores/userInfo";
import { useRouter } from "vue-router";

const userInfoStore = useUserInfoStore();

//-------------------------------------方剂收藏------------------------------------------

//方剂模型
const pres = ref([]);

const preModel = ref({

});

//分页条数据模型
const pageNum1 = ref(1); //当前页
const total1 = ref(20); //总条数
const pageSize1 = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange1 = (size) => {
  pageSize1.value = size;
  preCollList();
};
//当前页码发生变化，调用此函数
const onCurrentChange1 = (num) => {
  pageNum1.value = num;
  preCollList();
};

const preCollList = async () => {
  const params = {
    pageNum: pageNum1.value,
    pageSize: pageSize1.value,
    userId: userInfoStore.userInfo.id
  };
  const result = await preCollListService(params);
  pres.value = result.data.items;
  total1.value = result.data.total;
};
preCollList();

const preDetail = async (id) => {
  router.push({ path: "/user/preDetail", query: { id: id } });
}


const preCollection = ref({
    "userId":0,
    "preId":0,
});


const deletePre = async (id) => {
  preCollection.value.userId = userInfoStore.userInfo.id;
  preCollection.value.preId = id;
  let result = await isPreCollService(preCollection.value);
  let collId = result.data.id;
  console.log(result.data.id);
  await preCollDeleteService(collId);
  await preCollNumSubtractService(id);
  ElMessage.success("取消收藏成功");
  await preCollList();
}

//-------------------------------------典籍收藏-----------------------------------------

//分页条数据模型
const pageNum2 = ref(1); //当前页
const total2 = ref(20); //总条数
const pageSize2 = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange2 = (size) => {
  pageSize2.value = size;
  bookCollList();
};
//当前页码发生变化，调用此函数
const onCurrentChange2 = (num) => {
  pageNum2.value = num;
  bookCollList();
};

const bookCollList = async () => {
  const params = {
    pageNum: pageNum2.value,
    pageSize: pageSize2.value,
    userId: userInfoStore.userInfo.id
  };
  const result = await bookCollListService(params);
  books.value = result.data.items;
  total2.value = result.data.total;
};
bookCollList();


const deleteBook = async (bookId) => {
  let params = {
    bookId: bookId,
    userId: userInfoStore.userInfo.id
  };
  let result = await isBookCollService(params);
  let collId = result.data.id;
  await bookCollDeleteService(collId);
  await bookCollNumSubtractService(bookId);
  ElMessage.success("取消收藏成功");
  await bookCollList();
}

//添加表单数据模型
const bookModel = ref({
  bookName: "",
  author: "",
  introduction: "",
  type: "",
  collNum: 0,
  coverImg: "",
});

//典籍模型
const books = ref([]);

const router = useRouter();

const chapterList = async (id) => {
  // const result = await herbDetailService(id);
  // herbs.value = result.data.items;
  router.push({ path: "/user/chapter", query: { bookId: id } });
  //console.log(id);
};

//----------------------------------讨论帖收藏---------------------------------


//分页条数据模型
const pageNum3 = ref(1); //当前页
const total3 = ref(20); //总条数
const pageSize3 = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange3 = (size) => {
  pageSize3.value = size;
  bookCollList();
};
//当前页码发生变化，调用此函数
const onCurrentChange3 = (num) => {
  pageNum3.value = num;
  bookCollList();
};

const posts = ref([]);
const postCollList = async () => {
  const params = {
    pageNum: pageNum3.value,
    pageSize: pageSize3.value,
    userId: userInfoStore.userInfo.id
  };
  const result = await postCollListService(params);
  posts.value = result.data.items;
  total3.value = result.data.total;
};
postCollList();

const detail = async(id) => {
   addViewService(id);
   router.push({ path: "/user/postDetail", query: { id: id } });
}

const deletePost = async (postId) => {
  let params = {
    postId: postId,
    userId: userInfoStore.userInfo.id,
  };
  let result = await isPostCollService(params);
  let collId = result.data.id;
  await postCollDeleteService(collId);
  await postCollNumSubtractService(postId);
  ElMessage.success("取消收藏成功");
  await postCollList();
}
</script>

<template>
  <el-card class="page-container">
    <el-tabs type="border-card" style="background-color: #FFF8DC; height: 620px;">
      <el-tab-pane label="方剂" class="tab" >
        <div style="display: flex;width: 95%;margin: 0 auto;background-color: #FFF8DC;border-radius: 5px;">
                <!-- 方剂列表div -->
            <div style="flex: 1; margin-top:20px;">
              <div v-for="p in pres" :key="p" class="item">
                  <div style="margin-left:12px;margin-top:10px;margin-right:10px;">
                    <div style="display: flex">
                      <div class = "name"  @click="preDetail(p.id)"> {{p.preName}} </div>
                      <div >
                        <el-button
                        :icon="StarFilled"
                        circle
                        plain
                        type="primary"
                        @click="deletePre(p.id)"
                        ></el-button>
                      </div> 
                    </div>
                    
                    <div class="text"  @click="preDetail(p.id)">
                      <div >剂型：{{p.dosageForm}}</div>
                      <div >组成：{{p.originalText}}</div>
                    </div>
                    </div>
                  </div>
            </div>
        </div>
        <!-- 分页条 -->
        <el-pagination
          v-model:current-page="pageNum1"
          v-model:page-size="pageSize1"
          :page-sizes="[5, 10, 20, 30]"
          layout="jumper, total, sizes, prev, pager, next"
          background
          :hide-on-single-page="value"
          :total="total1"
          @size-change="onSizeChange1"
          @current-change="onCurrentChange1"
          style="margin-top: 20px; position: fixed;bottom: 12%; left: 42%;"
        />
      </el-tab-pane>

      <el-tab-pane label="典籍" class="tab">
        <el-row :gutter="20" v-for="i in (1, Math.ceil(total2/5))" :key="i">
          <el-col :span="5" v-for="b in books" :key="b">

            <el-card shadow="hover" class="card">
              <template #header>{{b.bookName}}</template>
              <img :src=b.coverImg @click="chapterList(b.id)" class="image"/>
              <div class="bottom clearfix">
                <!-- <el-text type="text"> {{b.author}} </el-text> -->
                <el-button link @click="deleteBook(b.id)">取消收藏</el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <!-- 分页条 -->
        <el-pagination
          v-model:current-page="pageNum2"
          v-model:page-size="pageSize2"
          :page-sizes="[5, 10, 20, 30]"
          layout="jumper, total, sizes, prev, pager, next"
          background
          :total="total2"
          @size-change="onSizeChange2"
          @current-change="onCurrentChange2"
          style="margin-top: 20px; position: fixed;bottom: 12%; left: 42%;"
        />
      </el-tab-pane>

      <el-tab-pane label="讨论帖" class="tab">
      
      <div style="flex: 1;">
 
        <div v-for="p in posts" :key="p" style="height: 160px;display: flex;margin: 10px 20px;border-bottom: 1px solid #cccccc;" class="item">
          <div style="margin: 20px 0;width: 200px;" @click="detail(p.id)">
            <el-image :src="p.coverImg" style="height: 130px;width: 200px;object-fit: cover;cursor: pointer;"></el-image>
          </div>
          <div style="margin: 30px 20px;">
            <div style="display: flex">
              <div @click="detail(p.id)" style="font-size: 18px;color: #000000;cursor: pointer;width:800px"> {{p.title}} </div>
              <div >
                <el-button
                :icon="StarFilled"
                circle
                plain
                type="primary"
                @click="deletePost(p.id)"
                ></el-button>
                </div> 
            </div>
            
            <div @click="detail(p.id)" style="display: flex;color: #cccccc;line-height: 40px;">
              <span class="icon-active"><i class="el-icon-alarm-clock el-icon--right"></i>{{p.postTime.substring(0,10)}} {{p.postTime.substring(11,20)}}</span>
              <span class="icon-active" icon="el-icon-link" style="margin-left: 10px;"><i class="el-icon-view el-icon--right"></i>{{p.viewNum}}人浏览过</span>
            </div>
            <div @click="detail(p.id)" class="content" v-html="p.content">
            </div>
          </div>
        </div>
 
      </div>

      <!-- 分页条 -->
        <el-pagination
          v-model:current-page="pageNum3"
          v-model:page-size="pageSize3"
          :page-sizes="[5, 10, 20, 30]"
          layout="jumper, total, sizes, prev, pager, next"
          background
          :total="total3"
          @size-change="onSizeChange3"
          @current-change="onCurrentChange3"
          style="margin-top: 20px; position: fixed;bottom: 12%; left: 42%;"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style lang="scss" scoped>
.image {
  width: 100%;
  height: 220px;
  display: block;
  margin-bottom: 10px;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.page-container {
  min-height: 100%;
  box-sizing: border-box;
  background-color: #FFF8DC;
  

  ::v-deep .el-tabs__item.is-active {
    color: #8B4513;//选中
    background-color: #FFF8DC;
    opacity: 1;
  }
  
  ::v-deep .el-tabs__item :hover {
    color: #8B4513;//悬浮
    cursor: pointer;
    opacity: 1;
    }
  
  .card {
  margin-top: 10px;
  width: 200px;
  height: 340px;
}

.el-row {
  margin-bottom: 20px;
}

.item {
  transition-duration: 0.5s;
  height: 125px;
  display: flex;
  margin: 10px 20px;
  border-bottom: 1px solid #cccccc;
  

  .img {
    width: 100%;
    height: auto;
    transform: scale(1);
    transition: transform 1s ease 0s;
  }

  .name{
    font-size: 25px;
    color: #000000;
    cursor: pointer;
    width: 960px;
  }

  .name:hover{
    font-size: 1.7em;
  }

  .text {
    color: #cccccc; 
    margin-top:10px;height: 45px;
    overflow:hidden;  
    text-overflow:ellipsis; 
    display:-webkit-box;
    -webkit-box-orient:vertical;
    -webkit-line-clamp:3;  
    line-height: 25px;
    color: gray;
    font-size:13px;
  }
}
.item :hover img{
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
    height: 50px;overflow:hidden;  
    text-overflow:ellipsis; 
    display:-webkit-box;
    /* autoprefixer: off */
    -webkit-box-orient:vertical;
    /* autoprefixer: on */
    -webkit-line-clamp:2;  
    line-height: 25px;
    color: gray;
  }
}


</style>
