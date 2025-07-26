// src/features/MasterArchitectTool.tsx
import React, { useState, Suspense } from 'react';
import { PhoenixEnginePanelProps, MasterArchitectResponse } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';
const DesignDialogueModal = React.lazy(() => import('../../components/DesignDialogueModal'));

export const MasterArchitectTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { setLevels, setAdvancedStructuralReport, setVastuGridAnalysis, setBillOfQuantities, pushToUndoStack, currentProject, togglePanelVisibility } = props;
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);

    const isContextMissing = !currentProject?.location || !currentProject?.clientProfile || !currentProject?.siteContext;

    const handleApplyConcept = (result: MasterArchitectResponse) => {
        if (!result) return;
        pushToUndoStack();
        setLevels(result.projectData.levels);
        setAdvancedStructuralReport(result.structuralReport);
        setVastuGridAnalysis(result.vastuReport);
        setBillOfQuantities(result.boq);
    };

    return (
        <div>
            {isContextMissing && (
                <div className="p-3 mb-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-amber-400 text-amber-200 text-sm rounded-r-lg">
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
            <p className="text-sm text-slate-300 mb-3">Provide a high-level project brief. The Master Architect will orchestrate all necessary AI co-pilots to generate a complete, multi-faceted project concept from scratch.</p>
            
            <button
                onClick={() => setIsDialogueOpen(true)}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md flex items-center justify-center transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
                <span className="mr-2 text-lg">🌟</span>
                <span className="flex-grow">Start AI Design Dialogue</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">100 credits</span>
            </button>
            
            {isDialogueOpen && (
                <Suspense fallback={<div className="flex justify-center p-4"><LoadingSpinner/></div>}>
                    <DesignDialogueModal
                        {...props}
                        onClose={() => setIsDialogueOpen(false)}
                        onApplyConcept={handleApplyConcept}
                    />
                </Suspense>
            )}
        </div>
    );
};
