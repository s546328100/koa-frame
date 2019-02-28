import * as mongoose from 'mongoose'

export type UserModel = mongoose.Document & {
  openId: string
  phone: string
  nickName: string // 用户昵称
  avatarUrl: string // 头像
  province: string // 省
  city: string // 市
  country: string // 国家
  gender: number
  addresses: [
    {
      _id: string
      name: string
      phone: string
      province: string // 省
      city: string // 市
      region: string // 区
      location: string
      default: number
      createdAt: number
    }
  ]
  unionId: string
  share: any
  integral: number
}

const schema = new mongoose.Schema(
  {
    openId: String,
    unionId: String,
    phone: String,
    nickName: String, // 用户昵称
    avatarUrl: String, // 头像
    province: String, // 省
    city: String, // 市
    country: String, // 国家
    gender: Number, // 性别 1男
    addresses: [
      {
        name: String,
        phone: String,
        province: String, // 省
        city: String, // 市
        region: String, // 区
        location: String,
        default: {type: Number, default: 0},
        createdAt: {type: Date, default: Date.now}
      }
    ],
    share: Object,
    integral: Number
  },
  {
    timestamps: true
  }
)

// export default mongoose.model('user', schema)
export default {name: 'user', schema, db: 0}
