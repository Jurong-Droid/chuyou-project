var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL:'"/api"',
  SEVNCE_URL: '"/api/sevnce"',
  VUE_APP_BASE_URL: '"test.7tyun.com:444"',
  // VUE_APP_BASE_URL: '"10.65.158.131"',
  VUE_APP_RBP_MQ: "'rbp'",
  VUE_APP_RBP_ID: "'18435226'",
  ORIGIN_URL: '"localhost:8080"',
  Test_URL:'"/api/test"',

})
