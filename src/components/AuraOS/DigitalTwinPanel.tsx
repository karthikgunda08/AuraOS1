// src/components/AOS/DigitalTwinPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import { StructuralStress, DigitalTwinDataOverlay } from '../../types';

const ControlRow: React.FC<{ label: string; checked: boolean; onToggle: () => void; }> = ({ label, checked, onToggle }) => (
    <div className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
        <label htmlFor={`toggle-${label}`} className="text-sm font-medium text-slate-200">{label}</label>
        <input
            id={`toggle-${label}`}
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="h-5 w-5 rounded text-sky-500 bg-slate-600 border-slate-500 focus:ring-sky-500"
        />
    </div>
);

const SummaryMetric: React.FC<{ label: string; value: string | number; unit: string; }> = ({ label, value, unit }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-xl font-bold text-amber-300">{value} <span className="text-sm font-normal text-slate-300">{unit}</span></p>
    </div>
);

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors flex-grow ${isActive ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);


export const DigitalTwinPanel: React.FC = () => {
    const { digitalTwinData, activeDataOverlays, setActiveOverlays } = useAppStore(state => ({
        digitalTwinData: state.digitalTwinData,
        activeDataOverlays: state.activeDataOverlays,
        setActiveOverlays: state.setActiveOverlays,
    }));
    const [activeTab, setActiveTab] = useState<'summary' | 'iot'>('summary');

    const handleToggle = (overlay: keyof DigitalTwinDataOverlay) => {
        setActiveOverlays(prev => ({ ...prev, [overlay]: !prev[overlay] }));
    };

    if (!digitalTwinData) {
        return <div className="p-4 text-slate-400">Digital Twin data not available.</div>;
    }
    
    // Sort IoT devices by stress factor for easy identification of critical points
    const sortedStressSensors = [...(digitalTwinData.structuralStress || [])].sort((a, b) => b.stressFactor - a.stressFactor);

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                 <h4 className="font-bold text-lg text-sky-300 mb-2 flex items-center gap-2">
                    Digital Twin
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        LIVE
                    </span>
                </h4>
            </div>
            
             <div className="flex border-b border-slate-700 flex-shrink-0">
                <TabButton isActive={activeTab === 'summary'} onClick={() => setActiveTab('summary')}>Summary & Overlays</TabButton>
                <TabButton isActive={activeTab === 'iot'} onClick={() => setActiveTab('iot')}>Live IoT Devices</TabButton>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
               {activeTab === 'summary' && (
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            <SummaryMetric label="Power Draw" value={digitalTwinData.totalPowerDraw.toFixed(1)} unit="kWh" />
                            <SummaryMetric label="Peak Stress" value={`${(digitalTwinData.peakStressFactor * 100).toFixed(0)}%`} unit="Cap" />
                            <SummaryMetric label="Occupancy" value={digitalTwinData.totalOccupancy} unit="People" />
                        </div>
                        <div>
                             <h4 className="font-bold text-lg text-sky-300 mb-2">Data Overlays</h4>
                             <div className="space-y-2">
                                <ControlRow label="Energy Consumption" checked={activeDataOverlays.energy} onToggle={() => handleToggle('energy')} />
                                <ControlRow label="Structural Stress" checked={activeDataOverlays.stress} onToggle={() => handleToggle('stress')} />
                                <ControlRow label="Occupancy Flow" checked={activeDataOverlays.occupancy} onToggle={() => handleToggle('occupancy')} />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'iot' && (
                    <div>
                        <h4 className="font-bold text-lg text-sky-300 mb-2">Live Sensor Feed</h4>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                            {sortedStressSensors.length > 0 ? sortedStressSensors.map(sensor => (
                                <div key={sensor.wallId} className="p-2 bg-slate-900/50 rounded-md">
                                    <p className="text-sm font-medium text-slate-200">Strain Gauge ({sensor.wallId})</p>
                                    <div className="flex items-center gap-2">
                                         <div className="w-full bg-slate-700 rounded-full h-2.5">
                                            <div 
                                                className="bg-gradient-to-r from-green-400 to-red-500 h-2.5 rounded-full" 
                                                style={{ width: `${sensor.stressFactor * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-amber-300 w-12 text-right">
                                            {(sensor.stressFactor * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-400 text-center py-4">No live IoT sensor data available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};