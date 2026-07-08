import { createContext, useContext, useState, useEffect } from 'react';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(() => {
    try {
      const raw = localStorage.getItem('student');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [trilha, setTrilha] = useState(() => {
    try {
      const raw = localStorage.getItem('trilha');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (student) localStorage.setItem('student', JSON.stringify(student));
      else localStorage.removeItem('student');
    } catch (e) {
      // ignore
    }
  }, [student]);

  useEffect(() => {
    try {
      if (trilha && trilha.length) localStorage.setItem('trilha', JSON.stringify(trilha));
      else localStorage.removeItem('trilha');
    } catch (e) {
      // ignore
    }
  }, [trilha]);

  return (
    <StudentContext.Provider value={{ student, setStudent, trilha, setTrilha }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent deve ser usado dentro de StudentProvider');
  return context;
}
