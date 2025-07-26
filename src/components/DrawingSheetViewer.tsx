// src/components/DrawingSheetViewer.tsx
import React, { useState } from 'react';
import jspdf from 'jspdf';
import { GFCDrawingSet, ProjectData, MEPlayer, GeneralNotes, MaterialLegendItem } from '../types';

interface DrawingSheetViewerProps {
    sheet: GFCDrawingSet;
    projectData: ProjectData;
}

const SVG_VIEWBOX_WIDTH = 1200;
const SVG_VIEWBOX_HEIGHT = 850;
const SVG_PADDING = 50;

const projectToSvgCoords = (point: {x: number, y: number}, bounds: {minX: number, minY: number, width: number, height: number}) => {
    const scaleX = (SVG_VIEWBOX_WIDTH - SVG_PADDING * 2) / bounds.width;
    const scaleY = (SVG_VIEWBOX_HEIGHT - SVG_PADDING * 2 - 100) / bounds.height;
    const scale = Math.min(scaleX, scaleY);
    const svgX = (point.x - bounds.minX) * scale + SVG_PADDING;
    const svgY = (point.y - bounds.minY) * scale + SVG_PADDING;
    return { x: svgX, y: svgY, scale };
};

const getProjectBounds = (projectData: ProjectData) => {
    const allPoints = projectData.levels.flatMap(l => l.walls.flatMap(w => [{x: w.x1, y: w.y1}, {x: w.x2, y: w.y2}]));
    if (allPoints.length === 0) return { minX: 0, minY: 0, width: 1000, height: 800 };
    const minX = Math.min(...allPoints.map(p => p.x));
    const minY = Math.min(...allPoints.map(p => p.y));
    const maxX = Math.max(...allPoints.map(p => p.x));
    const maxY = Math.max(...allPoints.map(p => p.y));
    return { minX, minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
};

const renderMepLayer = (layer: MEPlayer, bounds: any, className: string) => {
    if (!layer) return null;
    return (
        <g className={className}>
            {(layer.lines || []).map(line => {
                const points = line.path.map(p => projectToSvgCoords(p, bounds)).map(p => `${p.x},${p.y}`).join(' ');
                return <polyline key={line.id} points={points} />;
            })}
             {(layer.symbols || []).map(symbol => {
                const pos = projectToSvgCoords(symbol, bounds);
                 return <circle key={symbol.id} cx={pos.x} cy={pos.y} r="5" />;
             })}
        </g>
    );
};

export const DrawingSheetViewer: React.FC<DrawingSheetViewerProps> = ({ sheet, projectData }) => {
    const [visibleLayers, setVisibleLayers] = useState({ plumbing: true, electrical: true, fire: true });

    const handleExportToPDF = () => {
        const svgElement = document.getElementById('drawing-svg-export');
        if (svgElement) {
            const doc = new jspdf({ orientation: 'l', unit: 'px', format: [SVG_VIEWBOX_WIDTH, SVG_VIEWBOX_HEIGHT] });
            const svgString = new XMLSerializer().serializeToString(svgElement);
            (doc as any).svg(svgString, { width: SVG_VIEWBOX_WIDTH, height: SVG_VIEWBOX_HEIGHT }).then(() => {
                doc.save(`GFC_Drawing.pdf`);
            });
        }
    };
    
    const bounds = getProjectBounds(projectData);
    const level = projectData.levels[0];

    return (
        <div className="w-full">
            <div className="bg-slate-700 p-3 rounded-t-lg flex justify-between items-center">
                <h3 className="font-bold text-lg text-sky-300">Good for Construction Drawing Set</h3>
                <button onClick={handleExportToPDF} className="px-4 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-500 rounded-md">Export PDF</button>
            </div>
            <div className="flex gap-4 p-2">
                <div className="w-3/4">
                    <div className="flex items-center gap-4 p-2 bg-slate-800 rounded-t-md">
                        <span className="text-xs font-semibold">MEP Layers:</span>
                        {Object.keys(visibleLayers).map((layerKey) => (
                            <label key={layerKey} className="flex items-center gap-1 text-xs">
                                <input
                                    type="checkbox"
                                    checked={visibleLayers[layerKey as keyof typeof visibleLayers]}
                                    onChange={() => setVisibleLayers(p => ({ ...p, [layerKey]: !p[layerKey] }))}
                                    className="h-3.5 w-3.5 rounded-sm bg-slate-600 border-slate-500 focus:ring-sky-500"
                                />
                                {layerKey.charAt(0).toUpperCase() + layerKey.slice(1)}
                            </label>
                        ))}
                    </div>
                    <svg id="drawing-svg-export" viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`} className="w-full h-auto bg-slate-800 rounded-b-md">
                        <style>{`
                            .wall { stroke: #FFF; stroke-width: 1.5; }
                            .plumbing-layer { stroke: #3498db; stroke-width: 1; fill: none; }
                            .electrical-layer { stroke: #f1c40f; stroke-width: 0.75; fill: none; stroke-dasharray: 5 3; }
                            .fire-layer { stroke: #e74c3c; stroke-width: 1; fill: none; }
                            .fire-layer circle { fill: #e74c3c; }
                        `}</style>
                        <g id="main-geometry">
                            {level.walls.map(wall => {
                                const p1 = projectToSvgCoords({ x: wall.x1, y: wall.y1 }, bounds);
                                const p2 = projectToSvgCoords({ x: wall.x2, y: wall.y2 }, bounds);
                                return <line key={wall.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="wall" />;
                            })}
                        </g>
                        {visibleLayers.plumbing && renderMepLayer(sheet.mepLayers.plumbing, bounds, 'plumbing-layer')}
                        {visibleLayers.electrical && renderMepLayer(sheet.mepLayers.electrical, bounds, 'electrical-layer')}
                        {visibleLayers.fire && renderMepLayer(sheet.mepLayers.fire, bounds, 'fire-layer')}
                    </svg>
                </div>
                <div className="w-1/4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-1">General Notes</h4>
                        <div className="p-2 bg-slate-800 rounded-md text-xs text-slate-300 space-y-1">
                            {Object.entries(sheet.generalNotes).map(([key, notes]) => (
                                <div key={key}><strong>{key.toUpperCase()}:</strong> {(notes as string[]).join(' ')}</div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-1">Material Legend</h4>
                        <div className="p-2 bg-slate-800 rounded-md text-xs text-slate-300 space-y-1">
                            {sheet.materialLegend.map((item, i) => (
                                <p key={i}><strong>{item.tag}:</strong> {item.details}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};