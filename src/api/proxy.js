import axios from 'axios';

axios.defaults.baseURL = '/';
export let proxySevnceRobot = axios.create({
  baseURL: '/api/sevnce'
});

export default axios;
