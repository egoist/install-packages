# install-packages [![NPM version](https://img.shields.io/npm/v/install-packages.svg?style=flat-square)](https://npmjs.com/package/install-packages) [![NPM downloads](https://img.shields.io/npm/dm/install-packages.svg?style=flat-square)](https://npmjs.com/package/install-packages) [![Build Status](https://img.shields.io/circleci/project/egoist/install-packages/master.svg?style=flat-square)](https://circleci.com/gh/egoist/install-packages)

Programmatically install npm packages.

## Install

```bash
yarn add install-packages
```

## Usage

```js
const install = require('install-packages')

install(['webpack', 'mocha'])
//=> Promise
```

## API

### install(packages, [cwd], [options])

#### packages

Type: `string[]`

#### cwd

Type: `string`<br>
Default: `process.cwd()`

The directory to install packages.

#### options

##### installPeers

Type: `boolean`<br>
Default: `true`

Install peer dependencies for corresponding dependency.

##### saveDev

Type: `boolean`<br>
Default: `false`

Install as dev dependencies.

##### packageManager

Type: `string`<br>
Possible values: `npm` `yarn`

By default we automatically detect package manager.

### install.determinePackageManager([cwd])

Determine package manager for specifc directory.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

[MIT](https://egoist.mit-license.org/) © [EGOIST](https://github.com/egoist)
