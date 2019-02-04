const { jsontreedb } = require('./index.js')
const yaml = require('js-yaml')

const main = async () => {
  try {
    const db = jsontreedb('./db')
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
    await db.put('', data)
    console.log(await db.get(''))
    console.log(await db.get('booking'))
    console.log(await db.get('booking/one'))
    console.log(await db.get('booking/two'))
    console.log(await db.get('booking/one/token'))
    await db.put('booking/one/token', `updated
`)
    console.log(await db.get('booking/one/token'))
    console.log(yaml.safeDump(await db.get('')))
    // await db.put('booking/two/token', null)
    await db.put('booking/two', null)
    console.log(yaml.safeDump(await db.get('')))
    await db.put('booking/one', { 'notToken': 'value' })
    console.log(yaml.safeDump(await db.get('')))
    await db.patch('booking/one', { 'token': 'tokenValue' })
    console.log(yaml.safeDump(await db.get('')))
  } catch (e) {
    console.error(e)
  }
}

main()
