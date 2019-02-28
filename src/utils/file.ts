import * as sharp from 'sharp'
import * as path from 'path'
import * as fs from 'fs'
import {Sharp} from 'sharp'
sharp.cache(false)

import * as tinify from 'tinify'
;(tinify as any).key = 'z9qwwmbpKS7wKCBSjVlPSwQ6gwQ2l58F'

export default class File {
  async metadata(filepath: string) {
    const image = sharp(filepath)
    let res = await image.metadata()
    return {image, info: res}
  }

  async resize(image: Sharp, name: string, width: string = '', height: string = '') {
    let newPath = path.resolve(__dirname, '../uploads/sharp', name)
    let obj: any = {}
    if (width) obj.width = +width
    if (height) obj.height = +height
    let info = await image
      .resize(obj)
      .sharpen()
      // .quality(100)
      .toFile(newPath)
      .then()
    return {info, path: newPath}
  }

  /**
   * 生成圆形的头像
   * @param {*} avatarPath 头像路径
   */
  async genCircleAvatar(avatarPath: string, name: string) {
    let newPath = path.resolve(__dirname, '../uploads/sharp', name + '.png')
    // 创建圆形SVG，用于实现头像裁剪
    const roundedCorners = new Buffer('<svg><circle r="90" cx="90" cy="90"/></svg>')
    let info = await sharp(avatarPath).resize(180, 180).overlayWith(roundedCorners, {cutout: true}).png().toFile(newPath)
    return {info, path: newPath}
  }

  async compress(filepath: string, name: string) {
    let newPath = path.resolve(__dirname, '../uploads/tinify', name)

    return new Promise(function(resolve, reject) {
      try {
        fs.readFile(filepath, function(err, sourceData) {
          if (err) throw err
          tinify.fromBuffer(sourceData).toBuffer(function(err, resultData) {
            if (err) reject(err)
            fs.writeFile(newPath, resultData, function(err: any) {
              if (err) throw err
              resolve(newPath)
            })
          })
        })
      } catch (error) {
        throw error
      }
    })
  }
}
