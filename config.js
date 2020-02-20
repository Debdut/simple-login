const config = {
  app: {
    PORT : process.env.PORT || 3000,
    ADDRESS : '127.0.0.1'
  },
  mongo: {
    ADDRESS : 'simple-login-qnflc.mongodb.net/test?retryWrites=true&w=majority',
    USER : 'debdut',
    PASS : 'jaihind'
  },
  captcha: {
    KEY: '6LccodoUAAAAAMV3A9dk-5Ez7Ramt0o40s7pa_mq'
  }
}

module.exports = config