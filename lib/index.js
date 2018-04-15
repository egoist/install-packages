// @ts-check
const path = require('path')
const commandExists = require('command-exists')
const JoyCon = require('joycon')
const fs = require('./fs')
const promisify = require('./promisify')
const logger = require('./logger')
const emoji = require('./emoji')
const pipeSpawn = require('./pipeSpawn')
const PromiseQueue = require('./PromiseQueue')

// eslint-disable-next-line import/order
const resolve = promisify(require('resolve'))

const joycon = new JoyCon()

async function install(modules, cwd, options = {}) {
  let { installPeers = true, saveDev = false, packageManager } = options

  logger.status(emoji.progress, `Installing ${modules.join(', ')}...`)

  const packageLocation = await joycon.resolve(['package.json'], cwd)

  const installCwd = packageLocation ?
    path.dirname(packageLocation) :
    process.cwd()

  if (!packageManager) {
    packageManager = await determinePackageManager(cwd)
  }

  const commandToUse = packageManager === 'npm' ? 'install' : 'add'
  const args = [commandToUse, ...modules]
  if (saveDev) {
    args.push(packageManager === 'npm' ? '-D' : '--dev')
    args.push('-D')
  }

  // npm doesn't auto-create a package.json when installing,
  // so create an empty one if needed.
  if (packageManager === 'npm' && !packageLocation) {
    await fs.writeFile(path.join(cwd, 'package.json'), '{}')
  }

  try {
    await pipeSpawn(packageManager, args, {
      cwd: installCwd
    })
  } catch (err) {
    throw new Error(`Failed to install ${modules.join(', ')}.`)
  }

  if (installPeers) {
    await Promise.all(
      modules.map(m => installPeerDependencies(cwd, m.split('@')[0], options))
    )
  }
}

async function installPeerDependencies(cwd, name, options) {
  const [resolved] = await resolve(name, { basedir: cwd })
  const { data: pkg } = await joycon.load(['package.json'], path.dirname(resolved))
  const peers = pkg.peerDependencies || {}

  const modules = []
  for (const peer in peers) {
    if (!options.peerFilter || options.peerFilter(peer, peers[peer])) {
      modules.push(`${peer}@${peers[peer]}`)
    }
  }

  if (modules.length > 0) {
    await install(
      modules,
      cwd,
      Object.assign({}, options, { installPeers: false })
    )
  }
}

async function determinePackageManager(cwd) {
  const configFile = await joycon.resolve(
    ['yarn.lock', 'package-lock.json'],
    cwd
  )
  const hasYarn = await checkForYarnCommand()

  // If Yarn isn't available, or there is a package-lock.json file, use npm.
  const configName = configFile && path.basename(configFile)
  if (!hasYarn || configName === 'package-lock.json') {
    return 'npm'
  }

  return 'yarn'
}

let hasYarn = null
async function checkForYarnCommand() {
  if (hasYarn !== null) {
    return hasYarn
  }

  try {
    hasYarn = await commandExists('yarn')
  } catch (err) {
    hasYarn = false
  }

  return hasYarn
}

const queue = new PromiseQueue(install, { maxConcurrent: 1, retry: false })

function installPackages(...args) {
  queue.add(...args)
  return queue.run()
}

installPackages.determinePackageManager = determinePackageManager

module.exports = installPackages
