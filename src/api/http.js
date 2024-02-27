import axios from 'axios';
import { proxySevnceRobot } from './proxy';
// import methods from '@/assets/js/methods';

let http = function (options, type = '') {
  if (options.method === 'get') {
    options.params = options.data;
  }
  let proxyRequest = '';
  return new Promise((resolve, reject) => {
    if (type) {
      switch (type) {
        case 'proxySevnceRobot': {
          proxyRequest = proxySevnceRobot;
          break;
        }
      }
    } else {
      proxyRequest = axios;
    }
    proxyRequest(options)
      .then((res) => {
        let { data, status } = res;
        if (String(status).startsWith('2')) {
          // data = methods.formatJsonStr(data);
          resolve(data);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
export default http;
