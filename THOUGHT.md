[TOC]
一些实现tips
### soi对象
demo的配置文件可看 demo-conf.js. soi全局对象提供一些对外公用接口和实用函数(utility functions).
soi有addRule方法配置资源的线上路径, 配置结果可在多task之间共享, 每个task配置的rule可以覆盖共享的rule.
函数签名如下:
<pre>
```
soi.addRule(pattern:String|RegExp, options:Object):soi;
```
</pre>
options含有一个to的属性标示线上目录的路径, 如:
<pre>
```
soi.addRule('*.js', {
  to: 'assets/js/'
})
```
</pre>
### Task对象
task.addRule函数签名如下, options含有一个to的属性标示线上目录的路径, 如:
<pre>
```
task.addRule(pattern:String|RegExp, options:Object):Task;
```
```
task.addRule('*.js', {
  to: 'assets/js/'
});
```
</pre>

task.use函数签名如下, options含有一个to的属性标示线上目录的路径, 如:
<pre>
```
task.use(pluginName:String, options:Object):Task;
```
```
task.use('hash', {
  algorithm: 'sha1',
  length: 9,
  noname: true,
  encoding: 'base64'
});
```
</pre>
### Task执行过程
Task有两个具体实现: deploy task和release task, 共同的基类是Task.
拿到原始资源表后, 正常的构建过程和对应的方法:
1. 对源码对文本的一些处理（可选）  
   beforeCompile
2. 对js资源中require和require.async相对路径的替换，需要替换成资源id  
   compile中的resolveRelativeUrlInternal
3. 按照依赖树计算每个资源的线上路径, 这一步需要用到配置的rule规则 
   compile中的resolveProductUriInternal
4. 进行一些后处理（可选）
   postProcess
5. 对资源表进行瘦身序列化, 去掉无用属性, 合并依赖属性
   shim
6. 将资源表写入文件map.json
   flush
7. 将资源写入指定位置, deploy就是执行post上传, release是写入本地
   flush
   
这个流程不需要任何服务插件, 执行顺序和task.run方法里面的一致.
服务插件通过task.use引入并配置, 每个插件需要实现一个init方法, 传入参数当前task.
服务插件会根据本插件的功能覆盖task中的带有Internal后缀的方法（这些方法是插件扩展方法）,
而其他公用的方法和_开头的私有方法不允许被覆盖.

如replacer插件会在1.阶段进行文本替换,此时replacer插件的实现方式有两种:
1. 覆盖task的beforeCompileInternal方法实现对资源表中资源内容的replace替换
2. 监听task的beforeStart事件, 在开始编译前完成文本替换.

插件的初始化顺序是按照task.use的调用顺序执行. 但每个插件关注的功能点不同, 所以很可能监听不同的事件
或者覆盖不同的方法, 若出现不同插件覆盖同一方法的地方, 按照插件的初始化顺序覆盖.


### 非基础服务插件
此类插件的执行和原理同基础服务插件一样, 不同的是这些插件的代码独立于soi代码
并且命名通过soi.task.plugin.[pluginName]标示, 此类插件task会直接require插件名字.
而插件本身应该首先被npm install到全局或者local