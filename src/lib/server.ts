import * as Koa from 'koa'
import * as stringify from 'fast-json-stable-stringify'
import * as bluebird from 'bluebird'
import Loader from './loader'
import config from '../config/config.default'

export default class Server extends Koa {
  private loader: Loader
  public config: typeof config
  public stringify: any

  constructor() {
    super()
    this.loader = new Loader(this)
    this.stringify = stringify
    this.config = {} as typeof config

    global.Promise = bluebird
  }

  run(fn: (port: number) => void) {
    // 加载config
    this.loader.loadConfig('config/config.default', 'config/config.dev', 'config/lib/code')

    // loadLogger
    this.loader.loadLogger('lib/log')

    // 加载middleware
    this.loader.loadMiddleware('config/lib/middleware')

    // 加载controller
    this.loader.loadController(['controller/v1', 'controller/admin', 'controller/private'])

    // 加载service
    this.loader.loadService('service')

    // 加载model
    this.loader.loadModel('model')

    // 加载utils
    this.loader.loadUtils('utils')

    // 加载router
    this.loader.loadRouter()

    let server = this.listen(this.config.server.port, '0.0.0.0', () => {
      fn && fn(this.config.server.port)
    })

    // server.on('connection', function(socket) {
    //   socket.setKeepAlive(true, 6000)
    //   socket.setTimeout(70 * 1000)
    //   socket.setNoDelay(true)
    // })

    return server
  }

  startSchedule() {
    // 加载config
    this.loader.loadConfig('config/config.default', 'config/config.dev', 'config/lib/code')

    // loadLogger
    this.loader.loadLogger('lib/log')

    // 加载middleware
    this.loader.loadMiddleware('config/lib/middleware')

    // 加载service
    this.loader.loadService('service')

    // 加载model
    this.loader.loadModel('model')

    // 加载utils
    this.loader.loadUtils('utils')

    let that = this
    function onTimer() {
      that.context.service.schedule.task()
      that.context.service.subscribe.queue()
    }

    /**
     * 默认每隔 5s 检查一次
     */
    setInterval(onTimer, 5 * 1000)
  }

  startSubscribe() {
    // 加载config
    this.loader.loadConfig('config/config.default', 'config/config.dev', 'config/lib/code', true)

    // loadLogger
    this.loader.loadLogger('lib/log')

    // 加载middleware
    this.loader.loadMiddleware('config/lib/middleware')

    // 加载service
    this.loader.loadService('service')

    // 加载model
    this.loader.loadModel('model')

    // 加载utils
    this.loader.loadUtils('utils')

    this.context.service.subscribe.queue().then()
  }
}
