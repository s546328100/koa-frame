import Server from './lib/server'

const server = new Server()
server.startSubscribe()

console.log(`启动redis subscribe服务`)
