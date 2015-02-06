[![Build status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![Downloads][downloads-image]][downloads-url]
[![License][license-image]][license-url]

<style></style>

## soi是什么?
S.O.I (Smart Optimization Integration) 是和[oslojs](https://github.com/Saber-Team/oslojs)
一同使用的一款浏览器端JavaScript构建工具, 基于Node开发。[oslojs](https://github.com/Saber-Team/oslojs)
是一个符合AMD规范的高度模块化的JavaScript框架, 在浏览器端尤其表现卓越, 并且也支持移动端开发.
soi针对单页面打包设置，若多页面可多次执行soi optimize命令。

## 安装soi
确保本地安装了Node环境, 通过包管理器NPM进行安装.

运行：
```javascript
  npm install -g soi-cli
```
安装soi的命令行交互工具, 需要加-g全局安装标志.
接着运行：
```javascript
  npm install -g soi
```
安装soi, 建议加-g全局安装标志, 这样可以在任意目录使用soi构建前端项目.

## 使用soi
在任意目录建立你的代码仓库, 开发完毕后在此目录添加配置文件：
```
  soi.conf.js
```
在soi的各插件安装目录demo下会有个示例文件, 是针对插件本身的打包设置;


[travis-image]: https://img.shields.io/travis/Saber-Team/soi.svg?style=flat-square
[travis-url]: https://travis-ci.org/Saber-Team/soi
[npm-image]: https://img.shields.io/npm/v/soi.svg?style=flat-square
[npm-url]: https://npmjs.org/package/soi
[node-image]: https://img.shields.io/node/v/soi.svg?style=flat-square
[node-url]: https://npmjs.org/package/soi
[david-image]: http://img.shields.io/david/Saber-Team/soi.svg?style=flat-square
[david-url]: https://david-dm.org/Saber-Team/soi
[coveralls-image]: https://img.shields.io/coveralls/Saber-Team/soi.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/Saber-Team/soi?branch=master
[downloads-image]: http://img.shields.io/npm/dm/soi.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/soi
[license-image]: http://img.shields.io/npm/l/soi.svg?style=flat-square
[license-url]: LICENSE.md