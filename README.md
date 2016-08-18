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

## soi前端工程化工具

<img src="./doc/assets/sloc.png" alt="sloc stats" style="display: inline-block; position: relative; width: 80%; height: auto;" />

**s.o.i** 是一个前端项目构建打包构建工具, 内部集成了 [neo](https://github.com/AceMood/neo) 作为其资源扫描器, soi 相当于 neo 的后处理服务, 提供常见的打包插件, 如压缩, 合并, 文件指纹, CommonJS包装, less解析等等. 

## 处理流程

<img src="./doc/assets/workflow.png" alt="workflow" style="display: inline-block; position: relative; width: 80%; height: auto;" />

大致如流程图所示:

1. 利用 neo-core 模块扫描工程目录下的所有匹配文件, 解析记录其中依赖关系
2. 得到原始的依赖关系表后做一次输出, 给接下来的外部程序
3. soi 作为 neo-core 的外部使用程序得到原始表后根据用户配置进行一系列编译操作
4. 将操作后的文件内容和简化后的资源表一并写入到配置指定的磁盘位置

之所以说大致, 是因为有一些细节和机制随时调整, 比如编译缓存的实现。但于整体来说流程没有改变过, 插件机制也没有改变过。最终生成的资源表格式大致如下（部分）, 结合服务端资源加载框架, 可以实现类似bigpipe, quickling, bigrender等多种加载方式。

```
{
    "resource": {
        "css": {
            "reset-style": {
                "uri": "https://fbstatic.com/static/css/Vm87C6yZl.reset.css",
                "type": "css",
                "within": [
                    "p0"
                ]
            },
            "main": {
                "uri": "https://fbstatic.com/static/css/sBb7WjS1h.withId.css",
                "type": "css",
                "within": [
                    "p0"
                ]
            },
            "YG9FV": {
                "uri": "https://fbstatic.com/static/css/47bCoH0Nq.inlineImage.css",
                "type": "css",
                "within": [
                    "p0"
                ]
            }
        },
        "js": {
            "app": {
                "uri": "https://fbstatic.com/static/app/uJscvoH_I.app.js",
                "type": "js",
                "within": [
                    "p1"
                ],
                "deps": [
                    "AQJGK",
                    "zMZ2x",
                    "T4EMD"
                ],
                "asyncLoaded": [
                    "tospe"
                ]
            },
            "Foo": {
                "uri": "https://fbstatic.com/static/es2015/W1qlh6ATN.class.js",
                "type": "js"
            },
            "vrcode": {
                "uri": "https://fbstatic.com/static/js/v8T_eWYja.vrcode.js",
                "type": "js"
            },
            "base": {
                "uri": "https://fbstatic.com/static/js/SZyUOjeH4.withId.js",
                "type": "js"
            },
            "react-app": {
                "uri": "https://fbstatic.com/static/jsx/GxOJM6+cT.app.jsx",
                "type": "js",
                "deps": [
                    "math"
                ]
            },
            "math": {
                "uri": "https://fbstatic.com/static/jsx/MnPvjDU8m.math.js",
                "type": "js"
            },
            "AQJGK": {
                "uri": "https://fbstatic.com/static/app/iVzvT46_t.moduleA.js",
                "type": "js",
                "within": [
                    "p1"
                ],
                "css": [
                    "a5tlT"
                ]
            },
            "WlvnF": {
                "uri": "https://fbstatic.com/static/jsx/cIU1ZS86W.module.js",
                "type": "js",
                "deps": [
                    "math"
                ]
            }
        }
    },
    "pkgs": {
        "p0": {
            "uri": "https://fbstatic.com/static/pkg/88ml9AhKX.pkg.build.css",
            "has": [
                "main",
                "reset-style"
            ]
        }
    },
    "paths": {
        "src/app/app.js": "app",
        "src/es2015/class.js": "Foo",
        "src/js/vrcode.js": "vrcode",
        "src/js/withId.js": "base",
        "src/jsx/math.js": "math",
        "src/jsx/app.jsx": "react-app",
        "src/app/moduleA.js": "AQJGK",
        "src/app/moduleB.js": "zMZ2x",
        "src/app/moduleC.js": "T4EMD",
        "src/app/vrcode.js": "tospe",
        "src/es2015/arrow.js": "Iu6OX",
        "src/js/asyncRequire.js": "dj5Pa",
        "src/js/entry.js": "sWXOl",
        "src/js/inlineTest.js": "27kaY",
        "src/js/noId.js": "fvr+Q",
        "src/js/syncRequire.js": "GwHRf",
        "src/js/uriTest.js": "XvY+s",
        "src/jsx/module.js": "WlvnF",
        "src/css/reset.css": "reset-style",
        "src/css/withId.css": "main",
        "src/app/moduleA.css": "a5tlT",
        "src/css/inlineImage.css": "YG9FV",
        "src/css/mangle.css": "+mruT",
        "src/css/plain.css": "mFLE6",
        "src/less/detail.less": "JAhPf",
        "src/less/dialog.less": "e6fCE",
        "src/less/empty.less": "zhSrg",
        "src/less/import.less": "UVPXf",
        "src/less/purecss.less": "J0bO1",
        "src/less/shop_list.less": "Dez3f",
        "src/less/verify_list.less": "xI2wM"
    },    
    "cssClassMap": {}
}
```

## 安装
确保本地安装了 node 安装包(大于v4.0.0版本), 通过包管理器 npm 进行安装. 

**注意**：

若安装过v0.14.0之前版本的 **soi**, 需要通过以下命令卸载依赖的 soi-cli

```
npm uninstall -g soi-cli
```
原因是老版本的 **soi** 绑定命令行执行是由 soi-cli 模块实现的, 而新版的 **soi** 内部就直接通过 package.json 的 bin 字段绑定了, 不再需要 soi-cli 模块. 

如第一次安装 **soi**, 或者之前没有安装过 soi-cli, 则直接运行以下脚本：

```
  npm install -g soi
```

安装新版本 **soi** 切记加 -g 全局安装标志, 这样可以在任意目录使用 **soi** 构建前端项目. 

接着安装 soi 依赖模块, 进入 soi 模块的安装目录, 运行

```
npm install
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

### soi.config.get

### soi.config.set

### soi.release.task

### soi.deploy.task


## 预处理器

**soi** 内部目前提供以下预处理器, 无需安装其他模块可直接使用:

### less预编译器
### babel-es2015编译器
### babel-jsx编译器


## 插件

soi 内部集成了如下插件, 无需安装其他模块可直接使用: 

### modulewrapper

### uglifier

### replacer

### clean-css

### idgenerator

### fingerprint

### packager

## 未来
**soi** 力求future proof, 包括其插件体系的实现. 分离编译工具为资源扫描和后处理服务插件正是为此. 灵感和启发来自于 Facebook 的 **Haste Internals**, 国内方面前辈有百度的 **F.I.S**. 

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