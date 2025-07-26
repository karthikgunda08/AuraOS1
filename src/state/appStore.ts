// src/state/appStore.ts
import { create } from 'zustand';
import type { SetStateAction } from 'react';
import { 
    AppStore, AppState, User, Project, Level, Zone, InfrastructureLine, StagingSettings, 
    CameraView, SelectedObject, SunPosition, ConstructionPhase, AiFixResponse, CinematicTour, 
    PanelState, AICompanionLogEntry, PhoenixEngineTab, VastuGridAnalysis, AdvancedStructuralReport, 
    PropertyLine, TerrainMesh, Layer, AppView, UndoableState, LiveCursor, LiveSelection, 
    ChatMessage, Workspace, GeneratedDocument, GeneratedRender, PanelId, ProjectData, 
    BillOfQuantitiesReport, SustainabilityReport, BrahmaAstraReport, BrahmaAstraMission, 
    PlacedModel, ProjectSummary, CreditPack, UserAnalyticsData, LokaSimulatorReport, NavagrahaReport,
    AkashaReport, SamsaraReport, ShilpaSutraReport, Holocron, DigitalTwinData, SingularityReport,
    Collaborator, PrithviAstraReport, AgniAstraReport, NexusReport, ProactiveSuggestion,
    SanjeevaniReport, AtmanSignatureResponse, ParamAstraResponse, SvaDharmaResponse, StrategicInsight, SuggestedItem, OnboardingChecklist, TimeOfDay, DigitalTwinDataOverlay, SketcherTool, Placement, EditorMode
} from '../types';
import * as authService from '../services/authService';
import * as projectService from '../services/projectService';
import * as geminiService from '../services/geminiService';
import * as analyticsService from '../services/analyticsService';
import * as socketService from '../services/socketService';
import * as adminService from '../services/adminService';
import { useNotificationStore } from './notificationStore';
import { getColorForUserId } from '../utils/colorUtils';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;
const defaultLayerId = 'layer_default';

const createDefaultLayers = (): Layer[] => [
    { id: defaultLayerId, name: 'Default', isVisible: true, isLocked: false },
];

const createDefaultLevel = (name = 'Ground Floor', elevation = 0): Level => ({
    id: generateId('level'), name, elevation, walls: [], rooms: [], placements: [], placedModels: [],
    dimensionLines: [], comments: [], suggestedFurniture: [], plumbingLayout: [], electricalLayout: null, 
    hvacLayout: null, 
    drawingSet: null,
    layers: createDefaultLayers(), activeLayerId: defaultLayerId,
});

const getUndoableState = (state: AppStore): UndoableState => ({
    levels: JSON.parse(JSON.stringify(state.levels)),
    activeLevelIndex: state.activeLevelIndex,
    zones: JSON.parse(JSON.stringify(state.zones)),
    infrastructure: JSON.parse(JSON.stringify(state.infrastructure)),
    planNorthDirection: state.planNorthDirection,
    propertyLines: JSON.parse(JSON.stringify(state.propertyLines)),
    terrainMesh: state.terrainMesh ? JSON.parse(JSON.stringify(state.terrainMesh)) : null,
    stagingSettings: JSON.parse(JSON.stringify(state.stagingSettings)),
    savedCameraViews: JSON.parse(JSON.stringify(state.savedCameraViews)),
});

