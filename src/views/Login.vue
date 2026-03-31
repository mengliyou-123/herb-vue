<script setup>
import { Lock, User, Message } from "@element-plus/icons-vue";
import { ref } from "vue";
import { userLoginService, userRegisterService } from "@/api/user";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { useTokenStore } from "@/stores/token";

import { userInfoService } from "@/api/user";
import { useUserInfoStore } from "@/stores/userInfo";

import { reactive } from "vue";

//控制注册与登录表单的显示， 默认显示登录
const isRegister = ref(false);
const registerData = ref({
  username: "",
  email: "",
  password: "",
  rePassword: "",
  role: "",
});

//校验邮箱函数
const checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+$/;   //这里缺少了结尾的$.
      if (!regEmail.test(value)) {
        callback(new Error("请输入合法的邮箱"));
      }else {
        callback();
      }
      
}


//校验密码函数
const checkRePassword = (rule, value, callback) => {
  if (value === "") {
    callback(new Error("请再次确认密码"));
  } else if (value !== registerData.value.password) {
    callback(new Error("两次密码不一致"));
  } else {
    callback();
  }
};

//定义表单校验规则
const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 5, max: 16, message: "长度为5-16位", trigger: "blur" },
  ],
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" },
          {validator: checkEmail, trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 5, max: 16, message: "长度为5-16位", trigger: "blur" },
  ],
  rePassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { validator: checkRePassword, trigger: "blur" },
  ],
};

//调用后台接口完成注册
const register = async () => {
  const valid = await form.value.validate();
  if (valid) {
    const result = await userRegisterService(registerData.value);
    
    if (result.code === 0) {
    //成功了
    alert(result.msg ? msg : "注册成功");
  } else {
    //失败了
    alert("注册失败");
  } 
  
  }
};

const router = useRouter();
const tokenStore = useTokenStore();
const form = ref(null);

//调用函数，获取用户信息
const userInfoStore = useUserInfoStore();

//根据角色类型跳转相应页面
const login = async () => {
  // HM
  const valid = await form.value.validate();
  if (valid) {
    let result = await userLoginService(registerData.value);
    ElMessage.success(result.message ? result.message : "登录成功");
    //把得到的token存储到pinia中
    tokenStore.setToken(result.data);
    let result2 = await userInfoService();
    //把用户信息存进pinia
    userInfoStore.setUserInfo(result2.data);

    //跳转到首页，借助路由完成跳转，先要找到路由器，在上面导入
    if (userInfoStore.userInfo.role == "ROLE_USER") {
      await router.push("/user/herb");
    }

    if (userInfoStore.userInfo.role == "ROLE_ADMIN") {
      await router.push("/admin/herb");
    }
  }
};

const clearRegisterData = () => {
  registerData.value = {
    username: "",
    email: "",
    password: "",
    rePassword: "",
  };
};
</script>

<template>


  <div class="login-page">
    <!-- <el-col :span="12" class="bg"></el-col> -->
    <div class="form">
      <!-- 注册表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="on"
        v-if="isRegister"
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1 style="color:white">注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="请输入用户名"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>

        <el-form-item prop="email">
          <el-input
            :prefix-icon="Message"
            placeholder="请输入邮箱"
            v-model="registerData.email"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>

        <el-form-item prop="rePassword">
          <el-input
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
            v-model="registerData.rePassword"
          ></el-input>
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button
            class="button"
            auto-insert-space
            @click="
              register();
              isRegister = false;
            "
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link
            type="info"
            style="color:white"
            :underline="false"
            @click="
              isRegister = false;
              clearRegisterData();
            "
          >
             返回
          </el-link>
        </el-form-item>
      </el-form>

      <!-- 登录表单 -->
      <el-form
        ref="form"
        size="large"
        autocomplete="off"
        v-else
        :model="registerData"
        :rules="rules"
      >
        <el-form-item>
          <h1 style="color:white">登录</h1>
        </el-form-item>

        <el-form-item prop="username">
          <el-input
            :prefix-icon="User"
            placeholder="请输入用户名"
            v-model="registerData.username"
          ></el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
            v-model="registerData.password"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            class="button"
            auto-insert-space
            @click="login"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item class="flex">
          <el-link
            type="info"
            style="color:white"
            :underline="false"
            @click="
              isRegister = true;
              clearRegisterData();
            "
          >
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  // background-color: #f7de98;
  background: url("@/assets/login.png") no-repeat center / cover;

  display: flex;
  justify-content: center;
  align-items: center;



  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    background-color: rgba(0, 0, 0, 0.25);
    width: 400px;
    padding-left: 60px;
    padding-right: 80px;
    padding-top: 30px;
    padding-bottom: 30px;
    border-radius: 15px;
    
   

    .title {
      margin: 0 auto;
    }

    .button {
      width: 40%;
      margin-top: 20px;
      margin-left: 125px;
      background-color:#8B4513;
      color:white;
    }

    .flex {
      width: 100%;
      display: flex;
      margin-left: 400px;
      margin-top: -62px;
      
    }
  }
}
</style>
