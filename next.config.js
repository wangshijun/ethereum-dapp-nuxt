const config = require('config');

module.exports = {
  // 只有后端可用的配置
  serverRuntimeConfig: {},

  // 前后端都可用的配置
  publicRuntimeConfig: {
    infuraUrl: config.get('infuraUrl'),
  },
};
