// src/components/WorldBuilder.tsx
import React, { useState, useRef, Suspense } from 'react';
import { useAppStore } from '../state/appStore';
import { FloorPlanSketcherSection, SketcherHandles } from '../features/FloorPlanSketcherSection';
import { Basic3dViewPanel, View3DHandles } from './Basic3dViewPanel';
import { ViewPanelCard } from './ViewPanelCard';
import { WorldBuilderToolbar } from './WorldBuilderToolbar';
import { AuraOSHeader } from './AuraOS/AuraOSHeader';
import { BottomDock } from './AuraOS/BottomDock';
import ExportModal from './ExportModal';
import CollaborationModal from './collaboration/CollaborationModal';
import { GlobalSpinner } from './GlobalSpinner';
import { SketcherTool } from '../types';

const WorldBuilder: React.FC = () => {
    const store = useAppStore();
    const sketcherRef = useRef<SketcherHandles>(null);
    const view3dRef = useRef<View3DHandles>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const {
        currentProject, isExportModalOpen, setExportModalOpen,
        activeSketcherTool, setActiveSketcherTool,
    } = store;

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
            <AuraOSHeader />
            <main className="w-full h-full pt-20 pb-20 px-4">
                <div className="flex h-full gap-4">
                    <div className="w-2/3 h-full">
                        <ViewPanelCard title="2D Master Plan">
                            <FloorPlanSketcherSection 
                                ref={sketcherRef} 
                                {...store} 
                                currentTool={activeSketcherTool} 
                                setActiveSketcherTool={setActiveSketcherTool} 
                                // Dummy props to satisfy interface, not used in master plan
                                editorMode="concept"
                                setEditorMode={() => {}}
                                addPlacement={() => {}}
                                addDimensionLine={() => {}}
                            />
                        </ViewPanelCard>
                    </div>
                    <div className="w-1/3 h-full">
                        <ViewPanelCard title="3D Site Visualization">
                            <Basic3dViewPanel ref={view3dRef} {...store} />
                        </ViewPanelCard>
                    </div>
                </div>
            </main>

            <WorldBuilderToolbar 
                activeTool={activeSketcherTool as SketcherTool}
                onToolChange={(tool) => setActiveSketcherTool(tool)}
            />

            {/* Re-using BottomDock for consistency, but some buttons might be irrelevant */}
            <BottomDock
                onPhoenixClick={() => store.togglePanelVisibility('phoenixEngine')}
                onLayersClick={() => store.togglePanelVisibility('layersPanel')}
                onSaveClick={() => {/* TODO: Implement save modal */}}
                onProjectHubClick={() => store.togglePanelVisibility('projectHub')}
                onPropertiesClick={() => store.togglePanelVisibility('propertiesPanel')}
                onShareClick={() => setIsShareModalOpen(true)}
                onChatClick={() => store.togglePanelVisibility('chatPanel')}
                onAnalyticsClick={() => store.togglePanelVisibility('analyticsPanel')}
                onIntegrationsClick={() => store.togglePanelVisibility('integrationsPanel')}
                cinematicTourReady={!!store.cinematicTourData}
                onPlayTour={() => store.setIsCinematicTourPlaying(true)}
                onEnterAR={() => store.addNotification('AR feature coming soon!', 'info')}
                canUndo={store.canUndo}
                canRedo={store.canRedo}
                onUndo={store.undo}
                onRedo={store.redo}
                onToggleVastuGrid={() => {}}
                isVastuGridVisible={false}
                isVastuAnalysisRun={false}
                isDigitalTwinModeActive={store.isDigitalTwinModeActive}
                onToggleDigitalTwin={store.toggleDigitalTwinMode}
                isBrahmandaAstraActive={store.isBrahmandaAstraActive}
                setIsBrahmandaAstraActive={(value) => store.set({ isBrahmandaAstraActive: value })}
            />
            
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
        </div>
    );
};

export default WorldBuilder;
