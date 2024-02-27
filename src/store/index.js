import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import user from './modules/user'
import permission from './modules/permission'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    // 首页组件展开收起
    isCollapse: true,
    // 用户信息
    userInfo: {},
  },
  mutations: {
    show(state) {
      state.isCollapse = true;
    },
    hide(state) {
      state.isCollapse = false;
    },
  },
  modules: {
    app,
    user,
    permission
  },
  getters
})

export default store
