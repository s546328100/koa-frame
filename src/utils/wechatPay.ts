import * as xml2js from 'xml2js'
import {Parser} from 'xml2js'
import * as request from 'request'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

import Server from '../lib/server'

export default class WechatPay {
  private app: Server
  private appid: string
  private mch_id: string
  private key: string
  private ip: string
  private notify_url: string
  private refund_notify_url: string
  private xmlParser: Parser

  constructor(app: Server) {
    this.app = app

    let config = this.app.config
    this.appid = config.appId
    this.mch_id = config.mchId
    this.key = config.key
    this.ip = config.ip
    this.notify_url = config.host + config.notify_url
    this.refund_notify_url = config.host + config.refund_notify_url

    this.xmlParser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: true
    })
  }

  getPayData(total_fee: number, openid: string, out_trade_no: string, payBody = '抽奖大盒子') {
    let nonce_str = this.app.context.utils.common.mathRandoms('', 32)
    let str = `appid=${this.appid}&body=${payBody}&mch_id=${this.mch_id}&nonce_str=${nonce_str}&notify_url=${this.notify_url}&openid=${openid}&out_trade_no=${out_trade_no}&spbill_create_ip=${this
      .ip}&total_fee=${total_fee}&trade_type=JSAPI&key=${this.key}`

    let sign = crypto.createHash('md5').update(str).digest('hex')

    let bodyData = '<xml>'
    bodyData += '<appid>' + this.appid + '</appid>' // 小程序ID
    bodyData += '<body>' + payBody + '</body>' // 商品描述
    bodyData += '<mch_id>' + this.mch_id + '</mch_id>' // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>' // 随机字符串
    bodyData += '<openid>' + openid + '</openid>' // 用户标识
    bodyData += '<notify_url>' + this.notify_url + '</notify_url>' // 支付成功的回调地址
    bodyData += '<out_trade_no>' + out_trade_no + '</out_trade_no>' // 商户订单号
    bodyData += '<spbill_create_ip>' + this.ip + '</spbill_create_ip>' // 终端IP
    bodyData += '<total_fee>' + total_fee + '</total_fee>' // 总金额 单位为分
    bodyData += '<trade_type>JSAPI</trade_type>' // 交易类型 小程序取值如下：JSAPI
    bodyData += '<sign>' + sign.toUpperCase() + '</sign>' // 签名
    bodyData += '</xml>'

    return new Promise((resolve, reject) =>
      request(
        {
          url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
          method: 'POST',
          body: bodyData
        },
        (err, res, body) => {
          if (err) throw err
          this.xmlParser.parseString(body, (err: any, res: any) => {
            if (err) throw err

            let prepay_id = res.xml.prepay_id

            let str = `appId=${this.appid}&nonceStr=${nonce_str}&package=prepay_id=${prepay_id}&signType=MD5&timeStamp=${out_trade_no}&key=${this.key}`

            let paySign = crypto.createHash('md5').update(str).digest('hex')

            return resolve({
              code: 0,
              data: {
                timeStamp: out_trade_no.toString(),
                nonceStr: nonce_str,
                package: `prepay_id=${prepay_id}`,
                paySign: paySign,
                outTradeNo: out_trade_no
              }
            })
          })
        }
      )
    )
  }

  refund(out_refund_no_random: string, out_trade_no_random: string, refund_fee: number, total_fee: number) {
    let nonce_str = this.app.context.utils.common.mathRandoms('', 32)
    let appid = this.appid
    let mch_id = this.mch_id
    let refund_notify_url = this.refund_notify_url
    let key = this.key

    let str = `appid=${appid}&mch_id=${mch_id}&nonce_str=${nonce_str}&notify_url=${refund_notify_url}&out_refund_no=${out_refund_no_random}&out_trade_no=${out_trade_no_random}&refund_fee=${refund_fee}&total_fee=${total_fee}&key=${key}`
    let sign = crypto.createHash('md5').update(str).digest('hex')

    let bodyData = '<xml>'
    bodyData += '<appid>' + appid + '</appid>' // 小程序ID
    bodyData += '<mch_id>' + mch_id + '</mch_id>' // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>' // 随机字符串
    bodyData += '<out_trade_no>' + out_trade_no_random + '</out_trade_no>' // 商户订单号
    bodyData += '<out_refund_no>' + out_refund_no_random + '</out_refund_no>' // 商户订单号
    bodyData += '<notify_url>' + refund_notify_url + '</notify_url>' // 回调地址
    bodyData += '<total_fee>' + total_fee + '</total_fee>' // 总金额 单位为分
    bodyData += '<refund_fee>' + refund_fee + '</refund_fee>' // 退款金额 单位为分
    bodyData += '<sign>' + sign.toUpperCase() + '</sign>' // 签名
    bodyData += '</xml>'

    return new Promise((resolve, reject) => {
      request(
        {
          url: 'https://api.mch.weixin.qq.com/secapi/pay/refund',
          method: 'POST',
          body: bodyData,
          agentOptions: {
            pfx: fs.readFileSync(path.resolve(__dirname, '../config/cert/apiclient_cert.p12')),
            passphrase: mch_id
          }
        },
        (err, res, body) => {
          if (err) throw err
          this.xmlParser.parseString(body, (err: any, res: any) => {
            if (err) throw err
            let succ = res.xml.return_code
            if (succ === 'SUCCESS') resolve(res)
            else reject(res)
          })
        }
      )
    })
  }

  transfers(openid: string, out_trade_no_random: string, total_fee: number) {
    let nonce_str = this.app.context.utils.common.mathRandoms('', 32)
    let appid = this.appid
    let mch_id = this.mch_id
    let key = this.key
    let ip = this.ip

    let str = `amount=${total_fee}&check_name=NO_CHECK&desc=抽奖大盒子&mch_appid=${appid}&mchid=${mch_id}&nonce_str=${nonce_str}&openid=${openid}&partner_trade_no=${out_trade_no_random}&spbill_create_ip=${ip}&key=${key}`

    let sign = crypto.createHash('md5').update(str).digest('hex')

    let bodyData = '<xml>'
    bodyData += '<mch_appid>' + appid + '</mch_appid>' // 小程序ID
    bodyData += '<mchid>' + mch_id + '</mchid>' // 商户号
    bodyData += '<check_name>NO_CHECK</check_name>' // 商户号
    bodyData += '<desc>抽奖大盒子</desc>' // 商户号
    bodyData += '<nonce_str>' + nonce_str + '</nonce_str>' // 随机字符串
    bodyData += '<openid>' + openid + '</openid>' // 用户标识
    bodyData += '<partner_trade_no>' + out_trade_no_random + '</partner_trade_no>' // 退款订单号
    bodyData += '<spbill_create_ip>' + ip + '</spbill_create_ip>' // 终端IP
    bodyData += '<amount>' + total_fee + '</amount>' // 总金额 单位为分
    bodyData += '<sign>' + sign.toUpperCase() + '</sign>' // 签名
    bodyData += '</xml>'

    return new Promise((resolve, reject) =>
      request(
        {
          url: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
          method: 'POST',
          body: bodyData,
          cert: <any>fs.readFileSync(path.join(__dirname, '../config/cert/apiclient_cert.pem'), 'utf8'),
          key: <any>fs.readFileSync(path.join(__dirname, '../config/cert/apiclient_key.pem'), 'utf8')
        },
        (err, res, body) => {
          if (err) throw err
          this.xmlParser.parseString(body, (err: any, res: any) => {
            if (err) throw err
            return resolve(res)
          })
        }
      )
    )
  }
}
