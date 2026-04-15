<script setup>
import { ref } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { useUserInfoStore } from "@/stores/userInfo";
import { useTokenStore } from "@/stores/token";
import { userInfoUpdateService, userAvatarUpdateService, userPwdUpdateService } from "@/api/user";
import { ElMessage } from "element-plus";
import avatar from '@/assets/default.png';

const userInfoStore = useUserInfoStore();
const tokenStore = useTokenStore();

const userInfo = ref({
  ...userInfoStore.userInfo
})

const rules = {
  nickname: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    {
      pattern: /^\S{2,10}$/,
      message: '昵称必须是2-10位的非空字符串',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入用户邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ]
}

const formRef = ref(null);

const updateUserInfo = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      await userInfoUpdateService(userInfo.value);
      ElMessage.success('修改成功');
      userInfoStore.setUserInfo(userInfo.value);
    }
  });
}

const uploadRef = ref()
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

const pwdData = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})

const pwdFormRef = ref(null);

const updatePwdData = async () => {
  if (!pwdFormRef.value) return;
  await pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      await userPwdUpdateService(pwdData.value);
      ElMessage.success('修改成功')
      pwdData.value = {
        old_pwd: '',
        new_pwd: '',
        re_pwd: ''
      }
    }
  });
}

const checkRePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次确认密码'))
  } else if (value !== pwdData.value.new_pwd) {
    callback(new Error('两次密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  old_pwd: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度为5-16位', trigger: 'blur' },
  ],
  new_pwd: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 5, max: 16, message: '长度为5-16位', trigger: 'blur' },
  ],
  re_pwd: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: checkRePassword, trigger: 'blur' },
  ]
}

const activeTab = ref('info');
</script>

<template>
  <div class="userinfo-page">
    <div class="page-header">
      <span class="header-icon">👤</span>
      <h1>个人中心</h1>
      <p>管理您的个人信息、头像和账户安全</p>
    </div>

    <div class="page-body">
      <el-tabs v-model="activeTab" type="border-card" class="profile-tabs">
        <el-tab-pane label="基本资料" name="info">
          <el-form ref="formRef" :model="userInfo" :rules="rules" label-width="90px" class="profile-form">
            <el-form-item label="登录名称">
              <el-input v-model="userInfo.username" disabled />
              <div class="field-hint">登录名不可修改</div>
            </el-form-item>
            <el-form-item label="用户昵称" prop="nickname">
              <el-input v-model="userInfo.nickname" placeholder="请输入昵称（2-10个字符）" />
            </el-form-item>
            <el-form-item label="用户邮箱" prop="email">
              <el-input v-model="userInfo.email" placeholder="请输入邮箱地址" />
            </el-form-item>
            <el-form-item class="btn-row">
              <el-button type="primary" @click="updateUserInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="更换头像" name="avatar">
          <div class="avatar-section">
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
                    <div v-else class="avatar-placeholder">点击上传</div>
                    <div class="avatar-overlay"><span>更换图片</span></div>
                  </div>
                </el-upload>
              </div>
              <p class="avatar-hint">支持 JPG、PNG 格式，建议尺寸不小于 200×200</p>
            </div>
            <div class="action-bar">
              <el-button :icon="Plus" @click="uploadRef.$el.querySelector('input').click()">选择图片</el-button>
              <el-button :icon="Upload" type="primary" @click="updateAvatar">确认上传</el-button>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form ref="pwdFormRef" :model="pwdData" :rules="pwdRules" label-width="100px" class="pwd-form">
            <el-form-item label="旧密码" prop="old_pwd">
              <el-input v-model="pwdData.old_pwd" type="password" placeholder="请输入旧密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="new_pwd">
              <el-input v-model="pwdData.new_pwd" type="password" placeholder="请输入新密码（5-16位）" show-password />
            </el-form-item>
            <el-form-item label="确认新密码" prop="re_pwd">
              <el-input v-model="pwdData.re_pwd" type="password" placeholder="请再次输入新密码" show-password />
            </el-form-item>
            <div class="security-tips">
              <strong>安全提示：</strong>建议使用字母、数字、符号组合，定期更换密码以保护账户安全。
            </div>
            <el-form-item class="btn-row">
              <el-button type="primary" @click="updatePwdData">确认修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.userinfo-page {
  min-height: 100%;
  background: $bg-base;
  padding: 24px;
}

