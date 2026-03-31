import request from "@/utils/request";

export const bookAddService = (bookData) => {
  return request.post('/book', bookData)
}

export const bookUpdateService = (bookData) => {
  return request.put('/book', bookData)
}

export const bookDeleteService = (id) => {
  return request.delete('/book?id=' + id)
}

export const bookDetailService = (id) => {
    return request.get('/book/detail?id=' + id)
}

export const bookListService = (params) => {
    return request.get('/book', {params})
  }