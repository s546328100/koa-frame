import 'reflect-metadata'

const validateMetadataKey = Symbol('validate')
const requiredMetadataKey = Symbol('required')

function validate(target: any, propertyName: string, descriptor: any) {
  let existingValidateParameters: any[] = Reflect.getOwnMetadata(validateMetadataKey, target, propertyName) || []
  let existingRequiredParameters: {[key: string]: any} = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName) || {}

  let args = target[propertyName].toString().split('\r\n')[0].split('(')[1].split(')')[0].split(', ')
  args.forEach((e: string, i: number) => {
    let parameter = {name: e, rule: 0}
    existingRequiredParameters[i] && Object.assign(parameter, existingRequiredParameters[i])
    existingValidateParameters.push(parameter)
  })
  Reflect.defineMetadata(validateMetadataKey, existingValidateParameters, target, propertyName)

  // console.log(`||||> [${target.constructor.name}](${propertyName}): ${JSON.stringify(existingValidateParameters)}`)

  let method = descriptor.value
  descriptor.value = function() {
    let requiredParameters: any[] = Reflect.getOwnMetadata(validateMetadataKey, target, propertyName)
    let args = []
    let data
    switch (this.ctx.method) {
      case 'GET':
        data = this.ctx.query
        break
      case 'POST':
        data = this.ctx.request.body
        break
      case 'DELETE':
        data = this.ctx.query
        break
      default:
        data = this.ctx.request.body
        break
    }

    if (requiredParameters) {
      for (let parameter of requiredParameters) {
        let value = data[parameter.name]
        if (parameter.type) {
          switch (parameter.type) {
            case 'required':
              if (value === undefined || value === '') {
                let message = this.app.config.RESPOND.LACK_PARAMS
                message.param = parameter.name
                return (this.ctx.body = message)
              }
              switch (parameter.isArray) {
                case 1:
                  for (const rule of parameter.rule) {
                    for (let index = 0; index < value.length; index++) {
                      if (value[index][rule] === undefined || value[index][rule] === '') {
                        let message = this.app.config.RESPOND.LACK_PARAMS
                        message.param = parameter.name + `[${index}].` + rule
                        return (this.ctx.body = message)
                      }
                    }
                  }
                  break
                case 0:
                  for (const rule of parameter.rule) {
                    if (value[rule] === undefined || value[rule] === '') {
                      let message = this.app.config.RESPOND.LACK_PARAMS
                      message.param = parameter.name + '.' + rule
                      return (this.ctx.body = message)
                    }
                  }
                  break
              }
              break
            case 'included':
              if (!parameter.rule.includes(value)) {
                let message = this.app.config.RESPOND.PARAMS_ERROR
                message.param = parameter.name
                message.value = parameter.rule
                return (this.ctx.body = message)
              }
              break
          }
        }
        args.push(value)
      }
    }

    return method.apply(this, args)
  }
}

function required(target: any, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: {[key: string]: any} = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || {}
  existingRequiredParameters[parameterIndex] = {rule: 1, type: 'required'}
  Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey)
}

function included(arr: Array<number | string>) {
  return function(target: any, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: {[key: string]: any} = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || {}
    existingRequiredParameters[parameterIndex] = {rule: arr, type: 'included'}
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey)
  }
}

function _required(arr: Array<string>, isArray = 0) {
  return function(target: any, propertyKey: string | symbol, parameterIndex: number) {
    let existingRequiredParameters: {[key: string]: any} = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || {}
    existingRequiredParameters[parameterIndex] = {isArray, rule: arr, type: 'required'}
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey)
  }
}

export {validate, required, included, _required}
