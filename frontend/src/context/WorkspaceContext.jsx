import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [activeJobMatchId, setActiveJobMatchId] = useState(() => {
    return localStorage.getItem('activeJobMatchId') || null;
  });

  useEffect(() => {
    if (activeJobMatchId) {
      localStorage.setItem('activeJobMatchId', activeJobMatchId);
    } else {
      localStorage.removeItem('activeJobMatchId');
    }
  }, [activeJobMatchId]);

  return (
    <WorkspaceContext.Provider value={{ activeJobMatchId, setActiveJobMatchId }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  return useContext(WorkspaceContext);
};
