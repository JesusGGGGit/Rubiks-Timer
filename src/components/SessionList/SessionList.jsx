import React from 'react';

export default function SessionList({ 
  sessions, 
  activeSessionId, 
  switchSession, 
  openNewSessionForm,
  renameSession,
  deleteSession 
}) {
  return (
    <div className="sessions-list">
      <div className="sessions-header">
        <h3>Sesiones</h3>
        <button onClick={openNewSessionForm}>+ Nueva</button>
      </div>
      
      <ul>
        {sessions.map(session => (
          <li 
            key={session.id} 
            className={session.id === activeSessionId ? 'active' : ''}
            onClick={() => switchSession(session.id)}
          >
            <span>{session.name}</span>
            <div className="session-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("Nuevo nombre:", session.name);
                  if (newName) renameSession(session.id, newName);
                }}
              >
                Renombrar
              </button>
              {sessions.length > 1 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                >
                  Eliminar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}