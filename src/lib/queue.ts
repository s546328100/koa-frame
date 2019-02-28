export default function block(channel: string, type: number = 1, user: number = 1, _userId?: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    let value = target[propertyKey]
    descriptor.value = async function() {
      let {tokenObj: {userId = ''} = {}}  = (<any>this).ctx
      if (_userId) {
        let _ua = _userId.split('.')
        let res = (<any>this).ctx
        _ua.forEach((e) => {
          res = res[e]
        })
        userId = res
      }
      return await blockRun.run.call(this, user ? userId + '_' + channel : channel, value.bind(this, ...arguments), type)
    }
  }
}

interface queue {
  [key: string]: any[]
}

const queue: queue = {}

export {blockRun}

class blockRun {
  static run(channel: string, func: any, type?: number) {
    if (!channel) {
      return
    }
    if (typeof func !== 'function') {
      return
    }
    return new Promise(async (reslove, reject) => {
      if (!queue.hasOwnProperty(channel)) {
        queue[channel] = []
      }
      if (type === 1 && queue[channel].length >= 1) return reslove(((<any>this).ctx.body = {code: 5, message: '请勿频繁操作'}))

      queue[channel].push(
        blockRun._getBlockFunc.call(this, func, channel, {
          reslove,
          reject
        })
      )
      if (queue[channel].length == 1) {
        try {
          let lock = await (<any>this).app.cache.redlock.lock(channel, 60 * 1000)
          blockRun._outQueueRun(channel, lock)
        } catch (error) {
          blockRun._outQueueRun(channel, null, {code: 5, message: '系统繁忙，请稍后再试'})
        }
      }
    })
  }

  static _getBlockFunc(func: any, channel: string, callBackInfo: {reslove: any; reject: any}) {
    let runRes: any
    return async (lock: any, err: {code: number; message: string}) => {
      try {
        if (err) return callBackInfo.reject(err)
        runRes = await func()
      } catch (e) {
        callBackInfo.reject(e)
      } finally {
        blockRun._finallyFunc(runRes, callBackInfo, channel, lock, err)
      }
    }
  }

  static _finallyFunc(runRes: any, callBackInfo: {reslove: any; reject: any}, channel: string, lock: any, err: {code: number; message: string}) {
    callBackInfo.reslove(runRes)
    if (queue[channel] != undefined) queue[channel].shift()
    blockRun._outQueueRun(channel, lock, err)
  }

  static _outQueueRun(channel: string, lock: any, err?: {code: number; message: string}) {
    if (queue[channel] == undefined) return
    if (queue[channel].length == 0) {
      delete queue[channel]
      // if (!err) apple.redis.del(channel).then()
      if (lock) lock.unlock((err: any) => err && console.log(err))
    } else {
      if (lock) lock.extend(60 * 1000, (err: any) => err && console.log(err))
      // apple.redis.expire(channel, 60).then()
      blockRun._run(queue[channel][0], lock, err)
    }
  }

  static async _run(func: any, lock: any, err?: {code: number; message: string}) {
    await func(lock, err)
  }
}
