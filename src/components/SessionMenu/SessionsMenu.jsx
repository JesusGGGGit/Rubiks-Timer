export default function SessionsMenu({ sessions, activeSessionId, switchSession, openNewSessionForm, showNewSessionButton = true }) {
  return (
    <div className="sessions-menu">
      <div className="sort-select-wrapper">
        <select
          value={activeSessionId}
          onChange={(e) => switchSession(e.target.value)}
          className="session-selector"
        >
          {sessions.map(session => (
            <option key={session.id} value={session.id}>
              {`${session.name}(${session.cubeType || '3x3'})•${session.times.length}`}
            </option>
          ))}
        </select>
      </div>
      {showNewSessionButton && (
        <button
          className="new-session-btn"
          onClick={openNewSessionForm}
          title="Crear nueva sesión"
        >
          +
        </button>
      )}
    </div>
  );
}
