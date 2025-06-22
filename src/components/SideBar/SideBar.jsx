import StatsCard from '../StatsCard/StatsCard';
import SessionsMenu from '../SessionMenu/SessionsMenu';
import SortSelect from '../SortSelectTimes/SortSelect';
import NewSessionModal from '../NewSessionModal/NewSessionModal';
import TimesList from '../TimeList/TimeList';

export default function TimesSidebar({
  stats,
  activeSession,
  sessions,
  activeSessionId,
  switchSession,
  openNewSessionForm,
  sortOrder,
  setSortOrder,
  showNewSessionForm,
  setShowNewSessionForm,
  newSessionName,
  setNewSessionName,
  newSessionCubeType,
  setNewSessionCubeType,
  handleCreateSession,
  handleOutsideClick,
  openStatDetail,
  openTimeDetailModal,
  requestDeleteTime,
  formatTimeFull,
  getSortedTimes,
  getStdDevColor
}) {
  return (
    <aside className="times-sidebar">
      <div className="sidebar-header">
        <h2>Historial de Tiempos</h2>
      </div>
      <div className="stats-summary">
        <StatsCard
          label="Mejor"
          value={stats.bestTime !== null ? formatTimeFull(stats.bestTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}
          onClick={() => openStatDetail("bestTime")}
        />
        <StatsCard
          label="Peor"
          value={stats.worstTime !== null ? formatTimeFull(stats.worstTime, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}
          onClick={() => openStatDetail("worstTime")}
        />
        <StatsCard
          label="Ao5"
          value={stats.ao5 !== null ? formatTimeFull(stats.ao5, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}
          onClick={() => openStatDetail("ao5")}
        />
        <StatsCard
          label="Ao12"
          value={stats.ao12 !== null ? formatTimeFull(stats.ao12, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}
          onClick={() => openStatDetail("ao12")}
        />
        <StatsCard
          label="Promedio"
          value={stats.mo3 !== null ? formatTimeFull(stats.mo3, null, activeSession.plusTwoTimes, activeSession.dnfTimes) : "-:-"}
          onClick={() => openStatDetail("mo3")}
        />
        <StatsCard
          label="Variación"
          value={stats.stdDev !== null && stats.overallAverage > 0
            ? `${((stats.stdDev / stats.overallAverage) * 100).toFixed(1)}%`
            : "-:-"}
          onClick={() => openStatDetail("stdDev")}
          style={{
            color:
              stats.stdDev !== null && stats.overallAverage > 0
                ? getStdDevColor((stats.stdDev / stats.overallAverage) * 100)
                : "inherit"
          }}
        />
      </div>

      <SessionsMenu
        sessions={sessions}
        activeSessionId={activeSessionId}
        switchSession={switchSession}
        openNewSessionForm={openNewSessionForm}
      />

      <SortSelect sortOrder={sortOrder} setSortOrder={setSortOrder} />

      <NewSessionModal
        show={showNewSessionForm}
        setShow={setShowNewSessionForm}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        newSessionCubeType={newSessionCubeType}
        setNewSessionCubeType={setNewSessionCubeType}
        handleCreateSession={handleCreateSession}
        handleOutsideClick={handleOutsideClick}
      />

      <TimesList
        activeSession={activeSession}
        sortOrder={sortOrder}
        stats={stats}
        openTimeDetailModal={openTimeDetailModal}
        requestDeleteTime={requestDeleteTime}
        formatTimeFull={formatTimeFull}
        getSortedTimes={getSortedTimes}
      />
    </aside>
  );
}
