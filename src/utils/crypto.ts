import * as crypto from 'crypto'
import * as md5 from 'md5'

export default class Crypto {
  // DES 加密
  desEncrypt(message: string, key: string) {
    key = key.length >= 8 ? key.slice(0, 8) : key.concat('0'.repeat(8 - key.length))
    // console.log(key)
    const keyHex = Buffer.from(key)
    const cipher = crypto.createCipheriv('des-cbc', keyHex, keyHex)
    let c = cipher.update(message, 'utf8', 'base64')
    c += cipher.final('base64')
    return c
  }

  // DES 解密
  desDecrypt(text: string, key: string) {
    try {
      key = key.length >= 8 ? key.slice(0, 8) : key.concat('0'.repeat(8 - key.length))
      const keyHex = Buffer.from(key)
      const cipher = crypto.createDecipheriv('des-cbc', keyHex, keyHex)
      let c = cipher.update(text, 'base64', 'utf8')
      c += cipher.final('utf8')
      return c
    } catch (error) {
      throw error
    }
  }

  aesDecode(key: string, algorithm: string, str: string) {
    key = md5(key).toLowerCase()
    let iv = algorithm.indexOf('ecb') > -1 ? '' : key
    // let cipher = crypto.createCipheriv(algorithm, key, iv)
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    decipher.setAutoPadding(false)

    let inputEncoding: any = 'base64'
    let outputEncoding: any = 'utf8'

    let decipherChunks = []
    decipherChunks.push(decipher.update(str, inputEncoding, outputEncoding))
    decipherChunks.push(decipher.final(outputEncoding))
    return decipherChunks.join('')
  }

  WXBizDataCrypt(appId: string, sessionKey: string, encryptedData: string, iv: string) {
    // base64 decode
    let _sessionKey = Buffer.from(sessionKey, 'base64')
    let _encryptedData = Buffer.from(encryptedData, 'base64')
    let _iv = Buffer.from(iv, 'base64')

    try {
      // 解密
      let decipher = crypto.createDecipheriv('aes-128-cbc', _sessionKey, _iv)
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(true)
      let decoded = decipher.update(_encryptedData, 'binary', 'utf8')
      decoded += decipher.final('utf8')

      let _decoded = JSON.parse(decoded)

      if (_decoded.watermark.appid !== appId) {
        throw new Error('Illegal Buffer')
      }

      return _decoded
    } catch (err) {
      throw new Error('Illegal Buffer')
    }
  }
}
