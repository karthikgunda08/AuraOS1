// src/features/FloorPlanSketcherSection.tsx
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import * as fabric from 'fabric';
import { FloorPlanSketcherSectionProps, Wall, ReadOnlySketcherProps, Placement, SketcherTool, EditorMode, SelectedObject } from '../types';
import { getColorForUserId } from '../utils/colorUtils';

const SNAP_THRESHOLD = 15;
const GRID_SIZE = 20;

export interface SketcherHandles {
  exportAsPNG: () => string | undefined;
}

type CombinedProps = (FloorPlanSketcherSectionProps & { isReadOnly?: false | undefined }) | (ReadOnlySketcherProps & { isReadOnly: true });

// --- Geometry Helper Functions ---
const getWallVector = (wall: Wall) => new fabric.Point(wall.x2 - wall.x1, wall.y2 - wall.y1);
const getWallLength = (wall: Wall) => Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1);
const pointToLineSegmentDistance = (p: fabric.Point, v: fabric.Point, w: fabric.Point) => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
};
const getClosestPointOnSegment = (p: fabric.Point, v: fabric.Point, w: fabric.Point) => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return v;
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return new fabric.Point(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
}


export const FloorPlanSketcherSection = React.forwardRef<SketcherHandles, CombinedProps>((props, ref) => {
  const { levels, activeLevelIndex } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<{ x: number, y: number } | null>(null);
  const frustratedClicksRef = useRef({ count: 0, lastClickTimestamp: 0 });
  const activeLevel = levels[activeLevelIndex];

  const isReadOnly = 'isReadOnly' in props && props.isReadOnly;
  const liveSelections = !isReadOnly ? (props as FloorPlanSketcherSectionProps).liveSelections : {};
  const editorMode = !isReadOnly ? (props as FloorPlanSketcherSectionProps).editorMode : 'concept';
  const selectedObject = !isReadOnly ? (props as FloorPlanSketcherSectionProps).selectedObject : null;

  // Render canvas content when data changes
  useLayoutEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !activeLevel) return;

    canvas.clear();
    
    // Add grid based on mode
    if (editorMode === 'precision') {
        const gridColor = '#2e3a4e';
        for (let i = 0; i < canvas.getWidth() / GRID_SIZE; i++) {
            canvas.add(new fabric.Line([i * GRID_SIZE, 0, i * GRID_SIZE, canvas.getHeight()], { stroke: gridColor, selectable: false, evented: false, strokeWidth: 0.5 }));
        }
        for (let i = 0; i < canvas.getHeight() / GRID_SIZE; i++) {
            canvas.add(new fabric.Line([0, i * GRID_SIZE, canvas.getWidth(), i * GRID_SIZE], { stroke: gridColor, selectable: false, evented: false, strokeWidth: 0.5 }));
        }
    } else { // Concept mode grid
         const gridColor = '#222c3d'; // Fainter dots
         for (let i = 1; i < canvas.getWidth() / GRID_SIZE; i++) {
            for (let j = 1; j < canvas.getHeight() / GRID_SIZE; j++) {
                 canvas.add(new fabric.Circle({ left: i * GRID_SIZE, top: j * GRID_SIZE, radius: 0.5, fill: gridColor, selectable: false, evented: false }));
            }
        }
    }
    
    // NEW: Add underlay logic
    if (activeLevelIndex > 0) {
        const underlayLevel = levels[activeLevelIndex - 1];
        underlayLevel.walls.forEach(wall => {
            const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
                stroke: '#334155',
                strokeWidth: wall.thickness,
                selectable: false,
                evented: false,
                data: { id: wall.id, type: 'underlay' },
            } as any);
            canvas.add(line);
            (canvas as any).sendToBack(line);
        });
    }

    // Determine which objects are selected by other users
    const remoteSelections = new Set<string>();
    if (!isReadOnly) {
        const { currentUser } = props as FloorPlanSketcherSectionProps;
        Object.values(liveSelections).forEach(sel => {
            if (sel.userId !== currentUser?.id && sel.objectId) {
                remoteSelections.add(sel.objectId);
            }
        });
    }

    // Draw walls
    activeLevel.walls.forEach(wall => {
      const isLocked = remoteSelections.has(wall.id);
      const isSelected = selectedObject?.id === wall.id;
      const line = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
        stroke: isSelected ? '#f59e0b' : '#a7c5eb',
        strokeWidth: wall.thickness,
        selectable: !isReadOnly && !isLocked,
        evented: !isReadOnly && !isLocked,
        data: { id: wall.id, type: 'wall' },
        strokeLineCap: 'round',
        originX: 'center',
        originY: 'center',
        opacity: isLocked ? 0.6 : 1,
        strokeDashArray: isLocked ? [5, 5] : undefined,
      } as any);
      canvas.add(line);
    });

    // Draw placements (doors/windows)
    activeLevel.placements.forEach(placement => {
        const wall = activeLevel.walls.find(w => w.id === placement.wallId);
        if (!wall) return;
        
        const isLocked = remoteSelections.has(placement.id);
        const isSelected = selectedObject?.id === placement.id;
        const wallVec = getWallVector(wall);
        const wallAngle = Math.atan2(wallVec.y, wallVec.x);
        
        const centerOnWall = new fabric.Point(wall.x1, wall.y1).add(wallVec.scalarMultiply(placement.positionRatio));
        
        const symbolGroup = new fabric.Group([], {
            left: centerOnWall.x,
            top: centerOnWall.y,
            angle: fabric.util.radiansToDegrees(wallAngle),
            originX: 'center',
            originY: 'center',
            selectable: !isReadOnly && !isLocked,
            evented: !isReadOnly && !isLocked,
            data: { id: placement.id, type: 'placement' },
            opacity: isLocked ? 0.6 : 1,
            // Custom highlight for selected group
            ...(isSelected && {
                borderColor: '#f59e0b',
                cornerColor: '#f59e0b',
                hasControls: true,
            })
        } as any);
        
        const color = isSelected ? '#f59e0b' : '#e2e8f0';

        if (placement.type === 'door') {
            const doorRect = new fabric.Rect({ width: placement.width, height: wall.thickness, fill: '#0f172a', originX: 'center', originY: 'center' });
            const doorLeaf = new fabric.Rect({ width: placement.width, height: 4, fill: color, originX: 'left', originY: 'center', left: -placement.width / 2 });
            const doorSwing = new (fabric as any).Arc(
                -placement.width / 2, -wall.thickness/2,
                 { radius: placement.width, startAngle: 0, endAngle: 90, stroke: color, strokeWidth: 2, fill: '', originX: 'left', originY: 'bottom' });

            symbolGroup.add(doorRect as any, doorLeaf as any, doorSwing as any);
        } else { // Window
             const windowGap = new fabric.Rect({ width: placement.width, height: wall.thickness, fill: '#0f172a', originX: 'center', originY: 'center' });
             const windowFrame = new fabric.Rect({ width: placement.width, height: wall.thickness, stroke: color, strokeWidth: 2, fill: '', originX: 'center', originY: 'center' });
             const windowPane = new fabric.Line([-placement.width/2, 0, placement.width/2, 0], { stroke: color, strokeWidth: 2 });
            symbolGroup.add(windowGap as any, windowFrame as any, windowPane as any);
        }
        canvas.add(symbolGroup);
    });

    canvas.renderAll();
  }, [activeLevel, isReadOnly, editorMode, liveSelections, selectedObject, activeLevelIndex, levels]);

  // Initialize canvas and event listeners
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = new fabric.Canvas(canvasRef.current, {
        interactive: !isReadOnly,
        selection: !isReadOnly,
        backgroundColor: '#0f172a'
    });
    fabricCanvasRef.current = canvas;

    const parentEl = canvasRef.current.parentElement;
    if (!parentEl) return;
    const resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        canvas.setWidth(width);
        canvas.setHeight(height);
        canvas.renderAll();
    });
    resizeObserver.observe(parentEl);

    if (!isReadOnly) {
        const { setWalls, pushToUndoStack, currentTool, addProactiveSuggestion, setActiveSketcherTool, addPlacement, setContextMenu, setSelectedObject } = props as FloorPlanSketcherSectionProps;

        const getPointer = (e: any) => canvas.getPointer(e.e || e);

        const findSnapPoint = (pointer: fabric.Point) => {
            let snapX = pointer.x;
            let snapY = pointer.y;
            let didSnap = false;

            if (editorMode === 'precision') {
                 // Aggressive grid snap in precision mode
                const gridX = Math.round(pointer.x / GRID_SIZE) * GRID_SIZE;
                const gridY = Math.round(pointer.y / GRID_SIZE) * GRID_SIZE;
                if (Math.hypot(pointer.x - gridX, pointer.y - gridY) < SNAP_THRESHOLD) {
                    snapX = gridX;
                    snapY = gridY;
                    didSnap = true;
                }
            }

            // Always check for endpoint snaps, but be more aggressive in precision mode
            const endpointSnapThreshold = editorMode === 'precision' ? SNAP_THRESHOLD * 1.5 : SNAP_THRESHOLD;
            
            for (const wall of activeLevel?.walls || []) {
                if (Math.hypot(pointer.x - wall.x1, pointer.y - wall.y1) < endpointSnapThreshold) {
                    snapX = wall.x1;
                    snapY = wall.y1;
                    didSnap = true;
                    break;
                }
                if (Math.hypot(pointer.x - wall.x2, pointer.y - wall.y2) < endpointSnapThreshold) {
                    snapX = wall.x2;
                    snapY = wall.y2;
                    didSnap = true;
                    break;
                }
            }
            return { x: snapX, y: snapY };
        }
        
        const findClosestWall = (point: fabric.Point) => {
            let closestWall: Wall | null = null;
            let minDistance = Infinity;
            activeLevel.walls.forEach(wall => {
                const distance = pointToLineSegmentDistance(point, new fabric.Point(wall.x1, wall.y1), new fabric.Point(wall.x2, wall.y2));
                if (distance < minDistance) {
                    minDistance = distance;
                    closestWall = wall;
                }
            });
            return minDistance < SNAP_THRESHOLD ? closestWall : null;
        };

        const onMouseDown = (o: any) => {
            if (o.e.button !== 2) setContextMenu(null);

            const target = o.target;
            if (currentTool === 'select' && target && (target as any).data?.id) {
                const data = (target as any).data;
                setSelectedObject({ id: data.id, type: data.type, levelIndex: activeLevelIndex });
            } else if (currentTool === 'select' && !target) {
                setSelectedObject(null);
            }

            if (currentTool === 'door' || currentTool === 'window') {
                const pointer = getPointer(o);
                const wall = findClosestWall(pointer);
                if (wall) {
                    const wallStart = new fabric.Point(wall.x1, wall.y1);
                    const closestPointOnWall = getClosestPointOnSegment(pointer, wallStart, new fabric.Point(wall.x2, wall.y2));
                    const distFromStart = closestPointOnWall.distanceFrom(wallStart);
                    const wallLength = getWallLength(wall);
                    const positionRatio = wallLength > 0 ? distFromStart / wallLength : 0;
                    
                    const newPlacement: Omit<Placement, 'id' | 'layerId'> = {
                        type: currentTool, wallId: wall.id, positionRatio: positionRatio,
                        width: currentTool === 'door' ? 90 : 120, height: currentTool === 'door' ? 210 : 100
                    };
                    addPlacement(newPlacement);
                    setActiveSketcherTool('select');
                }
                return;
            }
            
            if (currentTool !== 'wall') return;
            isDrawing.current = true;
            const pointer = getPointer(o);
            startPoint.current = findSnapPoint(pointer);
            const line = new fabric.Line([startPoint.current.x, startPoint.current.y, pointer.x, pointer.y], {
                stroke: '#ffffff', strokeWidth: 5, selectable: false, data: { id: 'temp-wall' }
            } as any);
            canvas.add(line);
        };

        const onMouseMove = (o: any) => {
            const tempWallHighlightId = 'temp-wall-highlight';
            const existingHighlight = canvas.getObjects().find(obj => (obj as any).data?.id === tempWallHighlightId);
            if(existingHighlight) canvas.remove(existingHighlight);

            if (currentTool === 'door' || currentTool === 'window') {
                 const pointer = getPointer(o);
                 const wall = findClosestWall(pointer);
                 if (wall) {
                     const highlight = new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
                         stroke: '#f59e0b', strokeWidth: wall.thickness + 4, selectable: false, evented: false, data: { id: tempWallHighlightId }
                     } as any);
                     canvas.add(highlight);
                     (canvas as any).sendToBack(highlight);
                 }
            }
            
            if (!isDrawing.current || !startPoint.current) {
                canvas.renderAll();
                return;
            }
            const pointer = getPointer(o);
            const snappedEnd = findSnapPoint(pointer);
            const tempLine = canvas.getObjects().find(obj => (obj as any).data?.id === 'temp-wall') as fabric.Line;
            if(tempLine) {
                tempLine.set({ x2: snappedEnd.x, y2: snappedEnd.y });
                canvas.renderAll();
            }
        };
        
        const onMouseUp = (o: any) => {
            if (!isDrawing.current || !startPoint.current) return;
            isDrawing.current = false;
            
            const pointer = getPointer(o);
            const endPoint = findSnapPoint(pointer);

            const tempLine = canvas.getObjects().find(obj => (obj as any).data?.id === 'temp-wall');
            if (tempLine) canvas.remove(tempLine);

            if (startPoint.current.x === endPoint.x && startPoint.current.y === endPoint.y) {
                canvas.renderAll();
                return;
            }

            const newWall: Omit<Wall, 'id' | 'layerId'> = {
                x1: startPoint.current.x, y1: startPoint.current.y,
                x2: endPoint.x, y2: endPoint.y,
                thickness: 10, height: 240
            };
            
            pushToUndoStack();
            const newWallWithId: Wall = { ...newWall, id: `wall_${Date.now()}`, layerId: activeLevel.activeLayerId };
            setWalls(prev => [...prev, newWallWithId]);
            startPoint.current = null;
        };
        
        const onContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            const pointer = getPointer({e});
            const target = canvas.findTarget(e);

            let selectedObject: SelectedObject | null = null;
            if (target && (target as any).data?.id) {
                const data = (target as any).data;
                selectedObject = { id: data.id, type: data.type, levelIndex: activeLevelIndex };
            }
            setContextMenu({ x: e.clientX, y: e.clientY, object: selectedObject });
        };

        canvas.on('mouse:down', onMouseDown);
        canvas.on('mouse:move', onMouseMove);
        canvas.on('mouse:up', onMouseUp);
        
        const canvasWrapper = canvas.wrapperEl;
        canvasWrapper.addEventListener('contextmenu', onContextMenu);

        return () => {
            resizeObserver.disconnect();
            canvas.off('mouse:down', onMouseDown);
            canvas.off('mouse:move', onMouseMove);
            canvas.off('mouse:up', onMouseUp);
            canvasWrapper.removeEventListener('contextmenu', onContextMenu);
            canvas.dispose();
        };
    } else {
        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            const canvas = fabricCanvasRef.current;
            if (canvas) {
                canvas.setWidth(width);
                canvas.setHeight(height);
                canvas.renderAll();
            }
        });
        if(parentEl) resizeObserver.observe(parentEl);
        return () => {
            resizeObserver.disconnect();
            fabricCanvasRef.current?.dispose();
        };
    }
  }, [isReadOnly, activeLevel, props]);

  React.useImperativeHandle(ref, () => ({
    exportAsPNG: () => fabricCanvasRef.current?.toDataURL({ format: 'png', multiplier: 2 }),
  }));

  const getCursorClass = () => {
    if (isReadOnly) return '';
    const interactiveProps = props as FloorPlanSketcherSectionProps;
    return {
      wall: 'cursor-crosshair', select: 'cursor-default', door: 'cursor-copy', window: 'cursor-copy',
      comment: 'cursor-text', dimension: 'cursor-crosshair', property: 'cursor-default'
    }[interactiveProps.currentTool] || 'cursor-default';
  };
  
  return (
    <div className={`w-full h-full bg-slate-900 ${getCursorClass()}`}>
      <canvas ref={canvasRef} />
    </div>
  );
});

FloorPlanSketcherSection.displayName = 'FloorPlanSketcherSection';