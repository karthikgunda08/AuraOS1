// src/features/tools/DreamWeaverTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, MultiConceptResponse, MasterArchitectResponse } from '../../types';
import { generateMultiConceptApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors flex-grow ${isActive ? 'border-pink-400 text-pink-300' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);


export const DreamWeaverTool: React.FC<PhoenixEnginePanelProps> = (props) => {
  const { currentUser, setLevels, pushToUndoStack, onBuyCreditsClick, refreshCurrentUser, currentProject, togglePanelVisibility } = props;
  const [prompt, setPrompt] = useState('A compact, modern, and cost-effective 2BHK house with good natural light.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MultiConceptResponse | null>(null);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);
  const { addNotification } = useNotificationStore();

  const isContextMissing = !currentProject?.location || !currentProject?.clientProfile || !currentProject?.siteContext;

  const handleGenerate = async () => {
    if (!prompt.trim() || !currentUser) return;

    if (currentUser.role !== 'owner' && currentUser.credits < 80) {
      addNotification(`You need 80 credits. You have ${currentUser.credits}.`, 'info');
      onBuyCreditsClick();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await generateMultiConceptApi(currentProject?.id || '', prompt);
      setResults(response);
      setSelectedConceptIndex(0);
      addNotification("The AI has generated three design concepts!", "success");
      await refreshCurrentUser();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      addNotification(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
   const applyConcept = (conceptData: MasterArchitectResponse) => {
        pushToUndoStack();
        const { projectData } = conceptData;
        setLevels(projectData.levels || []);
        addNotification(`Applied '${conceptData.summary.substring(0, 20)}...' concept to the editor!`, "success");
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
      <p className="text-sm text-slate-300 mb-3">Describe your ideal space. A team of AI architects will generate three distinct concepts for you to explore.</p>
      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        rows={4} 
        className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-pink-500" 
        placeholder="e.g., 'A cozy G+1 Vastu home' or 'एक आरामदायक जी+1 वास्तु घर'" 
        disabled={isLoading} 
      />
      <button 
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
      >
        {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🎨</span>}
        <span className="flex-grow">{isLoading ? 'Consulting AI Team...' : 'Generate Concepts'}</span>
        <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">80 credits</span>
      </button>

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      
      {results && (
        <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
            <div className="flex border-b border-slate-600 mb-3">
                {results.map((item, index) => (
                    <TabButton key={index} isActive={selectedConceptIndex === index} onClick={() => setSelectedConceptIndex(index)}>
                        {item.persona}
                    </TabButton>
                ))}
            </div>
            <div>
                <h4 className="font-bold text-pink-300">{results[selectedConceptIndex].persona}'s Vision</h4>
                <p className="text-sm text-slate-300 my-2">{results[selectedConceptIndex].concept.summary}</p>
                <button onClick={() => applyConcept(results[selectedConceptIndex].concept)} className="w-full p-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md">
                    Apply this Concept
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
