import request from "@/utils/request";
import { useTokenStore } from "@/stores/token";

export const herbQAService = (herbName, question) => {
    return request.get('/ai/herb-qa', {
        params: {
            herbName: herbName,
            question: question
        }
    });
};

export const prescriptionAnalysisService = (prescriptionData) => {
    return request.post('/ai/prescription-analysis', { prescriptionData });
};

export const diagnosisService = (symptoms) => {
    return request.post('/ai/diagnosis', { symptoms: symptoms });
};

export const getDiagnosisHistoryService = () => {
    return request.get('/ai/history');
};

export const getDiagnosisHistoryByTypeService = (type) => {
    return request.get('/ai/history/type', {
        params: { type }
    });
};

export const deleteHistoryService = (id) => {
    return request.delete(`/ai/history/${id}`);
};

export const herbQAStreamService = async (herbName, question, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = `/api/ai/herb-qa-stream?herbName=${encodeURIComponent(herbName)}&question=${encodeURIComponent(question)}`;
    
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

export const prescriptionAnalysisStreamService = async (prescriptionData, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = '/api/ai/prescription-analysis-stream';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prescriptionData })
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

export const diagnosisStreamService = async (symptoms, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = '/api/ai/diagnosis-stream';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ symptoms })
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
