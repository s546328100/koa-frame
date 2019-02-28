import Server from '../server'
import {log} from '../log'
import {BaseContext} from 'koa'

import {RESPOND, body} from '../../type/code'
import model from '../../type/model'
import service from '../../type/service'
import utils from '../../type/utils'
import {Redis} from 'ioredis'

export default class Service {
  ctx: BaseContext
  app: Server
  service: service
  RESPOND: RESPOND
  log: log
  model: model
  utils: utils
  redis: Redis
  constructor(app: Server) {
    this.ctx = app.context
    this.app = app
    this.service = app.context.service
    this.RESPOND = (<any>app).config.RESPOND
    this.log = (<any>app).log
    this.model = app.context.model
    this.utils = app.context.utils
    this.redis = (<any>app).cache.redis
  }

  pageSend(data: {result: any; page: number; pageSize: number; count: number}): body {
    let {result, page, pageSize, count} = data

    let pageCount = pageSize ? Math.floor((count - 1) / pageSize + 1) : 1

    return {
      code: 0,
      result,
      pageNumber: page,
      pageCount,
      amount: count,
      next: page < pageCount,
      prev: page > 1
    }
  }

  success<T>(data: T) {
    return {code: 0, result: data} as {code: 0; result: T}
  }
}
