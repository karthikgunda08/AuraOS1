// src/components/AuraOS/MayaLayerPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../LoadingSpinner';

const ControlRow: React.FC<{ label: string; checked: boolean; onToggle: () => void; disabled?: boolean; }> = ({ label, checked, onToggle, disabled }) => (
    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
        <label htmlFor={`toggle-${label}`} className={`text-sm font-medium ${disabled ? 'text-slate-500' : 'text-slate-200'}`}>{label}</label>
        <input
            id={`toggle-${label}`}
            type="radio"
            name="maya-layer-mode"
            checked={checked}
            onChange={onToggle}
            disabled={disabled}
            className="h-5 w-5 text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500 disabled:opacity-50"
        />
    </div>
);

export const MayaLayerPanel: React.FC = () => {
    const { 
        sanjeevaniReport,
        runSamudraManthan,
        globalLoadingMessage,
    } = useAppStore(state => ({
        sanjeevaniReport: state.sanjeevaniReport,
        runSamudraManthan: state.runSamudraManthan,
        globalLoadingMessage: state.globalLoadingMessage,
    }));

    const [activeMode, setActiveMode] = useState('conflictSynergy');
    const isAnalyzing = globalLoadingMessage?.includes('holistic analysis');

    const handleRunAnalysis = () => {
        runSamudraManthan();
    }

    return (
        <div className="h-full flex flex-col p-4 text-white">
            <h3 className="text-lg font-bold text-sky-300 mb-4">Maya Layer Controls</h3>
            <p className="text-xs text-slate-400 mb-4">Activate real-time analysis overlays on your 2D plan to get instant feedback as you design.</p>
            <div className="space-y-2">
                <ControlRow
                    label="Conflict & Synergy"
                    checked={activeMode === 'conflictSynergy'}
                    onToggle={() => setActiveMode('conflictSynergy')}
                    disabled={!sanjeevaniReport}
                />
                <ControlRow
                    label="Vastu Flow"
                    checked={activeMode === 'vastu'}
                    onToggle={() => setActiveMode('vastu')}
                    disabled={true}
                />
                <ControlRow
                    label="Structural Stress"
                    checked={activeMode === 'structural'}
                    onToggle={() => setActiveMode('structural')}
                    disabled={true}
                />
                <ControlRow
                    label="Circulation Paths"
                    checked={activeMode === 'circulation'}
                    onToggle={() => setActiveMode('circulation')}
                    disabled={true}
                />
            </div>
             <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="w-full mt-4 p-2 text-sm font-semibold rounded-md bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50 flex items-center justify-center"
            >
                {isAnalyzing ? <><LoadingSpinner size="h-4 w-4 mr-2" /> Analyzing...</> : 'Refresh Analysis (40 Cr)'}
            </button>
             {!sanjeevaniReport && (
                <p className="text-xs text-amber-300 mt-3 text-center">Run the holistic analysis to enable the Conflict & Synergy overlay.</p>
            )}
        </div>
    );
};