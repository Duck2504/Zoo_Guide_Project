import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  PawPrint,
  QrCode,
  RefreshCw,
  UsersRound,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { API } from '../../config';
import { adminFetch } from '../../utils/adminFetch';

const EMPTY_STATS = {
  totalScans: 0,
  onlineUsers: 0,
  dailyStats: [],
  topAnimals: [],
};

const numberFormat = new Intl.NumberFormat('vi-VN');

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {numberFormat.format(value)}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-400">{detail}</p>
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
          <Icon size={22} strokeWidth={2.2} />
        </span>
      </div>
    </article>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-extrabold text-emerald-700">
        {numberFormat.format(payload[0].value)} lượt quét
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async ({ showRefresh = false } = {}) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const res = await adminFetch(`${API}/api/admin/stats/overview`);
      if (!res.ok) {
        const message = res.status === 401
          ? 'Mã quản trị chưa được nhập hoặc không hợp lệ. Hãy nhập mã ở thanh bên.'
          : `Không tải được thống kê (HTTP ${res.status}). Vui lòng thử lại.`;
        setError(message);
        return;
      }

      const data = await res.json();
      setStats({
        totalScans: Number(data.totalScans) || 0,
        onlineUsers: Number(data.onlineUsers) || 0,
        dailyStats: Array.isArray(data.dailyStats)
          ? data.dailyStats.map(item => ({
            ...item,
            dateLabel: formatDate(item.date),
            count: Number(item.count) || 0,
          }))
          : [],
        topAnimals: Array.isArray(data.topAnimals) ? data.topAnimals : [],
      });
      setLastUpdated(new Date());
      setError('');
    } catch (fetchError) {
      console.error('Lỗi khi tải dữ liệu thống kê:', fetchError);
      setError('Không thể kết nối máy chủ. Kiểm tra backend rồi thử tải lại.');
    } finally {
      setIsLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const intervalId = window.setInterval(() => fetchStats(), 15000);
    return () => window.clearInterval(intervalId);
  }, [fetchStats]);

  const todayKey = new Date().toLocaleDateString('vi-VN');
  const todayScans = stats.dailyStats.reduce((total, item) => {
    const itemDate = new Date(item.date);
    return itemDate.toLocaleDateString('vi-VN') === todayKey ? total + item.count : total;
  }, 0);
  const averageScans = stats.dailyStats.length
    ? Math.round(stats.dailyStats.reduce((sum, item) => sum + item.count, 0) / stats.dailyStats.length)
    : 0;
  const maxAnimalScans = Math.max(1, ...stats.topAnimals.map(animal => Number(animal.scanCount) || 0));

  if (isLoading) {
    return (
      <div className="grid min-h-full place-items-center bg-slate-50 p-6">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm">
          <RefreshCw className="animate-spin text-emerald-600" size={18} />
          Đang tải dữ liệu thống kê...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#f5f7f5] px-4 py-5 sm:px-6 sm:py-7 lg:px-9">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-7 text-white shadow-lg shadow-emerald-950/10 sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[38px] border-white/[0.05]" />
          <div className="pointer-events-none absolute -bottom-36 right-40 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-100">
                <Activity size={14} />
                TRUNG TÂM ĐIỀU HÀNH
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Tổng quan hoạt động</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-100/80 sm:text-base">
                Theo dõi lượt tham quan và những loài vật đang được quan tâm tại sở thú.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-emerald-50">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </span>
                Tự cập nhật mỗi 15 giây
              </div>
              <button
                type="button"
                onClick={() => fetchStats({ showRefresh: true })}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-70"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Làm mới
              </button>
            </div>
          </div>
          <div className="relative mt-6 flex items-center gap-2 text-xs font-medium text-emerald-100/70">
            <Clock3 size={14} />
            {lastUpdated
              ? `Cập nhật lần cuối lúc ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Chưa có dữ liệu cập nhật'}
          </div>
        </header>

        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">{error}</p>
            <button
              type="button"
              onClick={() => fetchStats({ showRefresh: true })}
              className="shrink-0 self-start rounded-lg px-3 py-1.5 font-bold text-amber-800 transition hover:bg-amber-100 sm:self-auto"
            >
              Thử lại
            </button>
          </div>
        )}

        <section aria-label="Các chỉ số chính" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Tổng lượt quét"
            value={stats.totalScans}
            detail="Tất cả lượt QR và GPS đã ghi nhận"
            icon={QrCode}
            tone="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="Đang trực tuyến"
            value={stats.onlineUsers}
            detail="Số người dùng online hiện tại"
            icon={UsersRound}
            tone="bg-sky-50 text-sky-700"
          />
          <StatCard
            label="Lượt quét hôm nay"
            value={todayScans}
            detail="Theo dữ liệu thống kê trong ngày"
            icon={CalendarDays}
            tone="bg-amber-50 text-amber-700"
          />
          <StatCard
            label="Trung bình mỗi ngày"
            value={averageScans}
            detail={`Tính trên ${stats.dailyStats.length} ngày có dữ liệu`}
            icon={Activity}
            tone="bg-violet-50 text-violet-700"
          />
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
          <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">Lượt tham quan gần đây</h2>
                <p className="mt-1 text-sm text-slate-500">Biến động lượt quét theo ngày</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700">7 ngày gần nhất</span>
            </div>
            {stats.dailyStats.length ? (
              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyStats} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
                    <defs>
                      <linearGradient id="scanLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#0f766e" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef2f0" vertical={false} strokeDasharray="4 5" />
                    <XAxis
                      dataKey="dateLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Lượt quét"
                      stroke="url(#scanLine)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#047857', stroke: '#d1fae5', strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-6 grid h-64 place-items-center rounded-xl bg-slate-50 px-4 text-center">
                <div>
                  <Activity className="mx-auto text-slate-300" size={30} />
                  <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có dữ liệu lượt quét</p>
                  <p className="mt-1 text-xs text-slate-400">Biểu đồ sẽ xuất hiện khi có lượt tham quan.</p>
                </div>
              </div>
            )}
          </article>

          <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">Động vật nổi bật</h2>
                <p className="mt-1 text-sm text-slate-500">Được quét nhiều nhất</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
                <PawPrint size={20} />
              </span>
            </div>
            {stats.topAnimals.length ? (
              <div className="mt-5 space-y-1">
                {stats.topAnimals.slice(0, 6).map((animal, index) => {
                  const scans = Number(animal.scanCount) || 0;
                  return (
                    <div key={animal.animalId ?? `${animal.animalName}-${index}`} className="rounded-xl px-2 py-3 transition hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                          index === 0 ? 'bg-amber-100 text-amber-700'
                            : index === 1 ? 'bg-slate-200 text-slate-600'
                              : index === 2 ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-500'
                        }`}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-slate-700">{animal.animalName || 'Chưa đặt tên'}</p>
                            <span className="shrink-0 text-xs font-extrabold text-slate-600">{numberFormat.format(scans)}</span>
                          </div>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-emerald-300'}`}
                              style={{ width: `${Math.max(4, (scans / maxAnimalScans) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 grid min-h-56 place-items-center rounded-xl bg-slate-50 px-4 text-center">
                <div>
                  <PawPrint className="mx-auto text-slate-300" size={30} />
                  <p className="mt-3 text-sm font-semibold text-slate-600">Chưa có dữ liệu động vật</p>
                </div>
              </div>
            )}
            <Link
              to="/admin/animals"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
            >
              Quản lý động vật
              <ArrowUpRight size={16} />
            </Link>
          </article>
        </section>
      </div>
    </div>
  );
}
