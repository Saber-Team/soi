__Build Info__

[![project][project-image]][project-url]
[![Build status][travis-image]][travis-url]
[![Dependency Status][david-image]][david-url]

__Downloads Info__

[![Downloads][downloads-image]][downloads-url]
[![Downloads][downloads-all-image]][downloads-url]

__Miscellaneous__

[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![maintain][maintain-image]][project-url]

## 前端构建工具

<img src="./doc/assets/sloc.png" alt="sloc stats" style="display: inline-block; position: relative; width: 80%; height: auto;" />

**soi** 是一个前端项目构建打包构建工具, 内部集成了 [neo](https://github.com/AceMood/neo) 作为其资源扫描器, soi 相当于 neo 的后处理服务, 提供常见的打包插件, 如压缩, 合并, 文件指纹, CommonJS包装, less解析等等。

在整个前端工程化的体系中, **soi** 作为构建工具所承载的任务和角色如下图所示,

<img src="./doc/assets/arch.png" alt="sloc stats" style="display: inline-block; position: relative; width: 80%; height: auto;" />

## 处理流程

<img src="./doc/assets/workflow.png" alt="workflow" style="display: inline-block; position: relative; width: 80%; height: auto;" />

大致如流程图所示:

1. 利用 neo-core 模块扫描工程目录下的所有匹配文件, 解析记录其中依赖关系
2. 得到原始的依赖关系表后做一次输出, 给接下来的外部程序
3. soi 作为 neo-core 的外部使用程序得到原始表后根据用户配置进行一系列编译操作
4. 将操作后的文件内容和简化后的资源表一并写入到配置指定的磁盘位置

之所以说大致, 是因为有一些细节和机制随时调整, 比如编译缓存的实现。但于整体来说流程没有改变过, 插件机制也没有改变过。最终生成的资源表有两个, 一个记录单独资源格式大致如下, 结合服务端资源加载框架, 可以实现类似bigpipe, quickling, bigrender等多种加载方式。另一个是packages.json存放打包信息, 单独存放是便于自动打包系统实现后的集成, 可由系统自动生成此文件而不必改动资源表文件。

```
{
    "resource": {
        "js": {
            "Backbone": {
                "uri": "https://bd.static0.com/dev/static/bb/7fedd6102.backbone.js",
                "type": "js",
                "path": "src/bb/backbone.js",
                "localPathName": "/static/bb/7fedd6102.backbone.js",
                "version": "7fedd6102",
                "deps": [
                    "underscore",
                    "jquery"
                ]
            },
            "jquery": {
                "uri": "https://bd.static0.com/dev/static/bb/5cd353a52.jquery.js",
                "type": "js",
                "path": "src/bb/jquery.js",
                "localPathName": "/static/bb/5cd353a52.jquery.js",
                "version": "5cd353a52"
            },
            "underscore": {
                "uri": "https://bd.static0.com/dev/static/bb/71b05f21b.underscore.js",
                "type": "js",
                "path": "src/bb/underscore.js",
                "localPathName": "/static/bb/71b05f21b.underscore.js",
                "version": "71b05f21b"
            }
        },
        "css": {
            "icon-style": {
                "uri": "https://bd.static0.com/dev/static/css/82e2712e8.font.css",
                "type": "css",
                "path": "src/css/font.css",
                "localPathName": "/static/css/82e2712e8.font.css",
                "version": "82e2712e8",
                "within": [
                    "p0"
                ]
            },
            "reset-style": {
                "uri": "https://bd.static0.com/dev/static/css/566f3b0ba.reset.css",
                "type": "css",
                "path": "src/css/reset.css",
                "localPathName": "/static/css/566f3b0ba.reset.css",
                "version": "566f3b0ba",
                "within": [
                    "p0"
                ]
            },
            "main": {
                "uri": "https://bd.static0.com/dev/static/css/31d9b6967.withId.css",
                "type": "css",
                "path": "src/css/withId.css",
                "localPathName": "/static/css/31d9b6967.withId.css",
                "version": "31d9b6967",
                "within": [
                    "p0"
                ]
            }
        }
    },
    "paths": {
        "src/bb/backbone.js": "Backbone",
        "src/bb/jquery.js": "jquery",
        "src/bb/underscore.js": "underscore",
        "src/css/font.css": "icon-style",
        "src/css/reset.css": "reset-style",
        "src/css/withId.css": "main"
    },
    "cssClassMap": {}
}
```

## 安装
确保本地安装了 node 安装包(大于v4.0.0版本), 通过包管理器 npm 进行安装. 

**注意**：

若安装过v0.14.0之前版本的 **soi**, 需要通过以下命令卸载依赖的 soi-cli

```
 $ npm uninstall -g soi-cli
```
原因是老版本的 **soi** 绑定命令行执行是由 soi-cli 模块实现的, 而新版的 **soi** 内部就直接通过 package.json 的 bin 字段绑定了, 不再需要 soi-cli 模块. 

如第一次安装 **soi**, 或者之前没有安装过 soi-cli, 则直接运行以下脚本：

```
 $ npm install -g soi
```

安装新版本 **soi** 切记加 -g 全局安装标志, 这样可以在任意目录使用 **soi** 构建前端项目. 

接着安装 soi 依赖模块, 进入 soi 模块的安装目录, 运行

```
 $ npm install
```

## 使用
在任意目录建立你的代码仓库, 开发完毕后在此目录添加配置文件：
```
  soi.conf.js
```
在 soi 的安装目录 samples 下会有示例项目, 分别对应 **soi release** 任务和 **soi deploy** 任务, 可作参考。

**注意**：
资源扫描器在扫描目录的时候默认会跳过`_`开头的文件名, 在一些预处理插件中可以把诸如提供假数据的js文件或者抽想出来的变量、函数
的less文件名改成`_`开头, 在产出时不会产生空文件. 另一种做法是配置扫描器的ignorePaths属性或者插件的ignore属性(内置插件都
支持), 这个函数可以接受文件的工程路径作为参数, 返回true则表示忽略此资源. 

### 配置

soi 通过命令行执行操作, 默认当前目录为所要扫描的工程目录。在配置文件中通过全局soi对象提供的api进行配置, 全部方法可以从[这里找到](./doc/soi.api.md), 常用方法有:

### soi.addRule

为多个构建任务添加全局共享的打包路径规则, 例

```
soi.addRule(/src\/(.*)\/(.*)/, {
	to : function($0, $1, $2) {
    	return [domain + '/static', $1, $2].join('/');
    }
})
```
会匹配工程目录下路径类似`src/js/jquery.js`的所有资源, 将其线上打包路径设置为`https://s0.db.com/static/js/jquery.js`. addRule的第二个参数也可以为一个字符串配置, 例

```
soi.addRule(/src\/(.*)\/(.*)/, '/static/$1/')
```

注意: 

1. task.addRule第二个参数传字符串不用自己拼接domain的设置, soi会自动加上为task设置的domain属性. 但是如果第二个参数传函数就需要自己拼接.
2. task.addRule第二个参数传字符串


### soi.config.get

### soi.config.set

### soi.release.task

### soi.deploy.task


## 预处理器

**soi** 内部目前提供以下预处理器, 无需安装其他模块可直接使用:

### less预编译器

将.less后缀的文件编译成css文件。有些less文件分离了函数和相关变量, 这部分less文件在编译后不会有内容, 但资源表会记录。为此可将这部分文件命名为 `_xxx.less` 的形式, 扫描器内部会自动忽略以 `_` 开头的文件。
 
### babel-es2015编译器

将es6语法的js文件编译成es5语法。不建议妄加使用, 虽然[Reactjs](https://facebook.github.io/react/)生态如日中天, 但也有其弊端。跟本插件相关的就是编译后产出代码的冗余, 比如每个使用class extends关键字的模块都会生成继承语句包裹在每个模块内部, 除非加上额外提取的处理, 否则编译后的文件每个会有约900字节的冗余, 对于加载速度要求较高的场景不适用。

### babel-jsx编译器

编译jsx文件为普通的js文件, 若使用jsx语法但并未引入es6的预编译, 这个插件的使用还是比较方便, 基于[Reactjs](https://facebook.github.io/react/)的场景可以使用。

## 插件体系

soi 内部集成了如下插件, 无需安装其他模块可直接使用: 

### modulewrapper

结合[kerneljs](https://github.com/AceMood/kerneljs/)模块加载器的代码wrapper功能, 将普通代码封装为CommanJS格式。简单场景可以使用。

### modux

结合[modux](https://github.com/AceMood/modux/)模块加载器的代码wrapper功能, 将普通代码封装为amdJS格式。modux是最新的加载器实现, 基于资源表能够更好的和工程化结合, 提升异步加载速度以及模块定义相关操作的稳定性, gzip后该库大小在**1.4kb**左右。

### uglifier



### replacer



### clean-css



### idgenerator



### fingerprint



### packager


## 最后
**soi** 力求future proof, 包括其插件体系的实现. 分离编译工具为资源扫描和后处理服务插件正是为此. 灵感和启发来自于 Facebook 的 **Haste Internal System**, 国内方面前辈有百度的 **F.I.S**. 

未实现的部分或者还不满意的部分[参见todo](./doc/todos.md), 其中最迫不及待就是对于html静态资源的扫描和基于ipc方式实现的编译缓存. 


[travis-image]: https://img.shields.io/travis/Saber-Team/soi.svg
[travis-url]: https://travis-ci.org/Saber-Team/soi

[npm-image]: https://img.shields.io/npm/v/soi.svg
[npm-url]: https://npmjs.org/package/soi
[node-image]: https://img.shields.io/node/v/soi.svg
[node-url]: https://npmjs.org/package/soi

[david-image]: http://img.shields.io/david/Saber-Team/soi.svg
[david-url]: https://david-dm.org/Saber-Team/soi

[coveralls-image]: https://img.shields.io/coveralls/Saber-Team/soi.svg
[coveralls-url]: https://coveralls.io/r/Saber-Team/soi?branch=master

[license-image]: http://img.shields.io/npm/l/soi.svg
[license-url]: LICENSE.md

[maintain-image]: https://img.shields.io/badge/maintained-Yes-blue.svg

[project-image]: https://img.shields.io/badge/soi-Excellent-brightgreen.svg
[project-url]: https://github.com/Saber-Team/soi

[downloads-image]: https://img.shields.io/npm/dm/soi.svg
[downloads-url]: https://npmjs.org/package/soi
[downloads-all-image]: https://img.shields.io/npm/dt/soi.svg

[coverage-image]: https://api.codacy.com/project/badge/coverage/43c442e150024a5fb80c876bb426c139
[codacy-image]: https://api.codacy.com/project/badge/grade/43c442e150024a5fb80c876bb426c139
[codacy-url]: https://www.codacy.com/app/zmike86/neo