const { jsontreedb } = require('./index.js')
const yaml = require('js-yaml')

function sameJSON (expected, actual) {
  if (JSON.stringify(expected) === JSON.stringify(actual)) {
    process.stdout.write('.')
  } else {
    console.error('Expected: ', expected, 'Got: ', actual)
    throw new Error('Did not get the expected value')
  }
}

function same (expected, actual) {
  if (expected === actual) {
    process.stdout.write('.')
  } else {
    console.error('Expected: ', expected, 'Got: ', actual)
    throw new Error('Did not get the expected value')
  }
}

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
    let expected = { booking: { one: { token: 'tokenOne' }, two: { arr: { 0: 'zero', 1: 'one', 2: 'two' }, token: 'tokenTwo' } } }
    sameJSON(expected, await db.get(''))
    expected = { one: { token: 'tokenOne' }, two: { arr: { 0: 'zero', 1: 'one', 2: 'two' }, token: 'tokenTwo' } }
    sameJSON(expected, await db.get('booking'))
    sameJSON({ token: 'tokenOne' }, await db.get('booking/one'))
    sameJSON({ arr: { 0: 'zero', 1: 'one', 2: 'two' }, token: 'tokenTwo' }, await db.get('booking/two'))
    sameJSON('tokenOne', await db.get('booking/one/token'))
    await db.put('booking/one/token', `updated
`)
    sameJSON('updated\n', await db.get('booking/one/token'))
    same(`booking:
  one:
    token: |
      updated
  two:
    arr:
      '0': zero
      '1': one
      '2': two
    token: tokenTwo
`, yaml.safeDump(await db.get('')))
    same(yaml.safeDump(await db.get('')), yaml.safeDump(await db.get()))
    // await db.put('booking/two/token', null)
    await db.put('booking/two', null)
    same(`booking:
  one:
    token: |
      updated
`, yaml.safeDump(await db.get('')))

    await db.put('booking/one', { 'notToken': 'value' })
    same(`booking:
  one:
    notToken: value
`, yaml.safeDump(await db.get()))
    // Notice that the keys are in sort order, not in insert order
    await db.patch('booking/one', { 'aToken': 'tokenValue' })
    same(`booking:
  one:
    aToken: tokenValue
    notToken: value
`, yaml.safeDump(await db.get()))
    console.log('\nSuccess.')
  } catch (e) {
    console.error(e)
  }
}

main()
