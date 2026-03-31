import request from "@/utils/request";

export const contentAddService = (contentData) => {
  return request.post('/content', contentData)
}

export const contentUpdateService = (contentData) => {
  return request.put('/content', contentData)
}

export const contentDeleteService = (id) => {
  return request.delete('/content?id=' + id)
}

export const contentDetailService = (id) => {
    return request.get('/content?id=' + id)
}

// 根据内容id找到章节
export const findChapterService = (contentId) => {
  return request.get('/content/findChapter?contentId=' + contentId)
}

//根据内容找到内容id
export const findIdByContentService = (content) => {
  return request.get('/content/findIdByContent?content=' + content)
}
