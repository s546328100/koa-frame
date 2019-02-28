import * as path from 'path'

// 日志根目录
const baseLogPath = path.resolve(__dirname, '../../', 'logs')

// 错误日志目录
const errorPath = '/error'
// 错误日志文件名
const errorFileName = 'error'
// 错误日志输出完整路径
const errorLogPath = baseLogPath + errorPath + '/' + errorFileName

// 响应日志目录
const responsePath = '/response'
// 响应日志文件名
const responseFileName = 'response'
// 响应日志输出完整路径
const responseLogPath = baseLogPath + responsePath + '/' + responseFileName

// 业务日志目录
const userPath = '/user'
// 业务日志文件名
const userFileName = 'user'
// 业务日志输出完整路径
const userLogPath = baseLogPath + userPath + '/' + userFileName

// 业务日志目录
const schedulePath = '/schedule'
// 业务日志文件名
const scheduleFileName = 'schedule'
// 业务日志输出完整路径
const scheduleLogPath = baseLogPath + schedulePath + '/' + scheduleFileName

// v2 配置。
const logConfig = {
  appenders: {
    // 错误日志
    errorLogger: {
      type: 'dateFile', // 日志类型
      filename: errorLogPath, // 日志输出位置
      alwaysIncludePattern: true, // 是否总是有后缀名
      // pattern: '-yyyy-MM-dd-hh.log', // 后缀，每小时创建一个新的日志文件
      pattern: '-yyyy-MM-dd.log',
      daysToKeep: 7 // 自定义属性，错误日志的根目录
    },
    // 响应日志
    resLogger: {
      type: 'dateFile',
      filename: responseLogPath,
      alwaysIncludePattern: true,
      // pattern: '-yyyy-MM-dd-hh.log',
      pattern: '-yyyy-MM-dd.log',
      daysToKeep: 7
    },
    // 控制台输出
    consoleLogger: {
      type: 'console'
    },
    // 业务日志
    userLogger: {
      type: 'dateFile',
      filename: userLogPath,
      alwaysIncludePattern: true,
      // pattern: '-yyyy-MM-dd-hh.log',
      pattern: '-yyyy-MM-dd.log',
      daysToKeep: 7
    },
    // 定时日志
    scheduleLogger: {
      type: 'dateFile',
      filename: scheduleLogPath,
      alwaysIncludePattern: true,
      // pattern: '-yyyy-MM-dd-hh.log',
      pattern: '-yyyy-MM-dd.log',
      daysToKeep: 7
    }
  },
  // 设置logger名称对应的的日志等级
  categories: {
    default: {
      appenders: ['consoleLogger'],
      level: 'info'
    },
    errorLogger: {
      appenders: ['errorLogger'],
      level: 'info'
    },
    resLogger: {
      appenders: ['resLogger'],
      level: 'info'
    },
    userLogger: {
      appenders: ['userLogger'],
      level: 'info'
    },
    scheduleLogger: {
      appenders: ['scheduleLogger'],
      level: 'info'
    }
  },
  disableClustering: true
}

export default logConfig
