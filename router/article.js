const express = require('express')
const router = express.Router()

// 导入文章路由处理函数对应的模块
const article_handler = require('../router_handler/article')

// 获取文章分类信息
router.get('/categories',article_handler.getArticleCategories)

// 获取文章列表信息
router.get('/list', article_handler.getArticleInfo)

// 获取文章搜索提示
router.get('/search',article_handler.getArticleSearchResult)

// 获取文章搜索信息
router.get('/searchlist', article_handler.getArticleSearchList)

// 获取文章详情信息
router.get('/detail/:article_id', article_handler.getArticleDetail)

// 点赞文章
router.post('/star', article_handler.addStarArticle)

// 取消点赞文章
router.post('/cancelstar', article_handler.cancelStarArticle)

// 关注作者
router.post('/follow',article_handler.addFollowAuthor)

// 取消关注
router.post('/cancelfollow', article_handler.cancelFollowAuthor)

// 发表评论
router.post('/comment', article_handler.publishComment)

// 获取评论
router.get('/comments/:articleId', article_handler.getComment)

// 点赞评论
router.post('/comment/addlike', article_handler.addCommentLike)

// 取消点赞评论
router.post('/comment/cancellike',article_handler.cancelCommentLike)

// 获取题目信息
router.get('/questions/:cateId', article_handler.getQuestions)

// 更新文章阅读数量
router.post('/readNum',article_handler.updateReadNum)

// 获取推送列表
router.get('/pushList',article_handler.getPushList)

module.exports = router