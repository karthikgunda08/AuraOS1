// src/components/GlobalSpinner.tsx
import React from 'react';

export const GlobalSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
      <p className="text-white mt-4 text-lg">{message}</p>
    </div>
  );
};