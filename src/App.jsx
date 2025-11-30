import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const WEBHOOK_URL = 'https://n8n.my-yang.online/webhook/test01';
const TIMEOUT_MS = 300000; // Timeout 設定：120秒（2分鐘），可根據需求調整

function App() {
  const [messages, setMessages] = useState([
    { content: '您好！我是 AI 助手，有什麼可以幫助您的嗎？', isUser: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateInfo, setDateInfo] = useState('');
  const [theme, setTheme] = useState('3d-cartoon'); // 預設風格
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const themes = [
    { id: '3d-cartoon', name: '3D卡通風格', icon: '🎨' },
    { id: 'tech-neon', name: '科技冷光風格', icon: '⚡' },
    { id: 'apple-minimal', name: '蘋果簡約風格', icon: '🍎' },
    { id: 'dark-cool', name: '黑暗冷酷風格', icon: '🌙' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const updateDateInfo = (start, end) => {
    if (start || end) {
      let info = '';
      if (start && end) {
        info = `時間範圍：${formatDateDisplay(start)} ~ ${formatDateDisplay(end)}`;
      } else if (start) {
        info = `日期：${formatDateDisplay(start)}`;
      } else if (end) {
        info = `截止日期：${formatDateDisplay(end)}`;
      }
      setDateInfo(info);
    } else {
      setDateInfo('');
    }
  };

  const getDateContext = () => {
    if (!startDate && !endDate) return '';
    
    let context = '\n\n[日期條件：';
    if (startDate && endDate) {
      context += `時間範圍從 ${formatDateDisplay(startDate)} 到 ${formatDateDisplay(endDate)}`;
    } else if (startDate) {
      context += `日期為 ${formatDateDisplay(startDate)}`;
    } else if (endDate) {
      context += `截止日期為 ${formatDateDisplay(endDate)}`;
    }
    context += ']';
    return context;
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    if (endDate && newStartDate > endDate) {
      setEndDate(newStartDate);
      updateDateInfo(newStartDate, newStartDate);
    } else {
      updateDateInfo(newStartDate, endDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);
    if (startDate && newEndDate < startDate) {
      setStartDate(newEndDate);
      updateDateInfo(newEndDate, newEndDate);
    } else {
      updateDateInfo(startDate, newEndDate);
    }
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
    setDateInfo('');
  };

  const formatMessage = (text) => {
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // Convert markdown headers
    formatted = formatted.replace(/^### (.+)$/gm, '<div style="font-size: 1.1em; font-weight: 600; margin: 12px 0 6px 0; color: #667eea;">$1</div>');
    formatted = formatted.replace(/^## (.+)$/gm, '<div style="font-size: 1.2em; font-weight: 600; margin: 15px 0 8px 0; color: #667eea;">$1</div>');
    formatted = formatted.replace(/^# (.+)$/gm, '<div style="font-size: 1.3em; font-weight: 600; margin: 18px 0 10px 0; color: #667eea;">$1</div>');
    
    // Convert list items
    formatted = formatted.replace(/^[\*\-] (.+)$/gm, '<div style="margin-left: 20px; position: relative; padding-left: 10px;"><span style="position: absolute; left: -10px;">•</span>$1</div>');
    
    // Convert bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert plain URLs
    formatted = formatted.replace(/(?<!href="|">)(https?:\/\/[^\s<"]+)(?!")/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  };

  const sendMessage = async (message) => {
    try {
      // 設定 timeout（預設 120 秒，可根據需求調整）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // 清除 timeout

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      console.log('Response text:', text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return text || '收到空回應';
      }
      
      if (data.output) {
        return data.output;
      } else if (data.response) {
        return data.response;
      } else if (data.text) {
        return data.text;
      } else if (typeof data === 'string') {
        return data;
      } else if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        return firstItem.output || firstItem.response || firstItem.text || JSON.stringify(firstItem);
      } else {
        return JSON.stringify(data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // 處理 timeout 錯誤
      if (error.name === 'AbortError') {
        throw new Error('請求超時：伺服器響應時間過長，請稍後再試或聯繫管理員');
      }
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const message = inputMessage.trim();
    if (!message) return;

    setIsLoading(true);
    const dateContext = getDateContext();
    const fullMessage = message + dateContext;

    // Add user message
    setMessages(prev => [...prev, { content: message, isUser: true }]);
    setInputMessage('');

    try {
      const response = await sendMessage(fullMessage);
      setMessages(prev => [...prev, { content: response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        content: '抱歉，發送訊息時發生錯誤，請稍後再試。', 
        isUser: false,
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={`app theme-${theme}`}>
      <div className="chat-container">
        <div className="chat-header">
          🤖 AI Agent Chat
          <div className="theme-selector">
            <button 
              className="theme-toggle-btn"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="切換風格"
            >
              {themes.find(t => t.id === theme)?.icon} 風格
            </button>
            {showThemeMenu && (
              <div className="theme-menu">
                {themes.map(t => (
                  <button
                    key={t.id}
                    className={`theme-option ${theme === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    <span className="theme-icon">{t.icon}</span>
                    <span className="theme-name">{t.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.isUser ? 'user' : 'assistant'}`}>
              <div 
                className="message-content"
                dangerouslySetInnerHTML={{ 
                  __html: msg.isUser ? msg.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : formatMessage(msg.content)
                }}
              />
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="date-picker-container">
          <span className="date-picker-label">📅 日期篩選：</span>
          <input 
            type="date" 
            className="date-input" 
            value={startDate}
            onChange={handleStartDateChange}
            title="選擇開始日期" 
            placeholder="yyyy/mm/dd"
          />
          <span className="date-range-separator">至</span>
          <input 
            type="date" 
            className="date-input" 
            value={endDate}
            onChange={handleEndDateChange}
            title="選擇結束日期" 
            placeholder="yyyy/mm/dd"
          />
          <button type="button" className="clear-dates-btn" onClick={clearDates}>
            清除
          </button>
          {dateInfo && <span className="date-info active">{dateInfo}</span>}
        </div>

        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input 
              ref={inputRef}
              type="text" 
              className="chat-input" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="輸入您的訊息..."
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
              disabled={isLoading}
              required
            />
            <button type="submit" className="send-button" disabled={isLoading}>
              發送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
