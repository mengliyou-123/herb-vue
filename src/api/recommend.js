import request from "@/utils/request";
import { useTokenStore } from "@/stores/token";

export const pcmRecommendService = (question) => {
    return request.get('/recommend', {
        params: {
            question: question
        }
    });
};

export const pcmRecommendStreamService = async (question, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = `/api/recommend/stream?question=${encodeURIComponent(question)}`;
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                if (line.startsWith('data:')) {
                    const data = line.slice(5).trim();
                    if (data === '[DONE]') {
                        onComplete && onComplete();
                        return;
                    }
                    if (data) {
                        onMessage && onMessage(data);
                    }
                }
            }
        }
        
        onComplete && onComplete();
    } catch (error) {
        onError && onError(error);
    }
};
