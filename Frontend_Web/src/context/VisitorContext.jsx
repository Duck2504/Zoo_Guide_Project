import { createContext, useEffect, useState, useContext } from 'react';
import { API } from '../config';

const VisitorContext = createContext();

// Dùng khi chưa tải được bảng Languages (mạng chậm, server đang khởi động): đúng 4 ngôn ngữ đang có trong DB
const FALLBACK_LANGUAGES = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' }
];

export const VisitorProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES);
  const [activeAnimal, setActiveAnimal] = useState(null); // Thú đang được chọn
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát audio

  // Danh sách ngôn ngữ lấy từ bảng Languages trong DB
  useEffect(() => {
    fetch(`${API}/api/languages`)
      .then(res => (res.ok ? res.json() : null))
      .then(list => { if (Array.isArray(list) && list.length) setLanguages(list); })
      .catch(() => { /* giữ danh sách dự phòng */ });
  }, []);

  // Ngôn ngữ đang chọn không còn trong DB thì quay về tiếng Việt
  useEffect(() => {
    if (!languages.some(l => l.code === language)) setLanguage('vi');
  }, [languages, language]);

  return (
    <VisitorContext.Provider value={{
      language, setLanguage, languages,
      activeAnimal, setActiveAnimal,
      isPlaying, setIsPlaying
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => useContext(VisitorContext);
