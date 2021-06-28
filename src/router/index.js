import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'
Vue.use(Router)

export const constantRouterMap = [{
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    name: '首页',
    hidden: true,
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/index')
    }]
  }
]
export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})
export const asyncRouterMap = [{
    path: '/system',
    component: Layout,
    redirect: '/system/cameraLive',
    name: '功能模块',
    meta: {
      title: '功能模块',
      icon: 'tree'
    },
    children: [{
        path: 'cameraLive',
        name: '直播',
        component: () => import('@/views/live/live'),
        meta: {
          title: '直播',
          icon: 'live'
        },
        menu: 'cameraLive'
      },
      {
        path: 'abnormalInfo',
        name: '异常记录',
        component: () => import('@/views/abnormal/abnormalList'),
        meta: {
          title: '异常记录',
          icon: 'warn'
        },
        menu: 'abnormalInfo'
      },
      {
        path: 'detectLabel',
        name: '检测标注',
        component: () => import('@/views/detectLabel/detectLabel'),
        meta: {
          title: '检测标注',
          icon: 'label'
        },
        menu: 'detectLabel'
      }, {
        path: '/system/config',
        name: '配置管理',
        component: () => import('@/views/config/index'),
        meta: {
          title: '配置管理',
          icon: 'label'
        },
        children: [{
          path: 'detectFunc',
          name: '检测方法',
          component: () => import('@/views/config/detectFunc/index'),
          meta: {
            title: '检测方法',
            icon: 'label'
          },
          menu: 'detectFunc'
        }, {
          path: 'cameraInfo',
          name: '摄像头信息',
          component: () => import('@/views/abnormal/abnormalList'),
          meta: {
            title: '异常记录',
            icon: 'warn'
          },
          menu: 'cameraInfo'
        }]

      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/user',
    name: '用户权限',
    meta: {
      title: '用户权限',
      icon: 'table'
    },
    children: [{
        path: 'user',
        name: '用户列表',
        component: () => import('@/views/user/user'),
        meta: {
          title: '用户列表',
          icon: 'user'
        },
        menu: 'user'
      },
      {
        path: 'role',
        name: '权限管理',
        component: () => import('@/views/user/role'),
        meta: {
          title: '权限管理',
          icon: 'password'
        },
        menu: 'role'
      },
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]
