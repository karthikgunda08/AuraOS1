// src/features/tools/civil/CivilEngineeringTools.tsx
import React from 'react';
import { PhoenixEnginePanelProps, PrithviAstraReport, ProjectData } from '../../../types';
import { runPrithviAstraEngineApi } from '../../../services/geminiService';
import { GenericApiTool } from '../misc/GenericApiTool';

// --- Prithvi-Astra (Geotechnical) Tool ---

const renderPrithviResult = (report: PrithviAstraReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <div>
            <h4 className="font-semibold text-slate-200">Geotechnical Report</h4>
            <ul className="text-sm text-slate-300 list-disc list-inside">
                <li>Soil Type: {report.geotechnicalReport.assumedSoilType}</li>
                <li>Est. SBC: {report.geotechnicalReport.estimatedSbc}</li>
                <li>Water Table: {report.geotechnicalReport.waterTableDepth}</li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-slate-200">Recommended Foundation</h4>
            <p className="text-sm text-slate-200"><strong>Type:</strong> {report.recommendedFoundation.type}</p>
            <p className="text-xs text-slate-400"><em>{report.recommendedFoundation.reasoning}</em></p>
        </div>
    </div>
);

export const PrithviAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Prithvi-Astra (Geotechnical)"
            description="Analyzes the project's location to provide a preliminary geotechnical report and a recommended foundation plan based on our Living Root Systems philosophy."
            creditCost={20}
            icon="🌱"
            apiFn={runPrithviAstraEngineApi}
            buildPayload={(p) => {
                if (!p.currentProject?.location) {
                    p.addNotification("Please set a project location in the Project Hub first.", "error");
                    return null;
                }
                const projectData: ProjectData = {
                    name: p.currentProject.name,
                    projectType: p.currentProject.projectType,
                    levels: p.levels,
                    planNorthDirection: p.planNorthDirection,
                    propertyLines: p.propertyLines,
                    terrainMesh: p.terrainMesh,
                    zones: p.zones,
                    infrastructure: p.infrastructure,
                    location: p.currentProject.location
                };
                return [projectData];
            }}
            onSuccess={(result, p) => {
                const typedResult = result as PrithviAstraReport;
                p.setPrithviAstraReport(typedResult);
                if (typedResult.recommendedFoundation?.preliminaryPlan && p.levels[0]) {
                    p.setSingleLevelProp('foundationPlan', typedResult.recommendedFoundation.preliminaryPlan);
                }
            }}
            buttonText="Run Geotechnical Analysis"
            renderResult={(result) => renderPrithviResult(result as PrithviAstraReport)}
        />
    );
};


// --- Agni-Astra (Structural) Tool ---

export const AgniAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    // Placeholder for now
    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Agni-Astra (Structural)</h3>
            <p className="text-sm text-slate-300 my-3">This tool is not yet implemented. It will design a complete structural system based on the geotechnical report from Prithvi-Astra.</p>
        </div>
    );
};
