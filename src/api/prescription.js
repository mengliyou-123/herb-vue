import request from "@/utils/request";

export const preAddService = (preData) => {
  return request.post('/prescription', preData)
}

export const preUpdateService = (preData) => {
  return request.put('/prescription', preData)
}

export const preDeleteService = (id) => {
  return request.delete('/prescription?id=' + id)
}

export const preDetailService = (id) => {
  return request.get('/prescription/detail?id=' + id)
}

export const preListService = (params) => {
  return request.get('/prescription', {params})
}