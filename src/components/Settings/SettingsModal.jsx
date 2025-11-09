import "./SettingsModal.css"; 
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SettingsModal({
  showSettings,
  activeSettingsTab,
  setActiveSettingsTab,
  bgColor,
  setBgColor,
  textColor,
  setTextColor,
  scrambleColor,
  setScrambleColor,
  timerSize,
  setTimerSize,
  holdToStart,
  setHoldToStart,
  inspectionTime,
  setInspectionTime,
  inspectionDuration,
  setInspectionDuration,
  dontAskAgain,
  setDontAskAgain,
  resetTimes,
  sessions,
  renameSession,
  deleteSession,
  activeSessionId,
  createNewSession,
  scrambleSize,
  setScrambleSize,
  cubeSize,
  setCubeSize,      
  setShowSettings,
  showCube,
  setShowCube,
}) {
   const navigate = useNavigate();
   const { user, logout } = useAuth();
   if (!showSettings) return null;
  
  // mobile detection not needed here; settings modal layout is handled via CSS/responsive rules
  
  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowSettings(false);
    }
  };

  
  
  return (
    <div className="modal-overlay settings-modal" onClick={handleOutsideClick}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-sidebar">
          {["apariencia", "comportamiento", "tiempos", "sesiones", "cuenta"].map((tab) => (
            <button
              key={tab}
              className={`settings-tab ${activeSettingsTab === tab ? "active" : ""}`}
              onClick={() => setActiveSettingsTab(tab)}
            >
              {{
                apariencia: "🎨 Apariencia",
                comportamiento: "⚙️ Comportamiento",
                tiempos: "⏱️ Tiempos",
                sesiones: "📁 Sesiones",
                scramble: "🔀 Scramble",
                cuenta: "👤 Cuenta",
              }[tab]}
            </button>
          ))}
        </div>

        <div className="settings-main">
          {activeSettingsTab === "apariencia" && (
            <div className="settings-section">
              <h3>Personalización Visual</h3>
              <div className="setting-group">
                <label>
                  Color de fondo:
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </label>
              </div>
              <div className="setting-group">
                <label>
                  Color del timer:
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
                </label>
              </div>
              <div className="setting-group">
                <label>
                  Color del scramble:
                  <input type="color" value={scrambleColor} onChange={(e) => setScrambleColor(e.target.value)} />
                </label>
              </div>
              <div className="setting-group">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!showCube}
                    onChange={(e) => { if (typeof setShowCube === 'function') setShowCube(e.target.checked); }}
                  />
                  <span className="slider"></span>
                  Mostrar cubo
                </label>
                <p className="setting-description">Activa para mostrar el cubo de visualización en la interfaz.</p>
              </div>
            </div>
          )}

          {activeSettingsTab === "comportamiento" && (
            <div className="settings-section">
              <h3>Comportamiento del Timer</h3>
              <div className="setting-group">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={holdToStart}
                    onChange={(e) => setHoldToStart(e.target.checked)}
                  />
                  <span className="slider"></span>
                  Mantener espacio para iniciar
                </label>
                <p className="setting-description">Desactívalo para iniciar/detener con un solo clic</p>
              </div>
              <div className="setting-group">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={inspectionTime}
                    onChange={(e) => setInspectionTime(e.target.checked)}
                  />
                  <span className="slider"></span>
                  Habilitar tiempo de inspección
                </label>
                {inspectionTime && (
                  <div className="setting-subgroup">
                    <label>
                      Duración (segundos):
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={inspectionDuration}
                        onChange={(e) =>
                          setInspectionDuration(
                            Math.max(5, Math.min(60, parseInt(e.target.value) || 15))
                          )
                        }
                      />
                    </label>
                  </div>
                )}
                <p className="setting-description">Tiempo para inspeccionar el cubo antes de comenzar</p>
              </div>
            </div>
          )}

          {activeSettingsTab === "tiempos" && (
            <div className="settings-section">
              <h3>Gestión de Tiempos</h3>
              <div className="setting-group">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={!!dontAskAgain}
                    onChange={(e) => { if (typeof setDontAskAgain === 'function') setDontAskAgain(e.target.checked); }}
                  />
                  <span className="slider"></span>
                  No preguntar antes de borrar
                </label>
              </div>
              <div className="setting-group">
                <button className="danger-button" onClick={() => {
                  // Prefer the shared dontAskAgain preference if available
                  const shouldSkip = !!dontAskAgain;
                  if (shouldSkip) {
                    // call resetTimes for current active session
                    try { resetTimes(activeSessionId); } catch (e) { resetTimes(); }
                  } else {
                    if (window.confirm("¿Estás seguro de que quieres borrar todos los tiempos de esta sesión?")) {
                      try { resetTimes(activeSessionId); } catch (e) { resetTimes(); }
                    }
                  }
                }}>
                  Borrar todos los tiempos
                </button>
                <p className="setting-description">Esta acción borrará los tiempos solo de la sesión actual</p>
              </div>
            </div>
          )}

          {activeSettingsTab === "sesiones" && (
            <div className="settings-section">
              <h3>Gestión de Sesiones</h3>
              <div className="sessions-list">
                {sessions.map((session) => (
                  <div key={session.id} className="session-item">
                    <input
                      type="text"
                      value={session.name}
                      onChange={(e) => renameSession(session.id, e.target.value)}
                    />
                    <span>{session.times.length} tiempos</span>
                    {sessions.length > 1 && (
                      <button
                        className="danger-button small"
                        onClick={() => deleteSession(session.id)}
                        disabled={session.id === activeSessionId}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button className="primary-button" onClick={createNewSession}>
                Crear Nueva Sesión
              </button>
            </div>
          )}

          {activeSettingsTab === "scramble" && (
            <div className="settings-section">
              <h3>Configuración de Scramble</h3>
              <div className="setting-group">
                <p>El tamaño del scramble y del cubo se ajustan automáticamente al tamaño de la pantalla para garantizar una visualización correcta en todos los dispositivos.</p>
              </div>
            </div>
          )}

          {activeSettingsTab === "cuenta" && (
            <div className="settings-section">
              <h3>Cuenta</h3>
              {user ? (
                <div>
                  <p>Conectado como: <strong>{user.displayName || user.email}</strong></p>
                  <button className="primary-button" onClick={() => { logout(); setShowSettings(false); }}>
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <div>
                  <p>No hay ninguna sesión iniciada.</p>
                  <button className="primary-button" onClick={() => { setShowSettings(false); navigate('/login'); }}>
                    Ir a iniciar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="settings-footer">
            <button className="close-button" onClick={() => setShowSettings(false)}>
              Cerrar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}