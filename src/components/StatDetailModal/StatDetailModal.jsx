import { formatTimeFull } from '../utils/formatUtils';
import { getStdDevDescription, getStdDevColor } from '../utils/Descriptions';
import './StatDetailModal.css';

function StatDetailModal({ selectedStat, stats, activeSession, setShowStatsModal, openTimeDetailModal }) {
  if (!selectedStat) return null;

  const handleOutsideClick = () => {
    setShowStatsModal(false);
  };

  const statInfo = {
    bestTime: {
      title: "Mejor Tiempo",
      description: "El tiempo más rápido que has conseguido en esta sesión.",
      value: formatTimeFull(stats.bestTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes),
      times: stats.validTimes.filter(t => !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === stats.bestTime)
    },
    worstTime: {
      title: "Peor Tiempo",
      description: "El tiempo más lento que has conseguido en esta sesión (sin contar DNFs).",
      value: formatTimeFull(stats.worstTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes),
      times: stats.validTimes.filter(t => !t.isDNF && (t.isPlusTwo ? t.time + 2000 : t.time) === stats.worstTime)
    },
    ao5: {
      title: "Promedio de 5 (Ao5)",
      description: "El promedio de tus últimos 5 tiempos (excluyendo el mejor y el peor).",
      value: stats.ao5 !== null ? formatTimeFull(stats.ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: activeSession.times.slice(-5)
    },
    ao12: {
      title: "Promedio de 12 (Ao12)",
      description: "El promedio de tus últimos 12 tiempos (excluyendo el mejor y el peor).",
      value: stats.ao12 !== null ? formatTimeFull(stats.ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: activeSession.times.slice(-12)
    },
    ao50: {
      title: "Promedio de 50 (Ao50)",
      description: "El promedio de tus últimos 50 tiempos (excluyendo el mejor y el peor).",
      value: stats.ao50 !== null ? formatTimeFull(stats.ao50, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: activeSession.times.slice(-50)
    },
    ao100: {
      title: "Promedio de 100 (Ao100)",
      description: "El promedio de tus últimos 100 tiempos (excluyendo el mejor y el peor).",
      value: stats.ao100 !== null ? formatTimeFull(stats.ao100, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: activeSession.times.slice(-100)
    },
    mo3: {
      title: "Promedio General",
      description: "El promedio de todos tus tiempos registrados.",
      value: stats.mo3 !== null ? formatTimeFull(stats.mo3, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: activeSession.times
    },
    bestAo5: {
      title: "Mejor Ao5",
      description: "El mejor promedio de 5 tiempos consecutivos que has conseguido.",
      value: stats.bestAo5 !== null ? formatTimeFull(stats.bestAo5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: []
    },
    worstAo5: {
      title: "Peor Ao5",
      description: "El peor promedio de 5 tiempos consecutivos que has conseguido.",
      value: stats.worstAo5 !== null ? formatTimeFull(stats.worstAo5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: []
    },
    bestAo12: {
      title: "Mejor Ao12",
      description: "El mejor promedio de 12 tiempos consecutivos que has conseguido.",
      value: stats.bestAo12 !== null ? formatTimeFull(stats.bestAo12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: []
    },
    worstAo12: {
      title: "Peor Ao12",
      description: "El peor promedio de 12 tiempos consecutivos que has conseguido.",
      value: stats.worstAo12 !== null ? formatTimeFull(stats.worstAo12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "--:--",
      times: []
    },
    stdDev: {
      title: "Coeficiente de Variación",
      description: (stats.stdDev !== null && stats.overallAverage > 0)
        ? getStdDevDescription((stats.stdDev / stats.overallAverage) * 100)
        : "No hay datos suficientes para calcular la consistencia.",
      value: stats.stdDev !== null && stats.overallAverage > 0
        ? (
          <span style={{ color: getStdDevColor((stats.stdDev / stats.overallAverage) * 100) }}>
            {(stats.stdDev / stats.overallAverage * 100).toFixed(1)}%
          </span>
        )
        : "--",
      times: []
    },
    successRate: {
      title: "Tasa de Éxito",
      description: "Porcentaje de solves completados sin DNFs.",
      value: `${stats.successRate}%`,
      times: []
    }
  };

  const currentStat = statInfo[selectedStat];
  if (!currentStat) return null;

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="stat-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="stat-detail-content">
          <div className="stat-detail-header">
            <h3>{currentStat.title}</h3>
            <div className="stat-detail-value">{currentStat.value}</div>
          </div>

          <div className="stat-detail-description">
            <p>{currentStat.description}</p>
          </div>

          {currentStat.times.length > 0 && (
            <div className="stat-times-list">
              <h4>Tiempos incluidos:</h4>
              {currentStat.times.map((t, i) => (
                <div
                  key={i}
                  className="stat-time-entry"
                  onClick={() => {
                    setShowStatsModal(false);
                    openTimeDetailModal(
                      t.index !== undefined
                        ? t.index
                        : activeSession.times.length - currentStat.times.length + i
                    );
                  }}
                >
                  <div className="stat-time-info">
                    <span className="stat-time-index">
                      {t.index !== undefined
                        ? t.index + 1
                        : activeSession.times.length - currentStat.times.length + i + 1}.
                    </span>
                    <span className="stat-time-value">
                      {formatTimeFull(
                        t.time,
                        t.index !== undefined
                          ? t.index
                          : activeSession.times.length - currentStat.times.length + i,
                        activeSession.plusTwoTimes,
                        activeSession.dnfTimes
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="stat-detail-actions">
            <button className="stat-detail-btn" onClick={() => setShowStatsModal(false)}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatDetailModal;
