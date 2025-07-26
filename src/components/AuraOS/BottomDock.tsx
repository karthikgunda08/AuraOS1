// src/components/AuraOS/BottomDock.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';

interface BottomDockProps {
  onPhoenixClick: () => void;
  onLayersClick: () => void;
  onSaveClick: () => void;
  onProjectHubClick: () => void;
  onPropertiesClick: () => void;
  onShareClick: () => void;
  onChatClick: () => void;
  onAnalyticsClick: () => void;
  onIntegrationsClick: () => void;
  cinematicTourReady: boolean;
  onPlayTour: () => void;
  onEnterAR: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onToggleVastuGrid: () => void;
  isVastuGridVisible: boolean;
  isVastuAnalysisRun: boolean;
  isDigitalTwinModeActive: boolean;
  onToggleDigitalTwin: () => void;
  isBrahmandaAstraActive: boolean;
  setIsBrahmandaAstraActive: (active: boolean) => void;
}

const ToolButton: React.FC<{
  title: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  id?: string;
  className?: string;
}> = ({ title, isActive, onClick, disabled, children, id, className }) => (
  <div className="relative group" id={id}>
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className={`p-3 rounded-lg transition-all duration-200 ${
        isActive ? 'bg-sky-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
      } disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
    <div className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
      {title}
    </div>
  </div>
);

export const BottomDock: React.FC<BottomDockProps> = ({ 
    onPhoenixClick, onLayersClick, onSaveClick, onProjectHubClick, onChatClick, onAnalyticsClick, cinematicTourReady, onPlayTour, onEnterAR, 
    canUndo, canRedo, onUndo, onRedo, onPropertiesClick, onShareClick, onToggleVastuGrid, isVastuGridVisible, isVastuAnalysisRun,
    isDigitalTwinModeActive, onToggleDigitalTwin, onIntegrationsClick,
    isBrahmandaAstraActive, setIsBrahmandaAstraActive,
}) => {

  const { companionState, setCompanionState, togglePanelVisibility, generativeFeedbackActive, setGenerativeFeedbackActive } = useAppStore();

  const orbClasses: Record<typeof companionState, string> = {
        idle: "bg-primary/80 hover:bg-primary text-primary-foreground",
        listening: "bg-red-500 text-white animate-pulse",
        thinking: "bg-purple-500 text-white", // Not spinning here, the widget will spin
        speaking: "bg-green-500 text-white",
        error: "bg-red-600 text-white",
  };

  const handleCompanionClick = () => {
      // This is a placeholder; the main logic is in AICompanionWidget.tsx
      // This click could initiate listening if the widget isn't already active.
      console.log("Companion orb clicked. State:", companionState);
  };

  const handleToggleMayaLayer = () => {
      setGenerativeFeedbackActive(!generativeFeedbackActive);
      togglePanelVisibility('mayaLayer');
  };
    
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-2 p-2 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700/50 shadow-lg pointer-events-auto">
      {/* Left Tools */}
      <ToolButton title="Save Version" onClick={onSaveClick} id="tutorial-target-save">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
      </ToolButton>
       <ToolButton title="Undo (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
      </ToolButton>
      <ToolButton title="Redo (Ctrl+Y)" onClick={onRedo} disabled={!canRedo}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
      </ToolButton>
       <ToolButton title="Share & Collaborate" onClick={onShareClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
      </ToolButton>
      <ToolButton title="Toggle Brahmanda-Astra (On-Canvas AI)" isActive={isBrahmandaAstraActive} onClick={() => setIsBrahmandaAstraActive(!isBrahmandaAstraActive)}>
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5z" opacity="0.4"/><path d="M6 6a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1V6zm3 0a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V6zm3 0a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1h-1a1 1 0 01-1-1V6z"/></svg>
      </ToolButton>
      <ToolButton title="Toggle Digital Twin" isActive={isDigitalTwinModeActive} onClick={onToggleDigitalTwin}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </ToolButton>
      <ToolButton title="Toggle Maya Layer" isActive={generativeFeedbackActive} onClick={handleToggleMayaLayer}>
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      </ToolButton>
       {cinematicTourReady && (
         <ToolButton title="Play Cinematic Tour" onClick={onPlayTour} className="bg-purple-600 text-white hover:bg-purple-500 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
        </ToolButton>
      )}


      <div className="w-px h-8 bg-slate-600/50 mx-2"></div>

      {/* Right Tools */}
      <ToolButton title="Project Hub" onClick={onProjectHubClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
      </ToolButton>
      <ToolButton title="Layers" onClick={onLayersClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 6h18M3 18h18" /></svg>
      </ToolButton>
      <ToolButton title="Properties" onClick={onPropertiesClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </ToolButton>
       <ToolButton title="Integrations" onClick={onIntegrationsClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
      </ToolButton>
      <ToolButton title="AI Chat" onClick={onChatClick}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
      </ToolButton>
      <ToolButton title="Phoenix AI Engine" onClick={onPhoenixClick} id="tutorial-target-phoenix" className="bg-gradient-to-br from-amber-500/50 to-orange-600/50 hover:from-amber-500/80 text-amber-200">
        <span className="text-lg">🌟</span>
      </ToolButton>
    </div>
  );
};