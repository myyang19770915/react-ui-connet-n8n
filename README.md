# AI Agent Chat - React 版本

這是一個使用 React + Vite 開發的 AI Agent 聊天介面。

## 功能特色

- ✅ 現代化的聊天介面設計
- ✅ 4種風格主題切換（3D卡通、科技冷光、蘋果簡約、黑暗冷酷）
- ✅ 日期範圍選擇功能
- ✅ Markdown 格式支持（連結、粗體、標題、列表）
- ✅ 即時訊息顯示
- ✅ 輸入中動畫效果
- ✅ 響應式設計

## 安裝依賴

```bash
npm install
```

## 開發模式

```bash
npm run dev
```

應用程式會在 http://localhost:9001 啟動

### 使用自訂 Port

```bash
# 方法 1: 臨時指定 port
npm run dev -- --port 8080

# 方法 2: 使用預設腳本
npm run dev:8080   # 使用 port 8080
npm run dev:5000   # 使用 port 5000
```

## 生產構建

```bash
npm run build
```

構建後的文件會在 `dist` 目錄中

## 預覽生產構建

```bash
npm run preview
```

### 預覽時使用自訂 Port

```bash
# 使用預設 port (9001)
npm run preview

# 使用自訂 port
npm run preview:8080
npm run preview:5000
npm run preview -- --port 9000
```

## 配置說明

### 修改 n8n Webhook URL

如果您的 n8n webhook URL 需要修改，請編輯以下文件：

**文件位置：** `src/App.jsx`  
**修改行數：** 第 4 行

```jsx
const WEBHOOK_URL = 'https://n8n.my-yang.online/webhook/test01';
```

將 URL 替換為您的新 webhook 地址：

```jsx
const WEBHOOK_URL = 'https://your-new-domain.com/webhook/your-path';
```

**注意事項：**
- 開發環境：儲存後會自動熱更新
- 生產環境：需重新執行 `npm run build` 構建

### 修改預設 Port

編輯 `vite.config.js` 文件：

```javascript
export default defineConfig({
  server: {
    port: 9001,  // 修改開發伺服器 port
  },
  preview: {
    port: 9001,  // 修改預覽伺服器 port
  }
})
```

## 部署說明

### 本地部署

執行 `npm run build` 後，將 `dist` 目錄中的文件部署到任何靜態文件伺服器。

### 使用 IIS (Windows)

1. 執行 `npm run build`
2. 在 IIS 中創建新網站
3. 指向 `dist` 目錄
4. 設定綁定的 port 和 domain

### 使用 Nginx

1. 複製 `dist` 目錄到伺服器
2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 雲端部署

**Vercel (推薦):**
```bash
npm install -g vercel
vercel
```

**Netlify:**
- 拖放 `dist` 目錄到 Netlify 網站

**GitHub Pages:**
```bash
npm install -D gh-pages
# 在 package.json 添加 "homepage" 和 "deploy" 腳本
npm run build
npm run deploy
```

## 風格主題

應用程式提供 4 種風格主題，可在右上角切換：

1. **🎨 3D卡通風格** - 紫藍漸變，立體陰影，圓潤可愛
2. **⚡ 科技冷光風格** - 深藍黑背景，青色霓虹發光效果
3. **🍎 蘋果簡約風格** - 淺灰白背景，極簡設計，iOS 風格
4. **🌙 黑暗冷酷風格** - 深色背景，紅色點綴，冷酷專業

## 技術棧

- React 18
- Vite 5
- CSS3

## 專案結構

```
n8n_workflow_ui/
├── src/
│   ├── App.jsx          # 主要 React 組件
│   ├── App.css          # 樣式文件（含4種主題）
│   └── main.jsx         # React 入口文件
├── index.html           # HTML 模板
├── index-old.html       # 原始純 HTML 版本（備份）
├── package.json         # 依賴配置
├── vite.config.js       # Vite 配置
└── README.md           # 說明文檔
```

## 常見問題

**Q: 如何切換回原始的純 HTML 版本？**  
A: 將 `index-old.html` 重命名為 `index.html` 即可。

**Q: 為什麼風格按鈕沒有顯示？**  
A: 確保使用的是 React 版本（`index.html` 應該包含 `<div id="root"></div>`），並執行 `npm run dev`。

**Q: 部署後 Port 如何決定？**  
A: 生產環境的 port 由您的 Web 伺服器（IIS、Nginx 等）配置決定，而非 Vite。
