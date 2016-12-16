## 属性

#### soi.Loaders



## 方法

#### soi.addRule(pattern, option): soi

* **pattern {string|Regexp}** 匹配模式, glob string或者正则
* **option {object}**
	* **to {function|string}** 线上路径

为多个构建任务添加全局共享的打包路径规则, 例

```
soi.addRule(/src\/(.*)\/(.*)/, {
	to : function($0, $1, $2) {
    	return [domain + '/static', $1, $2].join('/');
    }
})
```
会匹配工程目录下路径类似`src/js/jquery.js`的所有资源, 将其线上打包路径设置为`https://s0.db.com/static/js/jquery.js`. addRule的第二个参数的`to`也可以为一个字符串配置, 例

```
soi.addRule(/src\/(.*)\/(.*)/, {
	to: '/static/$1/'
})
```

注意: 

1. task.addRule第二个参数传字符串不用自己拼接domain的设置, soi会自动加上为task设置的domain属性. 但是如果第二个参数传函数就需要自己拼接.
2. task.addRule第二个参数传字符串, 无需考虑文件名字, 只需指定目录即可, 若`to`最后未加上系统的目录分隔符, 构建工具也会自行加上

#### soi.addCompiler(resourceType, compiler): void

* **resourceType {string}** 资源类型, 可以是css, js, image, font的一种或自定义的类型
* **compiler {object}** 编译函数对象

针对特定类型资源添加编译函数. compiler对象必须含有`exec`的函数, 在编译过程中, 流程会将当前编译资源resource, 
当前资源表对象task.map, 线上路径生成规则hit, 以及构建流程自身task通过形参传递给`exec`函数完成编译. 

一般情况下不需要覆盖常规的资源类型的编译对象, soi内置的编译函数会妥当处理资源的编译. 若需要添加自定义类型则可参考
[js compiler](https://github.com/Saber-Team/soi/blob/master/lib/compiler/js.js).

#### soi.getCompiler(resourceType): compiler

返回特定资源的编译器对象. compiler只是一个Object的实例且包含`exec`方法.

#### soi.config.get

#### soi.config.set

#### soi.release.task(name, option): ReleaseTask

* **name {string}** 构建任务的名称
* **option {object}** 任务配置对象
	* **dir {string}** 相对工程目录的目录地址, 用于存放打包后的静态文件
    * **mapTo {string}** 相对工程目录的目录地址, 用于存放打包后的资源表文件
    * **domain {string}** 资源线上cdn的地址, 如 'https://s0.bdstatic.com/'
    * **scandirs {Array.\<string\>}** 扫描的相对工程目录的目录, 如 `['src']`
    * **loaders {Array.<ResourceLoader>}** 要扫描的文件类型, 不同类型对应soi.Loaders的一个属性, 传入即可, 如 
    
    ``` javascript 
    [
    	new soi.Loaders.JSLoader(),
    	new soi.Loaders.CSSLoader()
    ]
    ```
    
    * **pack {object}** 文件合并配置, 需要和packger插件配合使用, 配置是参考如下代码:
     
    ``` javascript
    {
    	'/static/pkg/build.css': ['src/css/*.css'],
        '/static/pkg/build.js': ['src/app/*.js']
    }
    ```
      
    * **preserveComments {boolean}** 打包是否保留注释

返回生成的release类型的task, 用于构建工程目录下的代码. ReleaseTask的相关API可以[看这里](./doc/api/task.md)

#### soi.deploy.task(name, option): DeployTask

* **name {string}** 构建任务的名称
* **option {object}** 任务配置对象
	* **dir {string}** 相对工程目录的目录地址, 用于存放打包后的静态文件
    * **mapTo {string}** 相对工程目录的目录地址, 用于存放打包后的资源表文件
    * **domain {string}** 资源线上cdn的地址, 如 'https://s0.bdstatic.com/'
    * **scandirs {Array.\<string\>}** 扫描的相对工程目录的目录, 如 `['src']`
    * **loaders {Array.<ResourceLoader>}** 要扫描的文件类型, 不同类型对应soi.Loaders的一个属性, 传入即可, 如 
    
    ``` javascript 
    [
    	new soi.Loaders.JSLoader(),
    	new soi.Loaders.CSSLoader()
    ]
    ```
    
    * **pack {object}** 文件合并配置, 需要和packger插件配合使用, 配置是参考如下代码:
     
    ``` javascript
    {
    	'/static/pkg/build.css': ['src/css/*.css'],
        '/static/pkg/build.js': ['src/app/*.js']
    }
    ```
      
    * **preserveComments {boolean}** 打包是否保留注释
    * **watch {boolean}** 是否实时根据代码改动进行构建

返回生成的release类型的task, 用于构建工程目录下的代码. DeployTask的相关API可以[看这里](./doc/api/task.md)