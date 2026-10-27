import { Routes, Route } from 'react-router-dom';
// Các Layout chính (Sẽ tạo sau)
import VisitorLayout from './layouts/VisitorLayout';
import AdminLayout from './layouts/AdminLayout';

// Các trang (Pages)
import VisitorHome from './pages/visitor/Home';
import VisitorMap from './pages/visitor/Map';
import AdminDashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <Routes>
      {/* 1. Phân hệ Du khách */}
      <Route element={<VisitorLayout />}>
        <Route path="/" element={<VisitorHome />} />
        <Route path="/map" element={<VisitorMap />} />
      </Route>

      {/* 2. Phân hệ Quản trị viên */}
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Các route con của admin như /admin/zones, /admin/animals sẽ thêm vào đây */}
      </Route>
    </Routes>
  );
}