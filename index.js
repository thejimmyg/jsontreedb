const level = require('level')
const debug = require('debug')('jsontreedb')

const jsontreedb = (path) => {
  const db = open(path)
  return {
    put: async (key, value) => {
      return put(db, key, value)
    },
    patch: async (key, value) => {
      return patch(db, key, value)
    },
    get: async (key) => {
      return get(db, key)
    }
  }
}

const open = (path) => {
  return level(path)
}

function serialize (data, options) {
  const { basePath = '.', pairs = [] } = options || {}
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      if (data[k] === null || typeof data[k] === 'undefined') {
        // Ignore it
      } else if (typeof data[k] === 'object') {
        serialize(data[k], { basePath: basePath + k + '.', pairs: pairs })
      } else {
        pairs.push([basePath + k + '.', JSON.stringify(data[k])])
      }
    }
  }
  return pairs
}

const put = async (db, key, value) => {
  await patch(db, key, null)
  await patch(db, key, value)
}

const patch = async (db, key, value) => {
  if (value === null) {
    if (key !== '') {
      key = '.' + (key.replace(/\//g, '.'))
    }
    return new Promise((resolve, reject) => {
      const gte = key + '.'
      const lt = key + '{'
      const keysPromises = []
      debug({ gte, lt })
      db.createKeyStream({ gte, lt })
        .on('data', async function (data) {
          debug('key=', data)
          keysPromises.push(db.del(data))
        })
        .on('error', function (err) {
          debug('Oh my!', err)
          reject(err)
        })
        .on('close', function () {
          debug('Stream closed')
          Promise.all(keysPromises).then((r) => { resolve(r) }).catch((e) => { reject(e) })
        })
        .on('end', function () {
          debug('Stream ended')
        })
    })
  } else {
    if (key !== '') {
      key = '.' + (key.replace(/\//g, '.')) + '.'
    }
    let pairs = []
    if (typeof value === 'object') {
      serialize(value, { basePath: (key || '.'), pairs })
    } else {
      pairs.push([key, JSON.stringify(value)])
    }
    for (let i = 0; i < pairs.length; i++) {
      await db.put(pairs[i][0], pairs[i][1])
    }
  }
}

const get = async (db, key) => {
  if (typeof key === 'undefined') {
    key = ''
  }
  if (key.endsWith('/')) {
    throw new Error('Key should not end with /')
  }
  if (key !== '') {
    key = '/' + key
  }
  return new Promise((resolve, reject) => {
    let result = {}
    const gte = key.replace(/\//g, '.') + '.'
    const lt = key.replace(/\//g, '.') + '{'
    debug({ gte, lt })
    db.createReadStream({ gte, lt })
      .on('data', function (data) {
        const skip = key.split('/').length
        let parts = data.key.split('.').slice(skip)
        parts = parts.slice(0, parts.length - 1)
        debug(`Key: '${key}', skip: ${skip}, data.key: '${data.key}', data.value: '${data.value}', parts: ${parts.join(',')}, len: ${parts.length}`)
        if (parts.length === 0) {
          result = JSON.parse(data.value)
        } else {
          let r = result
          for (let i = 0; i < parts.length - 1; i++) {
            debug('===', parts, result, r)
            if (typeof r[parts[i]] === 'undefined') {
              r[parts[i]] = {}
            }
            r = r[parts[i]]
          }
          const key = parts[parts.length - 1]
          r[key] = JSON.parse(data.value)
        }
      })
      .on('error', function (err) {
        debug('Oh my!', err)
        reject(err)
      })
      .on('close', function () {
        debug('Stream closed', result)
        if (typeof result === 'undefined') {
          reject(new Error('No such key: ' + key))
        } else {
          resolve(result)
        }
      })
      .on('end', function () {
        debug('Stream ended')
      })
  })
}

module.exports = { jsontreedb, patch, put, get, open }
