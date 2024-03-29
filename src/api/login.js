// import api from '@/utils/api'
// import { param } from 'my-express-project/routes';
import http from './http';
import qs from 'qs';

const IP = `https://${process.env.VUE_APP_BASE_URL}/jwt/token`;
let loginApi = {
  // 登录七腾机器人获取token
  login: (params) => {
    return http({
      method: 'post',
      url: `${IP}/loginIn`,
      data: JSON.stringify(params), // 转为JSON字符串
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
};
export default loginApi;

// export function getInfo(token) {
//   return api({
//     url: '/login/testGetInfo',
//     method: 'get',
//     params: {token}
//   })
// }


