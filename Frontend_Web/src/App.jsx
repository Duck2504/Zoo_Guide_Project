import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Layouts
import VisitorLayout from './layouts/VisitorLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import VisitorHome from './pages/visitor/Home';
import VisitorMap from './pages/visitor/Map';
import AnimalDetail from './pages/visitor/AnimalDetail';
import AdminDashboard from './pages/admin/Dashboard';
import AnimalManager from './pages/admin/AnimalManager';
import ZoneManager from './pages/admin/ZoneManager';
import QrCodeIndex from './pages/admin/HomeAccessManager'
// Khởi tạo GA4 một lần duy nhất ở ngoài Component
ReactGA.initialize("G-XXXXXXXXXX"); // Đừng quên thay mã G- của em vào đây

export default function App() {
  const location = useLocation();

  // Bắt sự kiện mỗi khi URL thay đổi (Route đổi) và báo cáo lên GA4
  useEffect(() => {
    ReactGA.send({ 
      hitType: "pageview", 
      page: location.pathname + location.search 
    });
  }, [location]);

  return (
    <Routes>
      {/* 1. Phân hệ Du khách */}
      <Route element={<VisitorLayout />}>
        <Route path="/" element={<VisitorHome />} />
        <Route path="/map" element={<VisitorMap />} />
        <Route path="/a/:id" element={<AnimalDetail />} />
      </Route>

      {/* 2. Phân hệ Quản trị viên */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/animals" element={<AnimalManager />} />
        <Route path="/admin/zones" element={<ZoneManager/>} />
        <Route path="/admin/QrCode" element={<QrCodeIndex/>} />
      </Route>
    </Routes>
  );
}