// src/features/PropertiesPanel.tsx
import React from 'react';
import { PhoenixEnginePanelProps, Wall } from '../../types';
import { PREDEFINED_MATERIALS } from '../../constants';
import { getVastuQuickIndicator } from '../../utils/vastuUtils';
import { calculateRoomArea } from '../../utils/geometryUtils';

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

const NumberInput: React.FC<{ value: number; onBlur: (val: number) => void }> = ({ value, onBlur }) => {
    const [localValue, setLocalValue] = React.useState(value);
    
    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(parseFloat(e.target.value) || 0)}
            onBlur={() => onBlur(localValue)}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm"
        />
    );
};


const SelectInput: React.FC<{ value: string; onChange: (val: string) => void; children: React.ReactNode }> = ({ value, onChange, children }) => (
     <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm">
        {children}
    </select>
);

export const PropertiesPanel: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { selectedObject, levels, pushToUndoStack, setSingleLevelProp, addProactiveSuggestion, planNorthDirection } = props;

    if (!selectedObject) {
        return (
            <div className="p-4 text-center text-sm text-slate-400">
                Select an object on the canvas to see its properties.
            </div>
        );
    }
    
    const { id, type, levelIndex } = selectedObject;
    const level = levels[levelIndex];

    const handleUpdate = (updateFn: (item: any) => any) => {
        pushToUndoStack();
        const propMap = {
            wall: 'walls',
            room: 'rooms',
            placement: 'placements',
            placedModel: 'placedModels',
        } as const;

        const propKey = propMap[type as keyof typeof propMap];
        if (propKey) {
            setSingleLevelProp(propKey, (prev: any[]) => prev.map(item => item.id === id ? updateFn(item) : item));
        }
    };

    const handleRoomTypeChange = (newType: string) => {
        handleUpdate(r => ({...r, type: newType}));
        const updatedRoom = level.rooms.find(r => r.id === id);

        if (newType.toLowerCase().includes('kitchen') && updatedRoom) {
            const vastuIndicator = getVastuQuickIndicator({ ...updatedRoom, type: newType }, planNorthDirection);
            if (vastuIndicator.scoreConcept < 50) {
                addProactiveSuggestion({
                    title: "Vastu Suggestion",
                    message: `The current orientation for the kitchen may not be optimal according to Vastu. Consider moving it to a South-East or North-West zone for better energy flow.`,
                    cta: {
                        label: 'Open Vastu Tool',
                        action: (store) => {
                            store.setActiveTool('vastu');
                            if (!store.panelStates.phoenixEngine.isVisible) {
                                store.togglePanelVisibility('phoenixEngine');
                            }
                        }
                    }
                });
            }
        }
    };
    
    const renderProperties = () => {
        let selectedItem: any = null;
        switch (type) {
            case 'wall': selectedItem = level.walls.find(w => w.id === id); break;
            case 'placement': selectedItem = level.placements.find(p => p.id === id); break;
            case 'room': selectedItem = level.rooms.find(r => r.id === id); break;
            case 'placedModel': selectedItem = level.placedModels.find(m => m.id === id); break;
            default: return <p className="text-slate-400">No properties to edit for this object.</p>;
        }
        if (!selectedItem) return null;
        
        return (
            <>
                <div className="space-y-3">
                    {type === 'wall' && (
                        <>
                            <InputGroup label="Thickness"><NumberInput value={selectedItem.thickness} onBlur={val => handleUpdate(w => ({...w, thickness: val}))} /></InputGroup>
                            <InputGroup label="Height"><NumberInput value={selectedItem.height} onBlur={val => handleUpdate(w => ({...w, height: val}))} /></InputGroup>
                        </>
                    )}
                    {type === 'placement' && (
                         <>
                            <InputGroup label="Width"><NumberInput value={selectedItem.width} onBlur={val => handleUpdate(p => ({...p, width: val}))} /></InputGroup>
                            <InputGroup label="Height"><NumberInput value={selectedItem.height} onBlur={val => handleUpdate(p => ({...p, height: val}))} /></InputGroup>
                        </>
                    )}
                     {type === 'room' && (
                        <>
                            <InputGroup label="Room Name"><input type="text" defaultValue={selectedItem.name} onBlur={(e) => handleUpdate(r => ({...r, name: e.target.value}))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm" /></InputGroup>
                            <InputGroup label="Room Type"><input type="text" defaultValue={selectedItem.type} onBlur={(e) => handleRoomTypeChange(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm" /></InputGroup>
                            <InputGroup label="Floor Material">
                                <SelectInput value={selectedItem.floorMaterial || ''} onChange={val => handleUpdate(r => ({...r, floorMaterial: val}))}>
                                    <option value="">Default</option>
                                    {PREDEFINED_MATERIALS.filter(m => m.appliesTo === 'floor' || m.appliesTo === 'any').map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                                </SelectInput>
                            </InputGroup>
                             <InputGroup label="Wall Material (Override)">
                                 <SelectInput value={selectedItem.wallMaterialOverride || ''} onChange={val => handleUpdate(r => ({...r, wallMaterialOverride: val}))}>
                                    <option value="">Default</option>
                                    {PREDEFINED_MATERIALS.filter(m => m.appliesTo === 'wall' || m.appliesTo === 'any').map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
                                </SelectInput>
                            </InputGroup>
                            <div className="mt-2 pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-400">Calculated Area</p>
                                <p className="text-lg font-bold text-slate-100">
                                    {selectedItem.calculatedArea ? `${(selectedItem.calculatedArea / 10000).toFixed(2)} sq.m` : 'N/A'}
                                </p>
                                <button
                                    onClick={() => {
                                        const roomWalls = selectedItem.wallIds.map((id: string) => level.walls.find(w => w.id === id)).filter(Boolean);
                                        const area = calculateRoomArea(roomWalls as Wall[]);
                                        handleUpdate(r => ({ ...r, calculatedArea: area }));
                                    }}
                                    className="text-xs mt-1 text-sky-400 hover:underline"
                                >
                                    Recalculate Area
                                </button>
                            </div>
                        </>
                     )}
                     {type === 'placedModel' && (
                        <>
                            <InputGroup label="Width"><NumberInput value={selectedItem.width} onBlur={val => handleUpdate(m => ({...m, width: val}))} /></InputGroup>
                            <InputGroup label="Depth"><NumberInput value={selectedItem.depth} onBlur={val => handleUpdate(m => ({...m, depth: val}))} /></InputGroup>
                            <InputGroup label="Height"><NumberInput value={selectedItem.height3d} onBlur={val => handleUpdate(m => ({...m, height3d: val}))} /></InputGroup>
                            <InputGroup label="Rotation"><NumberInput value={selectedItem.rotation} onBlur={val => handleUpdate(m => ({...m, rotation: val}))} /></InputGroup>
                        </>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-600">
                    <InputGroup label="Layer Assignment">
                        <SelectInput value={selectedItem.layerId} onChange={val => handleUpdate(item => ({ ...item, layerId: val }))}>
                            {level.layers.map(layer => <option key={layer.id} value={layer.id}>{layer.name}</option>)}
                        </SelectInput>
                    </InputGroup>
                </div>
            </>
        );
    };
    
    const getObjectName = () => {
        switch (type) {
            case 'wall': return "Wall";
            case 'room': return level.rooms.find(r => r.id === id)?.name || "Room";
            case 'placement': return level.placements.find(p => p.id === id)?.type === 'door' ? "Door" : "Window";
            case 'placedModel': return level.placedModels.find(m => m.id === id)?.name || "3D Model";
            default: return "Object";
        }
    };

    return (
        <div className="p-4 h-full overflow-y-auto">
            <h4 className="text-lg font-bold text-sky-300 mb-4 capitalize">{getObjectName()}</h4>
            {renderProperties()}
        </div>
    );
};
