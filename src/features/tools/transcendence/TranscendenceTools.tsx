// src/features/tools/transcendence/TranscendenceTools.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps } from '../../../types';
import { GenericApiTool } from '../misc/GenericApiTool';
import { runNavagrahaEngineApi, runAkashaEngineApi, runSamsaraEngineApi, runShilpaSutraAnalysisApi, runAtmanSignatureApi, runParamAstraApi, runSvaDharmaAnalyzerApi, runSamudraManthanApi } from '../../../services/geminiService';
import { NavagrahaReport, AkashaReport, SamsaraReport, ShilpaSutraReport, ProjectData, AtmanSignatureResponse, ParamAstraResponse, SvaDharmaResponse, SanjeevaniReport } from '../../../types';
import { useAppStore } from '../../../state/appStore';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ParamAstraResultVisualizer } from '../../../components/analysis/ParamAstraResultVisualizer';
import { SanjeevaniReportDisplay } from '../../../components/analysis/SanjeevaniReportDisplay';
import { Button } from '../../../components/ui/Button';

// --- Navagraha Engine ---
const renderNavagrahaResult = (report: NavagrahaReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <h4 className="font-semibold text-slate-200">Cosmic Analysis</h4>
        <p className="text-sm text-slate-300 italic">{report.analysis}</p>
        <div>
            <h5 className="font-semibold text-slate-200 mb-1">Auspicious Timings:</h5>
            <ul className="space-y-2 text-sm">
                {report.auspiciousTimings.map((item, i) => (
                    <li key={i} className="p-2 bg-slate-900/50 rounded-md">
                        <strong>{item.event}:</strong> <span className="text-amber-300">{item.date}</span>
                        <p className="text-xs text-slate-400">{item.notes}</p>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

export const NavagrahaTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Navagraha Engine"
        description="The celestial architect. Analyze your project's location and desired timeframe to find auspicious timings for key construction milestones, aligned with Vedic cosmic principles."
        creditCost={100}
        icon="🪐"
        apiFn={runNavagrahaEngineApi}
        buildPayload={(p): [ProjectData] | null => {
            const projectData: ProjectData = {
                name: p.currentProject?.name || 'Untitled Project',
                projectType: p.currentProject?.projectType || 'building',
                levels: p.levels,
                location: p.currentProject?.location,
                planNorthDirection: p.planNorthDirection,
                propertyLines: p.propertyLines,
                terrainMesh: p.terrainMesh,
                zones: p.zones,
                infrastructure: p.infrastructure
            };
            return [projectData];
        }}
        onSuccess={(result, p) => p.setNavagrahaReport(result as NavagrahaReport)}
        buttonText="Analyze Cosmic Timings"
        renderResult={(result) => renderNavagrahaResult(result as NavagrahaReport)}
    />
);

// --- Akasha Engine ---
const renderAkashaResult = (report: AkashaReport) => (
     <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <h4 className="font-semibold text-slate-200">Response from the Akashic Records</h4>
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{report.response}</p>
         {report.citations.length > 0 && (
            <div>
                <h5 className="font-semibold text-slate-200 mb-1">Cited Projects from the Records:</h5>
                <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                    {report.citations.map((item, i) => <li key={i}>{item.summary}</li>)}
                </ul>
            </div>
        )}
    </div>
);

export const AkashaTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const [query, setQuery] = useState('');
    return (
        <div>
            <textarea 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                rows={3} 
                className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500 mb-2" 
                placeholder="Ask a profound design question... e.g., 'What are the most common structural solutions for large cantilevered balconies in residential projects?'" 
            />
            <GenericApiTool
                {...props}
                toolName="Akasha Engine"
                description="Query the Akashic Records, the collective memory of all designs on the platform. Gain insights from a universe of architectural data."
                creditCost={50}
                icon="📚"
                apiFn={runAkashaEngineApi}
                buildPayload={(p) => {
                    if (!query.trim()) {
                        p.addNotification('Please enter a query for the Akasha Engine.', 'error');
                        return null;
                    }
                    return [query];
                }}
                onSuccess={(result, p) => p.setAkashaReport(result as AkashaReport)}
                buttonText="Query the Records"
                renderResult={(result) => renderAkashaResult(result as AkashaReport)}
            />
        </div>
    );
};


// --- Samsara Engine ---
const renderSamsaraResult = (report: SamsaraReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <h4 className="font-semibold text-slate-200">Lifecycle Analysis</h4>
        <p className="text-sm text-slate-300 italic">{report.summary}</p>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <h5 className="font-semibold text-slate-200 mb-1">Maintenance Schedule:</h5>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {report.maintenanceSchedule.map((item: any, i) => <li key={i}>{item.item} ({item.frequency})</li>)}
                </ul>
            </div>
            <div>
                <h5 className="font-semibold text-slate-200 mb-1">Material Reincarnation Plan:</h5>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {report.materialReincarnationPlan.map((item: any, i) => <li key={i}>{item.material} ➔ {item.potentialNewUse}</li>)}
                </ul>
            </div>
        </div>
    </div>
);


export const SamsaraTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Samsara Engine"
        description="The master of cycles. Analyze your project's entire lifecycle, from maintenance costs to demolition and material recycling potential."
        creditCost={75}
        icon="♻️"
        apiFn={runSamsaraEngineApi}
        buildPayload={(p) => [{ projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] }]}
        onSuccess={(result, p) => p.setSamsaraReport(result as SamsaraReport)}
        buttonText="Analyze Lifecycle"
        renderResult={(result) => renderSamsaraResult(result as SamsaraReport)}
    />
);

