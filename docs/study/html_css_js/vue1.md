## 1.浅谈vue $mount()

```vue
new Vue({

​		 router,//路由

​		 store,//根实例状态存储，子组件通过 this.$store 访问

​		 render: h => h(App),//App组件渲染，这里是h即是vm.$createElement，遍是在vm._render这个阶段

​		 data:{

​		 //

  		}

}).$mount('#app')
```
## 2.vue.config.js配置
### 2.1vue配置自定义路径 ###
```

npm  install  path  --save
const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir);
}
 
module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set("@", resolve("src"))
      .set("assets", resolve("src/assets"))
      .set("components", resolve("src/components"))
      .set("base", resolve("baseConfig"))
      .set("public", resolve("public"));
  },
}
```
### 2.2vue打包去除console ###
```
npm  install  uglifyjs-webpack-plugin  --save

const UglifyJsPlugin = require("uglifyjs-webpack-plugin"); // 引入插件

module.exports = {
  configureWebpack: {
    optimization: {
      minimizer: [
        new UglifyJsPlugin({
          uglifyOptions: {
            compress: {
              warnings: false,
              drop_console: true, //console
              drop_debugger: false,
              pure_funcs: ["console.log"] //移除console
            }
          }
        })
      ]
    }
  },
}
```
## 3vue引入本地图片
```
require('@/assets/xx.png') //由于vue编译最后图片存放在img目录下，不使用require会导致图片路径不对
```