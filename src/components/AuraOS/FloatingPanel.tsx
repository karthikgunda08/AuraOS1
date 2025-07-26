// src/components/AuraOS/FloatingPanel.tsx
import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { PanelState } from '../../types';

interface FloatingPanelProps {
  panelState: PanelState;
  setPanelState: React.Dispatch<React.SetStateAction<PanelState>>;
  onFocus: () => void;
  title: string;
  children: ReactNode;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({ panelState, setPanelState, onFocus, title, children }) => {
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartPosRef.current = {
      x: e.clientX - panelState.x,
      y: e.clientY - panelState.y,
    };
    onFocus(); // Bring to front on click
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      setPanelState(prev => ({
        ...prev,
        x: e.clientX - dragStartPosRef.current.x,
        y: e.clientY - dragStartPosRef.current.y,
      }));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setPanelState]);

  const handleClose = () => {
    setPanelState(prev => ({...prev, isVisible: false}));
  }

  return (
    <div
      className="aura-floating-panel"
      style={{
        left: `${panelState.x}px`,
        top: `${panelState.y}px`,
        width: `${panelState.width}px`,
        height: `${panelState.height}px`,
        zIndex: panelState.zIndex,
      }}
      onMouseDown={onFocus}
    >
      <div className="aura-floating-panel-header" onMouseDown={handleMouseDown}>
        <h3 className="text-sm font-bold text-slate-200 truncate">{title}</h3>
        <button onClick={handleClose} className="text-slate-400 hover:text-white">&times;</button>
      </div>
      <div className="aura-floating-panel-content">
        {children}
      </div>
      {/* Add resize handles here if needed */}
    </div>
  );
};
