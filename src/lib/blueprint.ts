const methods = ['get', 'post', 'patch', 'del', 'options', 'put']

interface Bp {
  [key: string]: Array<BP>
}

interface BP {
  httpMethod: string
  constructor: any
  handler: string
}

interface Decorator {
  (target: any, propertyKey: string): void
}

export interface blueprint extends Blueprint {
  /**
   * http post method
   * @param url
   */
  post(url: string): Decorator

  /**
   * http get method
   * @param url
   */
  get(url: string): Decorator
  patch(url: string): Decorator
  del(url: string): Decorator
  options(url: string): Decorator
  put(url: string): Decorator
}

class Blueprint {
  router: Bp = {}
  setRouter(url: string, blueprint: BP) {
    const _bp = this.router[url]
    if (_bp) {
      //检查http method 是否冲突
      for (const index in _bp) {
        const object = _bp[index]
        if (object.httpMethod === blueprint.httpMethod) {
          console.log(`路由地址 ${object.httpMethod} ${url} 已经存在`)
          return
        }
      }
      //不冲突则注册
      this.router[url].push(blueprint)
    } else {
      this.router[url] = []
      this.router[url].push(blueprint)
    }
  }

  getRoute() {
    return this.router
  }
}

methods.forEach((httpMethod) => {
  Object.defineProperty(Blueprint.prototype, httpMethod, {
    get: function() {
      return (url: string) => {
        return (target: any, propertyKey: string) => {
          ;(<any>this).setRouter(url, {
            httpMethod: httpMethod,
            constructor: target.constructor,
            handler: propertyKey
          })
        }
      }
    }
  })
})

export const bp: blueprint = <any>new Blueprint()
