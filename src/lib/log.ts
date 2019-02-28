import * as log4js from 'log4js'
import logConfig from '../config/lib/log'
import Crypto from '../utils/crypto'

export interface log {
  warn(msg: string): void
  info(msg: string): void
  logErrMsg(ctx: any, msg: string, resTime: number): void
  logError(ctx: any, error: any, resTime: number): void
  logResponse(ctx: any, resTime: number): void
  resMsg(msg: string): void
  resMsgErr(msg: string): void
  userMsg(msg: string, userId?: string): void
  scheduleMsg(msg: string, type?: type): void
}

type type = 'info' | 'warn' | 'error'

// 加载配置文件
log4js.configure(logConfig)

let log: any = {}

const errorLogger = log4js.getLogger('errorLogger')
const resLogger = log4js.getLogger('resLogger')
const userLogger = log4js.getLogger('userLogger')
const consoleLogger: any = log4js.getLogger('default')
const scheduleLogger: any = log4js.getLogger('scheduleLogger')

log.scheduleMsg = function(msg: string, type: type = 'info') {
  var logText = ''
  logText += msg
  scheduleLogger[type](logText)
  consoleLogger[type](logText)
}

log.warn = function(msg: string) {
  var logText = ''
  logText += msg
  errorLogger.warn(logText)
  consoleLogger.warn(logText)
}

log.info = function(msg: string) {
  var logText = ''
  logText += msg
  errorLogger.info(logText)
  consoleLogger.info(logText)
}

// 简化版的错误日志
log.logErrMsg = function(ctx: any, msg: string, resTime: number) {
  var error: any = {}
  error.name = ''
  error.message = msg
  error.stack = ''
  log.logError(ctx, error, resTime)
}

// 封装错误日志
log.logError = function(ctx: any, error: any, resTime: number) {
  if (ctx && error) {
    errorLogger.error(formatError(ctx, error, resTime))
    consoleLogger.error(formatError(ctx, error, resTime))
  }
}

// 封装响应日志
log.logResponse = function(ctx: any, resTime: number) {
  if (ctx) {
    if (resTime >= 300) resLogger.info(formatRes(ctx, resTime, 0))
    consoleLogger.info(formatRes(ctx, resTime))
  }
}

log.resMsg = function(msg: string) {
  var logText = ''
  logText += msg
  resLogger.info(logText)
  consoleLogger.info(logText)
}

log.resMsgErr = function(msg: string) {
  var logText = ''
  logText += msg
  resLogger.error(logText)
  consoleLogger.error(logText)
}

log.userMsg = function(msg: string, userId = '', des = false) {
  var logText = ''
  if (userId) {
    if(des) userId = new Crypto().desEncrypt(userId, 'Bitwork')
    logText += userId
    logText += '，'
  }
  logText += msg
  userLogger.info(logText)
  consoleLogger.info(logText)
}

// 格式化响应日志
var formatRes = function(ctx: any, resTime: number, type = 1) {
  var logText = ''

  // 响应日志开始
  // logText += '*** response {'

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime, type)

  // 响应状态码
  logText += '- status：' + ctx.status + ''

  // 响应内容

  let {body: {code = 0} = {}} = ctx

  if (ctx.body && ctx.body.constructor.name !== 'IncomingMessage') {
    let body = code > 0 && type === 1 ? colorize(JSON.stringify(ctx.body || ''), 'red') : JSON.stringify(ctx.body || '')
    logText += ' “' + body.substring(0, 1000) + '”'
  }

  // 响应日志结束
  // logText += '} response ***'

  return logText
}

// 格式化错误日志
var formatError = function(ctx: any, err: any, resTime: number) {
  var logText = ''

  // 错误信息开始
  logText += '*** error {'

  // 添加请求日志
  logText += formatReqLog(ctx.request, resTime)

  // 错误名称
  logText += 'err name:' + err.name + '; '
  // 错误信息
  logText += 'err message:' + err.message + '; '
  // 错误详情
  logText += 'err stack:' + err.stack + '; '

  // 错误信息结束
  logText += '} error ***'

  return logText
}

// 格式化请求日志
var formatReqLog = function(req: any, resTime: number, type = 1) {
  var logText = ''

  var method = req.method
  // 客户端ip
  logText += '' + getClientIP(req.req) + ''

  // 服务器响应时间
  logText += ' (' + (resTime > 200 && type === 1 ? colorize(resTime, 'red') : resTime) + ') '

  // 访问方法
  logText += '【' + method + '】'

  // 请求原始地址
  logText += '[' + req.originalUrl + ']'

  // 请求参数
  if (method === 'GET') {
    logText += ' - query：' + JSON.stringify(req.query) + ' '
    // startTime = req.query.requestStartTime;
  } else {
    logText += ' - body：' + JSON.stringify(req.body) + ' '
    // startTime = req.body.requestStartTime;
  }

  return logText
}

export default log

function getClientIP(req: any) {
  return req.headers['x-forwarded-for'] || req.ip || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.remoteAddress) || ''
}

const styles: {[key: string]: number[]} = {
  // styles
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  // grayscale
  white: [37, 39],
  grey: [90, 39],
  black: [90, 39],
  // colors
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [91, 39],
  yellow: [33, 39]
}

function colorizeStart(style: string) {
  return style ? `\x1B[${styles[style][0]}m` : ''
}

function colorizeEnd(style: string) {
  return style ? `\x1B[${styles[style][1]}m` : ''
}

function colorize(str: string | number, style: string) {
  return colorizeStart(style) + str + colorizeEnd(style)
}
