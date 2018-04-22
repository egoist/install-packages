# install-packages [![NPM version](https://img.shields.io/npm/v/install-packages.svg?style=flat-square)](https://npmjs.com/package/install-packages) [![NPM downloads](https://img.shields.io/npm/dm/install-packages.svg?style=flat-square)](https://npmjs.com/package/install-packages) [![Build Status](https://img.shields.io/circleci/project/egoist/install-packages/master.svg?style=flat-square)](https://circleci.com/gh/egoist/install-packages)

Programmatically install npm packages.

This is used by [webpack-proxy](https://github.com/egoist/webpack-proxy), here's a preview:

<img src="https://cdn.rawgit.com/egoist/76286067838fbd60db786b5a75df386c/raw/63a63a8f0a732f17e38427e33daa8ab79beec7d6/webpack-proxy.svg" alt="preview" width="500">

## Install

```bash
yarn add install-packages
```

## Usage

```js
const install = require('install-packages')

install({
  packages: ['webpack', 'mocha']
})
//=> Promise
```

## API

### install(options)

#### options

##### packages

Type: `string[]`

You can omit this to install dependencies from `package.json`.

##### cwd

Type: `string`<br>
Default: `process.cwd()`

The directory to install packages.

##### installPeers

Type: `boolean`<br>
Default: `true`

Install peer dependencies for corresponding dependency.

##### peerFilter

Type: `(name: string, version: string) => boolean`

A function to filter peerDependencies, return `true` to install it, `false` otherwise.

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
