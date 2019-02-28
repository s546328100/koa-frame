import Server from './lib/server'

const server = new Server()
server.startSchedule()

console.log(`启动定时任务处理服务`)