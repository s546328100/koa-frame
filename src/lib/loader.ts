import {BaseContext} from 'koa'
import * as KoaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import * as Redis from 'ioredis'
import * as Redlock from 'redlock'
import * as mongoose from 'mongoose'

import Server from './server'
import {bp} from './blueprint'

const CLASSLOADER = Symbol('classLoader')
interface FileModule {
  module: any
  filename: string
}
export default class Loader {
  private koaRouter: any = new KoaRouter({prefix: '/lottery'})
  private app: Server
  private db: any[]

  constructor(app: Server) {
    this.app = app
    this.db = []
  }

  private require(_path: string) {
    let url = path.resolve(__dirname, '../', _path)
    return require(url).default
  }

  private fileLoader(url: string): Array<FileModule> {
    const merge = path.resolve(__dirname, '../', url)
    console.log(`||==> 加载 ${merge}`)
    return fs.readdirSync(merge).map((name) => {
      return {
        module: require(merge + '/' + name).default,
        filename: name
      }
    })
  }

  loadConfig(def: string, dev: string, code: string, subscribe = false) {
    const conf = Object.assign({}, this.require(def), this.require(code))
    const merge = process.env.NODE_ENV === 'local' ? Object.assign({}, conf, this.require(dev)) : conf
    Object.defineProperty(this.app, 'config', {
      get: () => {
        return merge
      }
    })

    this.setCache(merge, subscribe)
    this.setMongo(merge)
  }

  private setCache(config: any, subscribe = false) {
    let {redis} = config

    let cache = new Redis(redis)

    cache.on('error', (err) => console.log('redis err:', err))
    cache.on('connect', () => console.log('redis connected'))

    // if (subscribe) cache.subscribe('templateMessage')

    // cache.on('message', (channel, data) => {
    //   this.app.context.service.subscribe.message(channel, data).then()
    // })

    let redlock = new Redlock([cache])

    Object.defineProperty(this.app, 'cache', {
      get: () => {
        return {redis: cache, redlock}
      }
    })
  }

  private setMongo(config: any) {
    const Fawn: any = require('fawn')
    ;(<any>mongoose).Promise = global.Promise

    let {database, database1} = config
    Fawn.init(mongoose)
    // 数据库
    let db = mongoose.createConnection(database.url, {useCreateIndex: true, useNewUrlParser: true})

    db.on('connected', function() {
      console.log('db connection open to ' + database.url)
    })

    db.on('error', function(err) {
      console.log('Mongoose connection error: ' + err)
    })

    db.on('disconnected', function() {
      console.log('Mongoose connection disconnected')
    })

    let db1 = mongoose.createConnection(database1.url, {useCreateIndex: true, useNewUrlParser: true})

    db1.on('connected', function() {
      console.log('db connection open to ' + database1.url)
    })

    db1.on('error', function(err) {
      console.log('Mongoose connection error: ' + err)
    })

    db1.on('disconnected', function() {
      console.log('Mongoose connection disconnected')
    })

    this.db.push(db)
    this.db.push(db1)
  }

  loadLogger(_path: string) {
    const log = this.require(_path)
    Object.defineProperty(this.app, 'log', {
      get: () => {
        return log
      }
    })
  }

  loadController(contorllers: string[]) {
    contorllers.forEach((e) => this.fileLoader(e))
  }

  loadRouter() {
    const r = bp.getRoute()
    Object.keys(r).forEach((url) => {
      r[url].forEach((object) => {
        this.koaRouter[object.httpMethod](url, async (ctx: BaseContext) => {
          const instance = new object.constructor(ctx)
          await instance[object.handler]()
        })
      })
    })
    this.app.use(this.koaRouter.routes())
  }

  private loadToContext(target: Array<FileModule>, app: Server, property: string) {
    Object.defineProperty(app.context, property, {
      get() {
        if (!(<any>this)[CLASSLOADER]) {
          ;(<any>this)[CLASSLOADER] = new Map()
        }
        const loaded = (<any>this)[CLASSLOADER]

        let instance = loaded.get(property)
        if (!instance) {
          instance = new ClassLoader({app, properties: target})
          loaded.set(property, instance)
        }
        return instance
      }
    })
  }

  loadService(path: string) {
    const service = this.fileLoader(path)
    this.loadToContext(service, this.app, 'service')
  }

  loadMiddleware(_prth: string) {
    let middlewareConfig = this.require(_prth)
    for (let i = 0, len = middlewareConfig.length; i < len; i++) {
      let {name, enable, options} = middlewareConfig[i]
      if (enable) {
        let filePath = path.join(__dirname, '../', 'middleware', ''.concat(name, process.env.DEBUG === 'true' ? '.ts' : '.js'))
        let middleware = fs.existsSync(filePath) ? require(filePath).default : require(name)
        this.app.use(middleware(options))
        console.log('server load middleware:', name)
      }
    }
  }

  loadModel(_path: string) {
    const model = this.fileLoader(_path)
    for (const m of model) {
      let {name, schema, db} = m.module
      m.module = this.db[db].model(name, schema)
    }
    this.loadToContext(model, this.app, 'model')
  }

  loadUtils(_path: string) {
    const utils = this.fileLoader(_path)
    this.loadToContext(utils, this.app, 'utils')
  }
}

class ClassLoader {
  private app: Server
  private cache: {[key: string]: any}

  constructor(options: any) {
    const properties = options.properties
    this.app = options.app
    this.cache = new Map()

    properties.forEach((mod: FileModule) => {
      const key = mod.filename.split('.')[0]
      this.defineProperty(key, mod.module)
    })
  }

  defineProperty(key: string, value: any) {
    const is = require('is-type-of')
    Object.defineProperty(this, key, {
      get() {
        let instance = this.cache.get(key)
        if (!instance) {
          instance = is.class(value) ? new value(this.app) : value
          this.cache.set(key, instance)
        }
        return instance
      }
    })
  }
}
