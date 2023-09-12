// 导入express
const express = require('express')
// 导入Joi验证规则的包
const Joi = require('joi')
// 导入bady-parser
const bodyParser = require('body-parser')

// 创建服务器的实例对象
const app = express()

// 导入并配置cors中间件
const cors = require('cors')
app.use(cors())

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
// 配置解析表单数据的中间件  注意：只能解析application/x-www-form-urlencoded格式的数据
// app.use(express.urlencoded({ extended: false }))

// 在路由之前封装res.cc函数
app.use((req, res, next) => {
  // status默认值为1，表示失败的情况
  // err的值可能是一个错误对象，也可能是一个错误的描述字符串
  res.cc = function (err, status = 1) {
    res.send({
      status,
      message: err instanceof Error? err.message : err
    })
  }
  next()
})

// 在路由之前配置解析Token的中间件
const expressJWT = require('express-jwt') 
// 导入配置文件
const config = require('./config')

app.use(expressJWT({secret:config.jwtSecretKey}).unless({path:[/^\/api\//,/^\/cms\//]}))

// 导入并使用用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)
// 导入并使用用户信息的路由模块
const userInfoRouter = require('./router/userInfo')
app.use('/my', userInfoRouter)
// 导入并使用文章路由模块
const articleRouter = require('./router/article')
app.use('/article', articleRouter)
// 导入并使用视频路由模块
const videoRouter = require('./router/video')
app.use('/video',videoRouter)
// 导入并使用其他功能路由模块
const moreRouter = require('./router/more')
app.use('/more', moreRouter)
// 导入并使用后台管理路由模块
const cmsRouter = require('./router/cms')
app.use('/cms',cmsRouter)

// 定义错误级别的中间件
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof Joi.ValidationError) return res.cc(err)
  // 身份认证失败导致的错误
  if (err.name === 'UnauthorizedError') {
    return res.send({
      status: 401,
      message:'身份认证失败！'
    })
  }
  // 未知的错误
  res.cc(err)
})

// 启动服务器
app.listen(3007,() => {
  console.log('api server running at http://127.0.0.1:3007');
})