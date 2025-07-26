// src/components/dashboard/TokenizeModal.tsx
import React, { useState } from 'react';
import { ProjectSummary } from '../../types';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../LoadingSpinner';

interface TokenizeModalProps {
  project: ProjectSummary;
  onClose: () => void;
  onTokenized: () => void;
}

export const TokenizeModal: React.FC<TokenizeModalProps> = ({ project, onClose, onTokenized }) => {
  const [totalTokens, setTotalTokens] = useState(10000);
  const [pricePerToken, setPricePerToken] = useState(100);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleTokenize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTokens <= 0 || pricePerToken <= 0 || !description.trim()) {
      addNotification("Please fill in all fields with valid values.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await projectService.tokenizeProjectApi(project.id, {
        totalTokens,
        pricePerToken,
        offeringDescription: description
      });
      addNotification("Your project has been tokenized and is now listed on the Exchange!", "success");
      onTokenized();
      onClose();
    } catch (error: any) {
      addNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalValue = totalTokens * pricePerToken;

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-[150] flex items-center justify-center backdrop-blur-sm animate-fade-in-up" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-purple-300 mb-2">Tokenize Project for Exchange</h2>
        <p className="text-sm text-slate-400 mb-6">Create a simulated investment offering for your project "{project.name}". This will list it on the Real Estate Exchange.</p>

        <form onSubmit={handleTokenize} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalTokens" className="block text-sm font-medium text-slate-300 mb-1">Total Tokens</label>
              <input
                id="totalTokens" type="number" value={totalTokens}
                onChange={(e) => setTotalTokens(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 transition" required
              />
            </div>
            <div>
              <label htmlFor="pricePerToken" className="block text-sm font-medium text-slate-300 mb-1">Price per Token (Credits)</label>
              <input
                id="pricePerToken" type="number" value={pricePerToken}
                onChange={(e) => setPricePerToken(parseInt(e.target.value, 10) || 0)}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 transition" required
              />
            </div>
          </div>

           <div className="p-3 bg-slate-900/50 rounded-md text-center">
                <p className="text-sm text-slate-400">Total Offering Value</p>
                <p className="text-2xl font-bold text-green-400">{totalValue.toLocaleString()} <span className="text-lg font-medium text-slate-300">Credits</span></p>
            </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Offering Description</label>
            <textarea
              id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Describe the investment potential and key features of your project..." required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold text-white text-sm flex items-center">
              {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
              {isLoading ? 'Tokenizing...' : 'List on Exchange'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TokenizeModal;