import request from "@/utils/request";

export const chapterAddService = (chapterData) => {
  return request.post('/chapter', chapterData)
}

export const chapterUpdateService = (chapterData) => {
  return request.put('/chapter', chapterData)
}

export const chapterDeleteService = (id) => {
  return request.delete('/chapter?id=' + id)
}

export const chapterListService = (bookId) => {
    return request.get('/chapter?bookId=' + bookId)
}

//根据章节id找到章节
export const findChapterByIdService = (chapterId) => {
  return request.get('/chapter/findChapterById?chapterId=' + chapterId)
}

//根据bookId删掉所有章节
export const deleteChaptersByBookIdService = (bookId) => {
  return request.delete('/chapter/deleteByBookId?bookId=' + bookId)
}