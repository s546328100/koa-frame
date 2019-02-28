const COS = require('cos-nodejs-sdk-v5')
import * as fs from 'fs'
import Server from '../lib/server'

export default class Cos {
  private app: Server
  private cos: any
  private Bucket: string
  private Region: string

  constructor(app: Server) {
    this.app = app

    this.cos = new COS({
      SecretId: this.app.config.cos.SecretId,
      SecretKey: this.app.config.cos.SecretKey
    })

    this.Bucket = this.app.config.cos.fileBucket
    this.Region = this.app.config.cos.region
  }

  putObject(filename: string, filepath: string, callback?: any) {
    return new Promise((resolve, reject) => {
      // 调用方法
      try {
        this.cos.putObject(
          {
            Bucket: this.Bucket,
            Region: this.Region,
            Key: filename /* 必须 */,
            // ACL: 'public-read',
            // TaskReady: function(tid) {
            //   console.log(tid)
            //   TaskId = tid
            // },
            onProgress: function(progressData: any) {
              callback && callback(progressData)
            },
            // 格式1. 传入文件内容
            // Body: fs.readFileSync(filepath),
            // 格式2. 传入文件流，必须需要传文件大小
            Body: fs.createReadStream(filepath),
            ContentLength: fs.statSync(filepath).size
          },
          (err: any, data: any) => {
            fs.unlinkSync(filepath)

            if (err) {
              ;(<any>this).app.log.info(JSON.stringify(err))
              return reject(err)
            }

            let url = 'https://' + this.Bucket + '.cos.' + this.Region + '.myqcloud.com' + '/' + encodeURIComponent(filename).replace(/%2F/g, '/')
            // let url = 'https://' + 'grandedu-1251897698.file.myqcloud.com' + '/' + encodeURIComponent(filename).replace(/%2F/g, '/')
            resolve(url)
          }
        )
      } catch (error) {
        ;(<any>this).app.log.info(JSON.stringify(error))
        reject(error)
      }
    })
  }

  deleteObject(filepath: string) {
    let url = 'https://' + this.Bucket + '.cos.' + this.Region + '.myqcloud.com' + '/'
    let key = filepath.split(url)[1]
    if (!key) return

    let Key = decodeURIComponent(key)

    return new Promise((resolve, reject) => {
      try {
        this.cos.deleteObject(
          {
            Bucket: this.Bucket,
            Region: this.Region,
            Key
          },
          (err: any, data: any) => {
            if (err) {
              ;(<any>this).app.log.info(JSON.stringify(err))
              reject(err)
            }
            resolve(data)
          }
        )
      } catch (error) {
        ;(<any>this).app.log.info(JSON.stringify(error))
        reject(error)
      }
    })
  }

  putBucket(Bucket: string) {
    return new Promise((resolve, reject) => {
      // 调用方法
      try {
        let params = {
          Bucket /* 必须 */,
          Region: 'ap-guangzhou' /* 必须 */,
          ACL: 'public-read' /* 非必须 */
        }

        this.cos.putBucket(params, (err: any, data: any) => {
          if (err) {
            ;(<any>this).app.log.info(JSON.stringify(err))
            return reject(err)
          }
          resolve(data)
        })
      } catch (error) {
        ;(<any>this).app.log.info(JSON.stringify(error))
        reject(error)
      }
    })
  }
}
