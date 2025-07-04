# mock

## 安装

```
npm install @vpsvl/mock -D
```

## 使用

```javascript
import Mock from '@vpsvl/mock';

// 扩展占位符方法直接在Mock.random上定义方法即可, 属性名必须以custom开头
Mock.random.customExample = () => Mock.random.pick(['成功', '失败']);

const data = Mock.mock({
  code: '200',
  data: {
    'list|1-5': [
      {
        'id|+1': 1,
        name: '@cname',
      },
    ],
  },
  message: '@customExample'
});
```

## 一、数据模板定义

数据模板中的每个属性由3部分构成： 属性名name, 生成规则rule(可选), 属性值value。
```
'name|rule': value
```
* 属性名 和 生成规则 之间用竖线 | 分隔。
* 生成规则 是可选的。
* 生成规则 有7种格式：

```
'name|min-max': value
'name|count': value
'name|min-max.dmin-dmax': value
'name|min-max.dcount': value
'name|count.dmin-dmax': value
'name|count.dcount': value
'name|+step': value
```

1. 属性值是字符串 String

```
// 通过重复 string 生成一个字符串，重复次数大于等于 min，小于等于 max。
'name|min-max': string

// 通过重复 string 生成一个字符串，重复次数等于 count。
'name|count': string
```

2. 属性值是数字 Number

```
// 属性值自动加 1，初始值为 number。
'name|+1': number

// 生成一个大于等于 min、小于等于 max 的整数，属性值 number 只是用来确定类型。
'name|min-max': number

// 生成一个浮点数，整数部分为count，小数部分保留dcount位。
'name|count.dcount': number

// 生成一个浮点数，整数部分大于等于 min、小于等于 max，小数部分保留 dmin 到 dmax 位。
'name|min-max.dmin-dmax': number
```

3. 属性值是布尔型 Boolean

```
// 随机生成一个布尔值，值为 true和 false 的概率是 1/2。
'name|1': boolean

// 随机生成一个布尔值，值为 boolean 的概率是 min / (min + max)，值为 !boolean 的概率是 max / (min + max)。
'name|min-max': boolean
```

4. 属性值是对象 Object

```
// 从属性值 object 中随机选取 count 个属性。
'name|count': object

// 从属性值 object 中随机选取 min 到 max 个属性。
'name|min-max': object
```

5. 属性值是数组 Array
   
```
// 通过重复 array 里的属性值生成一个新数组，重复次数为 count。
'name|count': array

// 通过重复 array 里的属性值生成一个新数组，重复次数大于等于 min，小于等于 max。
'name|min-max': array

// 从属性值 array 中顺序选取 1 个值。
'name|+1': array
```

## 二、数据占位符定义

* 用`@`来标识其后的字符串是 占位符。
* 占位符 引用的是 `Mock.random` 中的方法。

