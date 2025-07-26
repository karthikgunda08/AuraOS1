// src/components/dashboard/DashboardComponents.tsx
import React, { useState, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, ProjectSummary, UserAnalyticsData, ActivityLog } from '../../types';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../LoadingSpinner';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
const PublishModal = React.lazy(() => import('../marketplace/PublishModal'));
const TokenizeModal = React.lazy(() => import('./TokenizeModal'));
const DashboardChecklist = React.lazy(() => import('../onboarding/DashboardChecklist'));

const MotionDiv = motion.div as any;

// --- UserHeader ---
export const UserHeader: React.FC<{ currentUser: User }> = ({ currentUser }) => (
    <MotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h1 className="text-3xl md:text-4xl font-bold text-white">Mission Control</h1>
        <p className="text-lg text-slate-300 mt-1 font-body">Welcome, Founder {currentUser.name || currentUser.email.split('@')[0]}.</p>
    </MotionDiv>
);


// --- QuickStartCard ---
interface QuickStartCardProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    isPremium?: boolean;
}
const QuickStartCard: React.FC<QuickStartCardProps> = ({ title, icon, onClick, isPremium = false }) => (
    <button
        onClick={onClick}
        className={`relative w-full text-center p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors border border-transparent ${isPremium ? 'hover:border-amber-500' : 'hover:border-sky-500'}`}
    >
        {isPremium && <div className="absolute top-1 right-1 text-[10px] text-amber-300">✦</div>}
        <div className="text-3xl mb-1">{icon}</div>
        <h3 className="font-semibold text-xs text-slate-100">{title}</h3>
    </button>
);


