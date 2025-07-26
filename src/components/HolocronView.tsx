// src/components/HolocronView.tsx
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { HolocronData, HolocronHotspot, SunPosition, DigitalTwinData } from '../types';
import * as projectService from '../services/projectService';
import { LoadingSpinner } from './LoadingSpinner';
import { GlobalSpinner } from '../GlobalSpinner';
import { Basic3dViewPanel } from './Basic3dViewPanel';
import { HolocronInfoPanel } from './HolocronInfoPanel';

interface HolocronViewProps {
  shareableLink: string;
}

const HolocronView: React.FC<HolocronViewProps> = ({ shareableLink }) => {
  const [data, setData] = useState<HolocronData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<HolocronHotspot | null>(null);

  useEffect(() => {
    if (shareableLink) {
      projectService.getPublicHolocronDataApi(shareableLink)
        .then(setData)
        .catch(err => setError(err.message || 'Could not load the Holocron. The link may be invalid or access has been revoked.'))
        .finally(() => setIsLoading(false));
    } else {
      setError('No Holocron link provided.');
      setIsLoading(false);
    }
  }, [shareableLink]);

  if (isLoading) {
    return <GlobalSpinner message="Loading Holocron..." />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
        <h2 className="text-2xl font-bold text-red-400">Error</h2>
        <p className="text-slate-300 mt-2">{error || 'Holocron not found.'}</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-slate-900 relative">
      <Basic3dViewPanel
        levels={data.levels}
        zones={[]}
        infrastructure={[]}
        activeLevelIndex={0}
        propertyLines={data.propertyLines || []}
        terrainMesh={data.terrainMesh || null}
        selectedObject={null}
        setSelectedObject={() => {}}
        sunPosition={{ azimuth: 135, altitude: 45 }}
        isWalkthroughActive={false}
        setIsWalkthroughActive={() => {}}
        constructionSequence={null}
        activeTimelineWeek={null}
        collaborators={[]}
        liveSelections={{}}
        currentUser={null}
        hotspots={data.hotspots}
        onHotspotClick={setActiveHotspot}
        isDigitalTwinModeActive={false}
        digitalTwinData={null}
        activeDataOverlays={{ energy: false, stress: false, occupancy: false }}
      />
      {activeHotspot && (
        <HolocronInfoPanel
          hotspot={activeHotspot}
          onClose={() => setActiveHotspot(null)}
        />
      )}
       <div className="absolute bottom-4 left-4 bg-black/50 p-3 rounded-lg text-white">
            <h1 className="font-bold text-lg">{data.projectName}</h1>
            <p className="text-sm text-slate-300">An Interactive Holocron Presentation</p>
        </div>
    </div>
  );
};

export default HolocronView;