import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsModal from './SettingsModal';
import { useTheme } from '../Hooks/useTheme';
import { useSettings } from '../Hooks/useSettings';
import { useSessions } from '../Hooks/useSessions';

export default function SettingsPage({ settings: externalSettings }) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('apariencia');
  const navigate = useNavigate();

  const theme = useTheme();
  // Always call useSettings() (rules of hooks). Prefer externalSettings when provided.
  const internalSettings = useSettings();
  const settings = externalSettings || internalSettings;
  const sessionsHooks = useSessions();

  // Render SettingsModal as a full page. Provide a real setShowSettings that navigates back when closed.
  const setShowSettings = (val) => {
    if (val === false) {
      // Prefer navigating back; if no history, go to root.
      try {
        navigate(-1);
      } catch (e) {
        navigate('/');
      }
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <SettingsModal
        showSettings={true}
        setShowSettings={setShowSettings}
        activeSettingsTab={activeSettingsTab}
        setActiveSettingsTab={setActiveSettingsTab}
        bgColor={theme.bgColor}
        setBgColor={theme.setBgColor}
        textColor={theme.textColor}
        setTextColor={theme.setTextColor}
        scrambleColor={theme.scrambleColor}
        setScrambleColor={theme.setScrambleColor}
        timerSize={theme.timerSize}
        setTimerSize={theme.setTimerSize}
        holdToStart={settings.holdToStart}
        setHoldToStart={settings.setHoldToStart}
        inspectionTime={settings.inspectionTime}
        setInspectionTime={settings.setInspectionTime}
        inspectionDuration={settings.inspectionDuration}
        setInspectionDuration={settings.setInspectionDuration}
        dontAskAgain={settings.dontAskAgain}
        setDontAskAgain={settings.setDontAskAgain}
  showCube={settings.showCube}
  setShowCube={settings.setShowCube}
        resetTimes={sessionsHooks.resetTimes}
        sessions={sessionsHooks.sessions}
        renameSession={sessionsHooks.renameSession}
        deleteSession={sessionsHooks.deleteSession}
        activeSessionId={sessionsHooks.activeSessionId}
        createNewSession={sessionsHooks.createNewSession}
        scrambleSize={theme.scrambleSize}
        setScrambleSize={theme.setScrambleSize}
        cubeSize={theme.cubeSize}
        setCubeSize={theme.setCubeSize}
      />
    </div>
  );
}
