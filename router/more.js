const express = require('express')
const router = express.Router()

// 导入更多功能路由处理函数对应的模块
const more_handler = require('../router_handler/more')

// 获取签到信息
router.get('/signin', more_handler.getSignIn)

// 签到
router.post('/signin', more_handler.updateSignIn)

// 添加待办事件
router.post('/addtodo', more_handler.addTodo)

// 获取待办事项列表
router.get('/todolist',more_handler.getTodoList)

// 获取音乐的待办事项
router.get('/song',more_handler.getSongInfo)

// 发布提问
router.post('/inquiry',more_handler.postInquiry)

// 获取提问列表
router.get('/inquiry', more_handler.getInquiryList)

// 获取提问详情
router.get('/inquiry/detail/:inquiry_id', more_handler.getInquiryDetail)

// 发布回答
router.post('/inquiry/answer', more_handler.postAnswer)

// 获取回答信息
router.get('/inquiry/answer', more_handler.getAnswerList)

// 点赞回答
router.post('/inquiry/answer/star', more_handler.addStarAnswer)

// 取消点赞回答
router.post('/inquiry/answer/cancelStar', more_handler.cancelStarAnswer)

// 更新阅读数量
router.post('/inquiry/readNum', more_handler.updateReadNumber)

// 获取聊天回复
router.get('/chat/reply', more_handler.getReply)

// 获取积分兑换列表
router.get('/exchange', more_handler.getPointExchange)

// 积分兑换
router.post('/exchange', more_handler.addPointExchange)

// 更新积分信息
router.post('/point',more_handler.updatePointInfo)

// 获取我的课程
router.get('/curriculum',more_handler.getUserCurriculum)

module.exports = router