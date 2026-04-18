import request from "@/utils/request";

//发帖
export const postAddService = (postData) => {
  return request.post('/post', postData)
}

//删帖
export const postDeleteService = (id) => {
    return request.delete('/post?id=' + id)
}

//讨论区首页展示列表
export const postListService = (params) => {
    return request.get('/post', {params})
}

//我的帖子列表
export const myPostService = (params) => {
    return request.get('/post/myPost', {params})
}

//帖子详情
export const postDetailService = (id) => {
    return request.get('/post/detail?id='+ id)
}

//浏览量+1
export const addViewService = (id) => {
    return request.put('/post?id=' + id)
}

//编辑帖子
export const postUpdateService = (postData) => {
  return request.put('/post/update', postData)
}

//浏览量前十
export const hotPostService = () => {
    return request.get('/post/hot')
}

//根据userId删掉所有帖子
export const deletePostByUserIdService = (userId) => {
    return request.delete('/post/deleteByUserId?userId=' + userId)
}