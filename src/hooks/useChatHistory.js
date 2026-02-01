import { useState, useEffect } from 'react';

const STORAGE_KEY = 'candy_chat_history';

const useChatHistory = () => {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }, [messages]);

    const addMessage = (text, sender) => {
        // sender: 'user' | 'ai'
        const newMessage = {
            id: Date.now(),
            text,
            sender,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const clearHistory = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { messages, addMessage, clearHistory };
};

export default useChatHistory;
