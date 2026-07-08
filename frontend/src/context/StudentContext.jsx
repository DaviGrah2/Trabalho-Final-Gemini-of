import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getStudent } from '../api.js';

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

  const hasFetchedStudent = useRef(false);

  useEffect(() => {
    if (!student || hasFetchedStudent.current) return;
    hasFetchedStudent.current = true;
    async function reloadStudent() {
      try {
        const updatedStudent = await getStudent(student.id);
        if (updatedStudent && updatedStudent.id) {
          setStudent((current) => ({ ...current, ...updatedStudent }));
        }
      } catch (e) {
        // ignore. keep local student if server is unavailable.
      }
    }
    reloadStudent();
  }, [student]);

  // Ensure we attempt to resync from server on full app mount (covers HMR/refresh cases)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('student');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.id) return;
      (async () => {
        try {
          const updated = await getStudent(parsed.id);
          if (updated && updated.id) setStudent((cur) => ({ ...(cur || {}), ...updated }));
        } catch (e) {
          // ignore
        }
      })();
    } catch (e) {
      // ignore
    }
  }, []);

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
