// 导入数据库操作模块
const db = require('../db/index')
// 导入moment时间格式化模块
const moment = require('moment')
// 导入自定义函数模块
const myFunction = require('../utils/fn')

// 获取文章列表基本信息的处理函数
exports.getArticleInfo = (req, res) => {
  // 定义查询文章信息的SQL语句
  const sql = 'select a.*,b.cover_1,b.cover_2,b.cover_3,c.username,c.nickname from app_articles as a,app_article_cover b,app_users c where a.cate_id=? and a.id=b.id and a.author_id=c.id'
  // 调用db.query()执行SQL语句
  db.query(sql, req.query.classId,(err, results) => {
    // 执行SQL语句失败
    if (err) return res.cc(err)
    // 执行SQL语句成功，但是查询的结果可能为空
    if (results.length == 0) return res.cc('获取文章信息失败！')
    // 文章信息获取成功
    results.forEach(val => {
      let arr = []
      if (val.cover_1 && val.cover_2&&val.cover_3) {
        arr.push(val.cover_1, val.cover_2,val.cover_3)
      } else if (val.cover_1) {
        arr.push(val.cover_1)
      }
      val.cover = arr
      if (val.nickname) {
        val.author = val.nickname
      } else {
        val.author = val.username
      }
      delete val.cover_1
      delete val.cover_2
      delete val.cover_3
      delete val.nickname
      delete val.username
    });
    const start = (req.query.page-1)*5
    const dataList = results.splice(start, 5)
    if (dataList.length === 0) return res.cc('没有更多文章信息!')
    res.send({
      status: 0,
      message: '获取文章信息成功！',
      data: dataList
    })
  })
}

// 获取文章分类信息的处理函数
exports.getArticleCategories = (req, res) => {
  const sql = 'select * from app_article_cate'
  db.query(sql, (err, results) => {
    if(err) return res.cc(err)
    if(results.length==0) return res.cc('获取分类信息失败！')
    res.send({
      status: 0,
      message: '获取分类信息成功！',
      data: results
    })
  })
}

// 获取文章搜索提示的处理函数
exports.getArticleSearchResult = (req, res) => {
  const sql = 'select * from app_article_cate'
  db.query(sql, (err, results) => {
    if(err) return res.cc(err)
    if (results.length == 0) return res.cc('获取分类信息失败！')
    const result = results.filter((val) => {
      const kw = req.query.kw
      const reg = RegExp(`${kw}`)
      return reg.exec(val.name)
    })
    res.send({
      status: 0,
      message: '获取文章搜索结果成功！',
      data: result
    })
  })
}

// 获取文章搜索列表信息的处理函数(废弃：根据类别)
// exports.getArticleSearchList = (req, res) => {
//   const sql = 'select * from app_article_cate'
//   db.query(sql, (err, results) => {
//     if(err) return res.cc(err)
//     if (results.length == 0) return res.cc('获取分类信息失败！')
//     const result = results.filter((val) => {
//       const kw = req.query.kw
//       const reg = RegExp(`${kw}`)
//       return reg.exec(val.name)
//     })
//     const sql = 'select a.*,b.cover_1,b.cover_2,b.cover_3,c.username as author from app_articles as a,app_article_cover b,app_users c where a.id=b.id and a.author_id=c.id'
//     db.query(sql, (err, results_article) => {
//       if (err) return res.cc(err)
//       if(results_article===0) return res.cc('获取文章信息失败！')
//       // 文章信息获取成功
//       results_article.forEach(val => {
//         let arr = []
//         if (val.cover_1 && val.cover_2&&val.cover_3) {
//           arr.push(val.cover_1, val.cover_2,val.cover_3)
//         } else if (val.cover_1) {
//           arr.push(val.cover_1)
//         }
//         val.cover = arr
//         delete val.cover_1
//         delete val.cover_2
//         delete val.cover_3
//       });
//       let newArr=[]
//       result.forEach((val) => {
//         const arr = results_article.filter((item) => {
//           return item.cate_id == val.id
//         })
//         newArr.push(...arr)
//       })
//       const start = (req.query.page-1)*5
//       const dataList = newArr.splice(start, 5)
//       if (dataList.length === 0) return res.cc('获取文章信息失败!')
//       res.send({
//         status: 0,
//         message: '获取文章搜索结果成功！',
//         data: dataList
//       })
//     })
//   })
// }

