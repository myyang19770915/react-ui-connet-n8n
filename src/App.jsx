import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const WEBHOOK_URL = 'https://n8n.txcaix.com/webhook/4ae2fdef-878f-4854-8f94-944affb06581';
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
  const [selectedFloor, setSelectedFloor] = useState(''); // 樓層篩選
  const [selectedShift, setSelectedShift] = useState(''); // 班別篩選
  const [selectedFunction, setSelectedFunction] = useState(''); // 功能選擇
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const floors = ['A-2F', 'A-3F', 'A-4F', 'B-1F', 'B-2F', 'B-3F', 'C-2F', 'C-3F'];
  const shifts = ['日班', '夜班'];
  const functions = ['生產資訊', '量測資訊'];

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

  const clearFilters = () => {
    setSelectedFloor('');
    setSelectedShift('');
    setSelectedFunction('');
  };

  const getFilterContext = () => {
    let context = '';
    if (selectedFloor) {
      context += `\n[樓層：${selectedFloor}]`;
    }
    if (selectedShift) {
      context += `\n[班別：${selectedShift}]`;
    }
    if (selectedFunction) {
      context += `\n[查詢類型：${selectedFunction}]`;
    }
    return context;
  };

  const renderTable = (rows) => {
    if (rows.length === 0) return '';
    
    const parseRow = (row) => {
      return row
        .split('|')
        .slice(1, -1)
        .map(cell => cell.trim());
    };
    
    const headerCells = parseRow(rows[0]);
    const bodyRows = rows.slice(1);
    
    let html = '<div class="md-table-wrapper"><table class="md-table">';
    html += '<thead><tr>';
    headerCells.forEach(cell => {
      html += `<th>${cell}</th>`;
    });
    html += '</tr></thead>';
    
    if (bodyRows.length > 0) {
      html += '<tbody>';
      bodyRows.forEach(row => {
        const cells = parseRow(row);
        html += '<tr>';
        cells.forEach(cell => {
          // 處理表格內的特殊字元
          let cellContent = cell
            .replace(/\\_/g, '_')
            .replace(/\\-/g, '-');
          html += `<td>${cellContent}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody>';
    }
    
    html += '</table></div>';
    return html;
  };

  const formatMessage = (text) => {
    // 先處理表格（在其他處理之前）
    const lines = text.split('\n');
    let inTable = false;
    let tableRows = [];
    let result = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isTableRow = /^\|(.+)\|$/.test(line.trim());
      const isSeparator = /^\|[-:\|\s]+\|$/.test(line.trim());
      
      if (isTableRow || isSeparator) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        if (!isSeparator) {
          tableRows.push(line);
        }
      } else {
        if (inTable) {
          result.push(renderTable(tableRows));
          tableRows = [];
          inTable = false;
        }
        result.push(line);
      }
    }
    
    if (inTable && tableRows.length > 0) {
      result.push(renderTable(tableRows));
    }
    
    let formatted = result.join('\n');
    
    // 保護已生成的表格 HTML
    const tableMatches = [];
    formatted = formatted.replace(/<div class="md-table-wrapper">[\s\S]*?<\/div>/g, (match) => {
      tableMatches.push(match);
      return `__TABLE_PLACEHOLDER_${tableMatches.length - 1}__`;
    });
    
    // HTML 轉義
    formatted = formatted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    
    // 還原表格
    tableMatches.forEach((table, index) => {
      formatted = formatted.replace(`__TABLE_PLACEHOLDER_${index}__`, table);
    });
    
    // 處理水平分隔線
    formatted = formatted.replace(/^---+$/gm, '<hr class="md-hr">');
    
    // Convert markdown headers (#### > ### > ## > #)
    formatted = formatted.replace(/^#### (.+)$/gm, '<div class="md-header md-h4">$1</div>');
    formatted = formatted.replace(/^### (.+)$/gm, '<div class="md-header md-h3">$1</div>');
    formatted = formatted.replace(/^## (.+)$/gm, '<div class="md-header md-h2">$1</div>');
    formatted = formatted.replace(/^# (.+)$/gm, '<div class="md-header md-h1">$1</div>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^(\d+)\. (.+)$/gm, '<div class="md-list-item md-numbered"><span class="md-list-number">$1.</span> $2</div>');
    
    // Convert bullet list items (• 或 * 或 -)
    formatted = formatted.replace(/^[•\*\-] (.+)$/gm, '<div class="md-list-item"><span class="md-bullet">•</span> $1</div>');
    
    // Convert bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic (單個 * 包圍)
    formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
    
    // Convert markdown links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
    
    // Convert plain URLs
    formatted = formatted.replace(/(?<!href="|">)(https?:\/\/[^\s<"]+)(?!")/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
    
    // Convert line breaks - 減少連續空行
    formatted = formatted.replace(/\n{3,}/g, '\n\n'); // 將3個以上換行縮減為2個
    formatted = formatted.replace(/\n\n/g, '<br>'); // 雙換行變單個br
    formatted = formatted.replace(/\n/g, '<br>'); // 單換行變br
    
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
    const dateContext = getDateContext();
    const filterContext = getFilterContext();
    
    // 檢查是否有輸入訊息或有選擇任何篩選條件
    const hasFilters = startDate || endDate || selectedFloor || selectedShift || selectedFunction;
    if (!message && !hasFilters) return;

    setIsLoading(true);
    
    // 如果沒有輸入訊息但有篩選條件，使用預設查詢訊息
    const displayMessage = message || '請依據篩選條件查詢';
    const fullMessage = (message || '查詢') + dateContext + filterContext;

    // Add user message
    setMessages(prev => [...prev, { content: displayMessage, isUser: true }]);
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
          🤖 SMD Agent 領班助理系統
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

        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">📅 日期：</span>
            <input 
              type="date" 
              className="date-input" 
              value={startDate}
              onChange={handleStartDateChange}
              title="選擇開始日期"
            />
            <span className="date-range-separator">~</span>
            <input 
              type="date" 
              className="date-input" 
              value={endDate}
              onChange={handleEndDateChange}
              title="選擇結束日期"
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">🏢 樓層：</span>
            <select 
              className="filter-select"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="">不限</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>{floor}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">⏰ 班別：</span>
            <select 
              className="filter-select"
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
            >
              <option value="">不限</option>
              {shifts.map(shift => (
                <option key={shift} value={shift}>{shift}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">📊 功能：</span>
            <select 
              className="filter-select"
              value={selectedFunction}
              onChange={(e) => setSelectedFunction(e.target.value)}
            >
              <option value="">不限</option>
              {functions.map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
          </div>

          <button type="button" className="clear-all-btn" onClick={() => { clearDates(); clearFilters(); }}>
            全部重置
          </button>
        </div>

        <div className="chat-input-container">
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input 
              ref={inputRef}
              type="text" 
              className="chat-input" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={startDate || endDate || selectedFloor || selectedShift || selectedFunction ? "可直接發送查詢，或輸入更多訊息..." : "輸入您的訊息..."}
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
              disabled={isLoading}
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
