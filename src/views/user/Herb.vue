<script setup>
import { Delete, Edit, Plus } from "@element-plus/icons-vue";

import { ref } from "vue";
import { herbListService, herbDetailService } from "@/api/herb.js";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { useTokenStore } from "@/stores/token";
import { ElMessage, ElMessageBox } from "element-plus";
import {useUserInfoStore} from "@/stores/userInfo";
import { useRouter } from "vue-router";

const userInfoStore = useUserInfoStore();

//用户搜索时选中的科
const family = ref("");

//用户搜索时选中的类型
const category = ref("");

//用户搜索时选中的性
const property = ref("");

//用户搜索时选中的味
const flavor = ref("");

//用户搜索时选中的归经
const meridianTropism = ref("");

//用户搜索时填写的中文名
const cnName = ref("");

//中药模型
const herbs = ref([
]);

//分页条数据模型
const pageNum = ref(1); //当前页
const total = ref(20); //总条数
const pageSize = ref(10); //每页条数

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size;
  herbList();
};
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num;
  herbList();
};

//根据中文名查询

const herbList = async () => {
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    // 如果为空字符串，可以这样写
    family: family.value ? family.value : null,
    category: category.value ? category.value : null,
    property: property.value ? property.value : null,
    flavor: flavor.value ? flavor.value : null,
    meridianTropism: meridianTropism.value ? meridianTropism.value : null,
    cnName: cnName.value ? cnName.value : null,
  };
  const result = await herbListService(params);
  herbs.value = result.data.items;
  total.value = result.data.total;
};
herbList();

//数据模型
const herbModel = ref({
  cnName: "",
  latinName: "",
  en_name: "",
  family: "",
  habitat: "",
  part: "",
  catrgory: "",
  property: "",
  flavor: "",
  meridianTropism: "",
  efficacy: "",
  trait: "",
  indications: "",
  herbPic: "",
});

const tokenStore = useTokenStore();

const router = useRouter();

const herbDetail = async (id) => {
  // const result = await herbDetailService(id);
  // herbs.value = result.data.items;
  router.push({ path: "/user/herbDetail", query: { id: id } });
  //console.log(id);
};

const story = async (index) => {
  await router.push({ path: "/user/herbStories", query: { index: index } });
}
</script>

<template>
  <el-card class="page-container">
<!-- 上部分div -->
    <div>
<!-- 搜索框div -->
       <div style="margin-left:30px;margin-top:10px;"> 
        <el-input v-model="cnName" placeholder="按中文名检索" style="width:90%;height:40px;font-size:15px;"> </el-input>
        <el-button @click="herbList()" style="width:80px;height:40px;margin-left:10px;color:white;background-color:#8B4513">搜索</el-button>
      </div>

<!-- 筛选栏div -->
      <div style="margin-left:30px;"> 
        <table class="select-table">
          <tr class="tr">
            <td class="td-left">药味</td>
            <td class="td" @click="flavor = '';herbList()">
              <el-button link>全部</el-button>
              </td>
            <td class="td" @click="flavor = '苦';herbList()">
              <el-button link>苦</el-button>
              </td>
            <td class="td" @click="flavor = '甘';herbList()">
              <el-button link>甘</el-button>
              </td>
            <td class="td" @click="flavor = '涩';herbList()">
              <el-button link>涩</el-button>
              </td>
            <td class="td" @click="flavor = '辛';herbList()">
              <el-button link>辛</el-button>
              </td>
            <td class="td" @click="flavor = '酸';herbList()">
              <el-button link>酸</el-button>
              </td>
            <td class="td" @click="flavor = '咸';herbList()">
              <el-button link>咸</el-button>
              </td>
            <td class="td" @click="flavor = '淡';herbList()">
              <el-button link>淡</el-button>
              </td>
          </tr>
          <tr class="tr">
            <td class="td-left">药性</td>
            <td class="td" @click="property = '';herbList()">
              <el-button link>全部</el-button>
              
            </td>
            <td class="td" @click="property = '热';herbList()">
              <el-button link>热</el-button>
              </td>
            <td class="td" @click="property = '温';herbList()">
              <el-button link>温</el-button>
              </td>
            <td class="td" @click="property = '寒';herbList()">
              <el-button link>寒</el-button>
              </td>
            <td class="td" @click="property = '凉';herbList()">
              <el-button link>凉</el-button>
              </td>
            <td class="td" @click="property = '平';herbList()">
              <el-button link>平</el-button>
              </td>
          </tr>
          <tr class="tr">
            <td class="td-left">归经</td>
            <td class="td" @click="meridianTropism = '';herbList()">
              <el-button link>全部</el-button>
              
            </td>
            <td class="td" @click="meridianTropism = '心';herbList()">
              <el-button link>心经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '胃';herbList()">
              <el-button link>胃经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '脾';herbList()">
              <el-button link>脾经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '肾';herbList()">
              <el-button link>肾经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '肺';herbList()">
              <el-button link>肺经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '肝';herbList()">
              <el-button link>肝经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '胆';herbList()">
              <el-button link>胆经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '膀胱';herbList()">
              <el-button link>膀胱经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '大肠';herbList()">
              <el-button link>大肠经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '小肠';herbList()">
              <el-button link>小肠经</el-button>
              </td>
            <td class="td" @click="meridianTropism = '三焦';herbList()">
              <el-button link>三焦经</el-button>
              </td>
            <td class="td" style="width: 260px;" @click="meridianTropism = '';herbList()">心包经</td>

          </tr>
        </table>
      </div>
    </div>

