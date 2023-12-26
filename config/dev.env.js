var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_URL:'"/api"',
  ORIGIN_URL: '"localhost:8080"',
  Test_URL:'"/api/test"',
})
