import * as JWT from 'jsonwebtoken'
import * as fs from 'fs'

/**
 * 判断token是否正确，然后把解析的数据放到req.tokenObj中
 */
export default function(options: any) {
  return async function(ctx: any, next: any) {
    let {jwt, whiteList, notNecessary} = options
    if (whiteList && whiteList.includes(`${ctx.method} ${ctx.path}`)) {
      ctx.tokenObj = {}
      return await next()
    }

    if (notNecessary && notNecessary.includes(`${ctx.method} ${ctx.path}`)) {
      if (!ctx.header.token) {
        ctx.tokenObj = {}
        return await next()
      }
    }

    let data: any
    try {
      let _url = ctx.path.split('/')
      let secret = jwt[`/${_url[1]}/${_url[2]}`]
      data = JWT.verify(ctx.header.token, secret ? ctx.app.config.jwt[secret] : secret)
    } catch (error) {
      if (ctx.path === '/lottery/v1/file/upload') {
        let {files} = ctx.request
        for (const file in files) {
          let {path} = files[file]
          fs.unlinkSync(path)
        }
      }
      return (ctx.body = ctx.app.config.RESPOND.TOKEN_INVALID)
    }

    if (!data || !data.userId) return (ctx.body = ctx.app.config.RESPOND.TOKEN_INVALID)

    ctx.tokenObj = data
    return await next()
  }
}

/**
 * 检查请求参数的存在性
 * params: list 待检查的参数列表
 */
// function checkParams(ctx, params) {
//   var flag = true
//   params.forEach(param => {
//     if (!(param in ctx.request.body)) {
//       flag = false
//     }
//   })

//   if (!flag) {
//     ctx.body = {code: 1, message: '参数不全'}
//   }
//   return flag
// }
