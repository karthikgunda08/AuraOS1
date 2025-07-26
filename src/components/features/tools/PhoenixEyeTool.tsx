// src/features/tools/PhoenixEyeTool.tsx
import React, { useState, useRef } from 'react';
import { PhoenixEnginePanelProps } from '../PhoenixEnginePanel';
import { PhoenixEyeReport, Discrepancy } from '../../types';
import { analyzeSiteMediaApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const DiscrepancyCard: React.FC<{ discrepancy: Discrepancy }> = ({ discrepancy }) => {
    const severityColors = { low: 'border-yellow-500', medium: 'border-orange-500', high: 'border-red-500' };
    return (
        <div className={`p-3 bg-slate-900/50 rounded-lg border-l-4 ${severityColors[discrepancy.severity]}`}>
            <p className="font-semibold text-slate-200 capitalize">{discrepancy.type} Discrepancy <span className="text-xs">({discrepancy.severity})</span></p>
            <p className="text-sm text-slate-300 mt-1">{discrepancy.description}</p>
            <p className="text-sm text-emerald-300 mt-2">Recommendation: {discrepancy.recommendation}</p>
        </div>
    );
};

export const PhoenixEyeTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, onBuyCreditsClick, refreshCurrentUser, currentProject, constructionSequence } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PhoenixEyeReport | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const { addNotification } = useNotificationStore();
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (files.length > 5) {
            addNotification("You can upload a maximum of 5 images.", "error");
            return;
        }
        setSelectedImages(files);
        const previews = files.map(file => URL.createObjectURL(file as Blob));
        setImagePreviews(previews);
        // Reset the input value to allow re-selecting the same file
        e.target.value = '';
    };
    
    const handleUseCamera = () => {
        cameraInputRef.current?.click();
    };

    const handleAnalyze = async () => {
        if (!currentProject || !constructionSequence || selectedImages.length === 0) {
            addNotification("Please ensure a construction plan has been generated and you've selected at least one site image.", "error");
            return;
        }
        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < 30) {
            addNotification(`You need 30 credits.`, 'info');
            onBuyCreditsClick();
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const imagePromises = selectedImages.map(file => {
                return new Promise<{ base64: string, mimeType: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve({ base64: (reader.result as string).split(',')[1], mimeType: file.type });
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });
            const imagesData = await Promise.all(imagePromises);
            
            const response = await analyzeSiteMediaApi(currentProject.id, constructionSequence, imagesData);
            setResult(response);
            addNotification("Phoenix Eye analysis complete!", "success");
            await refreshCurrentUser();
        } catch (err: any) {
            setError(err.message);
            addNotification(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <p className="text-sm text-slate-300 mb-3">Upload recent photos from your construction site. The Phoenix Eye will compare them to the active 4D plan and report on progress and discrepancies.</p>
            <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="grid grid-cols-2 gap-2">
                    <label htmlFor="image-upload" className="w-full text-center p-4 border-2 border-dashed border-slate-500 rounded-md cursor-pointer hover:bg-slate-600/50 block">
                        {imagePreviews.length > 0 ? "Change Files" : "Upload from File"}
                    </label>
                    <button onClick={handleUseCamera} className="w-full text-center p-4 border-2 border-dashed border-slate-500 rounded-md cursor-pointer hover:bg-slate-600/50 block">
                        Use Device Camera
                    </button>
                </div>
                <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                <input ref={cameraInputRef} id="camera-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                
                {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {imagePreviews.map((src, i) => <img key={i} src={src} alt="preview" className="rounded-md object-cover h-24 w-full" />)}
                    </div>
                )}
            </div>
             <button
                onClick={handleAnalyze}
                disabled={isLoading || selectedImages.length === 0}
                className="w-full mt-4 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">👁️</span>}
                <span className="flex-grow">{isLoading ? 'Analyzing...' : 'Analyze Site Progress'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">30 credits</span>
            </button>
             {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
             {result && (
                <div className="mt-4 space-y-3">
                    <h4 className="font-semibold text-slate-200">Phoenix Eye Report</h4>
                    <div className="p-3 bg-slate-700/50 rounded-lg space-y-2">
                        <p><strong>Overall Assessment:</strong> {result.overallAssessment}</p>
                        <p><strong>Progress This Week:</strong> {result.progressPercentage}%</p>
                        <p><strong>Schedule Adherence:</strong> <span className="capitalize">{result.scheduleAdherence.replace('_', ' ')}</span></p>
                    </div>
                    {result.discrepancies.map(d => <DiscrepancyCard key={d.id} discrepancy={d} />)}
                </div>
             )}
        </div>
    );
};