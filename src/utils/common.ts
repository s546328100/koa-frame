export default class Common {
  getClientIP(req: any) {
    return req.headers['x-forwarded-for'] || req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || ''
  }

  dealElement(obj: any) {
    let param: any = {}
    if (obj === null || obj === undefined || obj === '') return param
    for (let key in obj) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        param[key] = obj[key]
      }
    }
    return param
  }

  mathRandoms(data: string, len: number) {
    let chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    for (let i = 0; i < len; i++) {
      let id = parseInt(String(Math.random() * (chars.length - 1)))
      data += chars[id]
    }
    return data
  }

  sleep(time: number) {
    return new Promise(function(resolve) {
      setTimeout(resolve, time)
    })
  }

  /**
   * 随机生成room_id
   */
  genRoomIdByRandom(str = '') {
    return str + (S4() + S4() + '_' + S4())
  }

  async awaitWrap<T, U = any>(promise: Promise<T>): Promise<[U | null, T | null]> {
    try {
      const data = await promise;
      return [null, data];
    }
    catch (err) {
      return [err, null];
    }
  }
}

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
}
