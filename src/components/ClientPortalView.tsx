// src/components/ClientPortalView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Project, SunPosition, Level, ReadOnlySketcherProps, PropertyLine, TerrainMesh, Layer, LiveSelection, BillOfQuantitiesReport, SustainabilityReport, GeneratedRender, LokaSimulatorReport, GFCDrawingSet, Holocron, HolocronHotspot, DigitalTwinData } from '../types';
import { getPublicProjectByShareLink } from '../services/authService';
import { LoadingSpinner } from './LoadingSpinner';
import { FloorPlanSketcherSection } from '../features/FloorPlanSketcherSection';
import { Basic3dViewPanel } from './Basic3dViewPanel';
import { ViewPanelCard } from './ViewPanelCard';
import { APP_TITLE } from '../constants';

const ClientPortalView: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sunPosition] = useState<SunPosition>({ azimuth: 135, altitude: 45 }); // Default sun position

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const shareableLink = pathParts[pathParts.length - 1];

    if (shareableLink) {
      getPublicProjectByShareLink(shareableLink)
        .then(data => {
          setProject(data.project);
        })
        .catch(err => {
          setError(err.message || 'Could not load project. The link may be invalid or expired.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError('No project link provided.');
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner />
        <span className="ml-4 text-slate-200">Loading Project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-slate-300 mt-2">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-slate-400">Project not found.</p>
      </div>
    );
  }

  const readOnlySketcherProps: ReadOnlySketcherProps = {
    levels: project.levels,
    activeLevelIndex: 0,
    planNorthDirection: project.planNorthDirection,
    propertyLines: project.propertyLines || [],
    terrainMesh: project.terrainMesh || null,
    zones: project.zones || [],
    infrastructure: project.infrastructure || [],
    selectedObject: null,
    currentProject: project,
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
        <header className="bg-slate-800 p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-sky-300">{project.name}</h1>
                <span className="text-sm font-semibold text-slate-300">Presented by {APP_TITLE}</span>
            </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8">
             <div className="flex flex-col lg:flex-row gap-8 h-full">
                <div className="lg:w-1/2 h-[70vh] min-h-[500px]">
                    <ViewPanelCard title="Floor Plan">
                      <FloorPlanSketcherSection
                        {...readOnlySketcherProps}
                        isReadOnly={true}
                      />
                    </ViewPanelCard>
                </div>
                <div className="lg:w-1/2 h-[70vh] min-h-[500px]">
                    <ViewPanelCard title="3D Visualization">
                         <Basic3dViewPanel
                            levels={project.levels}
                            zones={project.zones || []}
                            infrastructure={project.infrastructure || []}
                            activeLevelIndex={0}
                            propertyLines={project.propertyLines || []}
                            terrainMesh={project.terrainMesh || null}
                            selectedObject={null}
                            setSelectedObject={() => {}}
                            sunPosition={sunPosition}
                            isWalkthroughActive={false} setIsWalkthroughActive={() => {}}
                            constructionSequence={null} 
                            activeTimelineWeek={null}
                            collaborators={[]}
                            liveSelections={{}}
                            currentUser={null}
                            isDigitalTwinModeActive={false}
                            digitalTwinData={null}
                            activeDataOverlays={{ energy: false, stress: false, occupancy: false }}
                         />
                    </ViewPanelCard>
                </div>
            </div>
        </main>
    </div>
  );
};

export default ClientPortalView;