// --- Shilpa Sutra Analysis ---
const renderShilpaSutraResult = (report: ShilpaSutraReport) => (
  <div className="mt-4 p-3 bg-slate-900/30 rounded-lg space-y-6">
    <div className="border-l-4 border-amber-400 pl-4 py-2 bg-slate-800/40 rounded-r-lg">
      <h4 className="font-bold text-lg text-amber-300 font-serif">A Sthapati's Proclamation</h4>
      <blockquote className="mt-2 text-slate-200 italic">
        "{report.narrative}"
      </blockquote>
    </div>
    
    <div>
      <h4 className="font-bold text-lg text-sky-300 mb-3">Potential Embellishments</h4>
      <div className="space-y-3">
        {report.potentialEmbellishments.map((item, i) => (
          <div key={i} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-sky-500">
             <p className="font-semibold text-sky-200">{item.location}</p>
             <p className="text-sm text-slate-300">{item.suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ShilpaSutraTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Shilpa Sutra Analysis"
        description="A Sthapati's critique. Receive an aesthetic and spiritual analysis of your design, with suggestions for artistic embellishments based on traditional principles."
        creditCost={25}
        icon="🎨"
        apiFn={runShilpaSutraAnalysisApi}
        buildPayload={(p) => [{ projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] }]}
        onSuccess={(result, p) => p.setShilpaSutraReport(result as ShilpaSutraReport)}
        buttonText="Analyze Aesthetics"
        renderResult={(result) => renderShilpaSutraResult(result as ShilpaSutraReport)}
    />
);

export const AtmanSignatureTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { atmanSignature, svaDharmaReport, runSvaDharmaAnalyzer, globalLoadingMessage } = useAppStore(state => ({
        atmanSignature: state.atmanSignature,
        svaDharmaReport: state.svaDharmaReport,
        runSvaDharmaAnalyzer: state.runSvaDharmaAnalyzer,
        globalLoadingMessage: state.globalLoadingMessage,
    }));
    const [prompt, setPrompt] = useState('');
    const isAnalyzing = globalLoadingMessage?.includes('DNA');

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Atman Signature</h3>
            
            {/* Part 1: Discovery */}
            <div className="p-3 my-3 bg-slate-900/50 rounded-lg border border-purple-600/50">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-purple-300">Your Architectural DNA</h4>
                </div>
                {svaDharmaReport ? (
                    <div className="mt-2">
                        <p className="font-bold text-lg text-white">"{svaDharmaReport.signature}"</p>
                        <p className="text-xs text-purple-200 mt-1">{svaDharmaReport.analysis}</p>
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 mt-1">Discover your unique design signature by analyzing your portfolio.</p>
                )}
                 <Button variant="outline" size="sm" onClick={runSvaDharmaAnalyzer} className="w-full mt-3" disabled={isAnalyzing}>
                    {isAnalyzing ? <><LoadingSpinner size="h-4 w-4 mr-2" />Analyzing...</> : (svaDharmaReport ? 'Re-Analyze Signature' : 'Analyze My Signature (25 Cr)')}
                </Button>
            </div>
            
            {/* Part 2: Synthesis */}
            <h4 className="font-bold text-lg text-sky-300 mt-6">Signature Synthesis</h4>
            <p className="text-sm text-slate-400 my-2">Synthesize your unique design DNA with a new prompt to generate a project that is intrinsically yours.</p>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2} className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100" placeholder="New prompt, e.g., 'A small library'" disabled={!atmanSignature} />
            <GenericApiTool
                {...props}
                toolName=""
                description=""
                creditCost={50}
                icon="🧬"
                apiFn={runAtmanSignatureApi}
                buildPayload={(p) => {
                    if (!atmanSignature) {
                        p.addNotification("Please analyze your signature first.", "error");
                        return null;
                    }
                    if (!prompt.trim()) {
                        p.addNotification("Please enter a prompt for synthesis.", "error");
                        return null;
                    }
                    return [atmanSignature || '', prompt];
                }}
                onSuccess={(result, p) => p.setAtmanSignatureReport(result as AtmanSignatureResponse)}
                buttonText="Synthesize Signature"
            />
        </div>
    );
};

export const ParamAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { paramAstraReport } = props;
    return (
        <div>
            <GenericApiTool
                {...props}
                toolName="Param-Astra Engine"
                description="The evolutionary design engine. Define your objectives (e.g., minimize cost, maximize views) and let the AI explore thousands of design variations to find the optimal solutions."
                creditCost={75}
                icon="📈"
                apiFn={runParamAstraApi}
                buildPayload={(p) => ([{ cost: 'minimize', views: 'maximize', vastu: 'maximize' }]) as [any]}
                onSuccess={(result, p) => p.setParamAstraReport(result as ParamAstraResponse)}
                buttonText="Find Optimal Solutions"
            />
            {paramAstraReport && <ParamAstraResultVisualizer report={paramAstraReport} />}
        </div>
    );
};

export const SamudraManthanTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { sanjeevaniReport } = props;
    return (
        <div>
            <GenericApiTool
                {...props}
                toolName="Samudra Manthan (The Great Churning)"
                description="A holistic, multi-disciplinary analysis to identify conflicts and synergies between your project's structural, aesthetic, Vastu, and sustainable systems."
                creditCost={40}
                icon="🌪️"
                apiFn={runSamudraManthanApi}
                buildPayload={(p) => [{ projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] }]}
                onSuccess={(result, p) => p.setSanjeevaniReport(result as SanjeevaniReport)}
                buttonText="Perform Holistic Analysis"
            />
            {sanjeevaniReport && <SanjeevaniReportDisplay report={sanjeevaniReport} />}
        </div>
    );
};