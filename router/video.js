const express = require('express')
const router = express.Router()

// 导入视频路由处理函数对应的模块
const video_handler = require('../router_handler/video')

// 获取视频列表信息
router.get('/list', video_handler.getVideoInfo)

// 获取视频详细信息
router.get('/detail/:video_id', video_handler.getVideoDetail)

// 点赞视频
router.post('/star', video_handler.addStarVideo)

// 取消点赞视频
router.post('/cancelstar', video_handler.cancelStarVideo)

// 发表评论
router.post('/comment', video_handler.publishComment)

// 获取评论
router.get('/comments/:video_id', video_handler.getComment)

// 点赞评论
router.post('/comment/addlike', video_handler.addCommentLike)

// 取消点赞评论
router.post('/comment/cancellike',video_handler.cancelCommentLike)

module.exports = router