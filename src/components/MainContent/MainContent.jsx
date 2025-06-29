import CubeVisualization from '../CubeVisualization/CubeVisualization';

export default function MainContent({
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
    <main className="main-content">
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

      <div className="timer-container">
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

      <div className="cube-container">
        <CubeVisualization
          cubeState={cubeState}
          cubeType={activeSession.cubeType || '3x3'}
        />
      </div>

      <div className="instructions">
        <p>
          {inspectionTime
            ? "Presiona espacio para inspección • Mantén para iniciar • Suelta para detener"
            : holdToStart
            ? "Mantén espacio para preparar • Suelta para iniciar • Presiona nuevamente para detener"
            : "Presiona espacio para iniciar/detener"}
        </p>
      </div>
    </main>
  );
}