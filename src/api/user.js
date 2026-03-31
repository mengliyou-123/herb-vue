//导入request.js请求工具（调用后台接口需要发送异步请求
import request from "@/utils/request";

export const userRegisterService = (registerData) => {
  return request.post('/user/register', registerData)
}

export const userLoginService = (loginData) => {
  return request.post('/user/login', loginData)
}

export const userInfoService = () => {
  return request.get('/user/userInfo')
}

export const userInfoUpdateService = (userInfoData) => {
  return request.put('/user/update', userInfoData)
}

export const userAvatarUpdateService = (avatarUrl) => {
  const urlSearchParams = new URLSearchParams();
  urlSearchParams.append('avatarUrl', avatarUrl)
  return request.patch('/user/updateAvatar', urlSearchParams)
   //参数是query类型的，可以直接拼接到后面也可以借助URLSearchParams来完成
}

export const userPwdUpdateService = (pwdData) => {
  return request.patch('/user/updatePwd', pwdData)
}

export const userListService = (params) => {
  return request.get('/user/list',{params})
}

export const getUserByIdService = (id) => {
  return request.get('/user/getUserById?id=' + id)
}

export const userDeleteService = (id) => {
  return request.delete('/user?id=' + id)
}

