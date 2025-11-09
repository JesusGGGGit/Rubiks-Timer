import "../../App.css";
// SettingsModal moved to a dedicated Settings page
import { formatTimeDisplay,formatTimeFull } from '../utils/formatUtils';
import { calculateStats } from '../utils/calculateStats';
import StatDetailModal from '../StatDetailModal/StatDetailModal';
import Modals from '../TimesModal/TimesModal';
import TimesSidebar from '../SideBar/SideBar';
import MainContent from '../MainContent/MainContent';
import { useTheme } from '../Hooks/useTheme';
import { useScramble } from '../Hooks/useScramble';
import { useTimerLogic } from '../Hooks/useTimerLogic';
import { useTimeDetail } from "../Hooks/useTimeDetail";
import { useConfetti } from "../Hooks/useConfetti";
import { useSessions } from "../Hooks/useSessions";
import { useDeleteTime } from "../Hooks/useDeleteTime";
import { useSettings } from "../Hooks/useSettings";
import NewSessionModal from '../NewSessionModal/NewSessionModal';
import { getStdDevColor } from '../utils/Descriptions';
import { getSortedTimes } from '../utils/sorting';
import React, { useState} from "react";


function Timer({ settings: externalSettings }) {
  const {
    bgColor,
    textColor,
    scrambleColor,
    scrambleSize
  } = useTheme();

  const {
    sessions,
    activeSessionId,
    activeSession,
    createNewSession,
    switchSession,
    setSessions,
    showNewSessionForm,
    setShowNewSessionForm,
    newSessionName,
    setNewSessionName,
    newSessionCubeType,
    setNewSessionCubeType,
    openNewSessionForm,
  } = useSessions();

  // Always call the hook (rules of hooks). Prefer settings passed from App (single source of truth).
  const internalSettings = useSettings();
  const settingsHook = externalSettings || internalSettings;
  const {
    inspectionTime,
    inspectionDuration,
    holdToStart,
    dontAskAgain: settingsDontAsk,
    setDontAskAgain: setSettingsDontAsk
  } = settingsHook;

  const stats = calculateStats(activeSession.times, activeSession.plusTwoTimes, activeSession.dnfTimes);
  const { scramble, cubeState, generateScramble } = useScramble(activeSession.cubeType);

  // settings page/tab state moved to dedicated Settings page; not used here

  useConfetti(activeSessionId, activeSession.times, stats.bestTime);

  const {
    time,
    inspectionRunning,
    showDnf,
    ready
  } = useTimerLogic({
    inspectionTime,
    inspectionDuration,
    holdToStart,
    scramble,
    generateScramble,
    activeSessionId,
    setSessions,
  });

  const {
    selectedTimeDetail,
    showTimeDetailModal,
    setShowTimeDetailModal,
    openTimeDetailModal,
    applyPlusTwo,
    applyDnf
  } = useTimeDetail({
    activeSessionId,
    setSessions,
    activeSession
  });

  const {
    showDeleteModal,
    setShowDeleteModal,
    dontAskAgain,
    setDontAskAgain,
    requestDeleteTime,
    confirmDeleteTime,
  } = useDeleteTime(activeSessionId, setSessions, settingsDontAsk, setSettingsDontAsk);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent");

  const handleCreateSession = React.useCallback(() => {
    if (!newSessionName.trim()) return;
    createNewSession(newSessionName, newSessionCubeType);
  }, [newSessionName, newSessionCubeType, createNewSession]);

  const handleOutsideClick = React.useCallback((e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setShowStatsModal(false);
    }
  }, []);

  const openStatDetail = (statKey) => {
    setSelectedStat(statKey);
    setShowStatsModal(true);
  };

  return (
    <div className="app-container" style={{ backgroundColor: bgColor }}>
      <TimesSidebar
        stats={stats}
        activeSession={activeSession}
        sessions={sessions}
        activeSessionId={activeSessionId}
        switchSession={switchSession}
        openNewSessionForm={openNewSessionForm}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        showNewSessionForm={showNewSessionForm}
        setShowNewSessionForm={setShowNewSessionForm}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        newSessionCubeType={newSessionCubeType}
        setNewSessionCubeType={setNewSessionCubeType}
        handleCreateSession={handleCreateSession}
        handleOutsideClick={handleOutsideClick}
        openStatDetail={openStatDetail}
        openTimeDetailModal={openTimeDetailModal}
        requestDeleteTime={requestDeleteTime}
        formatTimeFull={formatTimeFull}
        getSortedTimes={getSortedTimes}
        getStdDevColor={getStdDevColor}
      />

      <MainContent
        scrambleColor={scrambleColor}
        scramble={scramble}
        scrambleSize={scrambleSize}
        showDnf={showDnf}
        inspectionRunning={inspectionRunning}
        textColor={textColor}
        formatTimeDisplay={formatTimeDisplay}
        time={time}
        ready={ready}
        inspectionTime={inspectionTime}
        holdToStart={holdToStart}
        bgColor={bgColor}
        cubeState={cubeState}
        activeSession={activeSession}
        showCube={settingsHook.showCube}
      />

      <NewSessionModal
        show={showNewSessionForm}
        setShow={setShowNewSessionForm}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        newSessionCubeType={newSessionCubeType}
        setNewSessionCubeType={setNewSessionCubeType}
        handleCreateSession={handleCreateSession}
        handleOutsideClick={() => setShowNewSessionForm(false)}
      />

      {/* Settings are now available on the /settings page */}

      <Modals
        showDeleteModal={showDeleteModal}
        onCancelDelete={() => setShowDeleteModal(false)}
        onConfirmDelete={confirmDeleteTime}
        dontAskAgain={dontAskAgain}
        setDontAskAgain={setDontAskAgain}
        showTimeDetailModal={showTimeDetailModal}
        timeDetail={selectedTimeDetail}
        onCloseDetail={() => setShowTimeDetailModal(false)}
        applyPlusTwo={applyPlusTwo}
        applyDnf={applyDnf}
        plusTwoTimes={activeSession.plusTwoTimes}
        dnfTimes={activeSession.dnfTimes}
      />

      {showStatsModal && (
        <StatDetailModal
          selectedStat={selectedStat}
          stats={stats}
          activeSession={activeSession}
          setShowStatsModal={setShowStatsModal}
          openTimeDetailModal={openTimeDetailModal}
        />
      )}
    </div>
  );
}

export default Timer;