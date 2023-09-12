// 导入数据库操作模块
const db = require('../db/index')
// 导入moment时间格式化模块
const moment = require('moment')

const urlencode = require('urlencode')
const request = require('request')

// 获取签到信息的处理函数
exports.getSignIn = (req, res) => {
  const sql = 'select * from app_signin where user_id=?'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取用户签到信息失败！')
    const total_days = results.length
    const today = moment().format('YYYY-MM-DD')
    const is_sign = results.some((item) => {
      return item.date===today
    })
    const sql = 'select date from app_signin where user_id=? and month=? and year = ?'
    db.query(sql, [req.user.id, req.query.month, req.query.year], (err, results) => {
      if (err) return res.cc(err)
      res.send({
        status: 0,
        message: '获取用户签到信息成功！',
        data: {
          total_days: total_days,
          days: results,
          is_sign: is_sign
        }
      })
    })
  })
}

// 签到的处理函数
exports.updateSignIn = (req, res) => {
  const now = moment(req.body.date)
  const day = moment(now).date() // 日
  const month = moment(now).month() + 1 // 月
  const year = moment(now).year() // 年
  const sql = 'insert into app_signIn (user_id,day,month,year,date) values(?,?,?,?,?)'
  db.query(sql, [req.user.id, day, month, year,req.body.date], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新签到信息失败！')
    const sql = 'update app_users set point_num=point_num+5 where id=?'
    db.query(sql, req.user.id, (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新积分信息失败！')
      res.send({
        status: 0,
        message: '更新签到与积分信息成功！'
      })
    })
  })
}

// 添加待办事件的处理函数
exports.addTodo = (req, res) => {
  const sql = 'insert into app_user_todo (user_id,content,date,time) values (?,?,?,?)'
  db.query(sql, [req.user.id, req.body.content, req.body.date, req.body.time], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) res.cc('新增待办事项失败！')
    res.send({
      status: 0,
      message: '新增待办事项成功！'
    })
  })
}

// 获取待办事件的处理函数
exports.getTodoList = (req, res) => {
  const sql = 'select * from app_user_todo where user_id=? order by id desc'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('当前用户无待办事项！')
    res.send({
      status: 0,
      message: '获取待办事项成功！',
      data: results
    })
  })
}

// 获取歌曲信息的处理函数
exports.getSongInfo = (req, res) => {
  const sql = 'select * from app_songs'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取歌曲信息失败！')
    res.send({
      status: 0,
      message: '获取歌曲信息成功！',
      data:results
    })
  })
}

// 发布提问的处理函数
exports.postInquiry = (req, res) => {
  const sql = 'insert into app_community_inquiry (content,questioner_id,cate,time) values (?,?,?,?)'
  const time = moment().format('YYYY-MM-DD HH:mm:ss')
  db.query(sql, [req.body.content, req.user.id, req.body.cate, time], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('添加提问信息失败！')
    res.send({
      status: 0,
      message: '添加提问信息成功！'
    })
  })
}

// 获取提问列表的处理函数
exports.getInquiryList = (req, res) => {
  const sql = 'select a.*,b.username,b.nickname,b.user_pic as questioner_pic,c.name as tag_name from app_community_inquiry as a,app_users b,app_article_cate c where a.questioner_id=b.id and c.id=a.cate order by a.id desc'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) res.cc('查询问题列表失败！')
    results.forEach((item) => {
      item.questioner_name = item.nickname ? item.nickname : item.username
      delete item.nickname
      delete item.username
    })
    const start = (req.query.page-1)*5
    const dataList = results.splice(start, 5)
    if (dataList.length === 0) return res.cc('没有更多文章信息!')
    res.send({
      status: 0,
      message: '查询问题列表成功！',
      data:dataList
    })
  })
}

// 获取提问详情的处理函数
exports.getInquiryDetail = (req, res) => {
  const sql = 'select a.*,b.username,b.nickname,b.user_pic as questioner_pic,c.name as tag_name from app_community_inquiry as a,app_users b,app_article_cate c where a.id=? and a.questioner_id=b.id and c.id=a.cate'
  db.query(sql, req.params.inquiry_id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) res.cc('查询提问详情失败！')
    const data = results[0]
    data.questioner_name = data.nickname ? data.nickname : data.username
    delete data.nickname
    delete data.username
    res.send({
      status: 0,
      message: '查询提问详情成功！',
      data: data
    })
  })
}

// 发布回答的处理函数
exports.postAnswer = (req, res) => {
  const sql = 'update app_community_inquiry set reply_num = reply_num+1 where id=?'
  db.query(sql, req.body.questionId, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新回答数量失败！')
    const sql = 'insert into app_community_answer (content,answerer_id,time,question_id) values (?,?,?,?)'
    const time = moment().format('YYYY-MM-DD HH:mm:ss')
    db.query(sql, [req.body.content, req.user.id, time, req.body.questionId], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) res.cc('发布回答信息失败！')
      res.send({
        status: 0,
        message: '发布回答信息成功！'
      })
    })
  })
}

