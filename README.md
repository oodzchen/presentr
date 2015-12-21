Presentr.js
===

A light weight HTML presentation framework

## Usage
  - [EN](./doc/guide-en.md "english")
  - [ZH](./doc/guide-zh.md "chinese")

## Dist/Build
You should use files under `dist/` folder for productions, files under `build/` folder is only for developement purpose.

### Build
Be sure you have install the `gulp-cli` at first

```shell
$ npm install --global gulp
```

install all dependencies:

```shell
$ npm install
```

build the developement version of Presentr.js

```shell
$ gulp build
```

The result is available in `build/` folder.

### Release
After you have made build:

```shell
$ gulp dist
```

Distributalble version will available in `dist/` folder.

## Run the demo
You can run the demo if you have build the files

```
$ gulp server
```

## Browser Support
Compatible with most of the modern browsers (Chrome, Firefox, Opera, IE10+), include the moblie platforms.

## License
Copyright (c) 2015 Lin Chen. Licensed under [The MIT License (MIT)](https://opensource.org/licenses/MIT)