import Controller from '../../lib/base/controller'
import {bp} from '../../lib/blueprint'
export default class TestController extends Controller {
  /**
   * @api {get} /v1/test 测试
   * @apiName create
   * @apiGroup test
   * @apiVersion 1.0.0
   * 
   * @apiHeader {String} token
   * 
   * @apiParam  {String} [type] type
   * @apiParam  {String} [id] id
   * @apiParam  {String} [num] num
   * @apiParam  {String} [activity] activity
   * @apiParam  {String} [content] content
   * @apiParam  {String} [user] user
   */
  @bp.get('/v1/test')
  async create() {
    let query = this.ctx.query

    let {userId} = this.ctx.tokenObj
    let admin = await this.service.admin.get({user: userId})
    if (!admin || admin.status !== 1 || admin.level > 0) return this.send(this.RESPOND.NO_POWER)

    let res: any = ''
    switch (query.type) {
      case '1':
        let arr = []
        for (let j = 0; j < +query.num; j++) {
          arr.push({user: userId, activity: query.activity, type: 1})
        }
        res = await this.model.activityUser.insertMany(arr)
        break
      case '2':
        res = await this.service.activity.lotteryTiming(query.activity)
      case '3':
        res = await this.service.schedule.doAction(`type_2_${query.activity}`, +query.time, 'activity', 'lotteryTiming', [query.activity])
      case '4':
        res = await this.utils.wechat.msgSecCheck(query.content)
      case '5':
        let activity = await this.service.activity.get({_id: query.activity})
        if (activity)
          res = await this.utils.templateMessage.getOutOfLine(
            query.user || activity.user,
            [activity.name, '2019-02-25 18:00前处理', query.content, '抱歉，根据《微信小程序平台运营规范》相关规定，微信官方要求对涉嫌诱导等违规内容进行清理。您可联系客服进行内容修改，如未联系，平台将统一以*替换违规内容'],
            `pages/activity/timingActivity/timingActivity?scene=@id@:@${query.activity}@`
          )
      default:
        res = await this.model.userShop.find({}).populate({path: 'unionId', model: this.model.user})
        break
    }

    // let keys = await this.redis.keys('activity_prize_5c401c8d1f8abf2748e03856*')
    // let res = await this.redis.del(...keys)

    // let res: any = []
    // for (let index = 0; index < 20000; index++) {
    //   res.push('5c495d3ebf41f43058271625')
    // }
    // await this.model.activity.updateOne({_id: '5c4a80ee45a3972f6cd2f9aa'}, {$push: {joinUser: {$each: res}}})

    // let {id} = this.ctx.query
    // let res = await this.service.activity.lotteryTiming('5c64dc7cba18ff15bc0d89b3')
    // await this.service.activity.noPrizeMessage('5c64dc7cba18ff15bc0d89b3', [], '测试', 1)

    // let res = await this.redis.del('access_token')

    // 乐观锁
    // let res1: any = await this.model.activity.findOne({_id: '5c429efbfd9c3002782f7d90'})
    // if (res1) {
    //   if (res1.status === 2) console.log(123)
    //   let res = await this.model.activity.findOneAndUpdate({_id: '5c429efbfd9c3002782f7d90', __v: res1.__v}, {status: 2, __v: res1.__v + 1})
    //   if (res) {
    //     console.log(456);
    //     return this.send(res as any)
    //   }
    // }

    // let res = await this.redis.publish('templateMessage', this.app.stringify({data: 1234}))

    // let res = await this.redis.lpush('messageQueue', 1, 2, 3)

    // let res = await this.utils.tencentcloud.sentenceRecognition({ProjectId: 0, SubServiceType: 2, EngSerViceType: '8k', SourceType: 0, VoiceFormat: 'mp3', Url: 'http%3A%2F%2Fliqiansunvoice-1255628450.cosgz.myqcloud.com%2Fdemo.mp3', UsrAudioKey: 'www'})
    // let alias = this.utils.aliasMethod({A: 2, B: 3, C: 5}, 10)
    // let res = alias.next()

    // await this.redis.rpush('test', ...res)

    // for (let index = 0; index < 100; index++) {
    //   let res = await this.service.activity.lottery1()
    //   console.log(res);
    // }

    // await this.service.schedule.cancel('stop_123')

    // let activity = await this.model.activity.find({})

    // if (activity) {
    //   let arr: any[] = []
    //   activity.forEach((a) => {
    //     a.joinUser.forEach((e) => {
    //       arr.push({user: e, activity: (a as any)._id})
    //     })
    //   })
    //   await this.model.activityUser.insertMany(arr)
    // }

    // let res = await this.model.activityUser.find({}).limit(10000)
    return this.send(res as any)
  }
}
