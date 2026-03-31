import {defineStore} from "pinia";
import {ref} from "vue";

export const useUserInfoStore = defineStore('userInfo',
    () => {
      //定义登录状态相关的内容
      const userInfo = ref({})

      const setUserInfo = (newUserInfo) => {
        userInfo.value = newUserInfo
      }

      const removeUserInfo = () => {
        userInfo.value = {}
      }

      return {
        userInfo, setUserInfo, removeUserInfo
      }
    },
    {
      persist: true
    });