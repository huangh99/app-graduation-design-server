// 导入数据库操作模块
const db = require('../db/index')
// 导入moment时间格式化模块
const moment = require('moment')

// 获取视频列表信息的处理函数
exports.getVideoInfo = (req, res) => {
  const sql = 'select a.*,b.username,b.nickname from app_videos as a,app_users b where a.cate_id=? and a.author_id=b.id'
  db.query(sql, req.query.cateId, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('查询视频列表失败！')
    results.forEach(val => {
      if (val.nickname) {
        val.author = val.nickname
      } else {
        val.author = val.username
      }
      delete val.nickname
      delete val.username
    })
    const start = (req.query.page-1)*5
    const dataList = results.splice(start, 5)
    if (dataList.length === 0) return res.cc('没有更多视频信息!')
    res.send({
      status: 0,
      message: '获取视频列表信息成功！',
      data: dataList
    })
  })
}

// 获取视频详情信息的处理函数
exports.getVideoDetail = (req, res) => {
  const sql = 'select a.*,b.username,b.nickname,b.user_pic as author_icon from app_videos as a,app_users b where a.id=? and a.author_id=b.id'
  db.query(sql, req.params.video_id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('查询视频详情信息失败！')
    const video = results[0]
    video.author = video.nickname ? video.nickname : video.username
    delete video.nickname
    delete video.username
    delete video.cover
    const sql = 'select is_star from app_user_star_video where video_id=? and user_id=?'
    db.query(sql, [req.params.video_id, req.user.id], (err, results) => {
      if (err) return res.cc(err)
      if (results.length !== 1) {
        video.is_star = 0
      } else if (results.length === 1) {
        video.is_star=results[0].is_star
      }
      const sql = 'select is_follow from app_user_follow_author where author_id=? and user_id=?'
      db.query(sql, [video.author_id, req.user.id], (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) {
          video.is_follow = 0
        } else if (results.length === 1) {
          video.is_follow=results[0].is_follow
        }
        res.send({
          status: 0,
          message: '获取视频详情信息成功！',
          data: video
        })
      })
    })
  })
}

// 点赞视频的处理函数
exports.addStarVideo = (req, res) => {
  const sqlStr = 'update app_videos set star_num=star_num+1 where id=?'
  db.query(sqlStr, req.body.target, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新点赞数量失败！')
    const sql = 'select * from app_user_star_video where user_id=? and video_id=?'
    db.query(sql, [req.user.id, req.body.target], (err, results) => {
      if (err) return res.cc(err)
      // SQL语句执行成功，查询是否存在对应关系
      if (results.length === 0) {
        // 不存在对应关系，向数据库添加对应关系
        const sql='insert into app_user_star_video (user_id,video_id) values (?,?)'
        db.query(sql, [req.user.id, req.body.target], (err, results) => {
          if(err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('添加点赞对应关系失败！')
          res.send({
            status: 0,
            message: '添加点赞对应关系成功！'
          })
        })
      } else {
        // 存在对应关系，向数据库修改对应关系
        const sql = 'update app_user_star_video set is_star=1 where user_id=? and video_id=?'
        db.query(sql, [req.user.id, req.body.target], (err, results) => {
          if (err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('修改点赞对应关系失败！')
          res.send({
            status: 0,
            message: '修改点赞对应关系成功！'
          })
        })
      }   
    })
  })
}

// 取消点赞视频的处理函数
exports.cancelStarVideo = (req, res) => {
  const sql = 'update app_videos set star_num=star_num-1 where id=?'
  db.query(sql, req.body.target, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) res.cc('更新点赞数量失败！')
    const sql = 'update app_user_star_video set is_star=0 where user_id=? and video_id=?'
        db.query(sql, [req.user.id, req.body.target], (err, results) => {
          if (err) return res.cc(err)
          if (results.affectedRows !== 1) return res.cc('修改点赞对应关系失败！')
          res.send({
            status: 0,
            message: '修改点赞对应关系成功！'
          })
        })
  })
}

// 发表评论的处理函数
exports.publishComment = (req, res) => {
  const sql = 'select id as commentator_id,username as commentator_name,nickname,user_pic as commentator_pic from app_users where id=?'
  db.query(sql, req.user.id, (err, results) => {
    if(err) return res.cc(err)
    if (results.length !== 1) return res.cc('查询发布者信息失败！')
    const publisher = results[0]
    publisher.commentator_name = publisher.nickname? publisher.nickname:publisher.commentator_name
    publisher.content = req.body.content
    publisher.comment_time = moment().format('YYYY/MM/DD HH:mm:ss')
    publisher.video_id=req.body.videoId
    const sql = 'insert into app_video_comment (commentator_id,commentator_name,commentator_pic,content,video_id,comment_time) values (?,?,?,?,?,?)'
    db.query(sql, [publisher.commentator_id,publisher.commentator_name,publisher.commentator_pic,publisher.content,publisher.video_id,publisher.comment_time], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('写入评论信息失败！')
      const sql = 'update app_videos set comment_num=comment_num+1 where id=?'
      db.query(sql, publisher.video_id, (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('更新评论数量失败！')
        res.send({
          status: 0,
          message: '写入评论并更新评论数量成功！'
        })
      })
    })
  })
}

// 获取评论信息的处理函数
exports.getComment = (req, res) => {
  const sql = 'select * from app_video_comment where video_id=? order by id desc'
  db.query(sql, req.params.video_id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('没有查询到评论数据！')
    let commentList = results
    const sql = 'select * from app_user_star_comment_video where user_id=?'
    db.query(sql, req.user.id, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) {
        commentList.forEach((val) => {
          val.is_star=0
        })
      } else if (results.length !== 0) {
        commentList.forEach((val) => {
          val.is_star=0
          results.forEach((item) => {
            if (item.comment_id === val.id) {
              val.is_star=item.is_star
            }
          })
        })
      }
      res.send({
        status: 0,
        message: '获取评论列表信息成功！',
        data: commentList
      })
    })
  })
}

// 评论点赞的处理函数
exports.addCommentLike = (req, res) => {
  const sql = 'select * from app_user_star_comment_video where comment_id=? and user_id=?'
  db.query(sql, [req.body.commentId, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) {
      const sql = 'insert into app_user_star_comment_video (user_id,comment_id) values (?,?)'
      db.query(sql, [req.user.id, req.body.commentId], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('添加点赞评论信息失败！')
        res.send({
          status: 0,
          message: '添加点赞评论信息成功！'
        })
      })
    } else if (results.length === 1) {
      const sql = 'update app_user_star_comment_video set is_star=1 where comment_id=? and user_id=?'
      db.query(sql, [req.body.commentId, req.user.id], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('更新点赞评论信息失败！')
        res.send({
          status: 0,
          message: '更新点赞评论信息成功！'
        })
      })
    }
  })
}

// 取消评论点赞的处理函数
exports.cancelCommentLike = (req, res) => {
  const sql = 'update app_user_star_comment_video set is_star=0 where comment_id=? and user_id=?'
  db.query(sql, [req.body.commentId, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('取消点赞评论失败！')
    res.send({
      status: 0,
      message:'取消点赞评论成功！'
    })
  })
}