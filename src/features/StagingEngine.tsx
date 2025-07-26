// src/features/StagingEngine.tsx
import React from 'react';
import { PhoenixEnginePanelProps, TimeOfDay } from '../types';

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, min, max, step, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            <span className="text-xs font-mono text-slate-400 w-12 text-right">{value.toFixed(0)}°</span>
        </div>
    </div>
);

const RadioButtonGroup: React.FC<{ label: string; options: { value: TimeOfDay; label: string }[]; selected: TimeOfDay; onChange: (value: TimeOfDay) => void }> = ({ label, options, selected, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="flex gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${selected === opt.value ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

export const StagingEngine: React.FC<PhoenixEnginePanelProps> = ({ stagingSettings, setStagingSettings, sunPosition, setSunPosition, pushToUndoStack }) => {

    const handleStagingChange = (key: keyof typeof stagingSettings, value: any) => {
        pushToUndoStack();
        setStagingSettings(prev => ({...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-sky-300">Staging Engine</h3>
            <p className="text-sm text-slate-300 -mt-3">Control the lighting and ambiance of your 3D scene for presentations and renders.</p>

            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
                 <RadioButtonGroup
                    label="Time of Day"
                    options={[
                        { value: 'midday', label: 'Midday' },
                        { value: 'sunset', label: 'Sunset' },
                        { value: 'night', label: 'Night' },
                    ]}
                    selected={stagingSettings.timeOfDay}
                    onChange={(val) => handleStagingChange('timeOfDay', val)}
                />

                <Slider
                    label="Sun Azimuth (Direction)"
                    value={sunPosition.azimuth}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(e) => setSunPosition(prev => ({...prev, azimuth: parseInt(e.target.value, 10) }))}
                />
                
                <Slider
                    label="Sun Altitude (Height)"
                    value={sunPosition.altitude}
                    min={-90}
                    max={90}
                    step={1}
                    onChange={(e) => setSunPosition(prev => ({...prev, altitude: parseInt(e.target.value, 10) }))}
                />
            </div>
        </div>
    );
};