const initialAppState: AppState = {
  currentUser: null, isLoadingAuth: true, authError: null, authModal: null,
  projects: [], currentProject: null, isProjectLoading: false, projectError: null, view: 'landing',
  isProfilePageOpen: false, isHelpModalOpen: false, isFeedbackModalOpen: false, isSupportModalOpen: false,
  isBuyCreditsModalOpen: false, isExportModalOpen: false, isTokenizeModalOpen: false, isNewProjectModalOpen: false,
  projectToTokenize: null, selectedCreditPack: null, isCommandPaletteOpen: false,
  globalLoadingMessage: "Initializing App...", saveStatus: 'idle', hasUnsavedChanges: false,
  panelStates: {
      phoenixEngine: { id: 'phoenixEngine', x: window.innerWidth - 420, y: 80, width: 400, height: window.innerHeight - 150, zIndex: 100, isVisible: false },
      propertiesPanel: { id: 'propertiesPanel', x: 20, y: 80, width: 320, height: 500, zIndex: 100, isVisible: false },
      projectHub: { id: 'projectHub', x: window.innerWidth / 2 - 300, y: 100, width: 600, height: 500, zIndex: 100, isVisible: false },
      layersPanel: { id: 'layersPanel', x: 20, y: 600, width: 320, height: 300, zIndex: 100, isVisible: false },
      chatPanel: { id: 'chatPanel', x: window.innerWidth - 840, y: 80, width: 400, height: 500, zIndex: 100, isVisible: false },
      analyticsPanel: { id: 'analyticsPanel', x: window.innerWidth / 2 - 400, y: 120, width: 800, height: 600, zIndex: 100, isVisible: false },
      digitalTwinPanel: { id: 'digitalTwinPanel', x: window.innerWidth - 840, y: 80, width: 400, height: 350, zIndex: 100, isVisible: false },
      integrationsPanel: { id: 'integrationsPanel', x: 40, y: 100, width: 400, height: 400, zIndex: 100, isVisible: false },
      mayaLayer: { id: 'mayaLayer', x: window.innerWidth / 2 - 250, y: 150, width: 500, height: 400, zIndex: 100, isVisible: false },
  },
  workspaces: [], proactiveSuggestions: [], isLaunchSequenceActive: true,
  // Onboarding
  isWelcomeModalOpen: false,
  isOnboardingActive: false,
  onboardingStep: 0,
  onboardingChecklist: null,
  seenSpotlights: [],
  undoStack: [], redoStack: [], canUndo: false, canRedo: false,
  levels: [createDefaultLevel()], activeLevelIndex: 0, zones: [], infrastructure: [], planNorthDirection: 'N',
  propertyLines: [], terrainMesh: null, stagingSettings: { timeOfDay: 'midday', enableBloom: true }, savedCameraViews: [],
  selectedObject: null, showElectricalLayer: false, showHvacLayer: false, constructionSequence: null,
  activeTimelineWeek: null, isWalkthroughActive: false, sunPosition: { azimuth: 135, altitude: 45 },
  aiFixPreview: null, cinematicTourData: null, isCinematicTourPlaying: false, activeTool: 'masterArchitect',
  activeSketcherTool: 'select',
  editorMode: 'concept',
  focusedCommentId: null, contextMenu: null, isBrahmandaAstraActive: false, generativeFeedbackActive: false,
  advancedStructuralReport: null, vastuGridAnalysis: null, showVastuGrid: false, companionLog: [],
  isCompanionActive: false, companionState: 'idle', companionTranscript: null, chatHistory: [],
  generatedDocuments: [], generatedRenders: [], billOfQuantities: null, sustainabilityReport: null,
  brahmaAstraReport: null, isBrahmaAstraRunning: false, currentPlacingModelKey: null,
  projectAnalyticsData: null, userAnalytics: null, lokaSimulatorReport: null, navagrahaReport: null,
  akashaReport: null, samsaraReport: null, shilpaSutraReport: null, holocron: null,
  isHolocronAuthoringMode: false, prithviAstraReport: null, agniAstraReport: null, nexusReport: null,
  atmanSignature: null, atmanSignatureReport: null, paramAstraReport: null, svaDharmaReport: null,
  sanjeevaniReport: null, strategicInsights: null,
  isDigitalTwinModeActive: false, digitalTwinData: null, activeDataOverlays: { energy: false, stress: false, occupancy: false },
  isSingularityRunning: false, singularityProgress: null,
  collaborators: [], liveCursors: {}, liveSelections: {},
};

const MAX_UNDO_STEPS = 50;


