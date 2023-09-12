// 导入定义验证规则的包
const joi = require('joi')

// 定义用户名和密码的验证规则
const username = joi.string().alphanum().min(1).max(10).required()
const password = joi.string().pattern(/^[\S]{6,12}$/).required()

// 定义id,nickname,email的验证规则
const id = joi.number().integer().min(1).required()
const nickname = joi.string().allow('')
const email = joi.string().email().allow('')
const sex = joi.string().allow('')
const city = joi.string().allow('')
const birthday = joi.string().allow('')

// 定义验证avatar头像的验证规则
const avatar = joi.string().dataUri().required()

// 定义验证注册表单数据的规则对象
exports.reg_logon_schema = {
  body: {
    username,
    password,
    rePassword: joi.ref('password')
  }
}

// 定义验证登录表单数据的规则对象
exports.reg_login_schema = {
  body: {
    username,
    password
  }
}

// 验证规则对象 - 更新用户的基本信息
exports.update_userInfo_schema = {
  // 需要对req.body里面的数据进行验证
  body: {
    id,
    nickname,
    email,
    sex,
    birthday,
    city
  }
}

// 验证规则对象 - 更新密码
exports.update_password_schema = {
  body: {
    oldPwd: password,
    newPwd: joi.not(joi.ref('oldPwd')).concat(password)
  }
}

// 验证规则对象 - 更新头像
exports.update_avatar_schema = {
  body: {
    avatar
  }
}