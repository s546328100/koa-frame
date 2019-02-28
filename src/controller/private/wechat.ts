import Controller from '../../lib/base/controller'
import {bp} from '../../lib/blueprint'
import block from '../../lib/queue'

export default class WechatController extends Controller {
  @bp.get('/private/wechat/acessToken')
  @block('getAccessToken', 0, 0)
  async getAccessToken() {
    let {isReset} = this.ctx.query
    let res = await this.utils.wechat.getAccessToken(+isReset)
    return this.send(res)
  }
}