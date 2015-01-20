##SOI是什么?
SOI(Smart Optimization Integration)是和[oslojs](https://github.com/Saber-Team/oslojs)一同使用的一款浏览器端
JavaScript构建工具, 基于Node开发。[oslojs](https://github.com/Saber-Team/oslojs)是一个符合AMD规范的高度模块化的
JavaScript框架, 在浏览器端尤其表现卓越, 并且也支持移动端开发.

##安装SOI
确保本地安装了Node环境, 通过包管理器NPM进行安装.

运行：
```javascript
  npm install -g soi-cli
```
安装SOI的命令行交互工具, 需要加-g全局安装标志.
接着运行：
```javascript
  npm install -g soi
```
安装SOI, 建议加-g全局安装标志, 这样可以在任意目录使用SOI构建前端项目.

##使用SOI
在任意目录建立你的代码仓库, 开发完毕后在此目录添加两个配置文件：
```javascript
  soi.conf.js
  uglify.compress.conf.js
```
在SOI的安装目录下会有两个示例文件, 第一个是针对SOI本身的打包设置; 第二个是压缩js代码时的uglify配置文件.

##SOI配置项
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
SOI支持代码以AMD方式编写，所以需要模块加载器作为输入，这里提供的加载器文件会在首屏打包文件的第一个位置出现。
