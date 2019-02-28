import Controller from '../../lib/base/controller'
import {bp} from '../../lib/blueprint'
import {validate, required} from '../../lib/validate'

import * as path from 'path'
import * as rd from 'rd'
import * as fs from 'fs'

const logRoot = path.join(__dirname, '../../logs')

export default class LogController extends Controller {
  @bp.get('/admin/logfilelist')
  async listFiles() {
    let prefix = this.app.config.selfHost
    try {
      return this.send((await listFiles1(logRoot, prefix)) as any)
    } catch (e) {
      return this.send(e)
    }
  }

  @bp.get('/admin/getlogfile')
  @validate
  async loadFile(@required file: string) {
    let filepath = path.join(logRoot, file)
    try {
      return this.send((await loadFile1(filepath)) as any)
    } catch (e) {
      return this.send(e)
    }
  }
}

function listFiles1(rootDir: string, prefix: string) {
  let body = ''
  return new Promise(function(resolve, reject) {
    rd.each(
      rootDir,
      function(f, s, next) {
        f = f.replace(logRoot, '.')
        body += '<a href="' + prefix + f + '">' + f + ' ( ' + parseInt(String(s.size / 1024)) + 'KB )</a><br>'
        next()
      },
      function(err) {
        if (!err) {
          resolve(body)
        } else {
          reject(err)
        }
      }
    )
  })
}

function loadFile1(filepath: string) {
  return new Promise(function(resolve, reject) {
    fs.readFile(filepath, {encoding: 'utf-8'}, function(error, data) {
      if (!error) {
        resolve(data)
      } else {
        reject(error)
      }
    })
  })
}
