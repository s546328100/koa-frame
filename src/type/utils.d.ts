import {request} from '../utils/request'
import common from '../utils/common'
import cos from '../utils/cos'
import crypto from '../utils/crypto'
import wechat from '../utils/wechat'
import wechatPay from '../utils/wechatPay'
import file from '../utils/file'
import templateMessage from '../utils/templateMessage'
import tencentcloud from '../utils/tencentcloud'
import {init} from '../utils/aliasMethod'

export default interface utils {
  request: request
  common: common
  cos: cos
  crypto: crypto
  wechat: wechat
  wechatPay: wechatPay
  file: file
  templateMessage: templateMessage
  tencentcloud: tencentcloud
  aliasMethod: init
}
