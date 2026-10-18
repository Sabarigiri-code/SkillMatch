import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

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

  useEffect(() => {
    const initWorkspace = async () => {
      const token = localStorage.getItem('token');
      if (token && !activeJobMatchId) {
        try {
          const res = await api.get('/matches');
          if (res.data && res.data.length > 0) {
            const latest = res.data[0];
            if (latest?.id) {
              setActiveJobMatchId(latest.id);
            }
          }
        } catch (e) {
          // silently ignore if not authenticated yet
        }
      }
    };
    initWorkspace();

    const handleMatchCreated = (e) => {
      if (e.detail?.id) {
        setActiveJobMatchId(e.detail.id);
      }
    };
    window.addEventListener('match-created', handleMatchCreated);
    return () => window.removeEventListener('match-created', handleMatchCreated);
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
