// src/components/AuraOS/AuraOSWrapper.tsx
import React, { useState, useRef, Suspense, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import { FloorPlanSketcherSection, SketcherHandles } from '../../features/FloorPlanSketcherSection';
import { Basic3dViewPanel, View3DHandles } from '../Basic3dViewPanel';
import { ViewPanelCard } from '../ViewPanelCard';
import { EditorToolbar } from '../EditorToolbar';
import { FloatingPanel } from './FloatingPanel';
import { PhoenixEnginePanel } from '../../features/PhoenixEnginePanel';
import { PropertiesPanel } from '../../features/PropertiesPanel';
import { LayersPanel } from './LayersPanel';
import { ProjectHubPanel } from './ProjectHubPanel';
import ChatPanel from './ChatPanel';
import AnalyticsPanel from './AnalyticsPanel';
import { DigitalTwinPanel } from './DigitalTwinPanel';
import { IntegrationsPanel } from './IntegrationsPanel';
import { MayaLayerPanel } from './MayaLayerPanel';
import { BottomDock } from './BottomDock';
import { AuraOSHeader } from './AuraOSHeader';
import { TimelineControls } from '../TimelineControls';
import { CinematicPlayer } from './CinematicPlayer';
import { AICompanionWidget } from './AICompanionWidget';
import { SaveVersionModal } from './SaveVersionModal';
import ExportModal from '../ExportModal';
import CollaborationModal from '../collaboration/CollaborationModal';
import ContextMenu from './ContextMenu';
import { GlobalSpinner } from '../GlobalSpinner';
import * as projectService from '../../services/projectService';
import { PanelState, Layer, PanelId, SketcherTool, EditorMode } from '../../types';
const InteractiveTutorial = React.lazy(() => import('../onboarding/InteractiveTutorial'));

const AuraOSWrapper: React.FC = () => {
    const store = useAppStore();
    const sketcherRef = useRef<SketcherHandles>(null);
    const view3dRef = useRef<View3DHandles>(null);

    const { 
        panelStates, setPanelStates, togglePanelVisibility, 
        currentProject, isExportModalOpen, setExportModalOpen, hasUnsavedChanges,
        focusPanel, addLayer, updateLayer, deleteLayer, completeOnboardingChecklistItem,
        isOnboardingActive, activeSketcherTool, setActiveSketcherTool, editorMode, setEditorMode,
        setSelectedObject
    } = store;

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleSave = async (commitMessage: string) => {
        const { currentProject, levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron } = store;
        const projectData = { projectType: currentProject?.projectType || 'building', name: currentProject?.name || 'Untitled', levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron };
        
        store.set({ saveStatus: 'saving' });
        try {
            const { project: savedProject } = await projectService.saveProject({
                projectContent: projectData,
                projectName: currentProject?.name || 'Untitled',
                commitMessage,
                existingProjectId: currentProject?.id,
            });
            store.set({ currentProject: savedProject, saveStatus: 'saved', hasUnsavedChanges: false });
            store.addNotification('Version saved successfully!', 'success');
            completeOnboardingChecklistItem('versionSaved');
        } catch (error: any) {
            store.set({ saveStatus: 'error' });
            store.addNotification(`Save failed: ${error.message}`, 'error');
        }
    };
    
    useEffect(() => {
        let autoSaveInterval: number;
        if (hasUnsavedChanges && currentProject) {
            autoSaveInterval = window.setInterval(() => store.autoSaveProject(), 120000); // 2 minutes
        }
        return () => clearInterval(autoSaveInterval);
    }, [hasUnsavedChanges, currentProject, store.autoSaveProject]);
    
    const activeLevel = store.levels[store.activeLevelIndex];
    
    const createPanelStateSetter = (panelId: keyof typeof panelStates) => (updater: React.SetStateAction<PanelState>) => {
        setPanelStates(prev => {
            const currentPanelState = prev[panelId];
            const newPanelState = typeof updater === 'function' ? updater(currentPanelState) : updater;
            return { ...prev, [panelId]: newPanelState };
        });
    };

    const handleFocusPanel = (panelId: PanelId) => {
        focusPanel(panelId);
    };

    const handleAddLayer = () => {
        const name = prompt("Enter new layer name:", `Layer ${activeLevel.layers.length + 1}`);
        if (name) addLayer(name);
    };

    const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
        updateLayer(id, updates);
    };
    
    const handleDeleteLayer = (id: string) => {
        if (window.confirm("Are you sure you want to delete this layer? All objects on it will also be deleted.")) {
            deleteLayer(id);
        }
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
            <AuraOSHeader />
            <main className="w-full h-full pt-20 pb-20 px-4">
                <div className="flex h-full gap-4">
                    <div className="w-2/3 h-full" id="tutorial-target-canvas">
                        <ViewPanelCard title="2D Floor Plan">
                            <FloorPlanSketcherSection ref={sketcherRef} {...store} currentTool={activeSketcherTool} setActiveSketcherTool={setActiveSketcherTool} editorMode={editorMode} setEditorMode={setEditorMode} onViewCommentThread={store.onViewCommentThread} />
                        </ViewPanelCard>
                    </div>
                    <div className="w-1/3 h-full" id="tutorial-target-3d">
                        <ViewPanelCard title="3D Visualization">
                            <Basic3dViewPanel ref={view3dRef} {...store} setSelectedObject={setSelectedObject} />
                        </ViewPanelCard>
                    </div>
                </div>
            </main>
            
            <EditorToolbar activeTool={activeSketcherTool} onToolChange={setActiveSketcherTool} editorMode={editorMode} onModeChange={setEditorMode} />
            
            {Object.values(panelStates).map((ps: PanelState) => ps.isVisible && (
                <Suspense key={ps.id} fallback={<div/>}>
                    {ps.id === 'phoenixEngine' && <FloatingPanel title="Phoenix AI Engine" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><PhoenixEnginePanel {...store} /></FloatingPanel>}
                    {ps.id === 'propertiesPanel' && <FloatingPanel title="Properties" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><PropertiesPanel {...store} /></FloatingPanel>}
                    {ps.id === 'projectHub' && <FloatingPanel title="Project Hub" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><ProjectHubPanel /></FloatingPanel>}
                    {ps.id === 'layersPanel' && activeLevel && <FloatingPanel title="Layers" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><LayersPanel layers={activeLevel.layers} activeLayerId={activeLevel.activeLayerId} setActiveLayerId={(id) => store.setSingleLevelProp('activeLayerId', id)} onAddLayer={handleAddLayer} onUpdateLayer={handleUpdateLayer} onDeleteLayer={handleDeleteLayer} /></FloatingPanel>}
                    {ps.id === 'chatPanel' && <FloatingPanel title="AI Chat & Collaboration" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><ChatPanel /></FloatingPanel>}
                    {ps.id === 'analyticsPanel' && <FloatingPanel title="Project Analytics" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><AnalyticsPanel /></FloatingPanel>}
                    {ps.id === 'digitalTwinPanel' && <FloatingPanel title="Digital Twin" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><DigitalTwinPanel /></FloatingPanel>}
                    {ps.id === 'integrationsPanel' && <FloatingPanel title="Integrations" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><IntegrationsPanel /></FloatingPanel>}
                    {ps.id === 'mayaLayer' && <FloatingPanel title="Maya Layer" panelState={ps} setPanelState={createPanelStateSetter(ps.id)} onFocus={() => handleFocusPanel(ps.id)}><MayaLayerPanel /></FloatingPanel>}
                </Suspense>
            ))}

            <BottomDock 
                onPhoenixClick={() => togglePanelVisibility('phoenixEngine')}
                onLayersClick={() => togglePanelVisibility('layersPanel')}
                onSaveClick={() => setIsSaveModalOpen(true)}
                onProjectHubClick={() => togglePanelVisibility('projectHub')}
                onPropertiesClick={() => togglePanelVisibility('propertiesPanel')}
                onShareClick={() => setIsShareModalOpen(true)}
                onChatClick={() => togglePanelVisibility('chatPanel')}
                onAnalyticsClick={() => togglePanelVisibility('analyticsPanel')}
                onIntegrationsClick={() => togglePanelVisibility('integrationsPanel')}
                cinematicTourReady={!!store.cinematicTourData}
                onPlayTour={() => store.setIsCinematicTourPlaying(true)}
                onEnterAR={() => store.addNotification('AR feature coming soon!', 'info')}
                canUndo={store.canUndo}
                canRedo={store.canRedo}
                onUndo={store.undo}
                onRedo={store.redo}
                onToggleVastuGrid={() => store.setShowVastuGrid(s => !s)}
                isVastuGridVisible={store.showVastuGrid}
                isVastuAnalysisRun={!!store.vastuGridAnalysis}
                isDigitalTwinModeActive={store.isDigitalTwinModeActive}
                onToggleDigitalTwin={store.toggleDigitalTwinMode}
                isBrahmandaAstraActive={store.isBrahmandaAstraActive}
                setIsBrahmandaAstraActive={(value) => store.set({ isBrahmandaAstraActive: value })}
            />

            {store.constructionSequence && store.activeTimelineWeek !== null && (
                <TimelineControls sequence={store.constructionSequence} activeWeek={store.activeTimelineWeek} setActiveWeek={store.setActiveTimelineWeek} />
            )}
            
            {store.isCinematicTourPlaying && store.cinematicTourData && (
                <CinematicPlayer tourData={store.cinematicTourData} currentScript={"..."} onClose={() => store.setIsCinematicTourPlaying(false)} />
            )}

            {store.isCompanionActive && <AICompanionWidget />}
            {isOnboardingActive && <Suspense fallback={null}><InteractiveTutorial /></Suspense>}
            {isSaveModalOpen && <SaveVersionModal onClose={() => setIsSaveModalOpen(false)} onSave={handleSave} />}
            {isExportModalOpen && currentProject && <ExportModal onClose={() => setExportModalOpen(false)} sketcherRef={sketcherRef} view3dRef={view3dRef} projectName={currentProject?.name || 'Untitled'} />}
            {isShareModalOpen && currentProject && (
                <Suspense fallback={<GlobalSpinner message="Loading..." />}>
                    <CollaborationModal 
                        isOpen={isShareModalOpen} 
                        onClose={() => setIsShareModalOpen(false)}
                        projectId={currentProject.id}
                        initialCollaborators={store.collaborators}
                        onCollaboratorsUpdate={store.setCollaborators}
                    />
                </Suspense>
            )}
            {store.contextMenu && <ContextMenu x={store.contextMenu.x} y={store.contextMenu.y} object={store.contextMenu.object} />}
        </div>
    );
};

export default AuraOSWrapper;