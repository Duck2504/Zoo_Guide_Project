import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import VisitorLayout from './layouts/VisitorLayout';
import AdminLayout from './layouts/AdminLayout';

// Trang chủ tải ngay; các trang khác tách gói riêng, chỉ tải khi mở tới
import VisitorHome from './pages/visitor/Home';
const VisitorMap = lazy(() => import('./pages/visitor/Map'));
const AnimalDetail = lazy(() => import('./pages/visitor/AnimalDetail'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AnimalManager = lazy(() => import('./pages/admin/AnimalManager'));
const ZoneManager = lazy(() => import('./pages/admin/ZoneManager'));
const QrCodeIndex = lazy(() => import('./pages/admin/HomeAccessManager'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={null}>
    <Routes>
      {/* 1. Phân hệ Du khách */}
      <Route element={<VisitorLayout />}>
        <Route path="/" element={<VisitorHome />} />
        <Route path="/map" element={<VisitorMap />} />
        <Route path="/a/:id" element={<AnimalDetail />} />
      </Route>

      {/* 2. Phân hệ Quản trị viên (trang đăng nhập nằm ngoài AdminLayout để không bị chuyển hướng vòng lặp) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/animals" element={<AnimalManager />} />
        <Route path="/admin/zones" element={<ZoneManager/>} />
        <Route path="/admin/QrCode" element={<QrCodeIndex/>} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}