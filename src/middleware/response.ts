import {BaseContext} from 'koa'

export default function(options: any) {
  return async function(ctx: BaseContext, next: any) {
    let startTime = Date.now()
    try {
      await next()
      if (ctx.path === '/favicon.ico') return
      if (ctx.status === 404) return (ctx.body = ctx.app.config.RESPOND.INTERFACE_NOT_EXIST)
      let resTime = Date.now() - startTime
      ctx.app.log.logResponse(ctx, resTime)

      ctx.body = ctx.body
        ? ctx.body
        : {
            code: ctx.state.code !== undefined ? ctx.state.code : 0,
            data: ctx.state.data !== undefined ? ctx.state.data : {}
          }
    } catch (e) {
      let resTime = Date.now() - startTime
      ctx.app.log.logError(ctx, e, resTime)

      // 设置状态码为 500 - 服务端错误
      ctx.status = 200

      // 输出详细的错误信息
      ctx.body = {
        code: -1,
        error: e && e.message ? e.message : e.toString()
      }
    }
  }
}
