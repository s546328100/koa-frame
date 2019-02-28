import {Model} from 'mongoose'
import {UserModel} from '../model/user'
import {ActivityModel} from '../model/activity'
import {PrizeModel} from '../model/prize'
import {FormModel} from '../model/form'
import {ActivityUserModel} from '../model/activityUser'
import {adminModel} from '../model/admin'
import {messageModel} from '../model/message'

import {UserShopModel} from '../model/userShop'

export default interface model {
  user: Model<UserModel>
  activity: Model<ActivityModel>
  prize: Model<PrizeModel>
  form: Model<FormModel>
  activityUser: Model<ActivityUserModel>
  admin: Model<adminModel>
  message: Model<messageModel>

  userShop: Model<UserShopModel>
}
