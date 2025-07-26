// src/components/AuraOS/ProjectDetailsTab.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { ProjectData } from '../../types';

export const ProjectDetailsTab: React.FC = () => {
    const { currentProject, loadProject } = useAppStore(state => ({
        currentProject: state.currentProject,
        loadProject: state.loadProject,
    }));
    
    const [details, setDetails] = useState({
        location: '',
        clientProfile: '',
        siteContext: '',
        specificRequirements: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (currentProject) {
            setDetails({
                location: currentProject.location || '',
                clientProfile: currentProject.clientProfile || '',
                siteContext: currentProject.siteContext || '',
                specificRequirements: currentProject.specificRequirements || '',
            });
        }
    }, [currentProject]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!currentProject) return;
        setIsLoading(true);
        try {
            const projectData: ProjectData = {
                name: currentProject.name,
                projectType: currentProject.projectType,
                levels: currentProject.levels,
                zones: currentProject.zones,
                infrastructure: currentProject.infrastructure,
                planNorthDirection: currentProject.planNorthDirection,
                propertyLines: currentProject.propertyLines,
                terrainMesh: currentProject.terrainMesh,
                stagingSettings: currentProject.stagingSettings,
                savedCameraViews: currentProject.savedCameraViews,
                location: details.location,
                clientProfile: details.clientProfile,
                siteContext: details.siteContext,
                specificRequirements: details.specificRequirements,
                holocron: currentProject.holocron
            };
            
            const result = await projectService.saveProject({
                projectContent: projectData,
                projectName: currentProject.name,
                commitMessage: 'Updated project details',
                existingProjectId: currentProject.id,
            });
            addNotification('Project details updated successfully.', 'success');
            await loadProject(result.project.id); // Reload to ensure all state is fresh
        } catch (error: any) {
            addNotification(`Failed to save details: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!currentProject) {
        return <p className="p-4 text-slate-400">No project loaded.</p>
    }

    return (
        <div className="p-4 space-y-6">
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                 <h4 className="font-bold text-sky-300">Project Context</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Providing these details allows the AI to generate more personalized, accurate, and context-aware designs and analyses.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Project Location</label>
                        <input
                            type="text"
                            name="location"
                            value={details.location}
                            onChange={handleChange}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md"
                            placeholder="e.g., Goa, India"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Client Profile</label>
                        <textarea
                            name="clientProfile"
                            value={details.clientProfile}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md"
                            placeholder="Describe the client, their family, lifestyle, and preferences."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Site & Climate Context</label>
                        <textarea
                            name="siteContext"
                            value={details.siteContext}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md"
                            placeholder="Describe the site's surroundings, climate, views, and noise sources."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Specific Requirements</label>
                        <textarea
                            name="specificRequirements"
                            value={details.specificRequirements}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md"
                            placeholder="List any non-negotiable requirements, e.g., 'Must have a separate study room'."
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold text-white disabled:opacity-50 flex items-center"
                >
                    {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
                    Save Details
                </button>
            </div>
        </div>
    );
};