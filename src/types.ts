// src/types.ts

import type { ReactNode, SetStateAction } from 'react';

// --- Global Augmentations ---
declare global {
  interface Window {
    Razorpay: any;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// --- Basic Geometric & Data Structures ---

export interface Point2D { x: number; y: number; }
export interface Point3D { x: number; y: number; z: number; }

export interface Layer {
    id: string;
    name: string;
    isVisible: boolean;
    isLocked: boolean;
}

export interface Wall {
  id: string;
  x1: number; y1: number;
  x2: number; y2: number;
  thickness: number;
  height: number;
  material?: string;
  layerId: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  type: string;
  wallIds: string[];
  calculatedArea?: number;
  orientation?: string;
  floorMaterial?: string;
  wallMaterialOverride?: string;
  layerId: string;
}

export interface Placement {
  id: string;
  wallId: string;
  type: 'door' | 'window';
  positionRatio: number;
  width: number;
  height: number;
  layerId: string;
}

export interface Predefined3DModel {
  key: string;
  name: string;
  category: string;
  defaultWidth: number;
  defaultDepth: number;
  defaultHeight3d: number;
  modelUrl?: string;
  modelScale?: number;
}

export interface PlacedModel {
  id: string;
  modelKey: string;
  name: string;
  x: number; y: number;
  width: number; depth: number;
  height3d: number;
  rotation: number;
  layerId: string;
  brand?: string;
  style?: string;
}

export interface DimensionLine {
  id: string;
  type: 'manual' | 'auto';
  p1: Point2D;
  p2: Point2D;
  textPosition?: Point2D;
  offsetDistance: number;
  isTemporary?: boolean;
  layerId: string;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface AppComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
  resolved: boolean;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
  layerId: string;
}

// --- AI & Reports ---

export interface BoqItem {
  item: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface BillOfQuantitiesReport {
  summary: string;
  lineItems: BoqItem[];
}

export interface SustainabilityReport {
  score: number;
  scoreBreakdown: { metric: string; value: string; assessment: string }[];
  recommendations: { title: string; description: string }[];
}

export interface CodeComplianceReport {
    standard: string;
    summary: string;
    overallResult: 'Pass' | 'Fail' | 'Pass with warnings';
    items: { check: string; details: string; status: 'Pass' | 'Fail' | 'Warning' }[];
}

export interface AdvancedStructuralReport {
    summary: string;
    loadBearingWalls: string[];
    preliminaryLoadCalculations: { area: string; deadLoad: string; liveLoad: string }[];
    sizingSuggestions: ({
        type: 'column';
        location: { x: number; y: number; levelIndex: number };
        suggestedSize: string;
        reason: string;
    } | {
        type: 'beam';
        p1: Point2D;
        p2: Point2D;
        levelIndex: number;
        suggestedSize: string;
        reason: string;
    })[];
}

export interface AiSketchToPlanResponse {
    levels: Level[];
    rooms?: Room[];
}

export interface AiResearchResponse {
    text: string;
    sources: { web: { uri: string; title: string } }[];
}

export interface AiFixResponse {
    commentId: string;
    fix: {
        addedWalls?: Omit<Wall, 'id' | 'layerId' | 'height' | 'thickness'>[];
        modifiedWalls?: (Partial<Wall> & { id: string })[];
        deletedWallIds?: string[];
    };
}


export interface MaterialAnalysisReport {
    materialName: string;
    description: string;
    sustainabilityScore: number;
    pros: string[];
    cons: string[];
    typicalUseCases: string[];
}

export interface VastuGridAnalysis {
    padas: { compliance: 'good' | 'neutral' | 'bad' | 'empty'; reason: string }[];
}

export interface MasterArchitectResponse {
    projectData: ProjectData;
    structuralReport: AdvancedStructuralReport;
    vastuReport: VastuGridAnalysis;
    boq: BillOfQuantitiesReport;
    previewRender: { imageUrl: string; prompt: string };
    summary: string;
    refinedPrompt?: string;
    persona?: string;
    concept?: any;
}

export interface MultiConceptResponse extends Array<MasterArchitectResponse> {}

export interface ProjectCertificationReport {
    certificationStatus: 'Certified' | 'Certified with Recommendations' | 'Needs Review';
    executiveSummary: string;
    scorecard: { vastu: number; structural: number; sustainability: number; flow: number; compliance: number };
    reports: any;
}

export interface SiteAnalysisReport {
    summary: string;
    optimalPlacementSuggestion: { x: number; y: number; reason: string };
    foundationSuggestion: { type: string; reason: string };
    drainageSuggestion: { description: string; paths: Point2D[][] };
}

export interface InteriorSchemeResponse {
    designNarrative: string;
    materials: {
        floor: { materialKey: string; justification: string };
        primaryWall: { materialKey: string; justification: string };
        accentWall?: { wallId: string; materialKey: string; justification: string };
        trim: { materialKey: string; justification: string };
    };
    furniture: SuggestedItem[];
    lighting: SuggestedItem[];
    textiles: SuggestedItem[];
    decor: SuggestedItem[];
}

export interface LandscapePlanResponse {
    landscapingElements: PlacedModel[];
}

export interface MasterPlanLayoutResponse {
    zones: Zone[];
    infrastructure: InfrastructureLine[];
}

export interface FlowIssue {
    id: string;
    type: 'flow' | 'ergonomics';
    message: string;
    location: Point2D;
    area: { x: number; y: number; width: number; height: number };
}

export interface ArSuggestionsResponse {
    suggestedWallPalette: string[];
    suggestedFloorMaterialKey: string;
    narrative: string;
}

export interface OracleAnalysisResponse {
    text: string;
    sources: { web: { uri: string; title: string } }[];
}

export interface CostSustainabilityReport {
    overallSummary: string;
    suggestions: {
        originalItem: string;
        suggestedAlternative: string;
        costImpact: string;
        sustainabilityImpact: string;
        reason: string;
    }[];
}

export interface BrahmaAstraMission {
    goal: string;
    location: string;
    targetDemographic: string;
    budget: string;
    constraints: string;
}

export interface BrahmaAstraReport {
    mission: BrahmaAstraMission;
    marketAnalysis: { summary: string; keyDataPoints: { label: string; value: string }[] };
    masterPlan: { narrative: string; zones: Zone[]; infrastructure: InfrastructureLine[] };
    buildingDesigns: { buildingType: string; summary: string; levels: Level[] }[];
    financialProjections: { summary: string; estimatedCost: string; projectedRevenue: string; roi: string };
    overallNarrative: string;
}

export interface FabricationFile {
    fileName: string;
    mimeType: string;
    content: string;
}

export interface IndraNetVisual {
    title: string;
    prompt: string;
    generatedImageUrl?: string;
}

export interface IndraNetReport {
    brandIdentity: { logoConcept: string; colorPalette: string[]; tagline: string };
    visuals: IndraNetVisual[];
    videoStoryboard: { sceneNumber: number; visual: string; narration: string; onScreenText: string }[];
    websiteCopy: { headline: string; bodyText: string };
}

export interface VarunaReport {
    narrative: string;
    topographySummary: string;
    reservoirs: { name: string; location: Point2D; capacity: string; purpose: string }[];
    dams: { name: string; river: string; location: Point2D; type: string; height: string }[];
    canals: { name: string; path: Point2D[]; flowRate: string; type: string }[];
    environmentalImpact: string;
}

export interface LokaSimulatorReport {
    summary: string;
    solarIrradiance: { annual: number; units: string; peakMonths: string[] };
    windPatterns: { dominantDirection: string; averageSpeed: number; units: string };
    temperatureRange: { annualMin: number; annualMax: number; units: string };
    precipitation: { annualAverage: number; units: string; wettestMonths: string[] };
}

export interface NavagrahaReport {
    analysis: string;
    auspiciousTimings: { event: string; date: string; notes: string }[];
}

export interface AkashaReport {
    response: string;
    citations: { projectId: string; summary: string }[];
}

export interface SamsaraReport {
    summary: string;
    maintenanceSchedule: { item: string; frequency: string; estimatedCost: string }[];
    materialReincarnationPlan: { material: string; potentialNewUse: string; environmentalNote: string }[];
}

export interface ShilpaSutraReport {
    narrative: string;
    potentialEmbellishments: { location: string; suggestion: string }[];
}

export interface SingularityReport {
    summary: string;
    generatedAssets: { type: string; status: string; details: string }[];
}

export interface StrategicAdviceReport {
    summary: string;
    opportunities: { title: string; description: string }[];
    risks: { title: string; description: string }[];
}

export interface PrithviAstraReport {
    geotechnicalReport: { assumedSoilType: string; estimatedSbc: string; waterTableDepth: string; recommendations: string[]; };
    recommendedFoundation: { type: string; reasoning: string; preliminaryPlan?: Footing[]; };
}

export interface AgniAstraReport {
    structuralSystemSummary: string;
    materialSpecifications: { concreteGrade: string; steelGrade: string; };
    foundationDesign: (Footing & { reinforcement: string })[];
    columnSchedule: { id: string; level: number; location: Point2D; size: string; reinforcement: string }[];
    beamLayout: { id: string; level: number; p1: Point2D; p2: Point2D; size: string; reinforcement: string }[];
    slabDetails: { level: number; thickness: string; type: string }[];
    structuralNotes: string[];
}

export interface SvaDharmaResponse {
    signature: string;
    analysis: string;
}

export interface NexusReport {
    strategicOverview: string;
    growthOpportunities: { title: string; description: string }[];
    potentialRisks: { title: string; description: string }[];
    suggestedActions: { title: string; description: string; cta: string }[];
    svaDharmaAnalysis: SvaDharmaResponse;
    akashicInsights?: string[];
}

export interface AtmanSignatureResponse {
    narrative: string;
    projectData: ProjectData;
}

export interface ParamAstraResponse {
    solutions: { id: string; scores: Record<string, number>; thumbnailUrl: string }[];
}

export interface SanjeevaniReport {
    summary: string;
    conflicts: { description: string; elementIds: string[]; solutionPrompt?: string }[];
    synergies: { description: string; elementIds: string[] }[];
}

export interface AiCompanionCommandResponse {
    action: string;
    payload: any;
    narrative: string;
}

export interface GenerativeIP {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  thumbnailUrl: string;
}

export interface BrahmanTierProject {
    id: string;
    title: string;
    description: string;
    budget: string;
    timeline: string;
    requiredSkills: string[];
}

export interface Guild {
    id: string;
    name: string;
    members: User[];
    activeProject: BrahmanTierProject | null;
}


// --- Master Plan (Terraform) ---
export interface Zone { id: string; name: string; type: 'residential' | 'commercial' | 'green_space' | 'infrastructure'; path: Point2D[]; layerId: string; }
export interface InfrastructureLine { id: string; type: 'road' | 'utility_line'; path: Point2D[]; width?: number; layerId: string; }
export interface PropertyLine { id: string; points: Point2D[]; }
export interface TerrainMesh { vertices: number[]; indices: number[]; }

// --- Staging & Presentation ---
export type TimeOfDay = 'midday' | 'sunset' | 'night';
export interface StagingSettings { timeOfDay: TimeOfDay; enableBloom: boolean; }
export interface CameraView { id: string; name: string; position: Point3D; target: Point3D; }
export interface SunPosition { azimuth: number; altitude: number; }
export interface HolocronHotspot {
    id: string;
    title: string;
    type: 'narrative' | 'render' | 'document';
    content: string;
    position: Point3D;
}
export interface Holocron { isEnabled: boolean; shareableLink: string; hotspots: HolocronHotspot[]; }
export interface HolocronData { projectName: string; levels: Level[]; planNorthDirection: string; propertyLines: PropertyLine[]; terrainMesh: TerrainMesh | null; hotspots: HolocronHotspot[] }
export interface CinematicShot { shotType: string; summary: string; cameraStart: Point3D; cameraEnd: Point3D; targetStart: Point3D; targetEnd: Point3D; duration: number; script: string; }
export interface CinematicTour { title: string; shots: CinematicShot[]; }

// --- MEP & Detailing ---
export interface PlumbingLine { id: string; type: 'supply_hot' | 'supply_cold' | 'drainage'; path: Point2D[]; layerId: string; }
export interface Circuit { id: string; name: string; breakerRating: number; description?: string; }
export interface WiringPath { id: string; circuitId: string; path: Point2D[]; }
export interface ElectricalLayout { breakerPanel: { x: number; y: number; circuits: Circuit[]; }; wiringPaths: WiringPath[]; layerId: string; }
export interface Duct { id: string; type: 'supply' | 'return'; path: Point2D[]; width: number; }
export interface Vent { id: string; type: 'supply' | 'return'; x: number; y: number; width: number; length: number; angle: number; }
export interface HvacLayout { ducts: Duct[]; vents: Vent[]; ahuLocation?: Point2D; condenserLocation?: Point2D; layerId: string; }
export interface GFCDrawingSheet { title: string; type: string; data: any; titleBlock: any; }
export interface GeneralNotes { civil: string[], structural: string[], mep: string[], safety: string[] }
export interface MaterialLegendItem { tag: string; description: string; details: string; }
export interface ScheduleItem { id: string, type: string, size: string, material: string, remarks: string }
export interface MEPlayer { lines: {id: string, path: Point2D[]}[], symbols: {id: string, x: number, y: number}[] }
export interface GFCDrawingSet { generalNotes: GeneralNotes; materialLegend: MaterialLegendItem[]; mepLayers: { plumbing: MEPlayer, electrical: MEPlayer, fire: MEPlayer }; schedules: { doorSchedule: ScheduleItem[], windowSchedule: ScheduleItem[] }; }
export interface SuggestedFurnitureItem {
  id: string; 
  roomId: string; 
  itemType: string; 
  x: number; 
  y: number; 
  width: number; 
  depth: number; 
  height3d: number; 
  orientation2d: number; 
  vastuRemark?: string;
  layerId: string; 
}
export interface SuggestedItem {
  modelKey: string;
  name: string;
  x: number;
  y: number;
  rotation: number;
  justification: string;
}
// NEW: Civil Engineering Types
export interface Footing {
    id: string;
    x: number;
    y: number;
    size: string;
    depth: string;
    reinforcement?: string;
}

// --- Payments & Credits ---
export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
  tier: 'explorer' | 'architect' | 'firm';
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// --- Materials ---
export interface MaterialDefinition {
  key: string;
  name: string;
  type: 'color' | 'texture';
  value: string;
  category: string;
  finish: 'matte' | 'satin' | 'glossy';
  appliesTo: 'wall' | 'floor' | 'any' | 'model';
  uvScale?: { x: number, y: number };
  roughness?: number;
  metalness?: number;
}


// --- User & Auth ---
export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  credits: number;
  role: 'user' | 'owner';
  profession?: string;
  bio?: string;
  isProfilePublic?: boolean;
  portfolioUrl?: string;
  linkedInUrl?: string;
  profileImageUrl?: string;
  marketplaceEarnings?: number;
  workspaces: Workspace[];
  createdAt?: string;
  lastLogin?: string;
  loginStreak?: number;
  trialExpiresAt?: string;
  phoneNumber?: string;
  whatsappOptIn?: boolean;
  onboardingRewardClaimed?: boolean;
}
export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
export interface UpdateUserPayload { name: string; profession: string; bio: string; isProfilePublic: boolean; portfolioUrl: string; linkedInUrl: string; }
export interface ChangePasswordPayload { currentPassword: string; newPassword: string; }
export interface ActivityLog { id: string; action: string; details: string; timestamp: string; }
export interface UserAnalyticsData { totalProjects: number; loginStreak: number; activityLog: ActivityLog[]; }

export type PanelId = 'phoenixEngine' | 'propertiesPanel' | 'projectHub' | 'layersPanel' | 'chatPanel' | 'analyticsPanel' | 'digitalTwinPanel' | 'integrationsPanel' | 'mayaLayer';
export interface PanelState {
  id: PanelId;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isVisible: boolean;
}
export interface Workspace {
  id?: string;
  name: string;
  layout: Record<string, PanelState>;
}

export interface Collaborator {
  userId: {
    id: string;
    _id: string;
    name: string;
    email: string;
    profileImageUrl: string;
  };
  role: 'editor' | 'viewer';
}
export interface ChatMessage {
  _id?: string;
  userId: string;
  userName: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

// --- Level & Project ---
export interface Level {
  id: string; name: string; elevation: number;
  walls: Wall[]; rooms: Room[]; placements: Placement[];
  placedModels: PlacedModel[]; dimensionLines: DimensionLine[];
  comments: AppComment[]; suggestedFurniture: SuggestedFurnitureItem[];
  plumbingLayout: PlumbingLine[]; electricalLayout: ElectricalLayout | null;
  hvacLayout: HvacLayout | null; 
  drawingSet: GFCDrawingSet | null; layers: Layer[]; activeLayerId: string;
  foundationPlan?: Footing[]; // NEW
}

export type ProjectStatus = 'design' | 'review' | 'construction' | 'completed';
export interface ProjectTask { id: string; text: string; isCompleted: boolean; }
export interface BudgetCategory { id: string; name: string; planned: number; actual?: number; }
export interface ClientAccess { isEnabled: boolean; shareableLink: string; }
export interface ArchitectsFolio { title: string; narrative: string; shareableLink: string; isEnabled: boolean; }
export interface GeneratedDocument { _id: string; name: string; type: string; url: string; createdAt: string; }
export interface GeneratedRender { _id: string; prompt: string; url: string; createdAt: string; }
export interface MarketplaceInfo { price: number; description: string; tags: string[]; numPurchases: number; }
export interface AiCreditUsage { tool: string; cost: number; timestamp: Date; }

export interface Discrepancy {
    id: string;
    type: 'material' | 'structural' | 'dimensional' | 'safety' | 'progress';
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
    imageCoordinates?: Point2D;
}
export interface PhoenixEyeReport {
    overallAssessment: string;
    progressPercentage: number;
    scheduleAdherence: 'on_schedule' | 'behind_schedule' | 'ahead_of_schedule';
    discrepancies: Discrepancy[];
}
export interface ConstructionPhase {
  week: number;
  description: string;
  tasks: string[];
  estimatedMaterials: { item: string, quantity: number, unit: string }[];
  constructionNotes: string[];
  elementIds: { walls: string[], placements: string[], models: string[] };
}
export interface TokenizationDetails {
  isTokenized: boolean;
  totalTokens: number;
  pricePerToken: number; // in credits
  offeringDescription: string;
}

export interface Project {
  id: string;
  _id?: string;
  userId: string | { id: string; _id?: string; name: string; email: string; profileImageUrl: string; };
  name: string;
  location?: string;
  projectType: 'building' | 'masterPlan';
  isPublic: boolean;
  isForSale?: boolean;
  levels: Level[];
  zones: Zone[];
  infrastructure: InfrastructureLine[];
  planNorthDirection: string;
  propertyLines: PropertyLine[];
  terrainMesh: TerrainMesh | null;
  previewImageUrl?: string;
  stagingSettings: StagingSettings;
  savedCameraViews: CameraView[];
  status: ProjectStatus;
  budget: BudgetCategory[];
  tasks: ProjectTask[];
  clientAccess: ClientAccess;
  folio?: ArchitectsFolio;
  holocron: Holocron | null;
  cinematicTour?: CinematicTour | null;
  phoenixEyeReports?: PhoenixEyeReport[];
  version: number;
  collaborators: Collaborator[];
  generatedDocuments: GeneratedDocument[];
  generatedRenders: GeneratedRender[];
  chatHistory: ChatMessage[];
  clientProfile?: string;
  siteContext?: string;
  specificRequirements?: string;
  billOfQuantities?: BillOfQuantitiesReport;
  sustainabilityReport?: SustainabilityReport;
  aiCreditUsage: AiCreditUsage[];
  constructionSequence?: ConstructionPhase[];
  marketplace?: MarketplaceInfo;
  tokenization?: TokenizationDetails; // NEW
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  projectType: 'building' | 'masterPlan';
  isPublic: boolean;
  isForSale?: boolean;
  collaborators: Collaborator[];
  previewImageUrl?: string;
  userId?: {
      id: string;
      name: string;
      email: string;
      profileImageUrl: string;
  };
  folio?: {
    isEnabled?: boolean;
    shareableLink?: string;
  };
  marketplace?: MarketplaceInfo;
  tokenization?: { isTokenized: boolean }; // NEW
}

export interface ProjectData {
    id?: string;
    name: string;
    projectType: 'building' | 'masterPlan';
    levels: Level[];
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    planNorthDirection: string;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    stagingSettings?: StagingSettings;
    savedCameraViews?: CameraView[];
    location?: string;
    clientProfile?: string;
    siteContext?: string;
    specificRequirements?: string;
    holocron?: Holocron | null;
    status?: ProjectStatus;
    budget?: BudgetCategory[];
    tasks?: ProjectTask[];
    generatedDocuments?: GeneratedDocument[];
    generatedRenders?: GeneratedRender[];
    chatHistory?: ChatMessage[];
    billOfQuantities?: BillOfQuantitiesReport;
    sustainabilityReport?: SustainabilityReport;
    constructionSequence?: ConstructionPhase[];
}

export interface ProjectVersion {
    _id: string;
    projectId: string;
    versionNumber: number;
    commitMessage: string;
    createdAt: string;
}

// --- Digital Twin ---
export interface EnergyUsage { roomId: string; powerDraw: number; } // in Watts
export interface StructuralStress { wallId: string; stressFactor: number; } // 0 to 1
export interface OccupancyData { roomId: string; count: number; }
export interface DigitalTwinData {
    totalPowerDraw: number;
    peakStressFactor: number;
    totalOccupancy: number;
    energyUsage: EnergyUsage[];
    structuralStress: StructuralStress[];
    occupancy: OccupancyData[];
}
export interface DigitalTwinDataOverlay {
    energy: boolean;
    stress: boolean;
    occupancy: boolean;
}

// --- Admin & Foundation Types ---
export interface KpiData {
    totalUsers: number;
    totalProjects: number;
    totalRevenue: number;
    creditsSold: Record<string, number>;
}
export interface KpiChartData {
    name: string;
    users: number;
    revenue: number;
}
export interface Feedback {
    id: string;
    _id?: string;
    userId: { email: string; name: string; };
    category: 'bug_report' | 'feature_request' | 'general_feedback';
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'wont_fix';
    createdAt: string;
}

// NEW: Brahman Protocol / Akasha Engine Types
export interface StrategicInsight {
    id: string;
    finding: string;
    observation: string;
    hypothesis: string;
    actionable_intelligence: string;
}


export interface Submission {
  _id: string;
  projectId: ProjectSummary;
  userId: { name: string; email: string };
  proposal: string;
  status: 'submitted' | 'under_review' | 'adjudicated' | 'finalist' | 'winner';
  adjudicationReport?: AdjudicationReport;
}
export interface AdjudicationReport {
    overallScore: number;
    overallSummary: string;
    detailedCritique: {
        category: string;
        score: number;
        critique: string;
    }[];
}

// --- Wallet & Supply Chain ---
export interface Transaction {
    _id?: string;
    id?: string;
    userId: string;
    type: 'credit_purchase' | 'ai_tool_usage' | 'marketplace_sale' | 'marketplace_purchase' | 'payout' | 'adjustment';
    amount: number;
    description: string;
    relatedId?: string;
    createdAt: string;
}
export interface Supplier {
    _id: string;
    name: string;
    materialCategory: string;
    locationName: string;
    rating: number;
}
export interface Quote {
    _id: string;
    projectId: { name: string; _id: string; } | string;
    supplierId: Supplier | { name: string; _id: string; };
    materialName: string;
    quantity: number;
    unit: string;
    price: number;
    status: 'pending' | 'accepted' | 'rejected';
}


// --- Editor & Tools ---
export type AppView = 'landing' | 'userDashboard' | 'auraOS' | 'worldBuilder' | 'staging' | 'clientPortal' | 'folio' | 'showcase' | 'auraCommandCenter' | 'brahmaAstra' | 'marketplace' | 'realEstateExchange' | 'wallet' | 'astraSupplyChain' | 'chronicles' | 'holocron' | 'guilds';

export type SelectedObject = {
  id: string;
  type: 'wall' | 'room' | 'placement' | 'placedModel' | 'zone' | 'infrastructure' | 'propertyLine';
  levelIndex: number;
};

export interface LiveCursor {
  x: number;
  y: number;
  userName: string;
  color: string;
}

export interface LiveSelection {
  userId: string;
  objectId: string;
  objectType: string;
}

export interface AICompanionLogEntry {
  id: number;
  type: 'info' | 'thought' | 'action' | 'error';
  message: string;
  timestamp: number;
}

export interface Command {
    id: string;
    label: string;
    category: string;
    action: () => void;
    disabled?: boolean;
    icon?: ReactNode;
}

export type PhoenixEngineTab = 
    // AETHER
    'singularity' | 'masterArchitect' | 'nexusAdvisor' | 'dreamWeaver' | 'holocronAuthoring' | 
    'shilpaSutra' | 'akasha' | 'navagraha' | 'samsara' | 'oracle' | 'vastu' | 'indraNet' | 
    'research' | 'sketch' | 'boq' | 'sustainability' | 'compliance' | 'material' | 
    'phoenixEye' | 'arDesignLab' | 'comments' | 'modelLibrary' | 'staging' |
    // EARTH
    'prithviAstra' | 'agniAstra' | 'structure' | 'vishwakarma' | 'detailing' | 'fabricator' | 'siteAnalysis' | 'lokaSimulator' | 
    // WATER
    'hydroEngineer' | 'plumbingLayout' | 
    // FIRE
    'render' | 'ambiance' | 'cinematicTour' | 'optimizer' |
    // AIR
    'flow' | 'electricalLayout' | 'hvacLayout' |
    // ATMAN
    'atmanSignature' | 'svaDharma' |
    // BRAHMAN
    'paramAstra' | 'samudraManthan';

// Using 'any' for the store type to break the circular dependency between appStore.ts and types.ts
export interface ProactiveSuggestion {
  id: string;
  title: string;
  message: string;
  cta?: {
    label: string;
    action: (store: any) => void;
  };
}

export interface OnboardingChecklist {
  profileCompleted: boolean;
  projectCreated: boolean;
  aiToolUsed: boolean;
  versionSaved: boolean;
  featureSpotlightViewed: boolean;
}

export type SketcherTool = 'wall' | 'select' | 'dimension' | 'comment' | 'property' | 'door' | 'window' | 'zone' | 'road';
export type EditorMode = 'concept' | 'precision';

export interface UndoableState {
    levels: Level[];
    activeLevelIndex: number;
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    planNorthDirection: string;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    stagingSettings: StagingSettings;
    savedCameraViews: CameraView[];
}

export interface ProjectAnalyticsData {
    vastuScore: number;
    sustainabilityScore: number;
    materialDistribution: { name: string; value: number }[];
    creditUsage: { name: string; cost: number }[];
}

export interface AppState extends UndoableState {
  currentUser: User | null;
  isLoadingAuth: boolean;
  authError: string | null;
  authModal: 'login' | 'register' | null;
  projects: ProjectSummary[];
  currentProject: Project | null;
  isProjectLoading: boolean;
  projectError: string | null;
  view: AppView;
  isProfilePageOpen: boolean;
  isHelpModalOpen: boolean;
  isFeedbackModalOpen: boolean;
  isSupportModalOpen: boolean;
  isBuyCreditsModalOpen: boolean;
  isExportModalOpen: boolean;
  isTokenizeModalOpen: boolean;
  isNewProjectModalOpen: boolean;
  projectToTokenize: ProjectSummary | null;
  selectedCreditPack: CreditPack | null;
  isCommandPaletteOpen: boolean;
  globalLoadingMessage: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  hasUnsavedChanges: boolean;
  panelStates: Record<PanelId, PanelState>;
  workspaces: Workspace[];
  proactiveSuggestions: ProactiveSuggestion[];
  isLaunchSequenceActive: boolean;
  // Onboarding
  isWelcomeModalOpen: boolean;
  isOnboardingActive: boolean;
  onboardingStep: number;
  onboardingChecklist: OnboardingChecklist | null;
  seenSpotlights: string[];
  // Undo/Redo
  undoStack: UndoableState[];
  redoStack: UndoableState[];
  canUndo: boolean;
  canRedo: boolean;
  // Editor State
  selectedObject: SelectedObject | null;
  showElectricalLayer: boolean;
  showHvacLayer: boolean;
  showVastuGrid: boolean; // ADDED
  constructionSequence: ConstructionPhase[] | null;
  activeTimelineWeek: number | null;
  isWalkthroughActive: boolean;
  sunPosition: SunPosition;
  aiFixPreview: AiFixResponse | null;
  cinematicTourData: CinematicTour | null;
  isCinematicTourPlaying: boolean;
  activeTool: PhoenixEngineTab;
  activeSketcherTool: SketcherTool;
  editorMode: EditorMode;
  focusedCommentId: string | null;
  contextMenu: { x: number; y: number; object: SelectedObject | null } | null;
  isBrahmandaAstraActive: boolean;
  generativeFeedbackActive: boolean;
  // AI Companion
  companionLog: AICompanionLogEntry[];
  isCompanionActive: boolean;
  companionState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
  companionTranscript: string | null;
  // Collaboration
  collaborators: Collaborator[];
  liveCursors: Record<string, LiveCursor>;
  liveSelections: Record<string, LiveSelection>;
  // Project Data & Reports
  chatHistory: ChatMessage[];
  generatedDocuments: GeneratedDocument[];
  generatedRenders: GeneratedRender[];
  billOfQuantities: BillOfQuantitiesReport | null;
  sustainabilityReport: SustainabilityReport | null;
  advancedStructuralReport: AdvancedStructuralReport | null;
  vastuGridAnalysis: VastuGridAnalysis | null;
  brahmaAstraReport: BrahmaAstraReport | null;
  isBrahmaAstraRunning: boolean;
  currentPlacingModelKey: string | null;
  projectAnalyticsData: ProjectAnalyticsData | null;
  userAnalytics: UserAnalyticsData | null;
  lokaSimulatorReport: LokaSimulatorReport | null;
  navagrahaReport: NavagrahaReport | null;
  akashaReport: AkashaReport | null;
  samsaraReport: SamsaraReport | null;
  shilpaSutraReport: ShilpaSutraReport | null;
  holocron: Holocron | null;
  isHolocronAuthoringMode: boolean;
  prithviAstraReport: PrithviAstraReport | null;
  agniAstraReport: AgniAstraReport | null;
  nexusReport: NexusReport | null;
  atmanSignature: string | null; // ADDED
  atmanSignatureReport: AtmanSignatureResponse | null;
  paramAstraReport: ParamAstraResponse | null;
  svaDharmaReport: SvaDharmaResponse | null;
  sanjeevaniReport: SanjeevaniReport | null;
  strategicInsights: StrategicInsight[] | null;
  // Digital Twin
  isDigitalTwinModeActive: boolean;
  digitalTwinData: DigitalTwinData | null;
  activeDataOverlays: DigitalTwinDataOverlay;
  // Singularity Engine
  isSingularityRunning: boolean;
  singularityProgress: string | null;
}

export type AppStore = AppState & {
    set: (updater: Partial<AppState> | ((state: AppStore) => Partial<AppState>)) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    initApp: () => Promise<void>;
    login: (email: string, passwordPlain: string) => Promise<void>;
    register: (email: string, passwordPlain: string, phoneNumber: string, whatsappOptIn: boolean) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    logout: () => void;
    refreshCurrentUser: () => Promise<void>;
    fetchUserAnalytics: () => Promise<void>;
    newProject: (type: 'building' | 'masterPlan') => void;
    loadProject: (projectId: string) => Promise<void>;
    importProjectData: (projectData: ProjectData, name: string) => void;
    autoSaveProject: () => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    updateCurrentProject: (project: Partial<Project>) => void;
    pushToUndoStack: () => void;
    undo: () => void;
    redo: () => void;
    setupSocketListeners: () => void;
    applyWorkspaceLayout: (layout: Record<string, PanelState>) => void;
    saveCurrentWorkspace: (name: string) => Promise<void>;
    deleteWorkspace: (workspaceId: string) => Promise<void>;
    runBrahmaAstra: (mission: BrahmaAstraMission) => Promise<void>;
    runSingularityEngine: () => Promise<void>;
    toggleDigitalTwinMode: () => Promise<void>;
    runAiFurnishRoom: (roomId: string, style: string, useAtmanSignature: boolean) => Promise<void>;
    runSvaDharmaAnalyzer: () => Promise<void>;
    runSamudraManthan: () => Promise<void>;
    fetchStrategicInsights: () => Promise<void>;
    exportCometPackage: () => Promise<void>;
    setActiveOverlays: (updater: (prev: DigitalTwinDataOverlay) => DigitalTwinDataOverlay) => void;
    setAuthModal: (modal: 'login' | 'register' | null) => void;
    setGlobalLoading: (message: string | null) => void;
    setView: (view: AppView) => void;
    setProfilePageOpen: (isOpen: boolean) => void;
    setBuyCreditsModalOpen: (isOpen: boolean, pack?: CreditPack | null) => void;
    setHelpModalOpen: (isOpen: boolean) => void;
    setFeedbackModalOpen: (isOpen: boolean) => void;
    setSupportModalOpen: (isOpen: boolean) => void;
    setExportModalOpen: (isOpen: boolean) => void;
    setTokenizeModalOpen: (isOpen: boolean, project?: ProjectSummary | null) => void;
    setNewProjectModalOpen: (isOpen: boolean) => void;
    setPanelStates: (updater: SetStateAction<Record<PanelId, PanelState>>) => void;
    togglePanelVisibility: (panelId: PanelId) => void;
    focusPanel: (panelId: PanelId) => void;
    setIsCommandPaletteOpen: (updater: SetStateAction<boolean>) => void;
    addChatMessage: (message: ChatMessage) => void;
    setChatHistory: (messages: ChatMessage[]) => void;
    setCollaborators: (collaborators: Collaborator[]) => void;
    setLiveCursors: (updater: SetStateAction<Record<string, LiveCursor>>) => void;
    setLiveSelections: (updater: SetStateAction<Record<string, LiveSelection>>) => void;
    addPlacedModel: (model: Omit<PlacedModel, 'id' | 'layerId'>) => void;
    addPlacement: (placement: Omit<Placement, 'id' | 'layerId'>) => void;
    addDimensionLine: (line: Omit<DimensionLine, 'id' | 'layerId'>) => void;
    setHolocron: (holocron: Holocron | null) => void;
    setLevels: (updater: SetStateAction<Level[]>) => void;
    setSingleLevelProp: <K extends keyof Level>(prop: K, data: SetStateAction<Level[K]>) => void;
    setWalls: (updater: SetStateAction<Wall[]>) => void;
    setRooms: (updater: SetStateAction<Room[]>) => void;
    setPlacements: (updater: SetStateAction<Placement[]>) => void;
    setPlacedModels: (updater: SetStateAction<PlacedModel[]>) => void;
    setDimensionLines: (updater: SetStateAction<DimensionLine[]>) => void;
    setComments: (updater: SetStateAction<AppComment[]>) => void;
    setSuggestedFurniture: (updater: SetStateAction<SuggestedFurnitureItem[]>) => void;
    setPlumbingLayout: (updater: SetStateAction<PlumbingLine[]>) => void;
    setElectricalLayout: (updater: SetStateAction<ElectricalLayout | null>) => void;
    setHvacLayout: (updater: SetStateAction<HvacLayout | null>) => void;
    setDrawingSet: (updater: SetStateAction<GFCDrawingSet | null>) => void;
    setLayers: (updater: SetStateAction<Layer[]>) => void;
    setActiveLayerId: (updater: SetStateAction<string>) => void;
    addLayer: (name: string) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    deleteLayer: (id: string) => void;
    setActiveLevelIndex: (updater: SetStateAction<number>) => void;
    setPlanNorthDirection: (updater: SetStateAction<string>) => void;
    setPropertyLines: (updater: SetStateAction<PropertyLine[]>) => void;
    setTerrainMesh: (updater: SetStateAction<TerrainMesh | null>) => void;
    setZones: (updater: SetStateAction<Zone[]>) => void;
    setInfrastructure: (updater: SetStateAction<InfrastructureLine[]>) => void;
    setStagingSettings: (updater: SetStateAction<StagingSettings>) => void;
    setSavedCameraViews: (updater: SetStateAction<CameraView[]>) => void;
    setSelectedObject: (payload: SetStateAction<SelectedObject | null>) => void;
    deleteSelectedObject: () => void;
    setSunPosition: (updater: SetStateAction<SunPosition>) => void;
    setAdvancedStructuralReport: (report: AdvancedStructuralReport | null) => void;
    setVastuGridAnalysis: (analysis: VastuGridAnalysis | null) => void;
    setConstructionSequence: (updater: SetStateAction<ConstructionPhase[] | null>) => void;
    setActiveTimelineWeek: (updater: SetStateAction<number | null>) => void;
    setAiFixPreview: (updater: SetStateAction<AiFixResponse | null>) => void;
    setShowVastuGrid: (updater: SetStateAction<boolean>) => void;
    setShowElectricalLayer: (show: boolean) => void;
    setShowHvacLayer: (show: boolean) => void;
    setActiveTool: (tool: PhoenixEngineTab) => void;
    setActiveSketcherTool: (tool: SketcherTool) => void;
    setEditorMode: (mode: EditorMode) => void;
    setFocusedCommentId: (id: string | null) => void;
    setIsCompanionActive: (updater: SetStateAction<boolean>) => void;
    setCompanionState: (state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error') => void;
    setCompanionTranscript: (transcript: string | null) => void;
    addCompanionLog: (entry: Omit<AICompanionLogEntry, 'id' | 'timestamp'>) => void;
    setIsWalkthroughActive: (updater: SetStateAction<boolean>) => void;
    setCinematicTourData: (updater: SetStateAction<CinematicTour | null>) => void;
    setIsCinematicTourPlaying: (updater: SetStateAction<boolean>) => void;
    setGeneratedDocuments: (docs: GeneratedDocument[]) => void;
    setGeneratedRenders: (renders: GeneratedRender[]) => void;
    setBillOfQuantities: (report: BillOfQuantitiesReport | null) => void;
    setSustainabilityReport: (report: SustainabilityReport | null) => void;
    setCurrentPlacingModelKey: (key: string | null) => void;
    setProjectAnalyticsData: (data: ProjectAnalyticsData | null) => void;
    setUserAnalytics: (data: UserAnalyticsData | null) => void;
    setLokaSimulatorReport: (report: LokaSimulatorReport | null) => void;
    setNavagrahaReport: (report: NavagrahaReport | null) => void;
    setAkashaReport: (report: AkashaReport | null) => void;
    setSamsaraReport: (report: SamsaraReport | null) => void;
    setShilpaSutraReport: (report: ShilpaSutraReport | null) => void;
    setPrithviAstraReport: (report: PrithviAstraReport | null) => void;
    setAgniAstraReport: (report: AgniAstraReport | null) => void;
    setNexusReport: (report: NexusReport | null) => void;
    setAtmanSignatureReport: (report: AtmanSignatureResponse | null) => void;
    setParamAstraReport: (report: ParamAstraResponse | null) => void;
    setSvaDharmaReport: (report: SvaDharmaResponse | null) => void;
    setSanjeevaniReport: (report: SanjeevaniReport | null) => void;
    setIsHolocronAuthoringMode: (active: boolean) => void;
    updateHolocronHotspots: (hotspots: HolocronHotspot[]) => void;
    onViewCommentThread: (commentId: string) => void;
    onBuyCreditsClick: () => void;
    addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, 'id'>) => void;
    dismissProactiveSuggestion: (id: string) => void;
    setContextMenu: (menu: { x: number; y: number; object: SelectedObject | null } | null) => void;
    setGenerativeFeedbackActive: (isActive: boolean) => void;
    setLaunchSequenceActive: (isActive: boolean, showNotification?: boolean) => void;
    setWelcomeModalOpen: (isOpen: boolean) => void;
    startInteractiveTutorial: () => void;
    advanceTutorialStep: () => void;
    endInteractiveTutorial: () => void;
    completeOnboardingChecklistItem: (item: keyof OnboardingChecklist) => void;
    markSpotlightSeen: (spotlightId: string) => void;
};

export interface ReadOnlySketcherProps {
    levels: Level[];
    activeLevelIndex: number;
    planNorthDirection: string;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    selectedObject: SelectedObject | null;
    currentProject: Project | null;
}

export interface SharedEditorProps {
    currentUser: User | null;
    projects: ProjectSummary[];
    currentProject: Project | null;
    levels: Level[];
    activeLevelIndex: number;
    planNorthDirection: string;
    propertyLines: PropertyLine[];
    terrainMesh: TerrainMesh | null;
    zones: Zone[];
    infrastructure: InfrastructureLine[];
    selectedObject: SelectedObject | null;
    setSelectedObject: (payload: SetStateAction<SelectedObject | null>) => void;
    stagingSettings: StagingSettings;
    savedCameraViews: CameraView[];
    sunPosition: SunPosition;
    constructionSequence: ConstructionPhase[] | null;
    activeTimelineWeek: number | null;
    isWalkthroughActive: boolean;
    aiFixPreview: AiFixResponse | null;
    cinematicTourData: CinematicTour | null;
    isCinematicTourPlaying: boolean;
    activeTool: PhoenixEngineTab;
    focusedCommentId: string | null;
    contextMenu: { x: number; y: number; object: SelectedObject | null } | null;
    advancedStructuralReport: AdvancedStructuralReport | null;
    vastuGridAnalysis: VastuGridAnalysis | null;
    showVastuGrid: boolean;
    billOfQuantities: BillOfQuantitiesReport | null;
    sustainabilityReport: SustainabilityReport | null;
    lokaSimulatorReport: LokaSimulatorReport | null;
    collaborators: Collaborator[];
    liveSelections: Record<string, LiveSelection>;
    liveCursors: Record<string, LiveCursor>;
    isDigitalTwinModeActive: boolean;
    digitalTwinData: DigitalTwinData | null;
    activeDataOverlays: DigitalTwinDataOverlay;
    currentPlacingModelKey: string | null;
    atmanSignature: string | null;
    atmanSignatureReport: AtmanSignatureResponse | null; // ADDED
    svaDharmaReport: SvaDharmaResponse | null;
    paramAstraReport: ParamAstraResponse | null;
    sanjeevaniReport: SanjeevaniReport | null;
    runSvaDharmaAnalyzer: () => Promise<void>;
    set: (updater: Partial<AppState> | ((state: AppStore) => Partial<AppState>)) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    pushToUndoStack: () => void;
    setLevels: (updater: SetStateAction<Level[]>) => void;
    setSingleLevelProp: <K extends keyof Level>(prop: K, data: SetStateAction<Level[K]>) => void;
    setActiveTool: (tool: PhoenixEngineTab) => void;
    togglePanelVisibility: (panelId: PanelId) => void;
    onBuyCreditsClick: () => void;
    refreshCurrentUser: () => Promise<void>;
    addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, 'id'>) => void;
    onViewCommentThread: (commentId: string) => void;
    setAdvancedStructuralReport: (report: AdvancedStructuralReport | null) => void;
    setVastuGridAnalysis: (analysis: VastuGridAnalysis | null) => void;
    setBillOfQuantities: (report: BillOfQuantitiesReport | null) => void;
    setSustainabilityReport: (report: SustainabilityReport | null) => void;
    setSunPosition: (updater: SetStateAction<SunPosition>) => void;
    setStagingSettings: (updater: SetStateAction<StagingSettings>) => void;
    setCurrentPlacingModelKey: (key: string | null) => void;
    setAiFixPreview: (updater: SetStateAction<AiFixResponse | null>) => void;
    setCinematicTourData: (updater: SetStateAction<CinematicTour | null>) => void;
    setDrawingSet: (updater: SetStateAction<GFCDrawingSet | null>) => void;
    setFocusedCommentId: (id: string | null) => void;
    setGeneratedDocuments: (docs: GeneratedDocument[]) => void;
    setGeneratedRenders: (renders: GeneratedRender[]) => void;
    setLokaSimulatorReport: (report: LokaSimulatorReport | null) => void;
    setNavagrahaReport: (report: NavagrahaReport | null) => void;
    setAkashaReport: (report: AkashaReport | null) => void;
    setSamsaraReport: (report: SamsaraReport | null) => void;
    setShilpaSutraReport: (report: ShilpaSutraReport | null) => void;
    setPrithviAstraReport: (report: PrithviAstraReport | null) => void;
    setNexusReport: (report: NexusReport | null) => void;
    setParamAstraReport: (report: ParamAstraResponse | null) => void;
    setSanjeevaniReport: (report: SanjeevaniReport | null) => void;
    setAtmanSignatureReport: (report: AtmanSignatureResponse | null) => void;
    setShowVastuGrid: (updater: SetStateAction<boolean>) => void;
    completeOnboardingChecklistItem: (item: keyof OnboardingChecklist) => void;
    deleteSelectedObject: () => void;
    runAiFurnishRoom: (roomId: string, style: string, useAtmanSignature: boolean) => Promise<void>;
    setView: (view: AppView) => void;
    setContextMenu: (menu: { x: number; y: number; object: SelectedObject | null } | null) => void;
}

export interface PhoenixEnginePanelProps extends SharedEditorProps {}

export interface FloorPlanSketcherSectionProps extends SharedEditorProps {
    currentTool: SketcherTool;
    setActiveSketcherTool: (tool: SketcherTool) => void;
    editorMode: EditorMode;
    setEditorMode: (mode: EditorMode) => void;
    setWalls: (updater: SetStateAction<Wall[]>) => void;
    addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, 'id'>) => void;
    onViewCommentThread: (commentId: string) => void;
    addPlacement: (placement: Omit<Placement, 'id' | 'layerId'>) => void;
    addDimensionLine: (line: Omit<DimensionLine, 'id' | 'layerId'>) => void;
}