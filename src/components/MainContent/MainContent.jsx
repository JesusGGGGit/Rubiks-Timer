import CubeVisualization from '../CubeVisualization/CubeVisualization';

export default function MainContent({
  fullScreenTimer,
  setShowSettings,
  scrambleColor,
  scramble,
  scrambleSize, 
  showDnf,
  inspectionRunning,
  textColor,
  formatTimeDisplay,
  time,
  ready,
  inspectionTime,
  holdToStart,
  bgColor,
  cubeState,
  activeSession
}) {

  return (
    <main className={`main-content ${fullScreenTimer ? "full-screen" : ""}`}>
      {!fullScreenTimer && (
        <>
          <button className="settings-button" onClick={() => setShowSettings(true)}>
            ⚙️
          </button>
<div className="scramble-display">
  <div
    className="scramble-label"
    style={{ color: scrambleColor, fontSize: `${scrambleSize}px` }}
  >
    Scramble
  </div>
  <div
    className="scramble-text"
    style={{ color: scrambleColor, fontSize: `${scrambleSize}px` }}
  >
    {scramble}
  </div>
</div>

        </>
      )}

      <div className={`timer-container ${fullScreenTimer ? "full-screen" : ""}`}>
        {showDnf ? (
          <div className={`dnf-mode ${inspectionRunning ? "inspecting" : ""}`} style={{ color: textColor }}>
            <span className="dnf-text">DNF</span>
          </div>
        ) : (
          <div className={`timer-display ${inspectionRunning ? "inspecting" : ""} ${ready ? "ready" : ""}`}
               style={{ color: textColor }}>
            {formatTimeDisplay(time)}
          </div>
        )}
      </div>
      {!fullScreenTimer && (
        <div
          className="cube-container"
          style={{
         
          }}
        >
          <CubeVisualization
            cubeState={cubeState}
            cubeType={activeSession.cubeType || '3x3'}
          />
        </div>
      )}
      {!fullScreenTimer && (
        <div className="instructions">
          <p>
            {inspectionTime
              ? "Presiona espacio para inspección • Mantén para iniciar • Suelta para detener"
              : holdToStart
              ? "Mantén espacio para preparar • Suelta para iniciar • Presiona nuevamente para detener"
              : "Presiona espacio para iniciar/detener"}
          </p>
        </div>
      )}


    </main>
  );
}
