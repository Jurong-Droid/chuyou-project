import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'
import MultilevelMenu from '../components/MultilevelMenu'

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
  path: '/#',
  component: Layout,
  redirect: '/dashboard',
  name: 'dash',
  meta: {
    title: '首页',
    icon: 'tree'
  },
  children: [{
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/index'),
    meta: {
      title: '首页',
      icon: 'tree'
    },
    //menu: 'dashboard'
  }]
},
{
  path: '/system',
  component: Layout,
  redirect: 'cameraLive',
  name: 'system',
  meta: {
    title: '报警管理',
    icon: 'tree'
  },
  children: [
    {
      path: 'abnormalInfo',
      name: 'abnormalInfo',
      component: () => import('@/views/abnormal/abnormalList'),
      meta: {
        title: '报警信息',
        icon: 'warn'
      },
    }]
},
{
  path: '/system/live',
  name: 'live',
  component: Layout,
  // component: () => import('@/views/live/live'),
  meta: {
    title: '实时监控',
    icon: 'live'
  },
  // menu: 'cameraLive',
  children: [{
    path: 'cameraLive',
    name: 'cameraLive',
    component: () => import('@/views/live/monitor'),
    meta: {
      title: '监控视频',
      icon: 'live'
    },
    menu: 'cameraLive'
  }, {
    path: 'intelligentLive',
    name: 'intelligentLive',
    component: () => import('@/views/live/IntelligentLive'),
    meta: {
      title: '智能监控',
      icon: 'live'
    }
  }
  ]
},

{
  path: '/organ',
  name: 'organ',
  component: Layout,
  // component: () => import('@/views/live/live'),
  meta: {
    title: '组织机构',
    icon: 'live'
  },
  // menu: 'cameraLive',
  children: [
    {
      path: 'oilfield',
      name: 'oilfield',
      component: () => import('@/views/organ/oilfield'),
      meta: {
        title: '油田',
        icon: 'module'
      },
      // menu: 'organizationInfo'
    }, {
      path: 'oilplant',
      name: 'oilplant',
      component: () => import('@/views/organ/oilplant'),
      meta: {
        title: '采油厂',
        icon: 'module'
      },
      // menu: 'organizationInfo'
    }, {
      path: 'organizationInfo',
      name: 'organizationInfo',
      component: () => import('@/views/organ/oparea'),
      meta: {
        title: '单位',
        icon: 'module'
      },
      // menu: 'organizationInfo'
    }, {
      path: 'location',
      name: 'location',
      component: () => import('@/views/organ/location'),
      meta: {
        title: '区域',
        icon: 'module'
      }
    }
  ]
},

{
  path: '/system/module',
  component: Layout,
  name: 'anlyticsModule',
  meta: {
    title: '模型管理',
    icon: 'module'
  },
  children: [
    {
      path: 'anlyticsModule',
      name: 'anlyticsModule',
      component: () => import('@/views/moduleSlide'),
      meta: {
        title: '模型管理',
        icon: 'module'
      }
    },
    {
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
    },
    ,
    {
      path: 'onlineTrain',
      name: 'onlineTrain',
      component: () => import('@/views/onlineTrain'),
      meta: {
        title: '在线训练',
        icon: 'warn'
      },
    }
  ]
},

{
  path: '/system/config',
  name: 'config',
  component: Layout,
  meta: {
    title: '设备管理',
    icon: 'config'
  },
  children: [{
    path: 'edgeInfo',
    name: 'edgeInfo',
    component: () => import('@/views/config/edgeInfo'),
    meta: {
      title: '检测设备管理',
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
      title: '摄像头管理',
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
  },
  // {
  //   path: 'slideshow',
  //   name: 'slideshow',
  //   component: () => import('@/views/moduleSlide'),
  //   meta: {
  //     title: '轮询设置',
  //     icon: 'module'
  //   },
  //   menu: 'analyticsModule'
  // }
  {
    path: '/moduleDetail',
    name: 'moduleDetail',
    hidden: true,
    meta: {
      title: '检测模型详情',
      icon: 'server'
    },
    component: () => import('@/views/config/analyticsModule/detail')
  }]
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
  }
  ]
},
{
  path: '/organ',
  component: Layout,
  // redirect: '/organ/organ',
  name: '组织机构',
  meta: {
    title: '组织机构',
    icon: 'table'
  },
  children: [{
    path: 'organizationInfo',
    name: '用户列表',
    component: () => import('@/views/organ/oparea'),
    meta: {
      title: '组织机构信息',
      icon: 'server'
    },
    menu: 'organizationInfo'
  }
  ]
},
{
  path: '*',
  redirect: '/404',
  hidden: true
}
]
