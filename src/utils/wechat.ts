const queryString = require('querystring')
import * as request from 'request'

import Server from '../lib/server'

export default class Wechat {
  private app: Server
  private appid: string
  private secret: string

  constructor(app: Server) {
    this.app = app

    let config = this.app.config
    this.appid = config.appId
    this.secret = config.appSecret
  }

  async _getAccessToken(isReset?: number) {
    let url = this.app.config.host + '/lottery/private/wechat/acessToken'
    if (isReset) url = url + '?isReset=1'
    return await reqGet(url)
  }

  async getAccessToken(isReset?: number) {
    let wx = await (<any>this).app.cache.redis.get('access_token')

    if (wx && !isReset) return {access_token: wx}

    let data = {
      grant_type: 'client_credential',
      appid: this.appid,
      secret: this.secret
    }
    let url = 'https://api.weixin.qq.com/cgi-bin/token?' + queryString.stringify(data)
    let at: any = await reqGet(url)
    // ;(<any>this).app.log.resMsg('原access_token：' + wx)
    // ;(<any>this).app.log.resMsg('更新access_token：' + at.access_token)
    await (<any>this).app.cache.redis.set('access_token', at.access_token, 'EX', at.expires_in)

    return at
  }

  private async formFunc(userId: string) {
    let forms = await this.app.context.model.form.find({user: userId})
    if (!forms.length) return null

    let len = forms.length
    let index = 0

    const iterator: any = async (index: number) => {
      if (index === len) return null

      let form = forms[index]
      let formArr = form.formIds
      let touser = form.openId

      if (!formArr.length) {
        index++
        await this.app.context.model.form.deleteOne({_id: form.id})
        return await iterator(index)
      }

      let n = Math.floor(Math.random() * formArr.length)
      let form_id = formArr.splice(n, 1)[0]

      // await form.save()
      if (formArr.length) await this.app.context.model.form.updateOne({_id: form._id}, {formIds: formArr})
      else await this.app.context.model.form.deleteOne({_id: form._id})

      // if (index === len - 1 && formArr.length === 1) {
      //   let form_id = formArr.pop()
      //   await form.save()

      //   let template_id = 'WSwD25OHZZ8Az-92_8xSI-10q9SEM2uR3Wfn8jCY5aQ'
      //   let date = new Date().toLocaleString()
      //   let data = {keyword1: {value: '信息推送服务'}, keyword2: {value: date}, keyword3: {value: '您的推送服务即将过期，可以进入小程序点击预约按钮，点几次就有几次推送机会，每个机会的有效期为七天'}}
      //   let _event = {template_id, page: 'pages/index/index', form_id, data, emphasis_keyword: '', touser}

      //   let at = await this._getAccessToken()
      //   let accessToken = at.access_token
      //   let tUrl = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='
      //   let url = tUrl + accessToken

      //   let res = await reqPost(url, _event)
      //   ;(<any>this).app.log.resMsg(touser + '，模板消息提醒登陆，' + JSON.stringify(res))
      // }

      return {form_id, touser}
    }

    return await iterator(index)
  }

  async sendTemplateMessage(userId: string, template_id: string, data: any, page = 'pages/index/index', emphasis_keyword = '') {
    // await this.app.context.utils.common.sleep(500)

    let form = await this.formFunc(userId)
    if (!form) {
      ;(<any>this).app.log.scheduleMsg(userId + '，formId为空，不进行模板推送', 'error')
      return
    }
    let {form_id, touser} = form

    let _event = {template_id, page, form_id, data, emphasis_keyword, touser}

    let at: any = await this.getAccessToken()
    let accessToken = at.access_token
    let tUrl = 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token='
    let url = tUrl + accessToken

    let res: any = await reqPost(url, _event)
    if (res.errcode) {
      ;(<any>this).app.log.scheduleMsg(JSON.stringify(_event) + '，' + JSON.stringify(res), 'error')
      // 失败再发一次
      if (res.errcode === 40001) {
        let at: any = await this.getAccessToken(1)
        let accessToken = at.access_token
        url = tUrl + accessToken
        res = await reqPost(url, _event)
        ;(<any>this).app.log.scheduleMsg('40001模板消息失败重发', 'warn')
      }
      if (res.errcode === 41028 || res.errcode === 41029) {
        let form = await this.formFunc(userId)
        if (!form) return
        let {form_id, touser} = form
        _event.form_id = form_id

        res = await reqPost(url, _event)
        ;(<any>this).app.log.scheduleMsg('41028 41029模板消息失败重发', 'warn')
      }
    }

    if (res.errcode === 0) {
      ;(<any>this).app.log.scheduleMsg('===模板推送成功=== ，' + userId + ' ' + JSON.stringify(data))
      res.data = data
      res.userId = userId
    } else {
      ;(<any>this).app.log.scheduleMsg('✘===模板推送失败=== ，' + userId + ' ' + JSON.stringify(data), 'error')
    }
    return res
  }

  async getWXACodeUnlimit(userId: string, width = 280, page = 'pages/activity/luckyDraw/luckyDraw', is_hyaline = false) {
    let at = await this.getAccessToken()
    let accessToken = at.access_token

    let url = 'https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token='

    let res: any = await reqPost1(`${url}${accessToken}`, {scene: userId, page, width, is_hyaline: is_hyaline === false ? false : true})

    return res
  }

  async msgSecCheck(content: string) {
    let at = await this.getAccessToken()
    let accessToken = at.access_token

    let url = 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token='

    let res: any = await reqPost(`${url}${accessToken}`, {content})

    return res
  }

  async imgSecCheck(file: any) {
    let at = await this.getAccessToken()
    let accessToken = at.access_token

    let url = 'https://api.weixin.qq.com/wxa/img_sec_check?access_token='

    let res: any = await reqPost2(`${url}${accessToken}`, {file})

    return res
  }

  jscode2Session(code: string) {
    let data = {
      appid: this.appid,
      secret: this.secret,
      js_code: code,
      grant_type: 'authorization_code'
    }
    let myreq = 'https://api.weixin.qq.com/sns/jscode2session?' + queryString.stringify(data)
    return new Promise(function(resolve, reject) {
      request.get(myreq, function(error, rsp, body) {
        if (!error && rsp.statusCode == 200) {
          resolve(JSON.parse(body))
        } else {
          reject(error)
        }
      })
    })
  }
}

function reqGet(url: string) {
  return new Promise(function(resolve, reject) {
    request.get(url, function(error, rsp, body) {
      if (!error && rsp.statusCode == 200) {
        resolve(JSON.parse(body))
      } else {
        reject(error)
      }
    })
  })
}

function reqPost2(url: string, data: any) {
  return new Promise(function(resolve, reject) {
    let ops = {
      my_file: data.file,
    }
    request.post({url, formData: ops}, function(error, rsp, body) {
      if (!error && rsp.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}

function reqPost(url: string, data: any) {
  return new Promise(function(resolve, reject) {
    let ops = {
      url,
      method: 'POST',
      json: true,
      headers: {
        'content-type': 'application/json'
      },
      body: data
    }
    request(ops, function(error, rsp, body) {
      if (!error && rsp.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}

function reqPost1(url: string, data: any) {
  return new Promise(function(resolve, reject) {
    let ops = {
      url,
      json: data,
      encoding: null // 设置编码，默认utf8，null为二进制
    }
    request.post(ops, function(error, rsp, body) {
      if (!error && rsp.statusCode == 200) {
        resolve(body)
      } else {
        reject(error)
      }
    })
  })
}
