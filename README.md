# 校宝加盟-品牌端-前端项目
***

### 场景
***
* 用户从buc登录后，进入品牌端，可对页面进行筛选，暂时有“加盟”、“课程”、“报表”三个模块。

## 安装
***
项目地址：（`git clone`）
```shell
  git clone git@git-server.chinaeast.cloudapp.chinacloudapi.cn:jiameng/pinpai_front.git
```

通过`npm`或者`yarn`安装本地服务第三方依赖模块,
```shell
  npm install
```
或者
```shell
  yarn install
```

## 启动(接下来都直接使用yarn，如果习惯npm直接替换掉yarn就可以)
***
##### 启动服务(http://localhost:8084/)
  * 本地起服务打包的js在内存内
```
  yarn start
```

##### 发布代码
  * 本打包命令实现多文件打包,打包出来的文件在dist文件中
```
  yarn run build
```

## Explain

### 目录结构 ###
***
<pre>
├── webpack.config.dll.js    // webpack DLL配置
├── webpack.config.js        // 构建服务和webpack配置
├── webpack.dev.js           // 开发环境，webpack配置
├── webpack.prod.js          // 生产环境，webpack配置
├── postcss.config.js        // postcss的配置文件，用于解析css,并将前缀添加到CSS规则 
├── dist                     // 项目build目录
├── index.html               // 项目入口文件
├── package.json             // 项目配置文件
├── src                      // 生产目录
│   ├── app                  // js入口文件夹，打包入口文件夹
│   ├── components           // 各种组件都存放此处
│   ├── db                   // 所有的请求配置放在这个文件夹
│   │   ├── dbFactory.js     // 请求操作方法文件
│   │   └── index.js         // 请求入口文件
│   ├── modules              // 所有的模块文件夹
│   │                        // 后期希望模块可以按照各个页面进行分类，比较方便
│   └── pages                // 页面管理文件夹
         ├── ...files        // 所需要的页面文件
         ├── base.css        // 页面中公共的css样式
         └── events.js       // 组件通信，fbemitter
</pre>