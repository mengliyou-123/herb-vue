import request from "@/utils/request";

export const herbAddService = (herbData) => {
  return request.post('/herb', herbData);
};

export const herbUpdateService = (herbData) => {
  return request.put('/herb', herbData);
};

export const herbDeleteService = (id) => {
  return request.delete('/herb?id=' + id);
};

export const herbDetailService = (id) => {
  return request.get('/herb/detail?id=' + id);
};

export const herbListService = (params) => {
  return request.get('/herb', { params });
};
