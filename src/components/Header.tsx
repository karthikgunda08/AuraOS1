
// src/components/Header.tsx
import React from 'react';
import { useAppStore } from '../state/appStore';
import { Button } from './ui/Button';
import { AuraLogo } from './AuraLogo';

export const Header: React.FC = () => {
    const { currentUser, setAuthModal, setView } = useAppStore(state => ({
        currentUser: state.currentUser,
        setAuthModal: state.setAuthModal,
        setView: state.setView,
    }));

    const navigateToShowcase = () => {
      // Use pushState to change URL without a full page reload
      window.history.pushState({}, '', '/showcase');
      // Create and dispatch a popstate event to trigger the router in App.tsx
      window.dispatchEvent(new PopStateEvent('popstate'));
    };

    return (
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                <button onClick={() => setView('landing')} className="flex items-center gap-3">
                    <AuraLogo className="h-8 w-8" />
                    <span className="text-xl font-bold text-white tracking-wider">AuraOS</span>
                </button>

                <nav className="hidden md:flex items-center gap-x-2">
                     <Button onClick={navigateToShowcase} variant="ghost" size="sm">Showcase</Button>
                     <Button onClick={() => setView('marketplace')} variant="ghost" size="sm">Marketplace</Button>
                     <Button onClick={() => setView('realEstateExchange')} variant="ghost" size="sm">Exchange</Button>
                </nav>

                <div className="flex items-center gap-x-4">
                    {currentUser ? (
                         <Button onClick={() => setView('userDashboard')} variant="ghost" size="sm">Dashboard</Button>
                    ) : (
                        <>
                            <Button onClick={() => setAuthModal('login')} variant="ghost" size="sm">Login</Button>
                            <Button onClick={() => setAuthModal('register')} size="sm">Sign Up</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};