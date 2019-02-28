import Service from '../lib/base/service'
import * as mongoose from 'mongoose'

import Decimal from 'decimal.js'
import * as moment from 'moment'

export default class UserService extends Service {
  async add(obj: any) {
    let user = await this.model.user.findOne({openId: obj.openId})
    if (!user) user = await this.model.user.create(obj)
    if (obj.unionId && !user.unionId) await this.model.user.updateOne({_id: user.id}, {unionId: obj.unionId})
    // if (obj.unionId) await this.model.userExtend.updateOne({unionId: obj.unionId}, {unionId: obj.unionId, xcx: obj.openId}, {upsert: true})
    return user
  }

  async create(id: any, obj: any) {
    let user = await this.model.user.findOneAndUpdate(id, obj, {upsert: true, new: true})
    return user
  }

  async get(obj: any, select = '') {
    let user = await this.model.user.findOne(obj, select)
    return user
  }

  async update(id: any, obj: any) {
    await this.model.user.updateOne(id, obj)
    return this.success(id)
  }

  async addresses(userId: string) {
    let user = await this.model.user
      .aggregate()
      .match({_id:  mongoose.Types.ObjectId(userId)})
      .unwind('addresses')
      .project({addresses: 1})
      .sort({'addresses.default': -1, 'addresses.createdAt': -1})
      .exec()

    return this.success(user)
  }
}
