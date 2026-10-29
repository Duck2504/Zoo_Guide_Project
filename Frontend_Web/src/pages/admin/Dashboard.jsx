import { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalScans: 0,
    onlineUsers: 0,
    dailyStats: [],
    topAnimals: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Hàm gọi API lấy dữ liệu
  const fetchStats = async () => {
    try {
      // Nhớ đổi port 5000 thành port Backend thật của em
      const res = await fetch(`https://zooaudioguide-001-site1.ftempurl.com/api/admin/stats/overview`); 
      if (res.ok) {
        const data = await res.json();
        // Format lại ngày tháng cho biểu đồ
        const formattedData = {
          ...data,
          dailyStats: data.dailyStats.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          }))
        };
        setStats(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thống kê:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Gọi ngay lần đầu tiên
    fetchStats();

    // Thiết lập Polling: Tự động gọi lại API mỗi 15 giây (US-10)
    const intervalId = setInterval(() => {
      fetchStats();
    }, 15000);

    // Dọn dẹp interval khi chuyển sang trang khác
    return () => clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Đang tải số liệu...</div>;
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800">Thống Kê Tổng Quan</h1>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Cập nhật thời gian thực (15s)
        </div>
      </div>

      {/* THẺ SỐ LIỆU TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-bold mb-1">Số người đang Online</p>
            <h2 className="text-4xl font-black text-zoo-600">{stats.onlineUsers}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-zoo-50 flex items-center justify-center text-zoo-500 text-2xl">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-slate-500 font-bold mb-1">Tổng lượt quét QR / GPS</p>
            <h2 className="text-4xl font-black text-slate-800">{stats.totalScans}</h2>
          </div>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-2xl">
            <i className="fa-solid fa-qrcode"></i>
          </div>
        </div>
      </div>

      {/* KHU VỰC BIỂU ĐỒ & BẢNG XẾP HẠNG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Biểu đồ lượt truy cập 7 ngày (US-08) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Lượt truy cập 7 ngày gần nhất</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="count" name="Lượt quét" stroke="#10b981" strokeWidth={4} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bảng xếp hạng thú được quan tâm (US-09) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Động vật được quan tâm</h3>
          <div className="space-y-4">
            {stats.topAnimals.length === 0 ? (
              <p className="text-sm text-slate-500 italic text-center py-4">Chưa có dữ liệu</p>
            ) : (
              stats.topAnimals.map((animal, index) => (
                <div key={animal.animalId} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition">
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-slate-200 text-slate-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'}`}>
                      {index + 1}
                    </span>
                    <span className="font-bold text-slate-700">{animal.animalName}</span>
                  </div>
                  <span className="text-sm font-black text-zoo-600 bg-zoo-50 px-3 py-1 rounded-full">
                    {animal.scanCount} lượt
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}