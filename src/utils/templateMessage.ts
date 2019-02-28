import * as moment from 'moment'

import Server from '../lib/server'

export default class TemplateMessage {
  private app: Server

  constructor(app: Server) {
    this.app = app
  }

  // const 抽奖结果通知 = {
  //   "template_id": "TgFf7YJvEVvAEc_aNiuVCR3KJqE2DgufOc6LpLH_qE8",
  //   "page": "pages/tabs/more/prizeInfo/prizeInfo?id=",
  //   "data": {
  //       "keyword1": "活动名称",
  //       "keyword2": "温馨提示",
  //   }
  // }
  async lotteryResult(id: string, arr: any[], path: string) {
    let data: any = {}
    arr.forEach((e, i) => {
      data[`keyword${i + 1}`] = {value: e}
    })
    return await this.app.context.utils.wechat.sendTemplateMessage(id, 'TgFf7YJvEVvAEc_aNiuVCR3KJqE2DgufOc6LpLH_qE8', data, path)
  }

  // const 中奖结果通知 = {
  //   "template_id": "jqNNJSgErjhCiBNI_Y21t6YMWyHNeKGiM8ow1RslDIA",
  //   "page": "pages/tabs/more/prizeInfo/prizeInfo?id=",
  //   "data": {
  //       "keyword1": "活动名称",
  //       "keyword2": "奖品名称",
  //       "keyword4": "备注",
  //   }
  // }
  async winning(id: string, arr: any[], path: string) {
    let data: any = {}
    arr.forEach((e, i) => {
      data[`keyword${i + 1}`] = {value: e}
    })
    return await this.app.context.utils.wechat.sendTemplateMessage(id, 'jqNNJSgErjhCiBNI_Y21t6YMWyHNeKGiM8ow1RslDIA', data, path)
  }

  // const 新成员加入通知 = {
  //   "template_id": "onWSRvm_vLkeqZKfkYYM3VV-0_dSX_l5WeIUvJIWSM4",
  //   "page": "pages/tabs/more/prizeInfo/prizeInfo?id=",
  //   "data": {
  //       "keyword1": "温馨提示",
  //       "keyword2": "备注",
  //   }
  // }
  async newLottery(id: string, arr: any[], path: string, other: any) {
    let data: any = {}
    arr.forEach((e, i) => {
      data[`keyword${i + 1}`] = {value: e}
    })
    let res = await this.app.context.utils.wechat.sendTemplateMessage(id, 'onWSRvm_vLkeqZKfkYYM3VV-0_dSX_l5WeIUvJIWSM4', data, path)
    if (res.errcode === 0 && other && other.userId && other.activity) {
      await this.app.context.model.message.create({type: 1, sender: other.userId, sys: 1, activity: other.activity, receiver: res.userId, template: 'onWSRvm_vLkeqZKfkYYM3VV-0_dSX_l5WeIUvJIWSM4'})
    }
    return res
  }

  // const 违规删除通知 = {
  //   "template_id": "TnZ9BALSmAxjwlTxsPpLsoz0wXoho_H04VC0qAD2kGc",
  //   "page": "pages/tabs/more/prizeInfo/prizeInfo?id=",
  //   "data": {
  //       "keyword1": "活动名称",
  //       "keyword2": "提交时间",
  //       "keyword3": "违规内容",
  //       "keyword4": "违规原因",
  //   }
  // }
  async getOutOfLine(id: string, arr: any[], path: string) {
    let data: any = {}
    arr.forEach((e, i) => {
      data[`keyword${i + 1}`] = {value: e}
    })
    return await this.app.context.utils.wechat.sendTemplateMessage(id, 'TnZ9BALSmAxjwlTxsPpLsoz0wXoho_H04VC0qAD2kGc', data, path)
  }
}
