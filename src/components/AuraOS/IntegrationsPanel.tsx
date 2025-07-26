// src/components/AuraOS/IntegrationsPanel.tsx
import React, { useState } from 'react';
import * as projectService from '../../services/projectService';
import { useAppStore } from '../../state/appStore';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../LoadingSpinner';

const mockRevitProjects = [
  { id: 'revit_proj_1', name: 'Elysian Tower', status: 'In Design' },
  { id: 'revit_proj_2', name: 'Community Center', status: 'Construction Docs' },
  { id: 'revit_proj_3', name: 'Suburban Residence', status: 'Concept' },
];

export const IntegrationsPanel: React.FC = () => {
    const { importProjectData, togglePanelVisibility } = useAppStore(state => ({
        importProjectData: state.importProjectData,
        togglePanelVisibility: state.togglePanelVisibility,
    }));
    const { addNotification } = useNotificationStore();
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const handleImport = async (projectId: string, projectName: string) => {
        setIsLoading(projectId);
        addNotification(`Importing "${projectName}"... This may take a moment.`, 'info');
        try {
            const projectData = await projectService.importRevitProject(projectId);
            importProjectData(projectData, projectData.name);
            togglePanelVisibility('integrationsPanel');
        } catch (error: any) {
            addNotification(`Import failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 text-white">
            <h3 className="text-lg font-bold text-sky-300 mb-4">Integrations</h3>
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Autodesk_Revit_2021_Icon.svg/1200px-Autodesk_Revit_2021_Icon.svg.png" alt="Revit Logo" className="w-8 h-8"/>
                    <div>
                        <h4 className="font-semibold text-slate-100">Autodesk Revit</h4>
                        <p className="text-xs text-green-400">Connected</p>
                    </div>
                </div>

                <p className="text-sm text-slate-300 mb-3">Browse your projects from Autodesk Construction Cloud and import them directly into AuraOS.</p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockRevitProjects.map(proj => (
                        <div key={proj.id} className="p-2 bg-slate-700/50 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-sm text-slate-200">{proj.name}</p>
                                <p className="text-xs text-slate-400">{proj.status}</p>
                            </div>
                            <button
                                onClick={() => handleImport(proj.id, proj.name)}
                                disabled={!!isLoading}
                                className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-500 rounded-md font-semibold"
                            >
                                {isLoading === proj.id ? <LoadingSpinner size="h-4 w-4" /> : 'Import'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