// 获取文章详情信息的处理函数
exports.getArticleDetail = (req, res) => {
  const sql = 'select * from app_articles where id=?'
  db.query(sql, req.params.article_id,(err, results) => {
    if(err) return res.cc(err)
    if (results.length == 0) return res.cc('获取文章信息失败！')
    let article = results[0]
    const sql = 'select user_pic,nickname,username from app_users where id=?'
    db.query(sql, article.author_id, (err, results) => {
      if (err) return res.cc(err)
      if (results.length !== 1) return res.cc('查询作者信息失败！')
      article.author = results[0].nickname ? results[0].nickname : results[0].username
      article.author_pic = results[0].user_pic
      const sql = 'select is_star from app_user_star_article where article_id=? and user_id=?'
      db.query(sql, [req.params.article_id, req.user.id], (err, results) => {
        if (err) return res.cc(err)
        if (results.length !== 1) {
          article.is_star = 0
        } else if (results.length === 1) {
          article.is_star=results[0].is_star
        }
        const sql = 'select is_follow from app_user_follow_author where author_id=? and user_id=?'
        db.query(sql, [article.author_id, req.user.id], (err, results) => {
          if (err) return res.cc(err)
          if (results.length !== 1) {
            article.is_follow = 0
          } else if (results.length === 1) {
            article.is_follow=results[0].is_follow
          }
          res.send({
            status: 0,
            message: '获取详情信息成功！',
            data: article
          })
        })
      })
    })
  })
}

