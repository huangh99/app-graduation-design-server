// 导入数据库操作模块
const db = require('../db/index')
// 导入bcrypt.js依赖包
const bcrypt = require('bcryptjs')
// 导入生成token的包
const jwt = require('jsonwebtoken')
// 导入全局的配置文件
const config = require('../config')

// 注册新用户的处理函数
exports.logon = (req, res) => {
  // 获取客户端提交到服务器的用户信息
  const userInfo = req.body
  // 对表单中的数据进行合法性的校验
  // if (!userInfo.username || !userInfo.password) {
  //   return res.cc('用户名或密码不合法！')
  // }
  // 定义SQL语句，查询用户名是否被占用
  const sqlStr = 'select * from app_users where username=?'
  db.query(sqlStr, userInfo.username, (err, results) => {
    // 执行SQL语句失败
    if (err) {
      return res.cc(err)
    }
    // 判断用户名是否被占用
    if (results.length > 0) {
      return res.cc('用户名被占用，请更换其他用户名!')
    }
    // 调用bcrypt.hashSync()对密码进行加密
    userInfo.password = bcrypt.hashSync(userInfo.password,10)
    // 定义插入新用户的SQL语句
    const sql = 'insert into app_users set ?'
    // 调用db.query()执行SQL语句
    db.query(sql, { username: userInfo.username, password: userInfo.password }, (err, results) => {
      // 判断SQL语句是否执行成功
      if (err) return res.cc(err)
      // 判断影响行数是否为1
      if (results.affectedRows != 1) return res.cc('注册用户失败，请稍后再试！')
      // 注册用户成功
      res.cc('注册用户成功！', 0)
    })
  })
}

// 登录的处理函数
exports.login = (req, res) => {
  // 接收表单数据
  const userInfo = req.body
  // 定义SQL语句
  const sql = 'select * from app_users where username=?'
  // 执行SQL语句，根据用户名查询用户信息
  db.query(sql, userInfo.username, (err, results) => {
    // 执行SQL语句失败
    if(err) return res.cc(err)
    // 执行SQL语句成功,但是获取数据条数不等于1
    if(results.length!=1) return res.cc('用户名不存在！')
    // 判断密码是否正确
    const compareResult = bcrypt.compareSync(userInfo.password,results[0].password)
    // 密码错误，登录失败
    if(!compareResult) return res.cc('登录失败！密码错误！')
    // 密码正确，在服务器端生成token字符串
    const user = {...results[0],password:'',user_pic:''}
    // 对用户的信息进行加密，生成token字符串
    const tokenStr = jwt.sign(user,config.jwtSecretKey,{expiresIn:config.expiresIn})
    // 调用res.send()将token响应给客户端
    res.send({
      status: 0,
      message: '登陆成功！',
      data: {     
        token: 'Bearer ' + tokenStr
      }
    })
  })
}