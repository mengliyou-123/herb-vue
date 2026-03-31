import request from "@/utils/request";

// ----------------------------------方剂收藏相关--------------------------------------
export const preCollAddService = (preId) => {
  return request.post('/preCollect?preId=' + preId)
}

export const preCollNumAddService = (preId) => {
    return request.put('/preCollect?preId=' + preId)
}

export const preCollDeleteService = (id) => {
    return request.delete('/preCollect?id=' + id)
}
  
export const preCollNumSubtractService = (preId) => {
      return request.patch('/preCollect?preId=' + preId)
}
  
export const isPreCollService = (params) => {
    return request.get('/preCollect', {params})
}

export const preCollListService = (params) => {
    return request.get('/preCollect/list', {params})
}

export const findIdService = (preId) => {
    return request.get('/preCollect/getPreId?preId=', preId)
}
//删除收藏表里某个方剂的所有记录
export const deleteByPreIdService = (preId) => {
    return request.delete('/preCollect/deleteByPreId?preId=' + preId)
}
//根据userId删除
export const deletePreByUserIdService = (userId) => {
    return request.delete('/preCollect/deleteByUserId?userId=' + userId)
}


// --------------------------------------------典籍收藏相关-----------------------------------------
export const bookCollAddService = (bookId) => {
    return request.post('/bookCollect?bookId=' + bookId)
  }
  
  export const bookCollNumAddService = (id) => {
      return request.put('/bookCollect?id=' + id)
  }
  
  export const bookCollDeleteService = (id) => {
      return request.delete('/bookCollect?id=' + id)
  }
    
  export const bookCollNumSubtractService = (id) => {
        return request.patch('/bookCollect?id=' + id)
  }
    
  export const isBookCollService = (params) => {
      return request.get('/bookCollect', {params})
  }
  
  export const bookCollListService = (params) => {
      return request.get('/bookCollect/list', {params})
  }
  //删除关于这个典籍的所有记录
  export const deleteByBookIdService = (bookId) => {
    return request.delete('/bookCollect/deleteByBookId?bookId=' + bookId)
  }
  //根据userId删除
  export const deleteBookByUserIdService = (userId) => {
    return request.delete('/bookCollect/deleteByUserId?userId=' + userId)
}


  //----------------------------------------帖子收藏相关-----------------------------------------------
  export const postCollAddService = (postId) => {
    return request.post('/postCollect?postId=' + postId)
  }
  
  export const postCollNumAddService = (postId) => {
      return request.put('/postCollect?postId=' + postId)
  }
  
  export const postCollDeleteService = (id) => {
      return request.delete('/postCollect?id=' + id)
  }
    
  export const postCollNumSubtractService = (postId) => {
        return request.patch('/postCollect?postId=' + postId)
  }
    
  export const isPostCollService = (params) => {
      return request.get('/postCollect', {params})
  }
  
  export const postCollListService = (params) => {
      return request.get('/postCollect/list', {params})
  }
  //删除关于这个帖子的所有记录
  export const deleteByPostIdService = (postId) => {
    return request.delete('/postCollect/deleteByPostId?postId=' + postId)
  }
  //根据userId删除
  export const deletePostByUserIdService = (userId) => {
    return request.delete('/postCollect/deleteByUserId?userId=' + userId)
}
