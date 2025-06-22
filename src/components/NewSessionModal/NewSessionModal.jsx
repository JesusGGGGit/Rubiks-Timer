export default function NewSessionModal({
  show,
  setShow,
  newSessionName,
  setNewSessionName,
  newSessionCubeType,
  setNewSessionCubeType,
  handleCreateSession,
  handleOutsideClick,
}) {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="time-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="time-detail-content">
          <div className="time-detail-header">
            <h3>Crear nueva sesión</h3>
          </div>

          <div className="time-detail-info">
            <div className="time-detail-item">
              <label className="time-detail-label">Nombre:</label>
              <input
                type="text"
                className="time-detail-input"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />

              <select
                className="time-detail-select"
                value={newSessionCubeType}
                onChange={(e) => setNewSessionCubeType(e.target.value)}
              >
                <option value="2x2">2x2</option>
                <option value="3x3">3x3</option>
                <option value="4x4">4x4</option>
                <option value="5x5">5x5</option>
                <option value="6x6">6x6</option>
                <option value="7x7">7x7</option>
                <option value="Pyraminx">Pyraminx</option>
              </select>
            </div>
          </div>

          <div className="time-detail-actions">
            <button className="time-detail-btn" onClick={handleCreateSession}>
              Crear
            </button>
            <button
              className="time-detail-btn secondary"
              onClick={() => setShow(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
