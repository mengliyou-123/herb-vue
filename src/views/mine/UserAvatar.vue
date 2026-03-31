<script setup>
import {Plus, Upload} from '@element-plus/icons-vue'
import {ref} from 'vue'
import {useUserInfoStore} from "@/stores/userInfo";
import {useTokenStore} from "@/stores/token";
import {ElMessage} from "element-plus";
import {userAvatarUpdateService} from "@/api/user";
import avatar from '@/assets/default.png';

const uploadRef = ref()

const userInfoStore = useUserInfoStore();

//用户头像地址
const imgUrl = ref(userInfoStore.userInfo.userPic?userInfoStore.userInfo.userPic:avatar)

const tokenStore = useTokenStore();

//图片上传成功回调函数
const uploadSuccess = (result) => {
  imgUrl.value = result.data;
  ElMessage.success("图片上传成功")
}

//上传图片
const updateAvatar = async () => {
  await userAvatarUpdateService(imgUrl.value)
  ElMessage.success("修改成功")

//修改pinia中的数据
  userInfoStore.setUserInfo({
    ...userInfoStore.userInfo,
    userPic: imgUrl.value
  })
}
</script>

<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>更换头像</span>
      </div>
    </template>
    <el-row>
      <el-col :span="12">
        <el-upload
            ref="uploadRef"
            class="avatar-uploader"
            :show-file-list="false"
            :auto-upload="true"
            action="/api/upload" 
            name="file"
            :headers="{'Authorization':tokenStore.token}"
            :on-success="uploadSuccess"
        >
          <el-image v-if="imgUrl" :src="imgUrl" class="avatar"/>
          <el-image v-else src="avatar" width="278"/>
        </el-upload>
        <br/>
        <el-button style="background-color:#8B4513;color:white" :icon="Plus" size="large" @click="uploadRef.$el.querySelector('input').click()">
          选择图片
        </el-button>
        <el-button style="background-color:#8B4513;color:white" :icon="Upload" size="large" @click="updateAvatar">
          上传头像
        </el-button>
      </el-col>
    </el-row>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  background-color: #FFF8DC;
  .avatar-uploader {
    :deep {
      .avatar {
        width: 278px;
        height: 278px;
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
        width: 278px;
        height: 278px;
        text-align: center;
      }
    }
  }
}

</style>
