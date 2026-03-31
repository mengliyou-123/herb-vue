import request from "@/utils/request";

export const pcmAddService = (pcmData) => {
  return request.post('/pcm', pcmData)
}

export const pcmUpdateService = (pcmData) => {
  return request.put('/pcm', pcmData)
}

export const pcmDeleteService = (id) => {
  return request.delete('/pcm?id=' + id)
}

export const pcmDetailService = (id) => {
  return request.get('/pcm/detail?id=' + id)
}

export const pcmListService = (params) => {
  return request.get('/pcm', {params})
}

