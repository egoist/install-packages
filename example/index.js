const path = require('path')
const fs = require('fs')
const rm = require('rimraf')
const install = require('../lib')

fs.writeFileSync('./example/package.json', '{}', 'utf8')

install(['buble-loader'], path.resolve('example'), {
  peerFilter: name => name !== 'webpack'
}).then(() => {
  rm.sync('example/{package.json,yarn.lock,node_modules}')
})