export const useAppStore = create<AppStore>((set, get) => ({
    ...initialAppState,
    set: (updater) => set(typeof updater === 'function' ? updater : () => updater),
    
    // --- AUTH & INITIALIZATION ---
    initApp: async () => {
        const token = authService.getToken();
        if (token) {
            try {
                const user = await authService.getCurrentUserProfile();
                set({ currentUser: user, isLoadingAuth: false });
                analyticsService.setUser(user.id, { email: user.email, name: user.name });
                socketService.connectSocket(token);
                get().setupSocketListeners();
                get().refreshCurrentUser(); // Fetches projects etc.
            } catch (error) {
                authService.clearToken();
                set({ currentUser: null, isLoadingAuth: false });
            }
        } else {
            set({ isLoadingAuth: false });
        }
        setTimeout(() => set({ globalLoadingMessage: null }), 500);
    },

    login: async (email, passwordPlain) => {
        set({ globalLoadingMessage: 'Logging in...', authError: null });
        try {
            const { token, user } = await authService.loginUser(email, passwordPlain);
            authService.storeToken(token);
            set({ currentUser: user, authModal: null });
            analyticsService.setUser(user.id, { email: user.email, name: user.name });
            analyticsService.trackEvent('User Logged In');
            socketService.connectSocket(token);
            get().setupSocketListeners();
            await get().refreshCurrentUser();
            set({ view: 'userDashboard' });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    register: async (email, passwordPlain, phoneNumber, whatsappOptIn) => {
        set({ globalLoadingMessage: 'Creating account...', authError: null });
        try {
            const { token, user } = await authService.registerUser(email, passwordPlain, phoneNumber, whatsappOptIn);
            authService.storeToken(token);
            set({ currentUser: user, authModal: null });
            analyticsService.setUser(user.id, { email: user.email, name: user.name });
            analyticsService.trackEvent('User Registered');
            socketService.connectSocket(token);
            get().setupSocketListeners();
            await get().refreshCurrentUser();
            set({ 
                view: 'userDashboard', 
                isWelcomeModalOpen: true,
                onboardingChecklist: {
                    profileCompleted: false,
                    projectCreated: false,
                    aiToolUsed: false,
                    versionSaved: false,
                    featureSpotlightViewed: false,
                }
            });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    
    forgotPassword: async (email: string) => {
        set({ globalLoadingMessage: 'Sending reset link...', authError: null });
        try {
            const { message } = await authService.forgotPassword(email);
            get().addNotification(message, 'success');
            set({ authModal: 'login' });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    logout: () => {
        authService.clearToken();
        socketService.disconnectSocket();
        set({ ...initialAppState, isLoadingAuth: false, isLaunchSequenceActive: false, globalLoadingMessage: null, view: 'landing' });
        analyticsService.trackEvent('User Logged Out');
    },

    refreshCurrentUser: async () => {
        const { addNotification } = get();
        try {
            const [user, projects, workspaces] = await Promise.all([
                authService.getCurrentUserProfile(),
                projectService.loadUserProjects(),
                authService.getUserWorkspaces()
            ]);
            set({ currentUser: user, projects, workspaces });
        } catch (error: any) {
            addNotification(`Session expired: ${error.message}`, 'error');
            get().logout();
        }
    },

    fetchUserAnalytics: async () => {
        try {
            const data = await authService.getUserAnalytics();
            set({ userAnalytics: data });
        } catch (error: any) {
            get().addNotification(`Could not load user analytics: ${error.message}`, 'error');
        }
    },

    // --- PROJECT LIFECYCLE ---
    newProject: (type) => {
        get().pushToUndoStack();
        const resetState = {
            currentProject: null,
            levels: [createDefaultLevel()],
            activeLevelIndex: 0,
            zones: [], infrastructure: [], planNorthDirection: 'N',
            propertyLines: [], terrainMesh: null,
            stagingSettings: { timeOfDay: 'midday' as TimeOfDay, enableBloom: true },
            savedCameraViews: [],
            hasUnsavedChanges: true,
            // Reset reports
            billOfQuantities: null, sustainabilityReport: null, advancedStructuralReport: null,
            vastuGridAnalysis: null, constructionSequence: null, cinematicTourData: null
        };
        set(resetState);
        set({ view: type === 'building' ? 'auraOS' : 'worldBuilder' });
        get().addNotification('New project created. Remember to save!', 'info');
        get().completeOnboardingChecklistItem('projectCreated');
    },

    loadProject: async (projectId) => {
        set({ isProjectLoading: true, globalLoadingMessage: 'Loading project...' });
        try {
            const project = await projectService.getProjectDetails(projectId);
            
            const validTimeOfDay = (time?: string): TimeOfDay => {
                if (time === 'sunset' || time === 'night') {
                    return time;
                }
                return 'midday';
            };

            const undoState: UndoableState = {
                levels: project.levels,
                activeLevelIndex: 0,
                zones: project.zones || [],
                infrastructure: project.infrastructure || [],
                planNorthDirection: project.planNorthDirection || 'N',
                propertyLines: project.propertyLines || [],
                terrainMesh: project.terrainMesh || null,
                stagingSettings: {
                    timeOfDay: validTimeOfDay(project.stagingSettings?.timeOfDay),
                    enableBloom: project.stagingSettings?.enableBloom ?? true,
                },
                savedCameraViews: project.savedCameraViews || [],
            };
            set({ 
                currentProject: project, 
                ...undoState, 
                view: project.projectType === 'building' ? 'auraOS' : 'worldBuilder',
                hasUnsavedChanges: false,
                undoStack: [], redoStack: [], canUndo: false, canRedo: false,
                // Load reports
                billOfQuantities: project.billOfQuantities,
                sustainabilityReport: project.sustainabilityReport,
                // etc for other reports as they are added to project model
                collaborators: project.collaborators || [],
                chatHistory: project.chatHistory || [],
                generatedDocuments: project.generatedDocuments || [],
                generatedRenders: project.generatedRenders || [],
                cinematicTourData: project.cinematicTour || null,
            });

            // Connect to project room via WebSocket
            const token = authService.getToken();
            if (token) {
                socketService.connectSocket(token);
                get().setupSocketListeners(); // Ensure listeners are ready
                socketService.joinProjectRoom(projectId);
            }

        } catch (error: any) {
            set({ projectError: error.message });
            get().addNotification(`Error loading project: ${error.message}`, 'error');
        } finally {
            set({ isProjectLoading: false, globalLoadingMessage: null });
        }
    },
    
    importProjectData: (projectData, name) => {
        get().pushToUndoStack();
        const { levels, zones, infrastructure, planNorthDirection, propertyLines, terrainMesh } = projectData;
        const resetState = {
            currentProject: null,
            levels: levels || [createDefaultLevel()],
            activeLevelIndex: 0,
            zones: zones || [],
            infrastructure: infrastructure || [],
            planNorthDirection: planNorthDirection || 'N',
            propertyLines: propertyLines || [],
            terrainMesh: terrainMesh || null,
            hasUnsavedChanges: true
        };
        set(resetState);
        set({ view: projectData.projectType === 'building' ? 'auraOS' : 'worldBuilder' });
        get().addNotification(`Imported "${name}". Please review and save.`, 'success');
    },

    autoSaveProject: async () => {
        if (!get().hasUnsavedChanges || !get().currentProject) return;
        set({ saveStatus: 'saving' });
        try {
            const { currentProject, levels, zones, infrastructure, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron } = get();
            const projectData = { projectType: currentProject?.projectType || 'building', name: currentProject?.name || 'Untitled', levels, zones, infrastructure, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron };
            
            await projectService.saveProject({
                projectContent: projectData,
                projectName: currentProject?.name || 'Untitled',
                commitMessage: 'Auto-saved changes',
                existingProjectId: currentProject?.id,
                commitType: 'auto'
            });
            set({ saveStatus: 'saved', hasUnsavedChanges: false });
        } catch (error: any) {
            set({ saveStatus: 'error' });
            get().addNotification(`Auto-save failed: ${error.message}`, 'error');
        }
    },

    deleteProject: async (projectId) => {
        set({ globalLoadingMessage: 'Deleting project...' });
        try {
            await projectService.deleteProject(projectId);
            set(state => ({
                projects: state.projects.filter(p => p.id !== projectId),
                currentProject: state.currentProject?.id === projectId ? null : state.currentProject
            }));
            get().addNotification('Project deleted successfully.', 'success');
        } catch (error: any) {
            get().addNotification(`Failed to delete project: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    
    // --- UNDO/REDO ---
    pushToUndoStack: () => {
        const currentState = get();
        const snapshot = getUndoableState(currentState);
        
        const undoStack = [...currentState.undoStack, snapshot];
        if (undoStack.length > MAX_UNDO_STEPS) {
            undoStack.shift(); // Remove the oldest state
        }

        set({
            undoStack,
            redoStack: [], // Clear redo stack on new action
            canUndo: true,
            canRedo: false,
            hasUnsavedChanges: true,
        });
    },

    undo: () => {
        const { undoStack, redoStack } = get();
        if (undoStack.length === 0) return;

        const currentStateSnapshot = getUndoableState(get());
        const lastState = undoStack[undoStack.length - 1];

        const newUndoStack = undoStack.slice(0, undoStack.length - 1);
        
        set({
            ...lastState,
            undoStack: newUndoStack,
            redoStack: [...redoStack, currentStateSnapshot],
            canUndo: newUndoStack.length > 0,
            canRedo: true,
            hasUnsavedChanges: true,
        });
    },

    redo: () => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return;

        const currentStateSnapshot = getUndoableState(get());
        const nextState = redoStack[redoStack.length - 1];
        
        const newRedoStack = redoStack.slice(0, redoStack.length - 1);

        set({
            ...nextState,
            undoStack: [...undoStack, currentStateSnapshot],
            redoStack: newRedoStack,
            canUndo: true,
            canRedo: newRedoStack.length > 0,
            hasUnsavedChanges: true,
        });
    },

    // --- SOCKETS & COLLABORATION ---
    setupSocketListeners: () => {
        const socket = socketService.getSocket();
        if (!socket) return;
        
        // Remove old listeners to prevent duplicates
        socket.off('geometry_update');
        socket.off('chat_message');
        socket.off('load_chat_history');
        socket.off('cursor_update');
        socket.off('selection_update');
        socket.off('iot_data_update');
        socket.off('error_message');

        socketService.onGeometryUpdate((data) => {
            get().set({ levels: data.levels, hasUnsavedChanges: false }); // Directly apply update
            if (data.chatHistory) get().set({ chatHistory: data.chatHistory });
            get().addNotification('Project updated in real-time.', 'info');
        });

        socketService.onChatMessage((message) => {
            if (message.isAI && message.userName === 'Aura AI') {
                get().setCompanionState('speaking');
                // Could add TTS logic here in the future
                setTimeout(() => {
                    if (get().companionState === 'speaking') {
                        get().setCompanionState('idle');
                        get().setCompanionTranscript(null);
                    }
                }, 3000);
            }
            get().addChatMessage(message);
        });
        
        socketService.onLoadChatHistory((messages) => get().setChatHistory(messages));
        
        socketService.onCursorUpdate((data) => {
            get().setLiveCursors(cursors => ({
                ...cursors,
                [data.userId]: {
                    ...data.position,
                    userName: data.userName,
                    color: getColorForUserId(data.userId)
                }
            }));
        });

        socketService.onSelectionUpdate((data) => {
            get().setLiveSelections(selections => ({
                ...selections,
                [data.userId]: {
                    userId: data.userId,
                    objectId: data.selection?.id || '',
                    objectType: data.selection?.type || '',
                }
            }));
        });

        socketService.onIotDataUpdate((data) => {
            get().set(state => {
                if (!state.digitalTwinData) return {};
                const newStress = [...state.digitalTwinData.structuralStress];
                const sensorIndex = newStress.findIndex(s => s.wallId === data.wallId);
                if (sensorIndex > -1) {
                    newStress[sensorIndex] = data;
                } else {
                    newStress.push(data);
                }
                const peakStressFactor = Math.max(...newStress.map(s => s.stressFactor), 0);
                return { digitalTwinData: { ...state.digitalTwinData, structuralStress: newStress, peakStressFactor }};
            });
        });

        socketService.onError((message) => get().addNotification(message, 'error'));
    },
    
    // --- WORKSPACE ---
    applyWorkspaceLayout: (layout) => {
        set(state => {
            const newPanelStates = { ...state.panelStates };
            Object.keys(layout).forEach(panelId => {
                if (newPanelStates[panelId as PanelId]) {
                    newPanelStates[panelId as PanelId] = { ...newPanelStates[panelId as PanelId], ...layout[panelId] };
                }
            });
            return { panelStates: newPanelStates };
        });
        get().addNotification('Workspace layout applied.', 'success');
    },

    saveCurrentWorkspace: async (name) => {
        try {
            const newWorkspaces = await authService.saveUserWorkspace({ name, layout: get().panelStates });
            set({ workspaces: newWorkspaces });
            get().addNotification(`Workspace "${name}" saved.`, 'success');
        } catch (error: any) {
            get().addNotification(`Failed to save workspace: ${error.message}`, 'error');
        }
    },

    deleteWorkspace: async (workspaceId) => {
        try {
            const newWorkspaces = await authService.deleteUserWorkspace(workspaceId);
            set({ workspaces: newWorkspaces });
            get().addNotification('Workspace deleted.', 'success');
        } catch (error: any) {
            get().addNotification(`Failed to delete workspace: ${error.message}`, 'error');
        }
    },

    // --- AI & ENGINE ACTIONS ---
    runBrahmaAstra: async (mission) => {
        set({ isBrahmaAstraRunning: true, brahmaAstraReport: null });
        try {
            const report = await geminiService.runBrahmaAstraEngineApi(get().currentProject?.id || '', mission);
            set({ brahmaAstraReport: report });
            get().addNotification('Brahma-Astra mission complete!', 'success');
            await get().refreshCurrentUser();
        } catch (error: any) {
            get().addNotification(`Brahma-Astra failed: ${error.message}`, 'error');
        } finally {
            set({ isBrahmaAstraRunning: false });
        }
    },
    
    runSingularityEngine: async () => {
        const { currentProject } = get();
        if (!currentProject) {
            get().addNotification('Please save your project first.', 'error');
            return;
        }
        set({ isSingularityRunning: true, singularityProgress: 'Initializing...' });
        try {
            const projectData = { ...currentProject }; // Send full project data
            const report = await geminiService.runSingularityEngineApi(currentProject.id, projectData as ProjectData);
            set({ singularityProgress: 'Complete' });
            get().addNotification('Singularity Engine run complete!', 'success');
            await get().refreshCurrentUser(); // To reflect credit usage
            await get().loadProject(currentProject.id); // To reload generated assets
        } catch (error: any) {
            get().addNotification(`Singularity Engine failed: ${error.message}`, 'error');
        } finally {
            set({ isSingularityRunning: false, singularityProgress: null });
        }
    },
    
    initiateSingularityOnLatestProject: async () => {}, // Stub, as it's a complex flow
    exportCometPackage: async () => {
        get().addNotification('Comet Package export initiated... This feature is under development.', 'info');
    },
    
    toggleDigitalTwinMode: async () => {
        const { isDigitalTwinModeActive, currentProject, set } = get();
        const newState = !isDigitalTwinModeActive;
        set({ isDigitalTwinModeActive: newState });
        if (newState && currentProject) {
            try {
                const data = await projectService.getDigitalTwinData(currentProject.id);
                set({ digitalTwinData: data });
            } catch(error: any) {
                 get().addNotification(`Could not fetch Digital Twin data: ${error.message}`, 'error');
                 set({ isDigitalTwinModeActive: false });
            }
        }
    },

    runAiFurnishRoom: async (roomId, style, useAtmanSignature) => {
        const { currentProject, levels, planNorthDirection, propertyLines, terrainMesh, setSingleLevelProp, addNotification, refreshCurrentUser, atmanSignature } = get();
        if (!currentProject) return;
        set({ globalLoadingMessage: `AI is furnishing the room...` });
        try {
            const projectData: ProjectData = { name: currentProject.name, projectType: currentProject.projectType, levels, planNorthDirection, propertyLines, terrainMesh, zones: [], infrastructure: [] };
            const signatureToUse = useAtmanSignature ? atmanSignature || undefined : undefined;
            const result = await geminiService.generateInteriorSchemeApi(currentProject.id, projectData, roomId, style, signatureToUse);

            const newItems: PlacedModel[] = [...result.furniture, ...result.lighting, ...result.textiles, ...result.decor].map((item: SuggestedItem) => ({
                ...item,
                id: generateId('model_furnish'),
                layerId: get().levels[get().activeLevelIndex].activeLayerId,
                width: 50, depth: 50, height3d: 50, // These would come from model definitions
            }));
            
            setSingleLevelProp('suggestedFurniture', prev => [...prev, ...newItems.map(m => ({...m, itemType: m.modelKey, roomId, orientation2d: m.rotation, vastuRemark: '' }))]);
            
            addNotification('AI has furnished the room with suggestions!', 'success');
            await refreshCurrentUser();

        } catch (error: any) {
            addNotification(`AI Furnish failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    
    runSvaDharmaAnalyzer: async () => {
        set({ globalLoadingMessage: 'Analyzing your architectural DNA...' });
        try {
            const { projects, currentProject } = get();
            const projectIdForApi = currentProject?.id || projects[0]?.id;
            if (!projectIdForApi) {
                throw new Error("You must have at least one project to analyze your signature.");
            }
            const result = await geminiService.runSvaDharmaAnalyzerApi(projectIdForApi, projects);
            set({ svaDharmaReport: result, atmanSignature: result.signature });
            get().addNotification("Your Atman Signature has been discovered!", "success");
            await get().refreshCurrentUser();
        } catch (error: any) {
            get().addNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    runSamudraManthan: async () => {
        const { currentProject, levels, planNorthDirection, propertyLines, terrainMesh, zones, infrastructure } = get();
        if (!currentProject) return;
        set({ globalLoadingMessage: 'Running holistic analysis...' });
        try {
            const projectData: ProjectData = { name: currentProject.name, projectType: currentProject.projectType, levels, planNorthDirection, propertyLines, terrainMesh, zones, infrastructure };
            const report = await geminiService.runSamudraManthanApi(currentProject.id, projectData);
            set({ sanjeevaniReport: report });
            get().addNotification('Samudra Manthan complete! Sanjeevani Report is ready.', 'success');
             await get().refreshCurrentUser();
        } catch (error: any) {
             get().addNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    
    fetchStrategicInsights: async () => {
        try {
            const insights = await adminService.getStrategicInsightsApi();
            set({ strategicInsights: insights });
        } catch (error: any) {
            get().addNotification(`Failed to fetch insights: ${error.message}`, 'error');
        }
    },

    // --- SIMPLE SETTERS & HELPERS ---
    setActiveOverlays: (updater) => set(state => ({ activeDataOverlays: updater(state.activeDataOverlays) })),
    setAuthModal: (modal) => set({ authModal: modal, authError: null }),
    setGlobalLoading: (message) => set({ globalLoadingMessage: message }),
    setView: (view) => set({ view }),
    setProfilePageOpen: (isOpen) => set({ isProfilePageOpen: isOpen }),
    setBuyCreditsModalOpen: (isOpen, pack) => set({ isBuyCreditsModalOpen: isOpen, selectedCreditPack: pack || null }),
    setHelpModalOpen: (isOpen) => set({ isHelpModalOpen: isOpen }),
    setFeedbackModalOpen: (isOpen) => set({ isFeedbackModalOpen: isOpen }),
    setSupportModalOpen: (isOpen) => set({ isSupportModalOpen: isOpen }),
    setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }),
    setTokenizeModalOpen: (isOpen, project) => set({ isTokenizeModalOpen: isOpen, projectToTokenize: project || null }),
    setNewProjectModalOpen: (isOpen) => set({ isNewProjectModalOpen: isOpen }),
    setPanelStates: (updater) => set(state => ({ panelStates: typeof updater === 'function' ? updater(state.panelStates) : updater })),
    togglePanelVisibility: (panelId) => {
        set(state => {
            const newPanels = { ...state.panelStates };
            const maxZIndex = Math.max(...Object.values(newPanels).map((p: PanelState) => p.zIndex));
            if (newPanels[panelId]) {
                newPanels[panelId].isVisible = !newPanels[panelId].isVisible;
                if (newPanels[panelId].isVisible) {
                    newPanels[panelId].zIndex = maxZIndex + 1;
                }
            }
            return { panelStates: newPanels };
        });
    },
    focusPanel: (panelId) => {
        set(state => {
            const currentPanels = state.panelStates;
            const maxZIndex = Math.max(...Object.values(currentPanels).map((p: PanelState) => p.zIndex));
            const newPanels = { ...currentPanels };
            if (newPanels[panelId] && newPanels[panelId].zIndex <= maxZIndex) {
                newPanels[panelId].zIndex = maxZIndex + 1;
            }
            return { panelStates: newPanels };
        });
    },
    setIsCommandPaletteOpen: (updater) => set(state => ({ isCommandPaletteOpen: typeof updater === 'function' ? updater(state.isCommandPaletteOpen) : updater })),
    addChatMessage: (message) => set(state => ({ chatHistory: [...state.chatHistory, message] })),
    setChatHistory: (messages) => set({ chatHistory: messages }),
    setCollaborators: (collaborators) => set({ collaborators }),
    setLiveCursors: (updater) => set(state => ({ liveCursors: typeof updater === 'function' ? updater(state.liveCursors) : updater })),
    setLiveSelections: (updater) => set(state => ({ liveSelections: typeof updater === 'function' ? updater(state.liveSelections) : updater })),
    addPlacedModel: (model) => {
        get().pushToUndoStack();
        const { activeLevelIndex } = get();
        const activeLayerId = get().levels[activeLevelIndex].activeLayerId;
        const newModel = { ...model, id: generateId('model'), layerId: activeLayerId };
        get().setSingleLevelProp('placedModels', (prev: PlacedModel[]) => [...prev, newModel]);
    },
    addPlacement: (placement) => {
        get().pushToUndoStack();
        const { activeLevelIndex } = get();
        const activeLayerId = get().levels[activeLevelIndex].activeLayerId;
        const newPlacement: Placement = {
            ...placement,
            id: generateId('placement'),
            layerId: activeLayerId
        };
        get().setSingleLevelProp('placements', (prev: Placement[]) => [...prev, newPlacement]);
    },
    addDimensionLine: (line) => {
        get().pushToUndoStack();
         const { activeLevelIndex } = get();
        const activeLayerId = get().levels[activeLevelIndex].activeLayerId;
        const newLine = { ...line, id: generateId('dim'), layerId: activeLayerId };
        get().setSingleLevelProp('dimensionLines', (prev: any[]) => [...prev, newLine]);
    },
    setHolocron: (holocron) => set({ holocron }),
    setLevels: (updater) => set(state => ({ levels: typeof updater === 'function' ? updater(state.levels) : updater, hasUnsavedChanges: true })),
    setSingleLevelProp: (prop, data) => { set(state => { const newLevels = [...state.levels]; const level = newLevels[state.activeLevelIndex]; if (level) { level[prop] = typeof data === 'function' ? (data as Function)(level[prop]) : data; } return { levels: newLevels, hasUnsavedChanges: true }; }); },
    setWalls: (updater) => get().setSingleLevelProp('walls', updater),
    setRooms: (updater) => get().setSingleLevelProp('rooms', updater),
    setPlacements: (updater) => get().setSingleLevelProp('placements', updater),
    setPlacedModels: (updater) => get().setSingleLevelProp('placedModels', updater),
    setDimensionLines: (updater) => get().setSingleLevelProp('dimensionLines', updater),
    setComments: (updater) => get().setSingleLevelProp('comments', updater),
    setSuggestedFurniture: (updater) => get().setSingleLevelProp('suggestedFurniture', updater),
    setPlumbingLayout: (updater) => get().setSingleLevelProp('plumbingLayout', updater),
    setElectricalLayout: (updater) => get().setSingleLevelProp('electricalLayout', updater),
    setHvacLayout: (updater) => get().setSingleLevelProp('hvacLayout', updater),
    setDrawingSet: (updater) => get().setSingleLevelProp('drawingSet', updater),
    setLayers: (updater) => get().setSingleLevelProp('layers', updater),
    setActiveLayerId: (updater) => get().setSingleLevelProp('activeLayerId', updater),
    addLayer: (name) => { get().pushToUndoStack(); const newLayer: Layer = { id: generateId('layer'), name, isVisible: true, isLocked: false }; get().setSingleLevelProp('layers', (prev) => [...prev, newLayer]); get().setSingleLevelProp('activeLayerId', newLayer.id); },
    updateLayer: (id, updates) => { get().pushToUndoStack(); get().setSingleLevelProp('layers', (prev) => prev.map(l => l.id === id ? { ...l, ...updates } : l)); },
    deleteLayer: (id) => {
        const { levels, activeLevelIndex, setSingleLevelProp, addNotification } = get();
        const activeLevel = levels[activeLevelIndex];
        if (activeLevel.layers.length <= 1) {
            addNotification("Cannot delete the last layer.", "error");
            return;
        }
        get().pushToUndoStack();

        setSingleLevelProp('walls', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('rooms', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('placements', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('placedModels', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('dimensionLines', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('comments', (prev) => prev.filter(o => o.layerId !== id));
        setSingleLevelProp('suggestedFurniture', (prev) => prev.filter(o => o.layerId !== id));

        const newLayers = activeLevel.layers.filter(l => l.id !== id);
        setSingleLevelProp('layers', newLayers);

        if (activeLevel.activeLayerId === id) {
            setSingleLevelProp('activeLayerId', defaultLayerId);
        }
        addNotification("Layer and its contents deleted.", "success");
    },
    setActiveLevelIndex: (updater) => set(state => ({ activeLevelIndex: typeof updater === 'function' ? updater(state.activeLevelIndex) : updater })),
    setPlanNorthDirection: (updater) => { get().pushToUndoStack(); set(state => ({ planNorthDirection: typeof updater === 'function' ? updater(state.planNorthDirection) : updater, hasUnsavedChanges: true })); },
    setPropertyLines: (updater) => { get().pushToUndoStack(); set(state => ({ propertyLines: typeof updater === 'function' ? updater(state.propertyLines) : updater, hasUnsavedChanges: true })); },
    setTerrainMesh: (updater) => { get().pushToUndoStack(); set(state => ({ terrainMesh: typeof updater === 'function' ? updater(state.terrainMesh) : updater, hasUnsavedChanges: true })); },
    setZones: (updater) => { get().pushToUndoStack(); set(state => ({ zones: typeof updater === 'function' ? updater(state.zones) : updater, hasUnsavedChanges: true })); },
    setInfrastructure: (updater) => { get().pushToUndoStack(); set(state => ({ infrastructure: typeof updater === 'function' ? updater(state.infrastructure) : updater, hasUnsavedChanges: true })); },
    setStagingSettings: (updater) => { get().pushToUndoStack(); set(state => ({ stagingSettings: typeof updater === 'function' ? updater(state.stagingSettings) : updater, hasUnsavedChanges: true })); },
    setSavedCameraViews: (updater) => { get().pushToUndoStack(); set(state => ({ savedCameraViews: typeof updater === 'function' ? updater(state.savedCameraViews) : updater, hasUnsavedChanges: true })); },
    setSelectedObject: (payload) => set({ selectedObject: typeof payload === 'function' ? payload(get().selectedObject) : payload }),
    deleteSelectedObject: () => {
        const { selectedObject, setSingleLevelProp, setSelectedObject } = get();
        if (!selectedObject) return;
        get().pushToUndoStack();
        switch (selectedObject.type) {
            case 'wall': setSingleLevelProp('walls', (prev: any[]) => prev.filter(w => w.id !== selectedObject.id)); break;
            case 'room': setSingleLevelProp('rooms', (prev: any[]) => prev.filter(r => r.id !== selectedObject.id)); break;
            case 'placement': setSingleLevelProp('placements', (prev: any[]) => prev.filter(p => p.id !== selectedObject.id)); break;
            case 'placedModel': setSingleLevelProp('placedModels', (prev: any[]) => prev.filter(m => m.id !== selectedObject.id)); break;
        }
        setSelectedObject(null);
    },
    setSunPosition: (updater) => set(state => ({ sunPosition: typeof updater === 'function' ? updater(state.sunPosition) : updater })),
    setAdvancedStructuralReport: (report) => set({ advancedStructuralReport: report }),
    setVastuGridAnalysis: (analysis) => set({ vastuGridAnalysis: analysis }),
    setConstructionSequence: (updater) => set(state => ({ constructionSequence: typeof updater === 'function' ? updater(state.constructionSequence) : updater })),
    setActiveTimelineWeek: (updater) => set(state => ({ activeTimelineWeek: typeof updater === 'function' ? updater(state.activeTimelineWeek) : updater })),
    setAiFixPreview: (updater) => set(state => ({ aiFixPreview: typeof updater === 'function' ? updater(state.aiFixPreview) : updater })),
    setShowVastuGrid: (updater) => set(state => ({ showVastuGrid: typeof updater === 'function' ? updater(state.showVastuGrid) : updater })),
    setShowElectricalLayer: (show) => set({ showElectricalLayer: show }),
    setShowHvacLayer: (show) => set({ showHvacLayer: show }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setActiveSketcherTool: (tool) => set({ activeSketcherTool: tool }),
    setEditorMode: (mode) => set({ editorMode: mode }),
    setFocusedCommentId: (id) => set({ focusedCommentId: id }),
    setIsCompanionActive: (updater) => set(state => ({ isCompanionActive: typeof updater === 'function' ? updater(state.isCompanionActive) : updater })),
    setCompanionState: (state) => set({ companionState: state }),
    setCompanionTranscript: (transcript) => set({ companionTranscript: transcript }),
    addCompanionLog: (entry) => set(state => ({ companionLog: [...state.companionLog, { ...entry, id: Date.now(), timestamp: Date.now() }] })),
    setIsWalkthroughActive: (updater) => set(state => ({ isWalkthroughActive: typeof updater === 'function' ? updater(state.isWalkthroughActive) : updater })),
    setCinematicTourData: (updater) => set(state => ({ cinematicTourData: typeof updater === 'function' ? updater(state.cinematicTourData) : updater })),
    setIsCinematicTourPlaying: (updater) => set(state => ({ isCinematicTourPlaying: typeof updater === 'function' ? updater(state.isCinematicTourPlaying) : updater })),
    setGeneratedDocuments: (docs) => set({ generatedDocuments: docs }),
    setGeneratedRenders: (renders) => set({ generatedRenders: renders }),
    setBillOfQuantities: (report) => set({ billOfQuantities: report }),
    setSustainabilityReport: (report) => set({ sustainabilityReport: report }),
    setCurrentPlacingModelKey: (key) => set({ currentPlacingModelKey: key }),
    setProjectAnalyticsData: (data) => set({ projectAnalyticsData: data }),
    setUserAnalytics: (data) => set({ userAnalytics: data }),
    setLokaSimulatorReport: (report) => set({ lokaSimulatorReport: report }),
    setNavagrahaReport: (report) => set({ navagrahaReport: report }),
    setAkashaReport: (report) => set({ akashaReport: report }),
    setSamsaraReport: (report) => set({ samsaraReport: report }),
    setShilpaSutraReport: (report) => set({ shilpaSutraReport: report }),
    setPrithviAstraReport: (report) => set({ prithviAstraReport: report }),
    setAgniAstraReport: (report) => set({ agniAstraReport: report }),
    setNexusReport: (report) => set({ nexusReport: report }),
    setAtmanSignatureReport: (report) => set({ atmanSignatureReport: report }),
    setParamAstraReport: (report) => set({ paramAstraReport: report }),
    setSvaDharmaReport: (report) => set({ svaDharmaReport: report }),
    setSanjeevaniReport: (report) => set({ sanjeevaniReport: report }),
    setIsHolocronAuthoringMode: (active) => set({ isHolocronAuthoringMode: active }),
    updateHolocronHotspots: (hotspots) => set(state => ({ holocron: state.holocron ? { ...state.holocron, hotspots } : null })),
    onViewCommentThread: (commentId) => {
        set({ focusedCommentId: commentId, activeTool: 'comments' });
        const { panelStates, togglePanelVisibility, focusPanel } = get();
        if (!panelStates.phoenixEngine.isVisible) {
            togglePanelVisibility('phoenixEngine');
        }
        focusPanel('phoenixEngine');
    },
    onBuyCreditsClick: () => set({ isBuyCreditsModalOpen: true }),
    addProactiveSuggestion: (suggestion) => {
        const newSuggestion = { ...suggestion, id: generateId('suggestion') };
        set(state => ({ proactiveSuggestions: [newSuggestion, ...state.proactiveSuggestions.slice(0, 2)] }));
    },
    dismissProactiveSuggestion: (id) => set(state => ({ proactiveSuggestions: state.proactiveSuggestions.filter(s => s.id !== id) })),
    setContextMenu: (menu) => set({ contextMenu: menu }),
    setGenerativeFeedbackActive: (isActive) => set({ generativeFeedbackActive: isActive }),
    setLaunchSequenceActive: (isActive, showNotification) => {
        set({ isLaunchSequenceActive: isActive });
        if (!isActive && showNotification) {
            get().addNotification(`Welcome, Founder ${get().currentUser?.name || ''}. System online.`, 'success');
        }
    },
    // Onboarding Actions
    setWelcomeModalOpen: (isOpen) => set({ isWelcomeModalOpen: isOpen }),
    startInteractiveTutorial: () => set({ isOnboardingActive: true, onboardingStep: 0 }),
    advanceTutorialStep: () => {
        const { onboardingStep } = get();
        if (onboardingStep < 3) { // 4 steps total, 0-indexed
            set({ onboardingStep: onboardingStep + 1 });
        } else {
            get().endInteractiveTutorial();
        }
    },
    endInteractiveTutorial: () => set({ isOnboardingActive: false }),
    completeOnboardingChecklistItem: (item) => {
        set(state => {
            if (!state.onboardingChecklist || state.onboardingChecklist[item]) {
                return {}; // No change
            }
            const newChecklist = { ...state.onboardingChecklist, [item]: true };
    
            const allComplete = Object.values(newChecklist).every(Boolean);
            if (allComplete && state.currentUser && !state.currentUser.onboardingRewardClaimed) {
                const updatedUser = {
                    ...state.currentUser,
                    credits: (state.currentUser.credits || 0) + 25,
                    onboardingRewardClaimed: true,
                };
                get().addNotification(
                    "Onboarding Complete! We've added 25 bonus credits to your account as a reward.",
                    'success'
                );
                // This is a client-side simulation. A real app would call an API to persist the reward.
                return { onboardingChecklist: newChecklist, currentUser: updatedUser };
            }
            
            return { onboardingChecklist: newChecklist };
        });
    },
    markSpotlightSeen: (spotlightId) => {
        set(state => ({
            seenSpotlights: state.seenSpotlights.includes(spotlightId) ? state.seenSpotlights : [...state.seenSpotlights, spotlightId]
        }));
    },
    addNotification: (message, type) => useNotificationStore.getState().addNotification(message, type),
    updateCurrentProject: (project) => set(state => ({ currentProject: state.currentProject ? { ...state.currentProject, ...project } : null })),
}));