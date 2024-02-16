## 1.更改盒模型
```
*{
    box-sizing:border-box;
}
```
box-sizing 属性允许您以特定的方式定义匹配某个区域的特定元素。

例如，假如您需要并排放置两个带边框的框，可通过将 box-sizing 设置为 "border-box"。这可令浏览器呈现出带有指定宽度和高度的框，并把边框和内边距放入框中。
## 2.生成圆
```
{
    width:100px;
    height:100px;
    border-radius:50px;or50%
    overflow:hidden 隐藏多余部分
}
```
## 3.绝对定位
```
#father{
    position:relative;   
}
#fative div:first-child{
    position:absolute;
}
```
## 4.垂直水平居中
外围用div包裹id=wrapper
```
#wrapper{
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
}
```
## 5.媒体查询
```
@media(max-width:500px)
```