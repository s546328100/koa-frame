export interface request {
  (obj: any): any
}

export default async function(obj: any) {
  let results: any = {}

  let promises = []
  for (let key in obj) {
    let promise = obj[key]
    results[key] = undefined

    if (promise && promise.then)
      promises.push(
        promise.then(function(result: any) {
          results[key] = result
        })
      )
    else results[key] = promise
  }

  return Promise.all(promises).then(function() {
    return results
  })
}
