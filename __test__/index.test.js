const path = require('path')
const fs = require('fs')
const rm = require('rimraf')
const install = require('../lib')

jest.setTimeout(30000)

const fixture = (...args) => {
  return path.join(__dirname, 'fixture', ...args)
}

const cleanup = () => {
  rm.sync('__test__/fixture/*/{node_modules,package.json,yarn.lock,package-lock.json}')

  fs.readdirSync(fixture()).forEach(name => {
    fs.writeFileSync(fixture(name, 'package.json'), '{}', 'utf8')
  })
}

beforeAll(() => {
  cleanup()
})

afterAll(() => {
  cleanup()
})

test('simple', async () => {
  await install({
    packages: ['buble-loader'],
    cwd: fixture('simple'),
    peerFilter(name) {
      return name !== 'webpack'
    }
  })
  const { dependencies } = require(fixture('simple/package.json'))
  expect(Object.keys(dependencies)).toEqual(['buble', 'buble-loader'])
})
