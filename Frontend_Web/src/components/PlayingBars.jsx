// Ba vạch nhảy cạnh tên khi thuyết minh đang phát (giảm chuyển động: vạch đứng yên). Chỉ để nhìn, chữ "đang phát" đã có ở nơi khác.
export default function PlayingBars({ className = '' }) {
  return (
    <span className={`playing-bars ${className}`} aria-hidden="true">
      <span /><span /><span />
    </span>
  );
}
