import { useState } from 'react';
import { commonsThumb } from '../utils/commonsThumb';

// Ảnh động vật; thiếu link hoặc link hỏng thì hiện ô xanh tường có biểu tượng chân thú (không tải thêm ảnh từ xa để tránh lỗi lặp).
// width: cỡ ảnh (px) thật sự cần, để tải bản thu nhỏ của Wikimedia; hero: ảnh lớn đầu trang, chọn 500px hoặc 960px theo màn hình
export default function AnimalImage({ src, alt, className = '', loading = 'lazy', fetchPriority, width = 330, hero = false }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-wall-deep text-label/60 ${className}`}>
        <i className="fa-solid fa-paw text-4xl" aria-hidden="true"></i>
      </div>
    );
  }

  // `fetchpriority` viết thường: React 18 chưa nhận dạng fetchPriority
  return (
    <img
      src={commonsThumb(src, hero ? 960 : width)}
      srcSet={hero && commonsThumb(src, 500) !== src ? `${commonsThumb(src, 500)} 500w, ${commonsThumb(src, 960)} 960w` : undefined}
      sizes={hero ? '100vw' : undefined}
      alt={alt}
      loading={loading}
      fetchpriority={fetchPriority}
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
}
