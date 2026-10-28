import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
// 1. Bổ sung dòng import này:
import { VisitorProvider } from './context/VisitorContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ZooAudioGuide"></BrowserRouter>
    {/* 2. Bọc VisitorProvider ra ngoài cùng */}
    <VisitorProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </VisitorProvider>
  </React.StrictMode>
);