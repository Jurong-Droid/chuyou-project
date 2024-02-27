import http from './http';
// import i18n from '@/assets/js/i18n';
import store from '@/store';

console.log(process.env.VUE_APP_RBP_MQ);

let sevnceApi = {
  getRbp: (params, token, mq = process.env.VUE_APP_RBP_MQ) => {
    let proxy = 'proxySevnceRobot';
    params.params[0] = JSON.parse(params.params[0]);
    // params.params[0].language = i18n.locale;
    params.params[0].language = "zh-CN";
    // params.params[0].userId = store.state.userInfo.id;
    params.params[0].userId = "wangliangze";
    params.params[0] = JSON.stringify(params.params[0]);
    return http(
      {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          mq,
          ack: 'false',
          cmd: 'produce',
          Authorization: token,
          'Access-Control-Allow-Origin': '*'
        },
        data: params
      },
      proxy
    );
  },
  url: (params, token, url, type = '', method = 'POST') => {
    let { VUE_APP_MODE } = process.env,
      contentType = 'application/x-www-form-urlencoded';
    // 当请求需要传递参数时且类型不为上传；则往参数中加入语言参数
    if (params !== '' && type !== 'upload') {
      if (typeof params === 'object') {
        params.language = "zh-CN";
        // params.language = i18n.locale;
        params.userId = store.state.userInfo.id;
        contentType = 'application/json';
      }
    }
    // 生产环境url前面需要拼接或截取
    if (VUE_APP_MODE === 'production') {
      let arr = url.split('/');
      arr.splice(0, 2);
      url = arr.join('/');
    }
    // 通过类型判断使用哪种content-type
    if (type === 'download') {
      contentType = 'application/json';
    } else if (type === 'upload') {
      contentType =
        'multipart/form-data;boundary=--------------------------417997539762699466651875';
    }
    return http({
      method,
      headers: {
        'content-type': contentType,
        Authorization: token,
        'Access-Control-Allow-Origin': '*'
      },
      url,
      data: params
    });
  }
};
export default sevnceApi;
