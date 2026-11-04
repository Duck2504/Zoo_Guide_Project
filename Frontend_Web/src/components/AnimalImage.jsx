import { useState } from 'react';

// Ảnh động vật; thiếu link hoặc link hỏng thì hiện ô xanh có biểu tượng chân thú (không tải thêm ảnh từ xa để tránh lỗi lặp).
export default function AnimalImage({ src, alt, className = '', loading = 'lazy', fetchPriority }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-gradient-to-br from-zoo-600 to-zoo-900 text-white/70 ${className}`}>
        <i className="fa-solid fa-paw text-4xl" aria-hidden="true"></i>
      </div>
    );
  }

  // `fetchpriority` viết thường: React 18 chưa nhận dạng fetchPriority
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchpriority={fetchPriority}
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className}`}
    />
  );
}
