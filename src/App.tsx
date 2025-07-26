// src/App.tsx
import React, { Suspense, useEffect } from 'react';
import { useAppStore } from './state/appStore';
import { NotificationContainer } from './components/NotificationContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalSpinner } from './components/GlobalSpinner';
import { AnimatePresence } from 'framer-motion';

// Lazy-loaded components for different views
const LandingPageWrapper = React.lazy(() => import('./components/landing/LandingPageWrapper').then(m => ({ default: m.LandingPageWrapper })));
const ProjectDashboard = React.lazy(() => import('./components/dashboard/ProjectDashboard'));
const AuraOSWrapper = React.lazy(() => import('./components/AuraOS/AuraOSWrapper'));
const WorldBuilder = React.lazy(() => import('./components/WorldBuilder'));
const KwinCityShowcaseView = React.lazy(() => import('./components/KwinCityShowcaseView'));
const BrahmaAstraEngineView = React.lazy(() => import('./components/brahmaAstra/BrahmaAstraEngineView'));
const MarketplaceView = React.lazy(() => import('./components/marketplace/MarketplaceView'));
const RealEstateExchangeView = React.lazy(() => import('./components/exchange/RealEstateExchangeView'));
const WalletView = React.lazy(() => import('./components/wallet/WalletView'));
const AstraSupplyChainView = React.lazy(() => import('./components/AstraSupplyChainView'));
const ChroniclesView = React.lazy(() => import('./components/chronicles/ChroniclesView'));
const GuildsView = React.lazy(() => import('./components/guilds/GuildsView'));
const ClientPortalView = React.lazy(() => import('./components/ClientPortalView'));
const ArchitectsFolioView = React.lazy(() => import('./components/ArchitectsFolioView'));
const HolocronView = React.lazy(() => import('./components/HolocronView'));
const ResetPasswordPage = React.lazy(() => import('./components/ResetPasswordPage'));
const FoundationPage = React.lazy(() => import('./components/foundation/FoundationPage'));
const AuthModal = React.lazy(() => import('./components/AuthModal'));
const ProfilePage = React.lazy(() => import('./components/ProfilePage'));
const BuyCreditsModal = React.lazy(() => import('./components/BuyCreditsModal'));
const HelpSupportModal = React.lazy(() => import('./components/HelpSupportModal'));
const FeedbackModal = React.lazy(() => import('./components/FeedbackModal'));
const SupportAgentModal = React.lazy(() => import('./components/SupportAgentModal'));
const LaunchSequence = React.lazy(() => import('./components/dashboard/LaunchSequence'));
const AuraCommandCenter = React.lazy(() => import('./components/AuraOS/AuraCommandCenter'));
const ProactiveAIWidget = React.lazy(() => import('./components/ProactiveAIWidget'));
const CommunityShowcase = React.lazy(() => import('./components/community/CommunityShowcase'));
const PublicProfileView = React.lazy(() => import('./components/community/PublicProfileView'));
const TokenizeModal = React.lazy(() => import('./components/dashboard/TokenizeModal'));
const WelcomeModal = React.lazy(() => import('./components/onboarding/WelcomeModal')); 
const ProjectModal = React.lazy(() => import('./components/ProjectModal'));


export const App: React.FC = () => (
    <ErrorBoundary>
        <AppContent />
    </ErrorBoundary>
);

const AppContent: React.FC = () => {
    const { 
        view, currentUser, globalLoadingMessage, isProfilePageOpen, 
        isHelpModalOpen, isFeedbackModalOpen, isSupportModalOpen, isBuyCreditsModalOpen,
        isTokenizeModalOpen, projectToTokenize, setTokenizeModalOpen,
        authModal, initApp, isLaunchSequenceActive, isWelcomeModalOpen,
        isNewProjectModalOpen, setNewProjectModalOpen // Added for new project modal
    } = useAppStore();

    useEffect(() => {
        initApp();
    }, [initApp]);

    const renderView = () => {
        const path = window.location.pathname;
        if (path.startsWith('/client/')) return <ClientPortalView />;
        if (path.startsWith('/folio/')) return <ArchitectsFolioView />;
        if (path.startsWith('/holocron/')) {
            const shareableLink = path.split('/holocron/')[1];
            return <HolocronView shareableLink={shareableLink} />;
        }
        if (path.startsWith('/reset-password/')) {
            const token = path.split('/reset-password/')[1];
            return <ResetPasswordPage token={token} />;
        }
         if (path.startsWith('/kwin-city')) return <KwinCityShowcaseView />;
         if (path.startsWith('/foundation')) return <FoundationPage />;
         if (path.startsWith('/chronicles')) return <ChroniclesView />;
         if (path.startsWith('/guilds')) return <GuildsView />;
         if (path.startsWith('/showcase')) return <CommunityShowcase />;
         if (path.startsWith('/profiles/')) {
            const userId = path.split('/profiles/')[1];
            return <PublicProfileView userId={userId} />;
         }


        switch (view) {
            case 'landing': return <LandingPageWrapper onGetStarted={() => useAppStore.setState({ authModal: 'register' })} />;
            case 'userDashboard': return <ProjectDashboard />;
            case 'auraOS': return <AuraOSWrapper />;
            case 'worldBuilder': return <WorldBuilder />;
            case 'brahmaAstra': return <BrahmaAstraEngineView />;
            case 'marketplace': return <MarketplaceView />;
            case 'realEstateExchange': return <RealEstateExchangeView />;
            case 'wallet': return <WalletView />;
            case 'astraSupplyChain': return <AstraSupplyChainView />;
            case 'auraCommandCenter': return <AuraCommandCenter />;
            default: return <LandingPageWrapper onGetStarted={() => useAppStore.setState({ authModal: 'register' })} />;
        }
    };

    const mainContainerClass = currentUser ? 'animated-holo-grid' : 'bg-background';

    return (
        <div className={`min-h-screen flex flex-col font-sans text-foreground ${mainContainerClass}`}>
            <NotificationContainer />
             <AnimatePresence>
                {isLaunchSequenceActive && <LaunchSequence />}
            </AnimatePresence>
            <Suspense fallback={<GlobalSpinner message="Loading..." />}>
                {!isLaunchSequenceActive && renderView()}
                {authModal && <AuthModal />}
                {isProfilePageOpen && <ProfilePage />}
                {isBuyCreditsModalOpen && <BuyCreditsModal isOpen={isBuyCreditsModalOpen} onClose={() => useAppStore.setState({ isBuyCreditsModalOpen: false, selectedCreditPack: null })} />}
                {isHelpModalOpen && <HelpSupportModal onClose={() => useAppStore.setState({ isHelpModalOpen: false })} />}
                {isFeedbackModalOpen && <FeedbackModal onClose={() => useAppStore.setState({ isFeedbackModalOpen: false })} />}
                {isSupportModalOpen && <SupportAgentModal onClose={() => useAppStore.setState({ isSupportModalOpen: false })} />}
                {isTokenizeModalOpen && projectToTokenize && <TokenizeModal project={projectToTokenize} onClose={() => setTokenizeModalOpen(false, null)} onTokenized={() => { /* onPublished logic here if needed */ }} />}
                {isWelcomeModalOpen && <WelcomeModal />}
                {isNewProjectModalOpen && <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setNewProjectModalOpen(false)} />}
            </Suspense>
             {!isLaunchSequenceActive && currentUser && <ProactiveAIWidget />}
            {globalLoadingMessage && <GlobalSpinner message={globalLoadingMessage} />}
        </div>
    );
};