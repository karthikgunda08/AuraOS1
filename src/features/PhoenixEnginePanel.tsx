// src/features/PhoenixEnginePanel.tsx
import React from 'react';
import { PhoenixEnginePanelProps, PhoenixEngineTab } from '../types';
import { MasterArchitectTool } from './MasterArchitectTool';
import { ResearchTool } from './tools/ResearchTool';
import { BoqTool } from './tools/BoqTool';
import { SustainabilityTool } from './tools/SustainabilityTool';
import { ComplianceTool } from './tools/ComplianceTool';
import { MaterialTool } from './tools/MaterialTool';
import { StructureTool } from './tools/StructureTool';
import { DreamWeaverTool } from './tools/DreamWeaverTool';
import { DetailingTool } from './DetailingTool';
import { AmbianceTool } from './AmbianceTool';
import { StagingEngine } from './StagingEngine';
import { OracleTool } from './tools/OracleTool';
import { PhoenixEyeTool } from './tools/PhoenixEyeTool';
import { CommentsTool } from './tools/CommentsTool';
import { ModelLibraryPanel } from '../components/ModelLibraryPanel';
import { RenderTool } from './tools/RenderTool';
import { OptimizerTool } from './tools/OptimizerTool';
import { VishwakarmaTool } from './tools/VishwakarmaTool';
import { FabricatorTool } from './tools/FabricatorTool';
import { IndraNetTool } from './tools/IndraNetTool';
import { LokaSimulatorTool } from './tools/LokaSimulatorTool';
import { HydroEngineerTool } from './tools/HydroEngineerTool';
import { VastuTool } from './tools/VastuTool';
import { NexusAdvisorTool } from './tools/NexusAdvisorTool';
import {
  NavagrahaTool,
  AkashaTool,
  SamsaraTool,
  ShilpaSutraTool,
  AtmanSignatureTool,
  ParamAstraTool,
  SamudraManthanTool,
} from './tools/transcendence/TranscendenceTools';
import { PrithviAstraTool, AgniAstraTool } from './tools/civil/CivilEngineeringTools';
import {
  ARDesignLabTool,
  SketchToPlanTool,
  PlumbingTool,
  ElectricalTool,
  HVACTool,
  FlowTool,
  CinematicTourTool,
  SiteAnalysisTool
} from './tools/misc/SimpleTools';
import { JsonReportDisplay } from '../components/common/JsonReportDisplay';

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode; isPremium?: boolean }> = ({ isActive, onClick, children, isPremium }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? (isPremium ? 'border-amber-400 text-amber-300' : 'border-sky-400 text-sky-300') : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {isPremium && '✨'} {children}
    </button>
);

const toolCategories: Record<string, { label: string; tools: PhoenixEngineTab[] }> = {
    aether: { label: 'Aether (Vision)', tools: ['masterArchitect', 'dreamWeaver', 'nexusAdvisor', 'research', 'oracle', 'sketch', 'modelLibrary', 'comments'] },
    elements: { label: 'Elements (Analysis)', tools: ['boq', 'sustainability', 'compliance', 'material', 'structure', 'vastu', 'flow', 'phoenixEye'] },
    fabrication: { label: 'Fabrication (Construct)', tools: ['detailing', 'vishwakarma', 'fabricator'] },
    presentation: { label: 'Presentation (Ambiance)', tools: ['render', 'ambiance', 'staging', 'cinematicTour', 'indraNet', 'holocronAuthoring'] },
    transcendence: { label: 'Transcendence (Brahman)', tools: ['atmanSignature', 'paramAstra', 'samudraManthan', 'shilpaSutra', 'akasha', 'navagraha', 'samsara'] },
    civil: { label: 'Civil Engineering', tools: ['prithviAstra', 'agniAstra', 'siteAnalysis', 'lokaSimulator', 'hydroEngineer'] },
    mep: { label: 'MEP', tools: ['plumbingLayout', 'electricalLayout', 'hvacLayout'] },
};


const getCategoryForTool = (tool: PhoenixEngineTab): string => {
    for (const category in toolCategories) {
        if (toolCategories[category].tools.includes(tool)) {
            return category;
        }
    }
    return 'aether';
};

