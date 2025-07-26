// src/components/ArchitectsFolioView.tsx
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Project, SunPosition, Level, ReadOnlySketcherProps, PropertyLine, TerrainMesh, Layer, LiveSelection, BillOfQuantitiesReport, SustainabilityReport, LokaSimulatorReport, Holocron, HolocronHotspot, DigitalTwinData } from '../types';
import { getPublicFolioApi } from '../services/authService';
import { LoadingSpinner } from './LoadingSpinner';
import { APP_TITLE } from '../constants';
import { Basic3dViewPanel } from './Basic3dViewPanel';
import { FloorPlanSketcherSection } from '../features/FloorPlanSketcherSection';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionSection = motion.section as any;


const ArchitectsFolioView: React.FC = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sunPosition] = useState<SunPosition>({ azimuth: 135, altitude: 45 });

    useEffect(() => {
        const pathParts = window.location.pathname.split('/');
        const shareableLink = pathParts[pathParts.length - 1];

        if (shareableLink) {
            getPublicFolioApi(shareableLink)
                .then(data => setProject(data.project))
                .catch(err => setError(err.message || 'Could not load the Architect\'s Folio. The link may be invalid or access may have been revoked.'))
                .finally(() => setIsLoading(false));
        } else {
            setError('No Folio link provided.');
            setIsLoading(false);
        }
    }, []);

    const readOnlySketcherProps = useMemo((): ReadOnlySketcherProps => ({
        levels: project?.levels || [],
        activeLevelIndex: 0,
        planNorthDirection: project?.planNorthDirection || 'N',
        propertyLines: project?.propertyLines || [],
        terrainMesh: project?.terrainMesh || null,
        zones: project?.zones || [],
        infrastructure: project?.infrastructure || [],
        selectedObject: null,
        currentProject: project,
    }), [project]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <LoadingSpinner /><span className="ml-4 text-slate-200">Loading Architect's Folio...</span>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
                <h2 className="text-2xl font-bold text-red-400">Error</h2>
                <p className="text-slate-300 mt-2">{error || 'Project not found.'}</p>
            </div>
        );
    }
    
    const allRenders = project.generatedRenders || [];
    const heroRenderUrl = allRenders[0]?.url;
    
    return (
        <div className="bg-slate-900 text-slate-200 font-sans leading-relaxed">
            <header 
                className="relative h-[80vh] min-h-[600px] flex items-end justify-center text-center text-white p-8"
            >
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent z-10"></div>
                 <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `url(${heroRenderUrl || '/images/social-share.png'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></div>

                <MotionDiv
                    className="relative z-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold text-shadow-custom">{project.folio?.title || project.name}</h1>
                    <p className="text-lg md:text-xl mt-4 text-slate-300 text-shadow-custom">A Vision by {APP_TITLE}</p>
                </MotionDiv>
            </header>
            
            <main className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-24">
                <MotionSection
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-sky-300 mb-6 text-center">Architect's Narrative</h2>
                    <div className="prose prose-lg prose-invert mx-auto text-slate-300">
                        {(project.folio?.narrative || "").split('\n').map((paragraph, i) => <p key={i}>{paragraph}</p>)}
                    </div>
                </MotionSection>
                
                <MotionSection
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-3xl font-bold text-sky-300 mb-6 text-center">Interactive 3D Model</h2>
                    <div className="h-[70vh] min-h-[500px] bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner/></div>}>
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
                                constructionSequence={null} activeTimelineWeek={null}
                                collaborators={[]}
                                liveSelections={{}}
                                currentUser={null}
                                isDigitalTwinModeActive={false}
                                digitalTwinData={null}
                                activeDataOverlays={{ energy: false, stress: false, occupancy: false }}
                             />
                        </Suspense>
                    </div>
                </MotionSection>

                {allRenders.length > 0 && (
                    <MotionSection
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-sky-300 mb-6 text-center">Photorealistic Renders</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {allRenders.map((render, index) => (
                                <MotionDiv
                                    key={render._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="bg-slate-800 p-2 rounded-lg shadow-lg border border-slate-700"
                                >
                                    <img src={render.url} alt={render.prompt || 'AI Render'} className="w-full h-auto rounded-md object-cover"/>
                                    <p className="text-center text-sm mt-2 text-slate-400">{render.prompt || 'AI Render'}</p>
                                </MotionDiv>
                            ))}
                        </div>
                    </MotionSection>
                )}

                {project.levels[0]?.walls.length > 0 && (
                    <MotionSection
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold text-sky-300 mb-6 text-center">Floor Plan</h2>
                        <div className="h-[70vh] min-h-[500px] bg-slate-800 rounded-xl shadow-2xl overflow-hidden p-4 border border-slate-700">
                             <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><LoadingSpinner/></div>}>
                                <FloorPlanSketcherSection {...readOnlySketcherProps} isReadOnly={true} />
                             </Suspense>
                        </div>
                    </MotionSection>
                )}
            </main>
            <footer className="text-center py-8 border-t border-slate-700">
                <p className="text-slate-400">Folio generated by <span className="font-semibold text-sky-400">{APP_TITLE}</span></p>
            </footer>
        </div>
    );
};

export default ArchitectsFolioView;