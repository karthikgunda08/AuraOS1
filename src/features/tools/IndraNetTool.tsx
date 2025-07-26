// src/features/tools/IndraNetTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, IndraNetReport, IndraNetVisual, ProjectData } from '../../types';
import { runIndraNetEngineApi, generateImageApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const ReportSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="mt-4">
        <h4 className="font-bold text-lg text-sky-300 mb-2">{title}</h4>
        <div className="space-y-3 pl-2 border-l-2 border-slate-700">{children}</div>
    </div>
);

export const IndraNetTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, onBuyCreditsClick, refreshCurrentUser, levels, planNorthDirection, propertyLines, terrainMesh, currentProject } = props;
    const [report, setReport] = useState<IndraNetReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
    const { addNotification } = useNotificationStore();

    const projectData: ProjectData = { name: currentProject?.name || 'Untitled Project', projectType: currentProject?.projectType || 'building', levels, planNorthDirection, propertyLines, terrainMesh, zones: [], infrastructure: [] };

    const handleGenerateKit = async () => {
        if (!currentUser) {
            addNotification("Please log in.", "error");
            return;
        }
        if (currentUser.role !== 'owner' && currentUser.credits < 60) {
            addNotification(`You need 60 credits for this feature.`, 'info');
            onBuyCreditsClick();
            return;
        }

        setIsLoading(true);
        setReport(null);
        try {
            const response = await runIndraNetEngineApi(currentProject?.id || '', projectData);
            setReport(response);
            addNotification("Indra-Net has generated your media kit!", "success");
            await refreshCurrentUser();
        } catch (error: any) {
            addNotification(`Generation failed: ${error.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVisual = async (visual: IndraNetVisual, index: number) => {
        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < 5) {
             addNotification(`You need 5 credits for image generation.`, 'info');
             onBuyCreditsClick();
             return;
        }

        setGeneratingImageIndex(index);
        try {
            const imageResponse = await generateImageApi(currentProject?.id || '', visual.prompt, {});
            setReport(prevReport => {
                if (!prevReport) return null;
                const newVisuals = [...prevReport.visuals];
                newVisuals[index] = { ...newVisuals[index], generatedImageUrl: imageResponse.imageUrl };
                return { ...prevReport, visuals: newVisuals };
            });
            await refreshCurrentUser();
        } catch (error: any) {
             addNotification(`Image generation failed: ${error.message}`, 'error');
        } finally {
            setGeneratingImageIndex(null);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Indra-Net Engine</h3>
            <p className="text-sm text-slate-300 my-3">Generate a complete digital marketing & presentation kit for your project. This includes brand identity, visual concepts, a video storyboard, and website copy.</p>
             <button
                onClick={handleGenerateKit}
                disabled={isLoading}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🎬</span>}
                <span className="flex-grow">{isLoading ? 'Generating Media Kit...' : 'Generate Media Kit'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">60 credits</span>
            </button>

            {report && (
                <div className="mt-4 p-4 bg-slate-700/50 rounded-lg space-y-6">
                    <ReportSection title="Brand Identity">
                        <p><strong>Tagline:</strong> "{report.brandIdentity.tagline}"</p>
                        <p><strong>Logo Concept:</strong> {report.brandIdentity.logoConcept}</p>
                        <div className="flex items-center gap-2">
                            <strong>Color Palette:</strong>
                            {report.brandIdentity.colorPalette.map(color => (
                                <div key={color} className="w-6 h-6 rounded-full border-2 border-slate-500" style={{ backgroundColor: color }} title={color}></div>
                            ))}
                        </div>
                    </ReportSection>

                    <ReportSection title="Marketing Visuals">
                        {report.visuals.map((visual, index) => (
                            <div key={index} className="p-3 bg-slate-900/50 rounded-md">
                                <h5 className="font-semibold text-slate-200">{visual.title}</h5>
                                <p className="text-xs italic text-slate-400">"{visual.prompt}"</p>
                                <div className="mt-2 flex gap-2">
                                     <button
                                        onClick={() => handleGenerateVisual(visual, index)}
                                        disabled={generatingImageIndex !== null}
                                        className="text-xs px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded-md disabled:opacity-50 flex items-center"
                                    >
                                        {generatingImageIndex === index ? <LoadingSpinner size="h-4 w-4 mr-1" /> : '🖼️'} Generate (5 Cr)
                                    </button>
                                </div>
                                {visual.generatedImageUrl && (
                                    <img src={visual.generatedImageUrl} alt={visual.title} className="mt-2 rounded-md shadow-lg" />
                                )}
                            </div>
                        ))}
                    </ReportSection>

                    <ReportSection title="Video Storyboard">
                        <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                            {report.videoStoryboard.map(scene => (
                                <div key={scene.sceneNumber} className="p-2 bg-slate-900/50 rounded-md">
                                    <p><strong>Scene {scene.sceneNumber}:</strong> {scene.visual}</p>
                                    <p className="text-xs text-slate-300"><strong>Narration:</strong> "{scene.narration}"</p>
                                    <p className="text-xs text-slate-400"><strong>On-screen text:</strong> "{scene.onScreenText}"</p>
                                </div>
                            ))}
                        </div>
                    </ReportSection>

                    <ReportSection title="Website Copy">
                         <h5 className="font-bold text-slate-200">{report.websiteCopy.headline}</h5>
                         <p className="text-slate-300">{report.websiteCopy.bodyText}</p>
                    </ReportSection>
                </div>
            )}
        </div>
    );
};
