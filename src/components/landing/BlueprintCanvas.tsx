// src/components/landing/BlueprintCanvas.tsx
import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import { Room, Wall } from '../../types';

interface BlueprintCanvasProps {
    walls: Pick<Wall, 'id' | 'x1' | 'y1' | 'x2' | 'y2' | 'thickness'>[];
    rooms?: Pick<Room, 'name' | 'wallIds'>[];
    isLoading: boolean;
}

export const BlueprintCanvas: React.FC<BlueprintCanvasProps> = ({ walls, rooms, isLoading }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const drawBlueprint = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        canvas.clear();
        canvas.backgroundColor = '#0c4a6e';

        if (!walls || walls.length === 0) {
            canvas.renderAll();
            return;
        }

        const wallObjects = walls.map(wall => new fabric.Line([wall.x1, wall.y1, wall.x2, wall.y2], {
            stroke: 'rgba(255, 255, 255, 0.8)',
            strokeWidth: wall.thickness / 2,
            selectable: false,
            evented: false,
        }));
        
        canvas.add(...wallObjects);

        const roomLabels = (rooms || []).map(room => {
            if (!room.wallIds || room.wallIds.length === 0) return null;

            const roomWallPoints = room.wallIds.flatMap(wallId => {
                const wall = walls.find(w => w.id === wallId);
                return wall ? [{x: wall.x1, y: wall.y1}, {x: wall.x2, y: wall.y2}] : [];
            });

            if (roomWallPoints.length === 0) return null;

            const centerX = roomWallPoints.reduce((sum, p) => sum + p.x, 0) / roomWallPoints.length;
            const centerY = roomWallPoints.reduce((sum, p) => sum + p.y, 0) / roomWallPoints.length;

            return new fabric.Text(room.name, {
                left: centerX,
                top: centerY,
                originX: 'center',
                originY: 'center',
                fontSize: 12,
                fill: 'rgba(255, 255, 255, 0.6)',
                selectable: false,
                evented: false,
            });
        }).filter(Boolean) as fabric.Object[];

        if(roomLabels.length > 0) {
            canvas.add(...roomLabels);
        }

        // Center and zoom the content
        const group = new fabric.Group([...wallObjects, ...roomLabels], { selectable: false, evented: false });
        canvas.centerObject(group);
        const zoom = Math.min(
            (canvas.getWidth() * 0.9) / group.getScaledWidth(),
            (canvas.getHeight() * 0.9) / group.getScaledHeight()
        );
        canvas.zoomToPoint(new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2), zoom);
        
        canvas.renderAll();
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
            interactive: false, // This is a display-only canvas
        });
        fabricCanvasRef.current = canvas;

        const parentEl = canvasRef.current.parentElement;
        if (!parentEl) return;

        const resizeObserver = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            canvas.setWidth(width);
            canvas.setHeight(height);
            drawBlueprint();
        });
        
        resizeObserver.observe(parentEl);

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
            fabricCanvasRef.current = null;
        };
    }, []);

    useEffect(() => {
        drawBlueprint();
    }, [walls, rooms]);

    return (
        <div className="w-full h-full relative">
            <canvas ref={canvasRef} />
            {isLoading && (
                <div className="absolute inset-0 bg-blue-900/50 flex items-center justify-center">
                    <p className="text-white">AI is drawing the blueprint...</p>
                </div>
            )}
        </div>
    );
};