// --- MissionControlPanel (Replaces CreditManager, Sidebar, QuickStart) ---
export const MissionControlPanel: React.FC<{ currentUser: User; userAnalytics: UserAnalyticsData | null }> = ({ currentUser, userAnalytics }) => {
    const { setView, setBuyCreditsModalOpen, setNewProjectModalOpen, startInteractiveTutorial, onboardingChecklist } = useAppStore();
    const isChecklistVisible = onboardingChecklist && Object.values(onboardingChecklist).some(v => !v);

    return (
        <div className="glass-panel p-6 space-y-6">
            {/* NEW: Onboarding Checklist */}
            {isChecklistVisible && (
                <Suspense fallback={null}>
                    <DashboardChecklist />
                </Suspense>
            )}

            {/* Credit Status */}
            <div>
                 <h3 className="font-semibold text-lg text-slate-200 mb-4">Resource Allocation</h3>
                {currentUser.role === 'owner' ? (
                     <div className="bg-gradient-to-r from-amber-500/80 to-orange-500/80 p-4 rounded-lg text-white shadow-lg text-center border-2 border-amber-400">
                        <p className="font-bold text-base">Owner Access</p>
                        <p className="text-3xl font-extrabold">👑</p>
                        <p className="text-xs opacity-80">Unlimited Credits</p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-sky-600 to-blue-700 p-4 rounded-lg text-white shadow-lg">
                        <p className="font-bold text-base">AI Credits</p>
                        <p className="text-4xl font-extrabold my-1">{currentUser.credits}</p>
                        <button onClick={() => setBuyCreditsModalOpen(true)} className="w-full mt-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors">
                            Manage Credits
                        </button>
                    </div>
                )}
            </div>
            
            {/* Quick Actions */}
             <div>
                <h3 className="font-semibold text-lg text-slate-200 mb-4">Initiate Protocol</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <QuickStartCard title="New Project" icon={'🏢'} onClick={() => setNewProjectModalOpen(true)} />
                    <QuickStartCard title="Interactive Tutorial" icon={'🎓'} onClick={startInteractiveTutorial} />
                    <QuickStartCard title="Brahma-Astra" icon={'✨'} onClick={() => setView('brahmaAstra')} isPremium />
                    <QuickStartCard title="Marketplace" icon={'🛒'} onClick={() => setView('marketplace')} isPremium />
                    <QuickStartCard title="Wallet" icon={'💰'} onClick={() => setView('wallet')} />
                    <QuickStartCard title="Astra Network" icon={'🔗'} onClick={() => setView('astraSupplyChain')} />
                </div>
            </div>

            {/* Activity Feed */}
            <div>
                <h3 className="font-semibold text-lg text-slate-200 mb-4">Activity Log</h3>
                {!userAnalytics ? <div className="flex justify-center"><LoadingSpinner /></div> : (
                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {userAnalytics.activityLog.length > 0 ? userAnalytics.activityLog.map(log => (
                             <li key={log.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-sm">🔄</div>
                                <div>
                                    <p className="text-sm text-slate-200">{log.action}: <span className="font-semibold">{log.details}</span></p>
                                    <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        )) : <p className="text-center text-slate-500 text-sm py-4">No recent activity.</p>}
                    </ul>
                )}
            </div>
        </div>
    );
};


// --- ProjectList & ProjectCard ---
const ProjectCard: React.FC<{ project: ProjectSummary; }> = ({ project }) => {
    const { loadProject, refreshCurrentUser, set, setTokenizeModalOpen, deleteProject } = useAppStore();
    const { addNotification } = useNotificationStore();

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isTogglingPublic, setIsTogglingPublic] = useState(false);

    const handlePublished = useCallback(() => {
        projectService.loadUserProjects().then(newProjects => {
            set((state) => ({...state, projects: newProjects}));
        });
        refreshCurrentUser();
    }, [set, refreshCurrentUser]);
    
    const handleTokenizeClick = () => {
        setTokenizeModalOpen(true, project);
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`)) {
            deleteProject(project.id);
        }
    };
    
    const handleTogglePublic = async () => {
        setIsTogglingPublic(true);
        try {
            const updatedProject = await projectService.toggleProjectPublicStatus(project.id);
             set(state => ({
                projects: state.projects.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p)
            }));
            addNotification(`Project is now ${updatedProject.isPublic ? 'public' : 'private'}.`, 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            setIsTogglingPublic(false);
        }
    }

    return (
        <>
            <div className="glass-panel flex flex-col overflow-hidden">
                <div className="h-36 bg-slate-700 cursor-pointer relative group" onClick={() => loadProject(project.id)}>
                    {project.previewImageUrl ? (
                        <img src={project.previewImageUrl} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                         <div className={`w-full h-full bg-gradient-to-br ${project.projectType === 'masterPlan' ? 'from-indigo-500 to-purple-600' : 'from-sky-500 to-cyan-600'} flex items-center justify-center text-5xl opacity-50`}>
                            {project.projectType === 'masterPlan' ? '🗺️' : '🏢'}
                         </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="font-bold text-lg text-white">Open Editor</p>
                    </div>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-semibold text-slate-100 truncate" title={project.name}>{project.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-body">
                        Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="p-3 border-t border-slate-700/50 flex flex-wrap gap-2 items-center">
                    <button
                        onClick={handleTogglePublic}
                        disabled={isTogglingPublic}
                        className={`flex-grow text-xs px-2 py-1 rounded-md transition-colors flex items-center justify-center gap-1 ${project.isPublic ? 'bg-green-800/50 text-green-300 hover:bg-green-700' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {isTogglingPublic ? <LoadingSpinner size="h-3 w-3" /> : (project.isPublic ? '🌐 Public' : '🔒 Private')}
                    </button>
                    <button
                        onClick={() => setIsPublishModalOpen(true)}
                        className="text-xs px-2 py-1 bg-amber-600/50 text-amber-200 hover:bg-amber-600 rounded-md transition-colors"
                        title="Publish to Marketplace"
                    >
                        Publish
                    </button>
                     <button
                        onClick={handleTokenizeClick}
                        className="text-xs px-2 py-1 bg-purple-600/50 text-purple-200 hover:bg-purple-600 rounded-md transition-colors"
                        title="Tokenize for Real Estate Exchange"
                    >
                        Tokenize
                    </button>
                     <button
                        onClick={handleDelete}
                        className="text-xs px-2 py-1 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                        title="Delete Project"
                    >
                        Delete
                    </button>
                </div>
            </div>
            {isPublishModalOpen && (
                <Suspense fallback={<div />}>
                    <PublishModal
                        project={project}
                        onClose={() => setIsPublishModalOpen(false)}
                        onPublished={handlePublished}
                    />
                </Suspense>
            )}
            {useAppStore.getState().projectToTokenize?.id === project.id && (
                 <Suspense fallback={<div />}>
                    <TokenizeModal 
                        project={project}
                        onClose={() => setTokenizeModalOpen(false)}
                        onTokenized={handlePublished}
                    />
                 </Suspense>
            )}
        </>
    );
};

export const ProjectList: React.FC<{ projects: ProjectSummary[]; }> = ({ projects }) => (
    <section>
        <h2 className="text-2xl font-bold text-slate-200 mb-4">Project Repository</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.length > 0 ? (
                projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                    />
                ))
            ) : (
                 <div className="md:col-span-2 text-center p-8 bg-slate-800/30 rounded-lg border border-dashed border-slate-600">
                    <p className="text-slate-400">You haven't initiated any projects yet.</p>
                    <p className="text-sm text-slate-500 mt-1">Select a protocol from Mission Control to begin.</p>
                </div>
            )}
        </div>
    </section>
);