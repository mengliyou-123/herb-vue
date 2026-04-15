<script setup>
import { Plus, Upload } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useUserInfoStore } from "@/stores/userInfo";
import { useTokenStore } from "@/stores/token";
import { ElMessage } from "element-plus";
import { userAvatarUpdateService } from "@/api/user";
import avatar from '@/assets/default.png';

const uploadRef = ref()
const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();

const imgUrl = ref(userInfoStore.userInfo.userPic ? userInfoStore.userInfo.userPic : avatar)

const uploadSuccess = (result) => {
  imgUrl.value = result.data;
  ElMessage.success("图片上传成功")
}

const updateAvatar = async () => {
  await userAvatarUpdateService(imgUrl.value)
  ElMessage.success("修改成功")
  userInfoStore.setUserInfo({
    ...userInfoStore.userInfo,
    userPic: imgUrl.value
  })
}
</script>

<template>
  <div class="avatar-page">
    <div class="page-header">
      <div class="header-content">
        <span class="header-icon">🖼️</span>
        <div class="header-text">
          <h1>更换头像</h1>
          <p>上传一张您喜欢的头像图片</p>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="avatar-card">
        <div class="avatar-preview-area">
          <div class="avatar-ring">
            <el-upload
              ref="uploadRef"
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="true"
              action="/api/upload"
              name="file"
              :headers="{ 'Authorization': tokenStore.token }"
              :on-success="uploadSuccess"
            >
              <div class="avatar-wrapper">
                <el-image v-if="imgUrl" :src="imgUrl" class="avatar-img" fit="cover" />
                <div v-else class="avatar-placeholder">
                  <span class="placeholder-icon">📷</span>
                  <span>点击上传</span>
                </div>
                <div class="avatar-overlay">
                  <span>更换图片</span>
                </div>
              </div>
            </el-upload>
          </div>
          <p class="avatar-hint">支持 JPG、PNG 格式，建议尺寸不小于 200×200</p>
        </div>

        <div class="action-bar">
          <el-button :icon="Plus" size="large" class="action-btn select-btn" @click="uploadRef.$el.querySelector('input').click()">
            选择图片
          </el-button>
          <el-button :icon="Upload" size="large" class="action-btn upload-btn" @click="updateAvatar">
            确认上传
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.avatar-page {
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
    .header-icon {
      font-size: 42px;
    }
    .header-text {
      h1 {
        color: #fff;
        font-size: 26px;
        margin: 0 0 6px;
        letter-spacing: 2px;
      }
      p {
        color: rgba(255,255,255,0.8);
        font-size: 14px;
        margin: 0;
      }
    }
  }
}

.page-body {
  display: flex;
  justify-content: center;
  padding: 40px 24px;
}

.avatar-card {
  width: 100%;
  max-width: 520px;
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.avatar-preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-ring {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  padding: 4px;
  background: $color-primary-gradient;

  &::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px dashed rgba($color-primary, 0.3);
    animation: ring-rotate 12s linear infinite;
  }
}

@keyframes ring-rotate {
  to { transform: rotate(360deg); }
}

.avatar-uploader {
  width: 100%;
  height: 100%;
  :deep(.el-upload) {
    width: 100%;
    height: 100%;
    border: none;
    cursor: pointer;
  }
}

.avatar-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  background: $bg-surface;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transition: transform 0.4s ease;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: $text-placeholder;
  font-size: 14px;
  .placeholder-icon {
    font-size: 40px;
  }
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba($color-primary, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover {
  .avatar-img {
    transform: scale(1.05);
  }
  .avatar-overlay {
    opacity: 1;
  }
}

.avatar-hint {
  font-size: 13px;
  color: $text-placeholder;
  text-align: center;
}

.action-bar {
  display: flex;
  gap: 16px;
  width: 100%;
}

.action-btn {
  flex: 1;
  height: 44px;
  border-radius: $radius-md;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.select-btn {
  border: 2px solid $color-primary;
  color: $color-primary;
  background: transparent;
  &:hover {
    background: rgba($color-primary, 0.06);
    transform: translateY(-1px);
  }
}

.upload-btn {
  background: $color-primary;
  border-color: $color-primary;
  color: #fff;
  &:hover {
    background: $color-primary-light;
    border-color: $color-primary-light;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba($color-primary, 0.3);
  }
}

@media (max-width: 768px) {
  .page-body {
    padding: 24px 16px;
  }
  .avatar-card {
    padding: 28px;
  }
  .avatar-ring {
    width: 160px;
    height: 160px;
  }
}
</style>
