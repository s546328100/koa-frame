import Server from '../server'
import {log} from '../log'
import {BaseContext} from 'koa'

import {RESPOND, body} from '../../type/code'
import model from '../../type/model'
import service from '../../type/service'
import utils from '../../type/utils'
import {Redis} from 'ioredis'

export default class Controller {
  ctx: BaseContext
  app: Server
  service: service
  RESPOND: RESPOND
  log: log
  model: model
  utils: utils
  redis: Redis
  constructor(ctx: BaseContext) {
    this.ctx = ctx
    this.app = ctx.app
    this.service = ctx.service
    this.RESPOND = ctx.app.config.RESPOND
    this.log = ctx.app.log
    this.model = ctx.model
    this.utils = ctx.utils
    this.redis = ctx.app.cache.redis
  }

  send(data: body) {
    this.ctx.body = data
  }

  success(data: body) {
    this.ctx.body = {
      code: 0,
      result: data
    }
  }
}
