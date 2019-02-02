const { put, patch, get, open } = require('./index.js')
const yaml = require('js-yaml')

const main = async () => {
  try {
    const db = open('./db')
    const data = {
      booking: {
        one: {
          token: 'tokenOne'
        },
        two: {
          token: 'tokenTwo',
          undef: undefined,
          nu: null,
          empty: {},
          arr: ['zero', 'one', 'two']
        }
      }
    }
    await put(db, '', data)
    console.log(await get(db, ''))
    console.log(await get(db, 'booking'))
    console.log(await get(db, 'booking/one'))
    console.log(await get(db, 'booking/two'))
    console.log(await get(db, 'booking/one/token'))
    await put(db, 'booking/one/token', `updated
`)
    console.log(await get(db, 'booking/one/token'))
    console.log(yaml.safeDump(await get(db, '')))
    // await put(db, 'booking/two/token', null)
    await put(db, 'booking/two', null)
    console.log(yaml.safeDump(await get(db, '')))
    await put(db, 'booking/one', { 'notToken': 'value' })
    console.log(yaml.safeDump(await get(db, '')))
    await patch(db, 'booking/one', { 'token': 'tokenValue' })
    console.log(yaml.safeDump(await get(db, '')))
  } catch (e) {
    console.error(e)
  }
}

main()
