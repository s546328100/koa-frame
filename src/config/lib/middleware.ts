import * as path from 'path'

export default [
  {
    name: 'koa-compress',
    enable: true,
    options: {}
  },
  {
    name: 'response',
    enable: true,
    options: {}
  },
  {
    name: 'koa2-cors',
    enable: true,
    options: {maxAge: 3600}
  },
  {
    name: 'koa-body',
    enable: true,
    options: {
      multipart: true,
      formLimit: 1024 * 1024 * 20,
      formidable: {
        keepExtensions: true,
        uploadDir: path.resolve(__dirname, '../../uploads')
      }
    }
  },
  {
    name: 'auth',
    enable: true,
    options: {
      jwt: {
        '/lottery/v1': 'secret',
        '/lottery/admin': 'adminSecret'
      },
      notNecessary: [],
      whiteList: ['GET /favicon.ico']
    }
  }
]
