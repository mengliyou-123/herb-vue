<script setup>
import { ref } from 'vue'
import { userPwdUpdateService } from "@/api/user";
import { ElMessage } from "element-plus";

const pwdData = ref({
  old_pwd: '',
  new_pwd: '',
  re_pwd: ''
})

const formRef = ref(null);

const updatePwdData = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
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

const rules = {
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
</script>

<template>
  <div class="pwd-page">
    <div class="page-header">
      <div class="header-content">
        <span class="header-icon">🔐</span>
        <div class="header-text">
          <h1>重置密码</h1>
          <p>定期更换密码，保障账户安全</p>
        </div>
      </div>
    </div>

    <div class="page-body">
      <div class="pwd-card">
        <div class="card-header">
          <span class="header-icon-small">🔑</span>
          <span>修改登录密码</span>
        </div>

        <el-form
          ref="formRef"
          :model="pwdData"
          :rules="rules"
          label-position="top"
          class="pwd-form"
        >
          <div class="form-grid">
            <el-form-item label="旧密码" prop="old_pwd" class="form-item">
              <el-input v-model="pwdData.old_pwd" type="password" placeholder="请输入旧密码" show-password>
                <template #prefix>
                  <span class="input-prefix">🔒</span>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="新密码" prop="new_pwd" class="form-item">
              <el-input v-model="pwdData.new_pwd" type="password" placeholder="请输入新密码" show-password>
                <template #prefix>
                  <span class="input-prefix">🔑</span>
                </template>
              </el-input>
              <span class="field-hint">5-16位字符，建议包含字母和数字</span>
            </el-form-item>

            <el-form-item label="确认新密码" prop="re_pwd" class="form-item">
              <el-input v-model="pwdData.re_pwd" type="password" placeholder="请再次输入新密码" show-password>
                <template #prefix>
                  <span class="input-prefix">✅</span>
                </template>
              </el-input>
            </el-form-item>
          </div>

          <div class="security-tips">
            <div class="tips-title">安全提示</div>
            <ul class="tips-list">
              <li>密码长度不少于5个字符</li>
              <li>建议使用字母、数字、符号组合</li>
              <li>不要使用与其他平台相同的密码</li>
              <li>定期更换密码以保护账户安全</li>
            </ul>
          </div>

          <div class="form-actions">
            <el-button type="primary" class="submit-btn" @click="updatePwdData">
              确认修改
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pwd-page {
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
  padding: 32px 24px;
}

.pwd-card {
  width: 100%;
  max-width: 640px;
  background: $bg-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 28px;
  background: lighten($bg-base, 1%);
  border-bottom: 1px solid $border-color;
  font-size: 17px;
  font-weight: 600;
  color: $text-primary;
  .header-icon-small {
    font-size: 20px;
  }
}

.pwd-form {
  padding: 28px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-item {
  margin-bottom: 4px;
  :deep(.el-form-item__label) {
    font-weight: 600;
    font-size: 14px;
    color: $text-primary;
    padding-bottom: 8px;
  }
  :deep(.el-input__wrapper) {
    border-radius: $radius-md;
    border: 1.5px solid $border-color;
    transition: all 0.25s ease;
    box-shadow: none;
    &:hover {
      border-color: rgba($color-primary, 0.4);
    }
    &:focus-within {
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
  }
}

.input-prefix {
  font-size: 14px;
  margin-right: 4px;
}

.field-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: $text-placeholder;
}

.security-tips {
  margin: 24px 0;
  padding: 18px 20px;
  background: rgba($color-success, 0.04);
  border: 1px solid rgba($color-success, 0.15);
  border-radius: $radius-md;

  .tips-title {
    font-size: 14px;
    font-weight: 600;
    color: $color-success;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;

    &::before {
      content: '💡';
    }
  }

  .tips-list {
    margin: 0;
    padding-left: 18px;
    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 2;
    }
  }
}

.form-actions {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid $border-color;
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  min-width: 140px;
  height: 42px;
  border-radius: $radius-md;
  background: $color-primary;
  border-color: $color-primary;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  &:hover {
    background: $color-primary-light;
    border-color: $color-primary-light;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba($color-primary, 0.3);
  }
}

@media (max-width: 768px) {
  .page-body {
    padding: 16px;
  }
  .pwd-form {
    padding: 20px;
  }
}
</style>
