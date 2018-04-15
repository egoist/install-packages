// @ts-check
const fs = require('fs')
const promisify = require('./promisify')

exports.writeFile = promisify(fs.writeFile)