// 点赞文章的处理函数
exports.addStarArticle = (req, res) => {
  const sqlStr = 'update app_articles set star_num=star_num+1 where id=?'
  db.query(sqlStr, req.body.target, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新点赞数量失败！')
    const sql = 'select * from app_user_star_article where user_id=? and article_id=?'
    db.query(sql, [req.user.id, req.body.target], (err, results) => {
      if (err) return res.cc(err)
      // SQL语句执行成功，查询是否存在对应关系
      if (results.length === 0) {
        // 不存在对应关系，向数据库添加对应关系
        const sql='insert into app_user_star_article (user_id,article_id) values (?,?)'
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
        const sql = 'update app_user_star_article set is_star=1 where user_id=? and article_id=?'
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

// 取消点赞文章的处理函数
exports.cancelStarArticle = (req, res) => {
  const sql = 'update app_articles set star_num=star_num-1 where id=?'
  db.query(sql, req.body.target, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) res.cc('更新点赞数量失败！')
    const sql = 'update app_user_star_article set is_star=0 where user_id=? and article_id=?'
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

// 关注作者的处理函数
exports.addFollowAuthor = (req, res) => {
  const sqlStr = 'update app_users set follow_num=follow_num+1 where id=?'
  db.query(sqlStr, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新关注数量失败！')
    const sql = 'update app_users set fans_num=fans_num+1 where id=?'
    db.query(sql, req.body.target, (err, results) => {
      if (err) return res.cc(err)
      if(results.affectedRows!==1) return res.cc('更新粉丝数量失败！')
      const sql = 'select * from app_user_follow_author where user_id=? and author_id=?'
      db.query(sql, [req.user.id, req.body.target], (err, results) => {
        if (err) return res.cc(err)
        // SQL语句执行成功，查询是否存在对应关系
        if (results.length === 0) {
          // 不存在对应关系，向数据库添加对应关系
          const sql='insert into app_user_follow_author (user_id,author_id) values (?,?)'
          db.query(sql, [req.user.id, req.body.target], (err, results) => {
            if(err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('添加关注对应关系失败！')
            res.send({
              status: 0,
              message: '添加关注对应关系成功！'
            })
          })         
        } else if(results.length!==0) {
          // 存在对应关系，向数据库修改对应关系
          const sql = 'update app_user_follow_author set is_follow=1 where user_id=? and author_id=?'
          db.query(sql, [req.user.id, req.body.target], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('修改关注对应关系失败！')
            res.send({
              status: 0,
              message: '修改关注对应关系成功！'
            })
          })
        }
      })
    })
  })
}

// 取消关注作者的处理函数
exports.cancelFollowAuthor = (req, res) => {
  const sql = 'update app_users set follow_num=follow_num-1 where id=?'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) res.cc('更新关注数量失败！')
    const sql = 'update app_users set fans_num=fans_num-1 where id=?'
    db.query(sql, req.body.target, (err, results) => {
      if(err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新粉丝数量失败！')
      const sql = 'update app_user_follow_author set is_follow=0 where user_id=? and author_id=?'
      db.query(sql, [req.user.id, req.body.target], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('修改关注对应关系失败！')
        res.send({
          status: 0,
          message: '修改关注对应关系成功！'
        })
      })
    })
  })
}

// 发表评论的处理函数
exports.publishComment = (req, res) => {
  const sql = 'select id as commentator_id,username as commentator_name,nickname,user_pic as commentator_pic from app_users where id=?'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('查询发布者信息失败！')
    const publisher = results[0]
    publisher.commentator_name = publisher.nickname? publisher.nickname:publisher.commentator_name
    publisher.content = req.body.content
    publisher.comment_time = moment().format('YYYY/MM/DD HH:mm:ss')
    publisher.article_id=req.body.articleId
    const sql = 'insert into app_article_comment (commentator_id,commentator_name,commentator_pic,content,article_id,comment_time) values (?,?,?,?,?,?) '
    db.query(sql, [publisher.commentator_id,publisher.commentator_name,publisher.commentator_pic,publisher.content,publisher.article_id,publisher.comment_time], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('写入评论信息失败！')
      const sql = 'update app_articles set comment_num=comment_num+1 where id=?'
      db.query(sql, publisher.article_id, (err, results) => {
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
  const sql = 'select * from app_article_comment where article_id=? order by id desc'
  db.query(sql, req.params.articleId, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('没有查询到评论数据！')
    let commentList = results
    const sql = 'select * from app_user_star_comment where user_id=?'
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
  const sql = 'select * from app_user_star_comment where comment_id=? and user_id=?'
  db.query(sql, [req.body.commentId, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) {
      const sql = 'insert into app_user_star_comment (user_id,comment_id) values (?,?)'
      db.query(sql, [req.user.id, req.body.commentId], (err, results) => {
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) return res.cc('添加点赞评论信息失败！')
        res.send({
          status: 0,
          message: '添加点赞评论信息成功！'
        })
      })
    } else if (results.length === 1) {
      const sql = 'update app_user_star_comment set is_star=1 where comment_id=? and user_id=?'
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
  const sql = 'update app_user_star_comment set is_star=0 where comment_id=? and user_id=?'
  db.query(sql, [req.body.commentId, req.user.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('取消点赞评论失败！')
    res.send({
      status: 0,
      message:'取消点赞评论成功！'
    })
  })
}

// 获取题目信息的处理函数
exports.getQuestions = (req, res) => {
  const sql = 'select a.*,b.name as cate_name from app_questions as a,app_article_cate b where a.cate_id=? and b.id=?'
  db.query(sql, [req.params.cateId,req.params.cateId], (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取题目信息失败！')
    const arr = myFunction.reSort(results)
    const result =arr.slice(0,10)
    res.send({
      status: 0,
      message: '获取题目信息成功！',
      data: result
    })
  })
}

// 更新文章阅读量的处理函数
exports.updateReadNum = (req, res) => {
  const sql = 'select * from app_articles where id=?'
  db.query(sql, req.body.articleId, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('查询文章失败！')
    const cateId = results[0].cate_id
    const sql = 'update app_articles set read_num=read_num+1 where id=?'
    db.query(sql, req.body.articleId, (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新阅读数量失败！')
      const sql = 'select * from app_article_push where user_id=? and cate_id=?' 
      db.query(sql, [req.user.id,cateId], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) {
          const sql = 'insert into app_article_push (user_id,cate_id) values (?,?)'
          db.query(sql, [req.user.id, cateId], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('新增阅读数量失败！')
            res.send({
              status: 0,
              message: '新增阅读数量成功！'
            })
          })
        } else {
          const sql = 'update app_article_push set read_num=read_num+1 where user_id=? and cate_id=?'
          db.query(sql, [req.user.id, cateId], (err, results) => {
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) return res.cc('更新阅读数量失败！')
            res.send({
              status: 0,
              message: '更新阅读数量成功！'
            })
          })
        }
      })
    })
  })
}

// 获取推送列表的处理函数
exports.getPushList = (req, res) => {
  const sql = 'select cate_id from app_article_push where user_id=? order by read_num desc'
  db.query(sql, req.user.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) {
      const sql ='select a.*,b.cover_1,b.cover_2,b.cover_3,c.username,c.nickname from app_articles as a,app_article_cover b,app_users c where a.id=b.id and a.author_id=c.id order by a.read_num desc'
      db.query(sql, (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取查询结果失败！')
        results = results.splice(0, 30)
        results.forEach(val => {
          let arr = []
          if (val.cover_1 && val.cover_2&&val.cover_3) {
            arr.push(val.cover_1, val.cover_2,val.cover_3)
          } else if (val.cover_1) {
            arr.push(val.cover_1)
          }
          val.cover = arr
          if (val.nickname) {
            val.author = val.nickname
          } else {
            val.author = val.username
          }
          delete val.cover_1
          delete val.cover_2
          delete val.cover_3
          delete val.nickname
          delete val.username
        });
        const start = (req.query.page-1)*5
        const dataList = results.splice(start, 5)
        if (dataList.length === 0) return res.cc('没有更多文章信息!')
        res.send({
          status: 0,
          message: '获取文章信息成功！',
          data: dataList
        })
      })
    } else {
      results = results.slice(0, 3)
      let arr = [99,99]
      results.forEach(val => {
        arr.unshift(val.cate_id)
      })
      const sql = 'select a.*,b.cover_1,b.cover_2,b.cover_3,c.username,c.nickname from app_articles as a,app_article_cover b,app_users c where a.id=b.id and a.author_id=c.id and (a.cate_id=? or a.cate_id=? or a.cate_id=?) order by a.read_num desc'
      db.query(sql,[arr[0],arr[1],arr[2]], (err, results) => {
        if (err) return res.cc(err)
        if (results.length === 0) return res.cc('获取查询结果失败!')
        results.forEach(val => {
          let arr = []
          if (val.cover_1 && val.cover_2&&val.cover_3) {
            arr.push(val.cover_1, val.cover_2,val.cover_3)
          } else if (val.cover_1) {
            arr.push(val.cover_1)
          }
          val.cover = arr
          if (val.nickname) {
            val.author = val.nickname
          } else {
            val.author = val.username
          }
          delete val.cover_1
          delete val.cover_2
          delete val.cover_3
          delete val.nickname
          delete val.username
        });
        const start = (req.query.page - 1) * 5
        const dataList = results.splice(start, 5)
        if (dataList.length === 0) return res.cc('没有更多文章信息!')
        res.send({
          status: 0,
          message: '获取文章信息成功！',
          data: dataList
        })
      })
    }
  })
}

