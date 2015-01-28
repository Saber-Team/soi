[![Build status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][david-image]][david-url]
[![Downloads][downloads-image]][downloads-url]
[![License][license-image]][license-url]

<style></style>

##soi是什么?
S.O.I (Smart Optimization Integration) 是和[oslojs](https://github.com/Saber-Team/oslojs)
一同使用的一款浏览器端JavaScript构建工具, 基于Node开发。[oslojs](https://github.com/Saber-Team/oslojs)
是一个符合AMD规范的高度模块化的JavaScript框架, 在浏览器端尤其表现卓越, 并且也支持移动端开发.
soi针对单页面打包设置，若多页面可多次执行soi optimize命令。

##安装soi
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

##使用soi
在任意目录建立你的代码仓库, 开发完毕后在此目录添加配置文件：
```
  soi.conf.js
```
在soi的安装目录demo下会有个示例文件, 是针对soi本身的打包设置;

##soi optimize配置项
#### encoding
源码文件采用的编码方式, 枚举值可用'utf8', 'ascii', 'base64'。

#### debug
如果此项设置为true，则在打包过程中会打印一些过程输出值，但遇到error即便debug设置成false也会打印出错误信息。

#### base_dir
当前配置文件的基准根目录，默认是当前目录，也可以手动改

#### dist_dir
打包js文件被复制到的目录，之所以没有其他资源的目标路径是因为js对于异步按需加载的需求会远大于其他资源。
首先静态资源不会按需加载自己；其次css不建议异步加载，判断是否加载成功在各个浏览器表现非常不一致，而且css
阻塞渲染，js阻塞执行这是众所周知的用户体验缺陷，所以css建议都打包到一个文件在头部引用。（PS：为了更加的性能
优化，也可以将css移出关键路径，直接输出到模板页面，但相对的图片路径本打包工具暂不支持，现在只有外链方式打包）

#### module_loader
soi支持代码以AMD方式编写，所以需要模块加载器作为输入，这里提供的加载器文件会在首屏打包文件的第一个位置出现。

#### output_base
这是一个相对路径，基于soi.conf.js解析，意义是页面的所在位置（目录），目前用到css资源打包的时候含有滤镜的
图片路径时必须知道这个路径才能做正确改写。用途二是后续版本模板引擎的加入

#### sha1_length
每个资源哈希后缀的长度

#### bundles
bundles是一个映射对象，包含swf，font，htc，img，css，js6种类型的资源打包配置。
前4种属于纯静态资源配置，都是一样的，js和css略有不同。

**公共字段**

**input**：

指示需要依赖加载的入口，对于静态辅助资源如图片之类可以省略或者设成null。对于css打包
可以启用files字段手写一个文件数组（不能是目录，因为要保证顺序，并且文件中不能包含@import），也可以
不写files字段只写input字段指定css入口模块，而此模块中如果依赖其他css文件要以@import方式声明。
对于js资源，由于目前只支持kerneljs的AMD方式，所以所有代码需要以AMD方式写，并且模块加载器使用kerneljs。
如果使用requirejs也可以，但不支持package，path等等配置，且由于requirejs缺少kerneljs支持的require.async
接口加载异步模块，所以建议用requirejs的项目不要异步加载模块，只在部署前统一打到一个文件。

**files**：

只对图片类的静态资源有效。见input。

**defer**：

只对css和js有效。对于css静态打包到一个文件，不建议手写配置。另require.async接口只支持加载js模块。
对于js打包也不建议手写defer为true的配置，而会在源码解析时动态分析调用require.async的地方，动态增加
bundles.js数组的长度，此时所有的defer都设置为true。而对于dist_dir由于没有参考依照所以分析出的代码
会沿用全局dist_dir作为异步加载js模块的目标路径，这也是为何全局dist_dir只代表js模块的原因。

**dist_file**：

打包文件的名字，哈希后缀前的名字。对于require.async异步加载的模块会用源码的文件名。

**dist_dir**：

打包文件的目标目录。



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