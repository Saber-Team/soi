##SOI是什么?
SOI(Smart Optimization Integration)是和[oslojs](https://github.com/Saber-Team/SogouJS)一同使用的一款浏览器端
JavaScript构建工具, 基于Node开发。[oslojs](https://github.com/Saber-Team/SogouJS)是一个符合AMD规范的高度模块化的
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
