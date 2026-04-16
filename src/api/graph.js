import request from '@/utils/request'

export const knowledgeGraphService = {
    getGraphData() {
        return request.get('/graph/knowledge')
    }
}
