// 导入数据库操作模块
const db = require('../db/index')

// 获取轮播图的处理函数
exports.getBanner = (req, res) => {
  const sql = 'select * from app_config_banner where is_delete=0'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length===0) return res.cc('获取轮播图信息失败！')
    res.send({
      status: 0,
      message: '获取轮播图信息成功！',
      data: results
    })
  })
}

// 编辑轮播图的处理函数
exports.editBanner = (req, res) => {
  const sql = 'update app_config_banner set url=? where id=?'
  db.query(sql, [req.body.url, req.body.id], (err, results) => {
    if (err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('编辑轮播图失败！')
    res.send({
      status: 0,
      message: '编辑轮播图成功！'
    })
  })
}

// 删除轮播图的处理函数
exports.deleteBanner = (req, res) => {
  const sql = 'update app_config_banner set is_delete=1 where id=?'
  db.query(sql, req.body.id, (err, results) => {
    if (err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('删除轮播图失败！')
    res.send({
      status: 0,
      message: '删除轮播图成功！'
    })
  })
}

// 添加轮播图的处理函数
exports.addBanner = (req, res) => {
  const sql = 'insert into app_config_banner (url) values (?)'
  db.query(sql, req.body.url, (err, results) => {
    if (err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('添加轮播图失败！')
    res.send({
      status: 0,
      message: '添加轮播图成功！'
    })
  })
}

// 获取系统提示文案的处理函数
exports.getInfoText = (req, res) => {
  const sql = 'select * from app_config_text order by id desc'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if(results.length==0) return res.cc('获取系统提示文案失败！')
    res.send({
      status: 0,
      message: '获取系统提示文案成功！',
      data: results[0]
    })
  })
}

// 新增系统提示文案的处理函数
exports.addInfoText = (req, res) => {
  const sql = 'insert into app_config_text (text) values (?)'
  db.query(sql, req.body.text, (err, results) => {
    if (err) return res.cc(err)
    if(results.affectedRows!==1) return res.cc('新增系统提示文案失败！')
    res.send({
      status: 0,
      message: '新增系统提示文案成功！',
    })
  })
}

// 获取文章分类统计的处理函数
exports.getArticleCateInfo = (req, res) => {
  const sql = 'select cate_id,read_num from app_articles'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取文章分类统计失败！')
    let num = [0,0,0,0,0,0,0,0,0]
    let readNum = [0,0,0,0,0,0,0,0,0]
    results.forEach((val) => {
      switch (val.cate_id) {
        case 1:
          num[0]++
          readNum[0]=readNum[0]+val.read_num
          break;
        case 2:
          num[1]++
          readNum[1]=readNum[1]+val.read_num
          break;
        case 3:
          num[2]++
          readNum[2]=readNum[2]+val.read_num
          break;
        case 4:
          num[3]++
          readNum[3]=readNum[3]+val.read_num
        break;
        case 5:
          num[4]++
          readNum[4]=readNum[4]+val.read_num
        break;
        case 6:
          num[5]++
          readNum[5]=readNum[5]+val.read_num
        break;
        case 7:
          num[6]++
          readNum[6]=readNum[6]+val.read_num
          break;
        case 8:
          num[7]++
          readNum[7]=readNum[7]+val.read_num
          break;
        case 9:
          num[8]++
          readNum[8]=readNum[8]+val.read_num
          break;
      }
    })
    res.send({
      status: 0,
      message: '获取文章分类统计成功！',
      data: {
        num: num,
        readNum:readNum
      }
    })
  })
}

// 获取用户活跃度的处理函数
exports.getUserActive = (req, res) => {
  const sql = 'select id,username,nickname from app_users'
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    if (results.length === 0) return res.cc('获取用户信息失败！')
    userInfo = results
    const sql = 'select * from app_signin'
    db.query(sql, (err, results) => {
      if (err) return res.cc(err)
      if (results.length === 0) return res.cc('获取签到失败！')
      userInfo.forEach((val) => {
        const arr = results.filter((item) => {
          return item.user_id===val.id
        })
        // console.log(arr);
        val.sign_days=arr.length
      })
      res.send({
        status: 0,
        message: '获取信息成功！',
        data: userInfo
      })
    })
  })
}