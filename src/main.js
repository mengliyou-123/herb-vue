import '@/assets/main.scss'
import 'element-plus/dist/index.css'

import {createApp} from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import router from "@/router"; //因为文件名是index.js，不需要写
import {createPinia} from "pinia";
import {createPersistedState} from "pinia-persistedstate-plugin";
import locale from 'element-plus/dist/locale/zh-cn'
import { sanitizeRichHtml } from '@/utils/safeHtml'

const app = createApp(App)
const pinia = createPinia()
// Clear tokens written by earlier versions before switching to tab-scoped storage.
window.localStorage.removeItem('pinia-token')
window.localStorage.removeItem('pinia-userInfo')
const persistedState = createPersistedState({ storage: window.sessionStorage });
pinia.use(persistedState)

app.use(pinia)
app.use(router)
app.use(ElementPlus, {locale})
app.directive('safe-html', {
  beforeMount(element, binding) {
    element.innerHTML = sanitizeRichHtml(binding.value)
  },
  updated(element, binding) {
    element.innerHTML = sanitizeRichHtml(binding.value)
  }
})
app.mount('#app')
