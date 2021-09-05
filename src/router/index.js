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
    path: '/alarmPage',
    name: 'alarmPage',
    component: r => require.ensure([], () => r(require('../views/alarmPage/alarmPage')), 'alarmPage'),
  },
  {
    path: '/system',
    component: Layout,
    redirect: '/system/cameraLive',
    name: 'system',
    meta: {
      title: '功能模块',
      icon: 'tree'
    },
    children: [{
        path: 'cameraLive',
        name: 'cameraLive',
        component: () => import('@/views/live/live'),
        meta: {
          title: '直播',
          icon: 'live'
        },
        menu: 'cameraLive'
      },
      {
        path: 'abnormalInfo',
        name: 'abnormalInfo',
        component: () => import('@/views/abnormal/abnormalList'),
        meta: {
          title: '异常记录',
          icon: 'warn'
        },
        menu: 'abnormalInfo'
      },
      {
        path: '/system/config',
        name: 'config',
        component: () => import('@/views/config'),
        meta: {
          title: '配置管理',
          icon: 'config'
        },
        children: [{
          path: 'edgeInfo',
          name: 'edgeInfo',
          component: () => import('@/views/config/edgeInfo'),
          meta: {
            title: '边缘端',
            icon: 'server'
          },
          menu: 'edgeInfo'
        }, {
          path: '/edgeDetail',
          name: 'edgeDetail',
          hidden: true,
          meta: {
            title: '边缘端详情',
            icon: 'server'
          },
          component: () => import('@/views/config/edgeInfo/detail')
        }, {
          path: 'cameraInfo',
          name: 'cameraInfo',
          component: () => import('@/views/config/cameraInfo'),
          meta: {
            title: '摄像头信息',
            icon: 'monitor'
          },
          menu: 'cameraInfo'
        }, {
          path: '/cameraDetail',
          name: 'cameraDetail',
          hidden: true,
          meta: {
            title: '摄像头信息详情',
            icon: 'monitor'
          },
          component: () => import('@/views/config/cameraInfo/detail')
        }, {
          path: 'detectFunc',
          name: 'detectFunc',
          component: () => import('@/views/config/detectFunc'),
          meta: {
            title: '检测方法',
            icon: 'detect'
          },
          menu: 'detectFunc'
        }, {
          path: 'detectLabel',
          name: 'detectLabel',
          component: () => import('@/views/config/detectLabel'),
          meta: {
            title: '检测标注',
            icon: 'label'
          },
          menu: 'detectLabel'
        }, {
          path: 'analyticsModule',
          name: 'analyticsModule',
          component: () => import('@/views/config/analyticsModule'),
          meta: {
            title: '模型管理',
            icon: 'module'
          },
          menu: 'analyticsModule'
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