// 获取回答信息的处理函数
exports.getAnswerList = (req, res) => {
  const sql = 'select a.*,b.username,b.nickname,b.user_pic as answerer_pic from app_community_answer as a,app_users b where a.question_id=? and a.answerer_id=b.id order by a.id desc'
  db.query(sql, req.query.questionId, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('暂无回答信息！')
    results.forEach(item => {
      item.answerer_name = item.nickname ? item.nickname : item.username
      delete item.nickname
      delete item.username
    })
    let answerList  = results
    const sql = 'select * from app_community_user_star_answer where user_id=?'
    db.query(sql, req.user.id, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) {
        answerList.forEach(item => {
          item.is_star = 0
        })
      } else {
        answerList.forEach(item => {
          item.is_star = 0
          results.forEach(val => {
            if (val.answer_id === item.id) {
              item.is_star = val.is_star
            }
          })
        })
      }
      const start = (req.query.page-1)*5
      const dataList = answerList.splice(start, 5)
      if (dataList.length === 0) return res.cc('没有更多回答信息!')
      res.send({
        status: 0,
        message: '获取回答信息成功！',
        data: dataList
      })
    })
  })
}

// 点赞回答的处理函数
exports.addStarAnswer = (req, res) => {
  const sql = 'update app_community_answer set star_num=star_num+1 where id=?'
  db.query(sql, req.body.answerId, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) res.cc('更新点赞数量失败！')
    const sql = 'select * from app_community_user_star_answer where user_id=? and answer_id=?'
    db.query(sql, [req.user.id, req.body.answerId], (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) {
        const sql = 'insert into app_community_user_star_answer (user_id,answer_id) values (?,?)'
        db.query(sql, [req.user.id, req.body.answerId], (err, results) => {
          if (err) return res.cc(err)
          if (results.affectedRows !== 1) res.cc('新增点赞关系失败！')
          res.send({
            status: 0,
            message: '新增点赞关系成功！'
          })
        })
      } else {
        const sql = 'update app_community_user_star_answer set is_star=1 where user_id=? and answer_id=?'
        db.query(sql, [req.user.id, req.body.answerId], (err, results) => {
          if(err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('更新点赞关系失败！')
          res.send({
            status: 0,
            message: '更新点赞关系成功！'
          })
        })
      }
    })
    
  })
}

// 取消点赞回答的处理函数
exports.cancelStarAnswer = (req, res) => {
  const sql = 'update app_community_answer set star_num=star_num-1 where id=?'
  db.query(sql, req.body.answerId, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新点赞数量失败！')
    const sql = 'update app_community_user_star_answer set is_star=0 where user_id=? and answer_id=?'
    db.query(sql, [req.user.id, req.body.answerId], (err, results) => {
      if(err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新点赞关系失败！')
      res.send({
        status: 0,
        message: '更新点赞关系成功！'
      })
    })
  })
}

// 更新阅读次数的处理函数
exports.updateReadNumber = (req, res) => {
  const sql = 'update app_community_inquiry set read_num=read_num+1 where id=?'
  db.query(sql, req.body.questionId, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新阅读数量失败！')
    res.send({
      status: 0,
      message: '更新阅读数量成功！'
    })
  })
}

// 智能回复的处理函数
exports.getReply = (req, res) => {
  request('http://api.qingyunke.com/api.php?key=free&appid=0&msg='+urlencode(req.query.msg), (err, response, body) => {
    if (!err && response.statusCode == 200) {
      const result = JSON.parse(body)
      const content = result.content.replace(/{br}|\s{2,}/g,"<br>")
      res.send({
        status: 0,
        message: '获取回复信息成功！',
        data: content
      })
    }
  })
}

// 获取积分兑换列表的处理函数
exports.getPointExchange = (req, res) => {
  const sql = 'select * from app_exchange'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('查询积分兑换列表失败！')
    const list = results
    const sql = 'select * from app_user_exchange where user_id=?'
    db.query(sql, req.user.id, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) {
        list.forEach((item) => {
          item.is_exchange = 0
        })
      } else {
        list.forEach(item => {
          item.is_exchange=0
          results.forEach(value => {
            if (item.id === value.exchange_id) {
              item.is_exchange=value.is_exchange
            }
          })
        })
      }
      res.send({
        status: 0,
        message: '查询积分兑换列表成功！',
        data: list
      })
    })
  })
}

// 积分兑换的处理函数
exports.addPointExchange = (req, res) => {
  const sql = 'insert into app_user_exchange (user_id,exchange_id) values (?,?)'
  db.query(sql, [req.user.id, req.body.exchange_id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('添加兑换信息失败！')
    const sql = 'update app_users set point_num=point_num-? where id=?'
    db.query(sql, [req.body.point, req.user.id], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新积分信息失败！')
      res.send({
        status: 0,
        message: '添加兑换信息并更新积分信息成功！'
      })
    })
  })
}

// 更新积分信息的处理函数
exports.updatePointInfo = (req, res) => {
  const sql = 'update app_users set point_num=point_num+? where id=?'
  db.query(sql, [req.body.num, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新积分信息失败！')
    res.send({
      status: 0,
      message: '更新积分信息成功！'
    })
  })
}

// 获取用户课程的处理函数
exports.getUserCurriculum = (req, res) => {
  const sql = 'select a.* from app_exchange as a,app_user_exchange b where b.user_id=? and a.id=b.exchange_id'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('未查询到课程数据！')
    res.send({
      status: 0,
      message: '查询课程数据成功！',
      data: results
    })
  })
}