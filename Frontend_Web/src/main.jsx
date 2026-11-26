import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { VisitorProvider } from './context/VisitorContext';

// Trang đang mở là bản cũ mà gói JS của trang con đã bị deploy thay: tải lại một lần để lấy bản mới (tránh trang trắng)
window.addEventListener('vite:preloadError', () => {
  if (sessionStorage.getItem('zoo_reloaded')) return;
  sessionStorage.setItem('zoo_reloaded', '1');
  location.reload();
});
setTimeout(() => sessionStorage.removeItem('zoo_reloaded'), 10000); // chạy ổn 10 giây thì cho phép tự tải lại ở lần deploy sau

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <VisitorProvider>
        <App />
      </VisitorProvider>
    </BrowserRouter>
  </React.StrictMode>
);