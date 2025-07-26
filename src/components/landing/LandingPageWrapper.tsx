

// src/components/landing/LandingPageWrapper.tsx
import React from 'react';
import { LandingPricing } from './LandingPricing';
import { LandingFeaturesGrid } from './LandingFeaturesGrid';
import { LandingValueFlow } from './LandingValueFlow';
import { LandingManifesto } from './LandingManifesto';
import { useAppStore } from '../../state/appStore';
import { CreditPack } from '../../types';
import { Header } from '../Header';
import { Footer } from '../Footer';

interface LandingPageWrapperProps {
  onGetStarted: () => void;
}

export const LandingPageWrapper: React.FC<LandingPageWrapperProps> = ({ onGetStarted }) => {
  const { currentUser, setBuyCreditsModalOpen } = useAppStore(state => ({
    currentUser: state.currentUser,
    setBuyCreditsModalOpen: state.setBuyCreditsModalOpen,
  }));
  
  const handleBuyCreditsClick = (pack: CreditPack) => {
    setBuyCreditsModalOpen(true, pack);
  };

  return (
    <div className="flex-grow flex flex-col">
      <Header />
      <main className="flex-grow">
          <div className="bg-background/50">
            <LandingManifesto onGetStarted={onGetStarted} />
            <LandingValueFlow />
            <LandingFeaturesGrid />
            <LandingPricing 
              onGetStarted={onGetStarted} 
              currentUser={currentUser} 
              onBuyCreditsClick={handleBuyCreditsClick}
            />
          </div>
      </main>
      <Footer />
    </div>
  );
};