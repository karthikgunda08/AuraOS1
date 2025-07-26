// src/components/AuraOS/ProjectHubPanel.tsx
import React, { useState, useEffect } from 'react';
import { ProjectVersion, GeneratedDocument, GeneratedRender, SingularityReport } from '../../types';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { useAppStore } from '../../state/appStore';
import { ProjectDetailsTab } from './ProjectDetailsTab';

type HubTab = 'details' | 'versions' | 'documents' | 'renders' | 'holocron' | 'singularity';

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode, isPremium?: boolean }> = ({ isActive, onClick, children, isPremium }) => (
    <button
        onClick={onClick}
        className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors flex-grow flex items-center justify-center gap-1 ${isActive ? (isPremium ? 'border-amber-400 text-amber-300' : 'border-sky-400 text-sky-300') : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {isPremium && '✨'} {children}
    </button>
);

const VersionsTab: React.FC = () => {
    const { currentProject, loadProject } = useAppStore(state => ({
        currentProject: state.currentProject,
        loadProject: state.loadProject,
    }));
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (currentProject) {
            setIsLoading(true);
            projectService.getProjectVersions(currentProject.id)
                .then(setVersions)
                .catch(err => addNotification(err.message, 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [currentProject, addNotification]);

    const handleRestore = async (versionId: string) => {
        if (!currentProject) return;
        if (!window.confirm("This will save your current work as a new version and then restore the selected version. Are you sure you want to proceed?")) return;
        setIsLoading(true);
        try {
            const { project: restoredProject } = await projectService.restoreProjectVersion(currentProject.id, versionId);
            addNotification("Project restored successfully! Reloading...", "success");
            await loadProject(restoredProject.id);
        } catch (err: any) {
            addNotification(`Failed to restore: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-4"><LoadingSpinner/></div>;
    return (
        <ul className="space-y-2 p-2">
            {versions.map(version => (
                <li key={version._id} className="p-3 bg-slate-900/50 rounded-md border border-slate-700">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-200">Version {version.versionNumber}</p>
                            <p className="text-sm text-slate-300 italic">"{version.commitMessage}"</p>
                        </div>
                        <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{new Date(version.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button onClick={() => handleRestore(version._id)} className="px-3 py-1 text-xs bg-emerald-700 hover:bg-emerald-600 rounded-md font-semibold">Restore</button>
                    </div>
                </li>
            ))}
        </ul>
    );
};

const DocumentsTab: React.FC = () => {
    const { currentProject, generatedDocuments, setGeneratedDocuments } = useAppStore();
    const { addNotification } = useNotificationStore();

    const handleDelete = async (docId: string) => {
        if (!currentProject) return;
        try {
            const updatedDocs = await projectService.deleteProjectDocument(currentProject.id, docId);
            setGeneratedDocuments(updatedDocs);
            addNotification("Document deleted.", "success");
        } catch (error: any) {
            addNotification(`Error: ${error.message}`, 'error');
        }
    };
    
    return (
        <ul className="space-y-2 p-2">
            {generatedDocuments.map(doc => (
                <li key={doc._id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md border border-slate-700">
                    <div>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.name} className="text-sm font-medium text-sky-300 hover:underline">{doc.name}</a>
                        <p className="text-xs text-slate-400">{doc.type} - {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(doc._id)} className="text-red-400 hover:text-red-300">&times;</button>
                </li>
            ))}
        </ul>
    );
};

const RendersTab: React.FC = () => {
    const { currentProject, generatedRenders, setGeneratedRenders } = useAppStore();
    const { addNotification } = useNotificationStore();

    const handleDelete = async (renderId: string) => {
        if (!currentProject) return;
        try {
            const updatedRenders = await projectService.deleteProjectRender(currentProject.id, renderId);
            setGeneratedRenders(updatedRenders);
            addNotification("Render deleted.", "success");
        } catch (error: any) {
            addNotification(`Error: ${error.message}`, 'error');
        }
    };

    return (
        <div className="p-2 grid grid-cols-2 gap-2">
            {generatedRenders.map(render => (
                <div key={render._id} className="group relative bg-slate-900/50 rounded-md border border-slate-700">
                    <img src={render.url} alt={render.prompt || 'render'} className="w-full h-auto object-cover rounded-t-md" />
                    <button onClick={() => handleDelete(render._id)} className="absolute top-1 right-1 bg-red-600/50 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100">&times;</button>
                </div>
            ))}
        </div>
    );
};

const HolocronTab: React.FC = () => {
    const { currentProject, loadProject } = useAppStore(state => ({
        currentProject: state.currentProject,
        loadProject: state.loadProject,
    }));
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleGenerate = async () => {
        if (!currentProject) return;
        setIsLoading(true);
        try {
            const { project: updatedProject } = await projectService.generateHolocronApi(currentProject.id);
            await loadProject(updatedProject.id); // Reload to get the new holocron link
            addNotification("Holocron generated successfully!", "success");
        } catch (err: any) {
            addNotification(`Failed to generate Holocron: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const holocronLink = currentProject?.holocron?.shareableLink ? `${window.location.origin}/holocron/${currentProject.holocron.shareableLink}` : null;

    return (
        <div className="p-4 text-center">
            <h4 className="text-lg font-bold text-sky-300">Aura Holocron</h4>
            <p className="text-sm text-slate-300 my-3">Generate a stunning, interactive 3D web presentation of your project to share with clients and stakeholders.</p>
            <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800">
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : '✨'}
                {isLoading ? 'Generating...' : (holocronLink ? 'Regenerate Holocron' : 'Generate Holocron')}
            </button>
            {holocronLink && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                    <p className="text-sm text-slate-300">Your Holocron is live:</p>
                    <div className="flex items-center gap-2 mt-2">
                        <input type="text" readOnly value={holocronLink} className="w-full p-1 text-xs bg-slate-700 rounded-md border border-slate-600" />
                        <button onClick={() => navigator.clipboard.writeText(holocronLink).then(() => addNotification("Link copied!", "success"))} className="text-xs px-2 py-1 bg-slate-600 rounded-md">Copy</button>
                        <a href={holocronLink} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-sky-600 rounded-md">Open</a>
                    </div>
                </div>
            )}
        </div>
    )
};

const SingularityTab: React.FC = () => {
    const { runSingularityEngine, isSingularityRunning, singularityProgress } = useAppStore();
    const [report, setReport] = useState<SingularityReport | null>(null);

    const handleRunEngine = async () => {
        setReport(null);
        await runSingularityEngine();
        setReport({
            summary: "Singularity Engine has completed its run. All assets have been generated and saved to their respective tabs.",
            generatedAssets: [],
        });
    };

    const progressSteps = [
        "Generating GFC Drawings...",
        "Creating Cinematic Tour...",
        "Rendering Marketing Visuals...",
        "Composing Architect's Folio...",
        "Finalizing Project Bundle..."
    ];
    
    return (
        <div className="p-4 text-center">
            <h4 className="text-lg font-bold text-amber-300">Aura Singularity Engine</h4>
            <p className="text-sm text-slate-300 my-3">With a single command, orchestrate the entire architectural process. The AI will generate all necessary documents, visuals, and presentations for this project.</p>
            <button 
                onClick={handleRunEngine}
                disabled={isSingularityRunning}
                className="w-full mt-2 px-4 py-3 text-primary-foreground font-bold rounded-lg disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-600 hover:to-red-700 shadow-lg shadow-amber-500/20"
            >
                {isSingularityRunning ? <LoadingSpinner size="h-5 w-5 mr-2"/> : '🚀'}
                {isSingularityRunning ? 'Orchestrating...' : 'Activate Singularity Engine (500 Cr)'}
            </button>
            {isSingularityRunning && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg text-left">
                    <p className="font-semibold text-slate-200 mb-2">Progress:</p>
                    <ul className="space-y-1">
                        {progressSteps.map((step, index) => {
                            const currentProgressIndex = progressSteps.indexOf(singularityProgress || '');
                            const isDone = index < currentProgressIndex;
                            const isRunning = index === currentProgressIndex;
                             return (
                                <li key={step} className={`flex items-center gap-2 text-sm transition-all ${isDone ? 'text-green-300' : 'text-slate-400'}`}>
                                    {isDone ? '✅' : (isRunning ? <LoadingSpinner size="h-4 w-4" /> : '⏳')}
                                    <span className={isRunning ? 'font-bold text-white' : ''}>{step}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
            {report && !isSingularityRunning && (
                 <div className="mt-4 p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
                    <p className="font-bold">Execution Complete</p>
                    <p className="text-sm">{report.summary}</p>
                 </div>
            )}
        </div>
    )
};


export const ProjectHubPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<HubTab>('details');

    return (
        <div className="h-full flex flex-col">
            <div className="flex border-b border-slate-700 flex-shrink-0">
                <TabButton isActive={activeTab === 'details'} onClick={() => setActiveTab('details')}>Details</TabButton>
                <TabButton isActive={activeTab === 'versions'} onClick={() => setActiveTab('versions')}>Versions</TabButton>
                <TabButton isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')}>Documents</TabButton>
                <TabButton isActive={activeTab === 'renders'} onClick={() => setActiveTab('renders')}>Renders</TabButton>
                <TabButton isActive={activeTab === 'holocron'} onClick={() => setActiveTab('holocron')}>Holocron</TabButton>
                <TabButton isActive={activeTab === 'singularity'} onClick={() => setActiveTab('singularity')} isPremium>Singularity</TabButton>
            </div>
            <div className="flex-grow overflow-y-auto">
                {activeTab === 'details' && <ProjectDetailsTab />}
                {activeTab === 'versions' && <VersionsTab />}
                {activeTab === 'documents' && <DocumentsTab />}
                {activeTab === 'renders' && <RendersTab />}
                {activeTab === 'holocron' && <HolocronTab />}
                {activeTab === 'singularity' && <SingularityTab />}
            </div>
        </div>
    );
};