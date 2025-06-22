export default function TimesList({
  activeSession,
  sortOrder,
  stats,
  openTimeDetailModal,
  requestDeleteTime,
  formatTimeFull,
  getSortedTimes
}) {
  if (activeSession.times.length === 0) {
    return (
      <div className="times-list">
        <div className="empty-state">
          <p>No hay tiempos registrados aún</p>
        </div>
      </div>
    );
  }

  return (
    <div className="times-list">
      {getSortedTimes(activeSession, sortOrder).map((t) => (
        <div
          key={t.index}
          className={`time-entry ${
            stats.numericTimes[t.index] === stats.bestTime ? "best-time" : ""
          }`}
          onClick={() => openTimeDetailModal(t.index)}
        >
          <div className="time-info">
            <span className="time-index">{t.index + 1}.</span>
            <span className="time-value">
              {formatTimeFull(
                t.time,
                t.index,
                activeSession.plusTwoTimes,
                activeSession.dnfTimes
              )}
            </span>
            {stats.numericTimes[t.index] === stats.bestTime && (
              <span className="best-badge">★</span>
            )}
          </div>
          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              requestDeleteTime(t.index);
            }}
            aria-label="Borrar tiempo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
