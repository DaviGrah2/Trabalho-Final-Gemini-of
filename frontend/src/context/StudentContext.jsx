import { createContext, useContext, useState } from 'react';

const StudentContext = createContext(null);

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [trilha, setTrilha] = useState([]);

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
