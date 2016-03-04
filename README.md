[![Build status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![Downloads][downloads-image]][downloads-url]
[![License][license-image]][license-url]

<style></style>

## soi是什么
S.O.I (<em style="color:rgb(0,249,89)">S</em>mart <em style="color:rgb(72,128,255)">O</em>ptimization 
<em style="color:rgb(255,141,123)">I</em>ntegration) 是一个前端项目构建打包构建工具，内部集成了[neo](https://github.com/AceMood/neo) 作为其资源扫描器，soi相当于neo的后处理服务，提供常见的打包插件，如压缩、合并、文件指纹、CommonJS包装、less解析等等。

## 安装soi
确保本地安装了Node环境，通过包管理器NPM进行安装。

**注意**：

若安装过v0.14.0之前版本的 **soi**，需要通过以下命令卸载依赖的soi-cli

```
npm uninstall -g soi-cli
```
原因是老版本的 **soi** 绑定命令行执行是由soi-cli模块实现的，而新版的 **soi** 内部就直接通过package.json绑定了，不再需要soi-cli模块。

如第一次安装 **soi**，或者之前没有安装过soi-cli，则直接运行以下脚本：

```
  npm install -g soi
```

安装新版本 **soi** 切记加-g全局安装标志，这样可以在任意目录使用 **soi** 构建前端项目。

## 使用soi
在任意目录建立你的代码仓库，开发完毕后在此目录添加配置文件：
```
  soi.conf.js
```
在soi的安装目录samples下会有示例项目。


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