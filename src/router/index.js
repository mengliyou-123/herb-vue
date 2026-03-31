import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { 
    path: '/login', 
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    redirect: '/user/herb',
    component: () => import('@/views/Layout.vue'),
    children: [
      { 
        path: '/mine/info', 
        component: () => import('@/views/mine/UserInfo.vue'),
        meta: { title: '个人信息' }
      },
      { 
        path: '/mine/avatar', 
        component: () => import('@/views/mine/UserAvatar.vue'),
        meta: { title: '更换头像' }
      },
      { 
        path: '/mine/resetPassword', 
        component: () => import('@/views/mine/UserResetPassword.vue'),
        meta: { title: '重置密码' }
      },
      { 
        path: '/mine/collections', 
        component: () => import('@/views/mine/Collections.vue'),
        meta: { title: '收藏夹' }
      },
      { 
        path: '/admin/userManage', 
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理', requiresAdmin: true }
      },
      { 
        path: '/admin/herb', 
        component: () => import('@/views/admin/HerbManage.vue'),
        meta: { title: '中药材管理', requiresAdmin: true }
      },
      { 
        path: '/admin/pcm', 
        component: () => import('@/views/admin/PcmManage.vue'),
        meta: { title: '中成药管理', requiresAdmin: true }
      },
      { 
        path: '/admin/pre', 
        component: () => import('@/views/admin/PreManage.vue'),
        meta: { title: '方剂管理', requiresAdmin: true }
      },
      { 
        path: '/admin/book', 
        component: () => import('@/views/admin/BookManage.vue'),
        meta: { title: '典籍管理', requiresAdmin: true }
      },
      { 
        path: '/admin/chapter', 
        component: () => import('@/views/admin/ChapterManage.vue'),
        meta: { title: '章节管理', requiresAdmin: true }
      },
      { 
        path: '/admin/post', 
        component: () => import('@/views/admin/PostManage.vue'),
        meta: { title: '讨论区管理', requiresAdmin: true }
      },
      { 
        path: '/admin/comment', 
        component: () => import('@/views/admin/CommentManage.vue'),
        meta: { title: '评论管理', requiresAdmin: true }
      },
      { 
        path: '/user/herb', 
        component: () => import('@/views/user/Herb.vue'),
        meta: { title: '药材坊' }
      },
      { 
        path: '/user/herbDetail', 
        component: () => import('@/views/user/HerbDetail.vue'),
        meta: { title: '药材详情' }
      },
      { 
        path: '/user/herbStories', 
        component: () => import('@/views/user/HerbStories.vue'),
        meta: { title: '药材传说' }
      },
      { 
        path: '/user/prescription', 
        component: () => import('@/views/user/Prescription.vue'),
        meta: { title: '方剂堂' }
      },
      { 
        path: '/user/preDetail', 
        component: () => import('@/views/user/PreDetail.vue'),
        meta: { title: '方剂详情' }
      },
      { 
        path: '/user/preStories', 
        component: () => import('@/views/user/PreStories.vue'),
        meta: { title: '方剂故事' }
      },
      { 
        path: '/user/pcm', 
        component: () => import('@/views/user/Pcm.vue'),
        meta: { title: '中成药' }
      },
      { 
        path: '/user/book', 
        component: () => import('@/views/user/Book.vue'),
        meta: { title: '藏经阁' }
      },
      { 
        path: '/user/chapter', 
        component: () => import('@/views/user/Chapter.vue'),
        meta: { title: '章节' }
      },
      { 
        path: '/user/content', 
        component: () => import('@/views/user/Content.vue'),
        meta: { title: '内容' }
      },
      { 
        path: '/user/forum', 
        component: () => import('@/views/user/Forum.vue'),
        meta: { title: '老茶馆' }
      },
      { 
        path: '/user/postDetail', 
        component: () => import('@/views/user/PostDetail.vue'),
        meta: { title: '帖子详情' }
      },
      { 
        path: '/user/myPost', 
        component: () => import('@/views/user/MyPost.vue'),
        meta: { title: '我的帖子' }
      },
      { 
        path: '/user/diagnosis', 
        component: () => import('@/views/user/Diagnosis.vue'),
        meta: { title: '智能问诊' }
      },
    ]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 百草居`
  }
  next()
})

export default router
