## 构建工具一些实现tips
Date: 2015-12-11


### 编码约定
1. 公用方法和属性正常驼峰命名
2. 私有方法和属性加前缀`_`, 并且外部模块不应直接调用和覆盖
3. 可被扩展的方法以`Internal`为后缀
4. 每个方法实现加注释不超过200行代码, 每个模块实现加注释不超过1000行代码, 过长考虑拆分
5. 注释要有完整的函数签名, 参见 [google的参数规范说明](https://developers.google.com/closure/compiler/docs/js-for-compiler?hl=en#tags)

### 示例配置
soi添加共享规则
<pre>
soi
    .addRule(/merchant\/img\/.*\.png$/, {
      to: 'static/images/'
    })
    .addRule(/merchant\/(.*)\/.*\.js$/, {
      to: 'static/js/'
    });
</pre>
task配置
<pre>
soi.release.task('dev',
    {
      to: '../dist/',
      mapTo: '../build/map.json',
      cacheTo: '../build/.cache',
      loader: [
        soi.Loaders.JSLoader,
      	soi.Loaders.CSSLoader
      ],
      scandirs: ['.'],
      ignorePaths: noop,
      cmdWrapper: {
        define: '__d',
        usestrict: true,
        commentdoc: '/* Built by @Saber.T */'
      }
    })
    .use('replacer', {
      '__NAVBAR__': function($0, $1) {
        if ($0 === '__NAVBAR__') {
          return 'zhida.baidu.com'
        }
      }
    })
    .use('less')
    .use('css')
    .use('hash', {
      algorithm: 'sha1',
      length: 9,
      noname: true,
      encoding: 'base64'
    })
    .use('uglify', {
      debug: false,
      curl: true,
      eqeqeq: false
    })
    .use('soi.task.plugin.tplloader', {
      left: '{{',
      right: '}}'
    });
</pre>

### soi对象

soi全局对象提供一些对外公用接口和实用函数(utility functions).

soi有addRule方法配置资源的线上路径, 配置结果可在多task之间共享, 每个task配置的rule可以覆盖共享的rule. 
函数签名如下:
<pre>
soi.addRule(pattern:String|RegExp, options:?Object):soi;
</pre>
options含有一个to的属性标示线上目录的路径, 如:
<pre>
soi.addRule('*.js', {
  to: 'assets/js/'
});
</pre>
### Task对象
task.addRule函数签名如下, options含有一个to的属性标示线上目录的路径, 如:
<pre>
task.addRule(pattern:String|RegExp, options:Object):Task;
</pre>
<pre>
task.addRule('*.js', {
  to: 'assets/js/'
});
</pre>

task.use函数签名如下, options含有一个to的属性标示线上目录的路径, 如:
<pre>
task.use(pluginName:String, options:?Object):Task;
</pre>
<pre>
task.use('hash', {
  algorithm: 'sha1',
  length: 9,
  noname: true,
  encoding: 'base64'
});
</pre>

### Task执行过程的关键步骤(lifetime)
Task有两个具体实现: DeployTask 和 ReleaseTask, 共同的基类是Task. 
拿到原始资源表后, 正常的构建过程和对应的**方法**:

1. 对源码对文本的一些处理（可选）  
   
   `beforeCompile`
2. 对js资源中require和require.async相对路径的替换，需要替换成资源id
   
   `compile`
3. 按照依赖树计算每个资源的线上路径, 这一步需要用到配置的rule规则
   
   `resolveProductUriInternal`
4. 进行一些后处理（可选） 
   
   `postProcess`
5. 对资源表进行瘦身序列化, 去掉无用属性, 合并依赖属性
   
   `shim`
6. 将资源表写入文件map.json 
   
   `flush`
7. 将资源写入指定位置, deploy就是执行post上传, release是写入本地
   
   `flush`
   
**代码构建这个流程本身不需要任何服务插件也可以完成**, 执行顺序和task.run方法里面的一致.

### Task的插件
服务插件通过task.use引入并配置, **插件的目的是为了构建过程添砖加瓦, 构建流程并不应该依赖于插件才能存活**.

每个插件需要实现一个init方法, 传入参数当前task.
<pre>
// 配置插件
Task.prototype.use = function(plug, options) {
  this.plugins.add(plug, options);
};

// 在task开始执行的时候应用插件
Task.prototype.apply = function() {
  this.plugins.forEach(function(plug) {
    plug.init(this);
  }, this);
};

// 每个插件应该实现名为init的方法
Plugin.prototype.init = function(task) {
  // 插件代码
  // 可以覆盖task的插件扩展点方法
  // 也可以监听必要事件完成插件功能
  // task的所有公用属性和方法都可用,
  // 调用task.getResourceMap()得到资源表对象
};
</pre>

服务插件会根据本插件的功能覆盖task中的带有`Internal`后缀的方法（这些方法是插件扩展方法）, 
而其他公用的方法和`_`开头的私有方法不允许被覆盖.
如: 

replacer插件会在上述的步骤1阶段进行文本替换, 此时replacer插件的实现方式有两种:

* 覆盖task的beforeCompileInternal方法实现对资源表中资源内容的replace替换
* 监听task的beforeStart事件, 在开始编译前完成文本替换.


插件的初始化顺序是按照task.use的调用顺序执行. 但每个插件关注的功能点不同, 所以很可能监听不同的事件
或者覆盖不同的方法, 若出现不同插件覆盖同一方法的地方, 按照插件的初始化顺序覆盖.


### 非基础（第三方）服务插件
此类插件的执行和原理同基础服务插件一样, 不同的是这些插件的代码独立于soi代码, 并且命名通过
soi.task.plugin.[pluginName]标示, 此类插件task会直接require插件名字.

插件本身应该首先被npm install到全局或者local.

