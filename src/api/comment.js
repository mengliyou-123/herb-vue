import request from "@/utils/request";

//发评论
export const commentAddService = (commentData) => {
  return request.post('/comment', commentData)
}

//删评论
export const commentDeleteService = (id) => {
    return request.delete('/comment?id=' + id)
}

//评论列表
export const commentListService = (postId) => {
    return request.get('/comment?postId=' + postId)
}

//根据id找评论
export const getCommentByIdService = (id) => {
  return request.get('/comment/getCommentById?id=' + id)
}

//根据postId删掉所有评论
export const deleteCommentsByPostIdService = (postId) => {
  return request.delete('/comment/deleteByPostId?postId=' + postId)
}

//根据userId删除所有评论
export const deleteCommentsByUserIdService = (userId) => {
  return request.delete('/comment/deleteByUserId?userId=' + userId)
}