.page-header {
  text-align: center;
  padding: 32px 0 24px;

  .header-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
  }

  h1 {
    font-size: 26px;
    color: $text-primary;
    margin: 0 0 8px;
    letter-spacing: 2px;
  }

  p {
    font-size: 14px;
    color: $text-muted;
    margin: 0;
  }
}

.page-body {
  max-width: 700px;
  margin: 0 auto;
}

.profile-tabs {
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
  border: none;

  :deep(.el-tabs__header) {
    background: $bg-surface;
    border-bottom: 1px solid $border-color;
    margin: 0;
  }

  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
    height: 50px;
    line-height: 50px;
    padding: 0 28px;
    color: $text-secondary;

    &.is-active {
      color: $color-primary;
      font-weight: 600;
    }

    &:hover {
      color: $color-primary;
    }
  }

  :deep(.el-tabs__active-bar) {
    background: $color-primary;
    height: 3px;
    border-radius: 2px;
  }

  :deep(.el-tabs__content) {
    padding: 28px 36px;
    background: $bg-surface;
  }
}

.profile-form,
.pwd-form {
  .el-form-item {
    margin-bottom: 20px;
  }

  :deep(.el-form-item__label) {
    font-weight: 600;
    color: $text-primary;
  }

  :deep(.el-input__wrapper) {
    border-radius: $radius-md;
    transition: all 0.25s ease;
    box-shadow: 0 0 0 1px $border-color inset;

    &:hover {
      box-shadow: 0 0 0 1px rgba($color-primary, 0.4) inset;
    }

    &:focus-within {
      box-shadow: 0 0 0 1px $color-primary inset, 0 0 0 3px rgba($color-primary, 0.08);
    }
  }
}

.field-hint {
  font-size: 12px;
  color: $text-placeholder;
  margin-top: 6px;
}

.btn-row {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid $border-light;

  .el-button {
    min-width: 120px;
    height: 40px;
    border-radius: $radius-md;
    background: $color-primary;
    border-color: $color-primary;
    font-weight: 600;

    &:hover {
      background: $color-primary-light;
      border-color: $color-primary-light;
    }
  }
}

/* 头像上传 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
}

.avatar-preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.avatar-ring {
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  padding: 4px;
  background: $color-primary-gradient;

  &::before {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    border: 2px dashed rgba($color-primary, 0.3);
    animation: ringRotate 12s linear infinite;
  }
}

@keyframes ringRotate {
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
  color: $text-placeholder;
  font-size: 15px;
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover {
  .avatar-img { transform: scale(1.05); }
  .avatar-overlay { opacity: 1; }
}

.avatar-hint {
  font-size: 13px;
  color: $text-placeholder;
  text-align: center;
}

.action-bar {
  display: flex;
  gap: 14px;

  .el-button {
    height: 42px;
    border-radius: $radius-md;
    font-weight: 600;
    padding: 0 22px;
  }
}

/* 安全提示 */
.security-tips {
  padding: 14px 18px;
  background: rgba($color-success, 0.04);
  border: 1px solid rgba($color-success, 0.15);
  border-radius: $radius-md;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.7;
  margin-bottom: 8px;

  strong {
    color: $color-success;
  }
}

@media (max-width: 768px) {
  .userinfo-page {
    padding: 16px;
  }

  .profile-tabs :deep(.el-tabs__content) {
    padding: 20px;
  }

  .profile-tabs :deep(.el-tabs__item) {
    padding: 0 18px;
    font-size: 14px;
  }

  .avatar-ring {
    width: 150px;
    height: 150px;
  }
}
</style>
