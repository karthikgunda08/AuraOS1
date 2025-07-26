// src/features/AmbianceTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, InteriorSchemeResponse, ProjectData, SuggestedItem, PlacedModel } from '../../types';
import { generateInteriorSchemeApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors w-full ${isActive ? 'border-purple-400 text-purple-300' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);

const AccordionSection: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; count?: number; }> = ({ title, children, defaultOpen = false, count }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-slate-900/50 rounded-md">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-2 text-left flex justify-between items-center hover:bg-slate-800/50 rounded-md">
                <span className="font-semibold text-slate-200">{title} {count !== undefined && <span className="text-xs text-slate-400">({count})</span>}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && <div className="p-3 border-t border-slate-700">{children}</div>}
        </div>
    );
};

const InteriorDecorator: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, levels, activeLevelIndex, setSingleLevelProp, pushToUndoStack, onBuyCreditsClick, refreshCurrentUser, currentProject, togglePanelVisibility, atmanSignature } = props;
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [style, setStyle] = useState('modern minimalist');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<InteriorSchemeResponse | null>(null);
    const [useAtman, setUseAtman] = useState(false);
    const { addNotification } = useNotificationStore();
    const activeLevel = levels[activeLevelIndex];
    const activeLevelRooms = activeLevel?.rooms || [];
    
    const isContextMissing = !currentProject?.location || !currentProject?.clientProfile || !currentProject?.siteContext;

    const projectData: ProjectData = {
        name: props.currentProject?.name || 'Untitled Project',
        projectType: props.currentProject?.projectType || 'building',
        levels: props.levels,
        planNorthDirection: props.planNorthDirection,
        propertyLines: props.propertyLines,
        terrainMesh: props.terrainMesh,
        zones: [],
        infrastructure: [],
    };

    const handleGenerate = async () => {
        if (!selectedRoomId || !style) {
            addNotification("Please select a room and define a style.", "error");
            return;
        }

        if (!currentUser) {
            addNotification("Please log in to use this feature.", "error");
            return;
        }
        const creditCost = useAtman ? 15 : 10;
        if (currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits. You have ${currentUser.credits}.`, "info");
            onBuyCreditsClick();
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const signatureToUse = useAtman ? atmanSignature || undefined : undefined;
            const response = await generateInteriorSchemeApi(currentProject?.id || '', projectData, selectedRoomId, style, signatureToUse);
            setResult(response);
            addNotification("Interior scheme generated!", "success");
            await refreshCurrentUser();
        } catch (err: any) {
            setError(err.message);
            addNotification(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const applyScheme = () => {
        if (!result) return;
        pushToUndoStack();

        // Apply new models
        setSingleLevelProp('placedModels', (prevModels: PlacedModel[]) => {
             const newItems: PlacedModel[] = [
                ...(result.furniture || []),
                ...(result.lighting || []),
                ...(result.textiles || []),
                ...(result.decor || [])
            ].map((item: SuggestedItem) => ({
                ...item,
                id: generateId('model_decor'),
                layerId: activeLevel.activeLayerId,
                width: 50, // These should come from a model definition, using defaults for now
                depth: 50,
                height3d: 50,
            }));
            return [...prevModels, ...newItems];
        });
        
        // Apply room materials
        setSingleLevelProp('rooms', prevRooms => prevRooms.map(room => {
            if (room.id === selectedRoomId) {
                return {
                    ...room,
                    floorMaterial: result.materials.floor.materialKey,
                    wallMaterialOverride: result.materials.primaryWall.materialKey
                };
            }
            return room;
        }));

        // Apply accent wall material
        if (result.materials.accentWall?.wallId) {
             setSingleLevelProp('walls', prevWalls => prevWalls.map(wall => {
                if (wall.id === result.materials.accentWall?.wallId) {
                    return { ...wall, material: result.materials.accentWall?.materialKey };
                }
                return wall;
            }));
        }


        addNotification("Scheme applied to the room.", "success");
    };


    return (
        <div className="space-y-4">
             {isContextMissing && (
                <div className="p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-amber-400 text-amber-200 text-sm rounded-r-lg">
                    <p className="font-bold text-amber-100">💡 Enhance AI Precision</p>
                    <p className="mt-1">
                        For superior results, add project details like location and client profile in the{' '}
                        <button
                            onClick={() => togglePanelVisibility('projectHub')}
                            className="font-bold text-white underline hover:text-amber-200 focus:outline-none"
                        >
                            Project Hub
                        </button>.
                    </p>
                </div>
            )}
            <p className="text-xs text-slate-400">Select a room and a style, and the AI will generate a detailed interior design concept.</p>
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Room</label>
                <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                    <option value="">-- Select Room --</option>
                    {activeLevelRooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium text-slate-300 block mb-1">Style</label>
                <input type="text" value={style} onChange={e => setStyle(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
            </div>
            <button
                onClick={() => setUseAtman(!useAtman)}
                disabled={!atmanSignature}
                className={`w-full p-2 text-sm font-semibold rounded-md flex items-center justify-center transition-all border-2 ${
                    useAtman ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-700 border-transparent hover:border-purple-500 text-slate-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={!atmanSignature ? "Analyze your signature first in the Atman tool" : "Toggle using your personal design DNA"}
            >
                🧬 Use My Atman Signature
            </button>
             <button onClick={handleGenerate} disabled={isLoading || !selectedRoomId || !style} className="w-full p-2 font-semibold bg-pink-600 hover:bg-pink-500 rounded-md disabled:opacity-50 flex justify-center items-center">
                {isLoading ? <LoadingSpinner size="h-5 w-5" /> : `Generate Scheme (${useAtman ? 15 : 10} Cr)`}
            </button>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            {result && (
                <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
                    <AccordionSection title="Design Narrative" defaultOpen>
                        <p className="text-sm italic text-slate-300">{result.designNarrative}</p>
                    </AccordionSection>
                     <AccordionSection title="Materials">
                        <div className="text-sm space-y-2">
                            <p><strong>Floor:</strong> {result.materials.floor.materialKey} - <i className="text-slate-400">{result.materials.floor.justification}</i></p>
                            <p><strong>Walls:</strong> {result.materials.primaryWall.materialKey} - <i className="text-slate-400">{result.materials.primaryWall.justification}</i></p>
                             {result.materials.accentWall && <p><strong>Accent Wall:</strong> {result.materials.accentWall.materialKey} - <i className="text-slate-400">{result.materials.accentWall.justification}</i></p>}
                             <p><strong>Trim:</strong> {result.materials.trim.materialKey} - <i className="text-slate-400">{result.materials.trim.justification}</i></p>
                        </div>
                    </AccordionSection>
                    <AccordionSection title="Furniture" count={result.furniture?.length}>
                         <ul className="text-sm space-y-2 list-disc list-inside text-slate-300">
                            {(result.furniture || []).map((item, i) => <li key={i}><strong>{item.name}:</strong> <i className="text-slate-400">{item.justification}</i></li>)}
                        </ul>
                    </AccordionSection>
                    <AccordionSection title="Lighting" count={result.lighting?.length}>
                         <ul className="text-sm space-y-2 list-disc list-inside text-slate-300">
                            {(result.lighting || []).map((item, i) => <li key={i}><strong>{item.name}:</strong> <i className="text-slate-400">{item.justification}</i></li>)}
                        </ul>
                    </AccordionSection>
                    <AccordionSection title="Textiles & Decor" count={(result.textiles?.length || 0) + (result.decor?.length || 0)}>
                         <ul className="text-sm space-y-2 list-disc list-inside text-slate-300">
                            {(result.textiles || []).map((item, i) => <li key={i}><strong>{item.name}:</strong> <i className="text-slate-400">{item.justification}</i></li>)}
                            {(result.decor || []).map((item, i) => <li key={i}><strong>{item.name}:</strong> <i className="text-slate-400">{item.justification}</i></li>)}
                        </ul>
                    </AccordionSection>
                    <button onClick={applyScheme} className="w-full mt-2 p-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-md">Apply Full Scheme</button>
                </div>
            )}
        </div>
    );
};

const LandscapeArchitect: React.FC<PhoenixEnginePanelProps> = (props) => {
    // This is a placeholder for the full component logic.
    return <p>Landscape Architect Tool Coming Soon.</p>;
};

const CinematicTourGenerator: React.FC<PhoenixEnginePanelProps> = (props) => {
    // This is a placeholder for the full component logic.
    return <p>Cinematic Tour Generator Tool Coming Soon.</p>;
};


export const AmbianceTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'interior' | 'landscape' | 'cinematic'>('interior');

    return (
        <div>
            <div className="flex border-b border-slate-700 mb-4">
                <TabButton isActive={activeTab === 'interior'} onClick={() => setActiveTab('interior')}>Interior</TabButton>
                <TabButton isActive={activeTab === 'landscape'} onClick={() => setActiveTab('landscape')}>Landscape</TabButton>
                <TabButton isActive={activeTab === 'cinematic'} onClick={() => setActiveTab('cinematic')}>Cinematic</TabButton>
            </div>
            {activeTab === 'interior' && <InteriorDecorator {...props} />}
            {activeTab === 'landscape' && <LandscapeArchitect {...props} />}
            {activeTab === 'cinematic' && <CinematicTourGenerator {...props} />}
        </div>
    );
};