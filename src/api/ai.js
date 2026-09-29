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

export const saveDiagnosisHistoryService = (question, answer) => {
    return request.post('/ai/history', { question, answer });
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

    // Agent 通过 Vite/Nginx 的 /agent-api 代理暴露，Spring Boot 不再转发问答流。
    const agentBaseUrl = (import.meta.env.VITE_AGENT_BASE_URL || '/agent-api').replace(/\/$/, '');
    const url = `${agentBaseUrl}/query/stream`;
    let fullText = '';
    let completed = false;
    const streamBatchSize = 1;
    const streamIntervalMs = 18;

    const emitIncrementally = async (text) => {
        if (!text || !onMessage) return;

        for (let start = 0; start < text.length; start += streamBatchSize) {
            const end = Math.min(start + streamBatchSize, text.length);
            onMessage(text.slice(start, end));
            if (end < text.length) {
                await new Promise(resolve => setTimeout(resolve, streamIntervalMs));
            }
        }
    };

    const complete = async () => {
        if (completed) return;
        completed = true;

        // Agent 不知道当前登录用户；回答完成后仍通过 Spring Boot 保存历史。
        if (fullText.trim()) {
            try {
                await saveDiagnosisHistoryService(symptoms, fullText);
            } catch (historyError) {
                console.error('保存问诊历史失败', historyError);
            }
        }
        if (onComplete) await onComplete();
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: symptoms })
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
                        await complete();
                        return;
                    }
                    if (data) {
                        let event;
                        try {
                            event = JSON.parse(data);
                        } catch (parseError) {
                            console.warn('忽略无法解析的 Agent SSE 事件', parseError);
                            continue;
                        }

                        if (event.type !== 'text') continue;

                        // tcm_merge 返回累计文本；对外转换成现有组件使用的增量文本。
                        const cumulativeText = String(event.data || '');
                        let delta = cumulativeText;
                        if (cumulativeText.startsWith(fullText)) {
                            delta = cumulativeText.slice(fullText.length);
                        }
                        fullText = cumulativeText;
                        await emitIncrementally(delta);
                    }
                }
            }
        }

        await complete();
    } catch (error) {
        onError && onError(error);
    }
};

export const herbRecognitionStreamService = async (imageUrl, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = '/api/ai/herb-recognition-stream';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl })
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

export const tongueDiagnosisStreamService = async (imageUrl, onMessage, onComplete, onError) => {
    const tokenStore = useTokenStore();
    const token = tokenStore.token;
    
    const url = '/api/ai/tongue-diagnosis-stream';
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Accept': 'text/event-stream',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageUrl })
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
