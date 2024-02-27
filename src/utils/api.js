import axios from 'axios'
import {Message} from 'element-ui'
import {getToken,setToken} from '@/utils/auth'
import store from '../store'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_URL, // api的base_url
  timeout: 30000                  // 请求超时时间
})
// request拦截器
service.interceptors.request.use(config => {
  let token = getToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config
}, error => {
  // Do something with request error
  console.error(error) // for debug
  Promise.reject(error)
})
// respone拦截器
service.interceptors.response.use(
  response => {
    const token = response.headers.authorization;
    if(token){
      setToken(token);
    }
    const res = response.data;
    if (res.code === '200') {
      return res.data;
    } else if (res.code === "401") {
      Message({
        showClose: true,
        message: res.msg,
        type: 'error',
        duration: 500,
        onClose: () => {
          store.dispatch('FedLogOut').then(() => {
            location.reload()// 为了重新实例化vue-router对象 避免bug
          })
        }
      });
      return Promise.reject("未登录")
    } else if(res.code === '90003'){
      Message({
        dangerouslyUseHTMLString : true,
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res)
    } else {
      Message({
        dangerouslyUseHTMLString : true,
        message: res.msg,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(res)
    }
  },
  error => {
    console.error('err' + error)// for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)
export default service

