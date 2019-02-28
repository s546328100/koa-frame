export default {
  appId: '',
  appSecret: '',
  mchId: '',
  key: '',
  ip: '',
  host: '',
  notify_url: '/lottery/v1/pay/callback',
  refund_notify_url: '/lottery/v1/refund/callback',

  server: {
    port: 5761
  },

  jwt: {
    secret: '',
    adminSecret: ''
  },

  redis: {
    host: '127.0.0.1',
    port: 6379,
    db: 3,
    password: 'bitworker'
  },

  // 数据库地址
  database: {
    url: 'mongodb://bitwork:Bitworker@localhost:27017/lottery',
    options: {
      useNewUrlParser: true,
      keepAlive: 120
    }
  },

  database1: {
    url: 'mongodb://bitwork:Bitworker@localhost:27017/shop',
    options: {
      useNewUrlParser: true,
      keepAlive: 120
    }
  },

  cos: {
    SecretId: '',
    SecretKey: '',
    region: 'ap-guangzhou',
    // Bucket 名称
    fileBucket: 'lottery-1251897698',
    // 文件夹
    uploadFolder: ''
  }
}