// 获取文章搜索列表信息的处理函数
exports.getArticleSearchList = (req, res) => {
  const sql = 'select a.*,b.cover_1,b.cover_2,b.cover_3,c.username as author from app_articles as a,app_article_cover b,app_users c where a.id=b.id and a.author_id=c.id'
  db.query(sql, (err, results_article) => {
    if (err) return res.cc(err)
    if(results_article===0) return res.cc('获取文章信息失败！')
    // 文章信息获取成功
    results_article.forEach(val => {
      let arr = []
      if (val.cover_1 && val.cover_2&&val.cover_3) {
        arr.push(val.cover_1, val.cover_2,val.cover_3)
      } else if (val.cover_1) {
        arr.push(val.cover_1)
      }
      val.cover = arr
      delete val.cover_1
      delete val.cover_2
      delete val.cover_3
    })
    const kw = req.query.kw
    let result = results_article
    if (kw != '') {
      result = results_article.filter((val) => {
        const reg = RegExp(`${kw}`)
        return reg.exec(val.title)
      })
    }
    const start = (req.query.page-1)*5
    const dataList = result.splice(start, 5)
    if (dataList.length === 0) return res.cc('获取文章信息失败!')
    res.send({
      status: 0,
      message: '获取文章搜索结果成功！',
      data: dataList
    })
  })
}