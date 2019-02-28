console.log(`    
                               
                                 █████▒█    ██  ▄████▄   ██ ▄█▀       ██████╗ ██╗   ██╗ ██████╗
                               ▓██   ▒ ██  ▓██▒▒██▀ ▀█   ██▄█▒        ██╔══██╗██║   ██║██╔════╝
                               ▒████ ░▓██  ▒██░▒▓█    ▄ ▓███▄░        ██████╔╝██║   ██║██║  ███╗
                               ░▓█▒  ░▓▓█  ░██░▒▓▓▄ ▄██▒▓██ █▄        ██╔══██╗██║   ██║██║   ██║
                               ░▒█░   ▒▒█████▓ ▒ ▓███▀ ░▒██▒ █▄       ██████╔╝╚██████╔╝╚██████╔╝
                                ▒ ░   ░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░▒ ▒▒ ▓▒       ╚═════╝  ╚═════╝  ╚═════╝   ▄█▀█● Bitwork
                                ░     ░░▒░ ░ ░   ░  ▒   ░ ░▒ ▒░
                                ░ ░    ░░░ ░ ░ ░        ░ ░░ ░
                                         ░     ░ ░      ░  ░
                        
`)

import Server from './lib/server'

const server = new Server()
let _server = server.run((port) => {
  console.log(`server start to ${port}`)
})

const exitCode = {
  UNCAUGHT_FATAL_EXCEPTION: 1,
  EADDRINUSE: 8
}

process.on('uncaughtException', function(err: any) {
  try {
    console.log(`uncaughtException：, ${err}`)
    if (err.code === 'EADDRINUSE') {
      console.log('EADDRINUSE! Process %s exit', process.pid)
      process.exit(exitCode.EADDRINUSE)
    } else {
      gracefulShutdown()
    }
  } catch (e) {
    console.log(`uncaughtException:：, ${e}`)
  }
})

let gracefulShutdown = function() {
  setTimeout(function() {
    console.log('UNCAUGHTEXCEPTION! Process %s exit', process.pid)
    process.exit(exitCode.UNCAUGHT_FATAL_EXCEPTION)
  }, 30000).unref()

  _server.close()
}
