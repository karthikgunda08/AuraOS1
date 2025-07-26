// src/features/tools/VastuTool.tsx
import React from 'react';
import { GenericApiTool } from './misc/GenericApiTool';
import { PhoenixEnginePanelProps, VastuGridAnalysis } from '../../types';
import { analyzeVastuGridApi } from '../../services/geminiService';
import { FeatureSpotlight } from '../../components/onboarding/FeatureSpotlight';

export const VastuTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <FeatureSpotlight
            spotlightId="vastu-tool"
            title="Vastu Grid Analysis"
            content="This powerful tool analyzes your floor plan against ancient Vastu principles, providing a color-coded grid and detailed feedback for creating a harmonious space."
        >
            <GenericApiTool
                {...props}
                toolName="Vastu Grid Analysis"
                description="Analyze your floor plan against the principles of Vastu Shastra. The AI will generate a 9x9 Vastu Purusha Mandala and identify the energetic compliance of each zone."
                creditCost={10}
                icon="🕉️"
                apiFn={analyzeVastuGridApi}
                buildPayload={(p) => {
                    return [{ projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] }];
                }}
                onSuccess={(result, p) => {
                    p.setVastuGridAnalysis(result as VastuGridAnalysis);
                    p.setShowVastuGrid(true); // Automatically show the grid after analysis
                }}
                 buttonText="Analyze Vastu Grid"
            />
        </FeatureSpotlight>
    );
};
