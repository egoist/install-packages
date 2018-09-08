// @ts-check
const path = require('path')
const commandExists = require('command-exists')
const JoyCon = require('joycon')
const parse = require('parse-package-name')
const fs = require('./fs')
const promisify = require('./promisify')
const logger = require('./logger')
const emoji = require('./emoji')
const pipeSpawn = require('./pipeSpawn')
const PromiseQueue = require('./PromiseQueue')

// eslint-disable-next-line import/order
const resolve = promisify(require('resolve'))

const joycon = new JoyCon()

async function install(options) {
  options = Object.assign({
    cwd: process.cwd(),
    installPeers: true,
    saveDev: false
  }, options)

  let {
    packages,
    cwd,
    installPeers,
    saveDev,
    packageManager,
    args: _args,
    logTitle
  } = options

  if (logTitle !== false) {
    if (packages) {
      logger.status(emoji.progress, `Installing ${packages.join(', ')}...`)
    } else {
      logger.status(emoji.progress, `Installing packages...`)
    }
  }

  const packageLocation = await joycon.resolve({
    files: ['package.json'],
    cwd
  })

  const installCwd = packageLocation ?
    path.dirname(packageLocation) :
    process.cwd()

  if (!packageManager) {
    packageManager = await determinePackageManager(cwd)
  }

  const commandToUse = packages ?
    packageManager === 'npm' ?
      'install' :
      'add' :
    'install'
  const args = [commandToUse, ...(packages || []), ...(_args || [])]
  if (saveDev && packages) {
    args.push(packageManager === 'npm' ? '-D' : '--dev')
    args.push('-D')
  }

  // npm doesn't auto-create a package.json when installing,
  // so create an empty one if needed.
  if (packageManager === 'npm' && !packageLocation) {
    await fs.writeFile(path.join(cwd, 'package.json'), '{}')
  }

  await pipeSpawn(packageManager, args, {
    cwd: installCwd
  })

  if (installPeers) {
    if (packages) {
      await Promise.all(
        packages.map(async p => {
          const [resolved] = await resolve(parse(p).name, { basedir: cwd })
          await installPeerDependencies(path.dirname(resolved), cwd, options)
        })
      )
    } else {
      await installPeerDependencies(cwd, cwd, options)
    }
  }
}

/**
 * Install peer dependencies
 * @param {string} cwd The directory to find package.json
 * @param {string} installDir The directory to install peer dependencies
 * @param {*} options
 */
async function installPeerDependencies(cwd, installDir, options) {
  const { data: pkg } = await joycon.load({
    files: ['package.json'], cwd
  })
  const peers = pkg.peerDependencies || {}

  const packages = []
  for (const peer in peers) {
    if (!options.peerFilter || options.peerFilter(peer, peers[peer])) {
      packages.push(`${peer}@${peers[peer]}`)
    }
  }

  if (packages.length > 0) {
    await install(
      Object.assign({}, options, {
        packages,
        cwd: installDir,
        installPeers: false
      })
    )
  }
}

async function determinePackageManager(cwd) {
  const configFile = await joycon.resolve({
    files: ['yarn.lock', 'package-lock.json'],
    cwd
  })

  const configName = configFile && path.basename(configFile)

  if (configName === 'package-lock.json') {
    return 'npm'
  }

  const hasYarn = await checkForYarnCommand()
  return hasYarn ? 'yarn' : 'npm'
}

let hasYarn = null
async function checkForYarnCommand() {
  if (hasYarn !== null) {
    return hasYarn
  }

  try {
    hasYarn = await commandExists('yarnpkg')
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
