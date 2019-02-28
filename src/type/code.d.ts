export type body = {
  code: number
  result?: any
  message?: string
  pageNumber?: number
  pageCount?: number
  amount?: number
  next?: boolean
  prev?: boolean
}

export interface RESPOND {
  INTERFACE_NOT_EXIST: {code: 1; message: '接口不存在'}
  LACK_PARAMS: {code: 2; message: '参数不全'}
  PARAMS_ERROR: {code: 3; message: '参数有误'}
  MONEY_PARAMS_ERROR: {code: 4; message: '金额有误'}

  NO_POWER: {code: 8; message: '无权操作'}
  QERCODE_INVALID: {code: 9; message: '二维码无效'}
  LOGIN_FAIL: {code: 10; message: '登录失败'}
  NO_POWER_LOGIN: {code: 11; message: '无权登录'}
  TOKEN_INVALID: {code: 12; message: '令牌无效'}
  TOKEN_EXPIRE: {code: 13; message: '令牌过期'}

  LACK_DATA: {code: 100; message: '数据不存在'}
  LACK_PHONE: {code: 101; message: '缺少手机号'}

  NOT_ACCOUNT: {code: 210; message: '账号不存在'}
  LACK_USER_INFO: {code: 211; message: '请完善个人信息'}
  PHONE_IS_EXIST: {code: 212; message: '手机号码已存在'}
  MONEY_LESS: {code: 213; message: '金额不足提现'}
  ONCE_A_DAY: {code: 214; message: '一天只能提现一次'}
  PASSWORD_ERROR: {code: 215; message: '密码错误'}
  WITHDRAW_FAIL: {code: 216; message: '提现失败'}

  ACTIVITY_IS_OVER: {code: 302; message: '活动已结束'}
  ACTIVITY_IS_JOIN: {code: 303; message: '已参加活动'}
  LOSING_LOTTERY: {code: 304; message: '未中奖'}
  APPOINTMENT_LT_TIME: {code: 306; message: '开奖时间小于当前时间'}
  NO_MORE_THAN_ONE_WEEK: {code: 307; message: '时间不能大于一周'}
  NO_LOTTERY_NUM: {code: 308; message: '人数设置有误'}
  NOT_ENT_TIME: {code: 309; message: '请选择开奖时间'}
  CONTAINS_ILLEGAL_CONTENT: {code: 310; message: '含有违法违规内容'}

  HAVE_APPOINTMENT: {code: 300; message: '已被预约'}
  APPOINTMENT_BEFORE_THE_TIME: {code: 301; message: '未到预约时间'}
  ROOM_NO_CREATE: {code: 305; message: '房间还未创建'}
  APPOINTMENT_IS_START_NO_OVER: {code: 311; message: '预约已开始，暂时不能取消'}
  PS_HAVE_SERVED: {code: 312; message: 'PS已经约聊过，无法取消'}

  ARTICLE_IS_DEL: {code: 350; message: '改笔记已被删除'}
  COMMENT_IS_DEL: {code: 351; message: '改评论已被删除'}

  ESSAY_APPLICATION: {code: 360; message: '已提交申请，请耐心等待结果'}

  COUPON_EXIST: {code: 400; message: '已领取过优惠劵'}
  COUPON_LOSE: {code: 401; message: '无效优惠劵'}
  USER_REFERRAL_CODE_EXIST: {code: 410; message: '已使用过优惠代码'}
  NO_REFERRAL_CODE: {code: 411; message: '优惠代码不存在'}
  NO_USE_ONESELF_REFERRAL_CODE: {code: 412; message: '不能使用自己的优惠代码'}
  SIGN_IN: {code: 420; message: '已签到'}
  GOLD_LACK: {code: 421; message: '金币不足兑换'}

  NO_FILE: {code: 450; message: '请上传文件'}
  ONLY_MENTOR_UPLOAD_FILE: {code: 451; message: '只允许导师上传'}
  FAIL: {code: 500; message: '操作失败'}
}
