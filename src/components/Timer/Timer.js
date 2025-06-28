import React, { useState, useCallback } from "react";
import "../../App.css";
import SettingsModal from '../Settings/SettingsModal';
import { formatTimeDisplay, formatTimeFull } from '../utils/formatUtils';
import { calculateStats } from '../utils/calculateStats';
import { getStdDevColor } from '../utils/Descriptions';
import { getSortedTimes } from '../utils/sorting';
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



function App() {
  const {
    bgColor, setBgColor,
    textColor, setTextColor,
    scrambleColor, setScrambleColor,
    timerSize, setTimerSize,
    scrambleSize, setScrambleSize,
    cubeSize, setCubeSize 
  } = useTheme();

  const {
    sessions,
    activeSessionId,
    activeSession,
    createNewSession,
    switchSession,
    renameSession,
    deleteSession,
    resetTimes,
    setSessions,
    showNewSessionForm,
    setShowNewSessionForm,
    newSessionName,
    setNewSessionName,
    newSessionCubeType,
    setNewSessionCubeType,
    openNewSessionForm,
  } = useSessions();

  const {
    inspectionTime,
    setInspectionTime,
    inspectionDuration,
    setInspectionDuration,
    holdToStart,
    setHoldToStart
  } = useSettings();

  const stats = calculateStats(activeSession.times, activeSession.plusTwoTimes, activeSession.dnfTimes);
  const { scramble, cubeState, generateScramble } = useScramble(activeSession.cubeType);

  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("apariencia");

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
  } = useDeleteTime(activeSessionId, setSessions);

  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent");

  const handleCreateSession = useCallback(() => {
    if (!newSessionName.trim()) return;
    createNewSession(newSessionName, newSessionCubeType);
  }, [newSessionName, newSessionCubeType, createNewSession]);

  const handleOutsideClick = useCallback((e) => {
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
     
      <MainContent
        setShowSettings={setShowSettings}
        scrambleColor={scrambleColor}
        scramble={scramble}
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
        scrambleSize={scrambleSize} 
      />
      <NewSessionModal
        show={showNewSessionForm}
        setShow={setShowNewSessionForm}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        newSessionCubeType={newSessionCubeType}
        setNewSessionCubeType={setNewSessionCubeType}
        handleCreateSession={handleCreateSession}
        handleOutsideClick={() => setShowNewSessionForm(false)}  // aquí cierras modal
      />
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        bgColor={bgColor}
        setBgColor={setBgColor}
        textColor={textColor}
        setTextColor={setTextColor}
        scrambleColor={scrambleColor}
        setScrambleColor={setScrambleColor}
        timerSize={timerSize}
        setTimerSize={setTimerSize}
        holdToStart={holdToStart}
        setHoldToStart={setHoldToStart}
        inspectionTime={inspectionTime}
        setInspectionTime={setInspectionTime}
        inspectionDuration={inspectionDuration}
        setInspectionDuration={setInspectionDuration}
        dontAskAgain={dontAskAgain}
        setDontAskAgain={setDontAskAgain}
        resetTimes={resetTimes}
        sessions={sessions}
        renameSession={renameSession}
        deleteSession={deleteSession}
        activeSessionId={activeSessionId}
        createNewSession={createNewSession}
        scrambleSize={scrambleSize}
        setScrambleSize={setScrambleSize}
        cubeSize={cubeSize}
        setCubeSize={setCubeSize}
      />

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

export default App;