<!-- 下部分div -->
<div style="display: flex;width: 95%;margin: 0 auto;background-color: #FFF8DC;;border-radius: 5px;">
        <!-- 中药列表div -->
    <div style="flex: 1;border-right: 1px solid #cccccc;; margin-top:20px;">
      <div v-for="h in herbs" :key="h" @click="herbDetail(h.id)" style="height: 120px;display: flex;margin: 10px 20px;border-bottom: 1px solid #cccccc;">
            <div style="margin: 12px 0;width: 100px;">
            <el-image :src="h.herbPic" style="height: 85px;width: 100px;object-fit: cover;cursor: pointer;"></el-image>
          </div>
          <div style="margin-left:18px;margin-top:10px;margin-right:10px;">
            <div style="font-size: 25px;color: #000000;cursor: pointer;"> {{h.cnName}} </div>
            <div style="color: #cccccc; margin-top:10px;">
              <div style="height: 45px;
                overflow:hidden;  
                text-overflow:ellipsis; 
                display:-webkit-box;
                -webkit-box-orient:vertical;
                -webkit-line-clamp:2;  
                line-height: 22px;
                color: gray;
                font-size:12px;"> 
              {{h.trait}} {{h.efficacy}} {{h.indications}}</div>
            </div>
            </div>
          </div>
    </div>

      <div style="width: 380px;">
 
        <div style="margin: 20px 15px;">
          <div class="stories-panel">
            <div class="stories-header">
              <span>中药传说</span>
            </div>
            <div class="stories-content">
              <div class="row">
                    <div class="title" @click="story(1)">人参的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(2)">地龙的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(3)">马齿苋的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(4)">梅花的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(5)">麦冬的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(6)">芍药的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(7)">茵陈的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(8)">杏仁的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(9)">香附的传说</div>
                  </div>
                  <div class="row">
                    <div class="title" @click="story(10)">夏枯草的传说</div>
                  </div>
            </div>
          </div>
        </div>
 
      </div>

</div>
     

    <!-- 分页条 -->
    <el-pagination
      class="pagination"
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
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;
  background-color: #FFF8DC;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .select-table {
    border-collapse: collapse;
    margin-left: 10px;
    margin-top: 20px;
    .tr {
      border-bottom: 1px solid rgb(205, 205, 205);
      height: 35px;
      width: 500px;
      .td-left {
        width:60px;
        font-size: 15px;
        font-weight: bold;
      }
      .td {
        width:60px;
        font-size: 13px;
    }
    }
  }

  .stories-panel {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    
    .stories-header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      padding: 12px 15px;
      font-size: 16px;
      font-weight: 600;
      color: #fff;
    }
    
    .stories-content {
      padding: 10px 15px;
    }
    
    .row{
      padding: 5px 0;
      border-bottom: 1px dashed #cccccc;
      overflow: hidden;
      text-overflow: ellipsis;
      
      .title{
        color: #707070;
        line-height: 20px;
        font-size: 12px;
        margin-top: 5px;
        cursor: pointer;
        
        &:hover {
          color: #8B4513;
        }
      }
    }
  }
}
</style>
