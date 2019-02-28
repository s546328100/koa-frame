const tencentcloud = require('tencentcloud-sdk-nodejs')
import Server from '../lib/server'

const AaiClient = tencentcloud.aai.v20180522.Client
const models = tencentcloud.aai.v20180522.Models

const Credential = tencentcloud.common.Credential

export default class Tencentcloud {
  private app: Server
  private client: any

  constructor(app: Server) {
    this.app = app

    const cred = new Credential(this.app.config.cos.SecretId, this.app.config.cos.SecretKey)

    this.client = new AaiClient(cred)
  }

  sentenceRecognition(params: any) {
    let req = new models.SentenceRecognitionRequest()
    req.deserialize(params)
    this.client.SentenceRecognition(req, function(err: any, response: any) {
      // 请求异常返回，打印异常信息
      if (err) {
        console.log(err)
        return
      }
      // 请求正常返回，打印response对象
      console.log(response.to_json_string())
    })
  }
}
