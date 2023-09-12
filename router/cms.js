const express = require('express')
const router = express.Router()

// 导入用户路由处理函数对应的模块
const cms_handler = require('../router_handler/cms')



// 获取轮播图
router.get('/banner', cms_handler.getBanner)

// 编辑轮播图
router.post('/editBanner', cms_handler.editBanner)

// 删除轮播图
router.post('/deleteBanner', cms_handler.deleteBanner)

// 添加轮播图
router.post('/banner', cms_handler.addBanner)

// 获取系统提示文案
router.get('/infotext', cms_handler.getInfoText)

// 新增系统提示文案
router.post('/infotext', cms_handler.addInfoText)

// 获取文章分类统计
router.get('/article', cms_handler.getArticleCateInfo)

// 获取用户活跃天数
router.get('/user',cms_handler.getUserActive)

module.exports = router