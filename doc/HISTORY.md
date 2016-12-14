# ChangeLog

### `v1.7.0`
* addRule的to支持function类型
* 在文件指纹的插件中实现为每个静态资源添加版本号version属性
* 修复node url模块resolve方法的实现对domain配置解析path丢失的bug
* 写文件时为每个资源加上localPathName, 方便框架读文件
* 增加对字体文件类型的编译支持

### `v1.6.0`
* 修复自测时的bug
* 增加对modux框架的支持, 添加modux插件
* 更改为apache 2.0协议

### `v1.5.0`
* 增加了babel-jsx预处理插件
* 增加了babel-es2015预处理插件
* 升级neo-core 
* bug修复

### `v1.4.4`
* 工作流的预处理机制, less不再作为插件而是预处理器存在
* Task改名为Workflow基类
* 添加tag

### `v1.4.0`
* js编译支持内置的__uri和__inline函数
* 增加更稳定和广泛的clean-css插件作为css的默认压缩工具

### `v1.3.0`
* 部分代码需要精简、格式统一
* 抽离command方便宿主对象可灵活配置
* 将联调部署用到的receiver.php添加到源码中

### `v1.2.0`
* 增加messid插件配置选项, 优化传参

### `v1.0.0`
* 版本重大升级, 代码重构和优化, master合并dev分支
* 基于资源表的架构思路, 基于插件化的开发思路
* 移除对 `soi-cli` 的依赖, node版本仅支持v4.0.0以上

### `v0.12.0`
* 增加noname配置
* 修复tpl中占位符bug

### `v0.10.12`
* swf编译不生成唯一名
* js支持cmd wrapper依赖提取打包分析 
* css支持批量文件打包

### `v0.10.8`
* 资源定位由相对路径改为绝对路径
* 增加tpl简单的基于正则的替换规定

### `v0.9.7`
* 插件化api成型
* 保持最小功能集, 只做插件容器

### `v0.9.4`
* 修复只加载local modules的bug
* 补充一些测试用例

### `v0.9.0`
* 移除optimizer功能单独作为插件
* 重构soi基础架构

### `v0.8.7`
* optimizer插件化而不是作为整个soi的功能
* soi.conf.js脚本修改成调用soi.config.extend
* 修复少量bug

### `v0.8.5`
* 稳定测试版发布，提供基本打包功能