[//]: # (* 通过 Mock.Random.extend&#40;&#41; 来扩展自定义占位符。)

`Mock.random`提供的完整占位符方法如下：

### Basic

#### 1. boolean / bool

* @boolean()

返回随机布尔值

#### 2. natural

* @natural()

* @natural(min)

* @natural(min, max)

返回随机自然数

参数min为最小值(不传默认0)，可选

参数max为最大值，可选

#### 3. integer / int

* @integer()

* @integer(min)

* @integer(min, max)

返回随机整数

参数min为最小值，可选

参数max为最大值，可选

#### 4. float

* @float()

* @float(min, max, dmin, dmax)

返回随机整数

参数min为整数部分的最小值

参数max为整数部分的最大值

参数dmin为小数部分的最小位数

参数dmax为小数部分的最大位数

任意一个参数都可以省略，参数的意义按照以上顺序来

#### 5. character / char

* @character()

* @character(pool)

返回一个随机字符

参数pool表示字符池，将从中选取一个，不传或者传入了`lower` 、 `upper`、`number`、`symbol`，表示从内置的字符池从选取：

```
{
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    number: "0123456789",
    symbol: "!@#$%^&*()[]"
 }
```

#### 6.string

* @string()

* @string(length)

* @string(pool, length)

* @string(min, max)

* @string(pool, min, max)

返回一个随机字符串

参数length表示字符串长度

参数min表示字符串的最小长度

参数max表示字符串的最大长度

参数pool表示字符池，将从中选取一个，不传或者传入了`lower` 、 `upper`、`number`、`symbol`，表示从内置的字符池从选取：

```
{
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    number: "0123456789",
    symbol: "!@#$%^&*()[]",
}
```

#### 7. range

* @range(start)

* @range(start, stop)

* @range(start, stop, step)

返回一个随机整型数组

参数start表示数组中整数的起始值，必选

参数stop表示数组中整数的结束值，可选

参数step表示数组中整数之间的差，可选

### Date

参数format都是表示日期格式，常用格式为`yyyy-MM-dd hh:mm:ss`，可根据日期类型从中选取一部分

#### 1. date

* @date()

* @date(format)

返回一个随机日期

参数format默认格式为`yyyy-MM-dd`

#### 2. time

* @time()

* @time(format)

返回一个随机时间

参数format默认格式为`hh:mm:ss`

#### 3. datetime

* @datetime()

* @datetime(format)

返回一个随机日期和时间

参数format默认格式为`yyyy-MM-dd hh:mm:ss`

#### 4. now

* @now()

* @now(format)

返回当前时间

参数format默认格式为`yyyy-MM-dd hh:mm:ss`

### Image

#### 1. image / img

* @image()

* @image(size)

* @image(size, background)

* @image(size, background, text)

参数size表示图片的宽和高，格式为`宽x高`，不带单位，可选

参数background表示图片的背景色，可选

参数text表示图片上的文字。默认值为参数 size，可选

### Color

* @color(type)

参数`type`可选`hex`, `rgb`, `rgba`, 默认`hex`

* @hex()

* @rgb()

* @rgba()

返回对应格式的随机色

### Text

所有英文格式的在前边加字母`c`表示对应的中文格式

1. paragraph（返回英文）和 cparagraph（返回中文）

* @paragraph()

* @paragraph(length)

* @paragraph(min, max)

随机生成一个文本段落

参数length表示段落中句子的个数

参数min表示段落中句子的最小个数

参数max表示段落中句子的最大个数

2. sentence（返回英文）和 csentence（返回中文）

* @sentence()

* @sentence(length)

* @sentence(min, max)

随机生成一个句子

参数length表示句子中单词的个数（中文是汉字的个数）

参数min表示句子中单词的最小个数

参数max表示句子中单词的最大个数

3. word（返回英文）

* @word()

* @word(length)

* @word(min, max)

随机生成一个英文单词

参数length表示单词中字母的个数

参数min表示单词中字母的最小个数

参数max表示单词中字母的最大个数

4. cword（返回中文）

* @cword()

* @cword(pool)

* @cword(length)

* @cword(pool, length)

* @cword(min, max)

* @cword(pool, min, max)

随机生成一个汉字字符串

参数pool表示汉字字符池，可使用字符串自己定义

参数length表示字符串中汉字的个数

参数min表示字符串中汉字的最小个数

参数max表示字符串中汉字的最大个数

5. title（返回英文）和 ctitle（返回中文）

* @title()

* @title(length)

* @title(min, max)

随机生成一句标题，英文的每个单词的首字母大写。

参数length表示标题中单词（汉字）的个数

参数min表示标题中单词（汉字）的最小个数

参数max表示标题中单词（汉字）的最大个数

### Name

* @first()

随机生成一个常见英文名

* @last()

随机生成一个常见英文姓

* @name()

随机生成一个常见英文姓名

* @cfirst()

随机生成一个常见中文名

* @clast()

随机生成一个常见中文姓

* @cname()

随机生成一个常见中文姓名

### Web

1. url

* @url()

* @url(protocol)

随机生成一个url

参数protocol表示url协议，例如`http`

2. email

* @email()

* @email(domain)

随机生成一个email

参数domain表示email的域名，即@后的部分

### Address

* @region()

随机生成一个大区

* @province()

随机生成一个

* @city()

随机生成一个市，传入true会带上省

* @county()

随机生成一个县，传入true会带上省、市

* @zip()

随机生成一个邮编

### Helper

* @order(arg1, arg2, ...args)

按照参数的顺序取值，取到最后一个后再从第一个开始取值

* @pick(arg1, arg2, ...args)

从参数数组中随机选取一个元素，并返回。

* @guid()

随机生成一个guid，类似uuid

* @id()

随机生成一个18位的身份证号