export const PhoenixEnginePanel: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { activeTool, setActiveTool } = props;
    const [activeCategory, setActiveCategory] = React.useState(getCategoryForTool(activeTool));

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setActiveTool(toolCategories[category].tools[0]);
    };
    
    React.useEffect(() => {
        setActiveCategory(getCategoryForTool(activeTool));
    }, [activeTool]);

    const renderTool = () => {
        switch (activeTool) {
            case 'masterArchitect': return <MasterArchitectTool {...props} />;
            case 'research': return <ResearchTool {...props} />;
            case 'boq': return <BoqTool {...props} />;
            case 'sustainability': return <SustainabilityTool {...props} />;
            case 'compliance': return <ComplianceTool {...props} />;
            case 'material': return <MaterialTool {...props} />;
            case 'structure': return <StructureTool {...props} />;
            case 'dreamWeaver': return <DreamWeaverTool {...props} />;
            case 'detailing': return <DetailingTool {...props} />;
            case 'ambiance': return <AmbianceTool {...props} />;
            case 'staging': return <StagingEngine {...props} />;
            case 'oracle': return <OracleTool {...props} />;
            case 'phoenixEye': return <PhoenixEyeTool {...props} />;
            case 'comments': return <CommentsTool {...props} />;
            case 'modelLibrary': return <ModelLibraryPanel {...props} />;
            case 'render': return <RenderTool {...props} />;
            case 'optimizer': return <OptimizerTool {...props} />;
            case 'vishwakarma': return <VishwakarmaTool {...props} />;
            case 'fabricator': return <FabricatorTool {...props} />;
            case 'indraNet': return <IndraNetTool {...props} />;
            case 'lokaSimulator': return <LokaSimulatorTool {...props} />;
            case 'hydroEngineer': return <HydroEngineerTool {...props} />;
            case 'vastu': return <VastuTool {...props} />;
            case 'nexusAdvisor': return <NexusAdvisorTool {...props} />;
            // Transcendence
            case 'navagraha': return <NavagrahaTool {...props} />;
            case 'akasha': return <AkashaTool {...props} />;
            case 'samsara': return <SamsaraTool {...props} />;
            case 'shilpaSutra': return <ShilpaSutraTool {...props} />;
            case 'atmanSignature': return <AtmanSignatureTool {...props} />;
            case 'paramAstra': return <ParamAstraTool {...props} />;
            case 'samudraManthan': return <SamudraManthanTool {...props} />;
            // Civil
            case 'prithviAstra': return <PrithviAstraTool {...props} />;
            case 'agniAstra': return <AgniAstraTool {...props} />;
            case 'siteAnalysis': return <SiteAnalysisTool {...props} />;
            // Misc
            case 'arDesignLab': return <ARDesignLabTool {...props} />;
            case 'sketch': return <SketchToPlanTool {...props} />;
            case 'plumbingLayout': return <PlumbingTool {...props} />;
            case 'electricalLayout': return <ElectricalTool {...props} />;
            case 'hvacLayout': return <HVACTool {...props} />;
            case 'flow': return <FlowTool {...props} />;
            case 'cinematicTour': return <CinematicTourTool {...props} />;
            
            // Default/Fallbacks
            case 'holocronAuthoring': return <JsonReportDisplay title="Holocron Authoring" data={{ status: "Coming soon." }} />;
            case 'singularity': return <JsonReportDisplay title="Singularity" data={{ status: "Run from Project Hub." }} />;
            case 'svaDharma': return <JsonReportDisplay title="SvaDharma" data={{ status: "Run from Atman Signature tool." }} />;

            default: return <p>Tool '{activeTool}' not implemented yet.</p>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-slate-700 flex-shrink-0">
                <div className="flex overflow-x-auto">
                    {Object.entries(toolCategories).map(([key, { label }]) => (
                        <TabButton key={key} isActive={activeCategory === key} onClick={() => handleCategoryChange(key)}>
                            {label}
                        </TabButton>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                {renderTool()}
            </div>
        </div>
    );
};
