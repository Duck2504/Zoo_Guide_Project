import { createContext, useState, useContext } from 'react';

const VisitorContext = createContext();

export const VisitorProvider = ({ children }) => {
  const [language, setLanguage] = useState('vi');
  const [activeAnimal, setActiveAnimal] = useState(null); // Thú đang được chọn
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát audio

  return (
    <VisitorContext.Provider value={{
      language, setLanguage,
      activeAnimal, setActiveAnimal,
      isPlaying, setIsPlaying
    }}>
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => useContext(VisitorContext);