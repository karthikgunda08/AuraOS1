// src/components/BuyCreditsModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNotificationStore } from '../state/notificationStore';
import { CreditPack, RazorpayPaymentResponse } from '../types';
import { CREDIT_PACKS } from '../constants';
import { initiateCreditPurchase } from '../services/paymentService';
import { LoadingSpinner } from './LoadingSpinner';
import { useAppStore } from '../state/appStore';

interface BuyCreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const tierStyles = {
    explorer: 'border-sky-500',
    architect: 'border-purple-500',
    firm: 'border-amber-500 ring-2 ring-amber-400',
};

const tierButtonStyles = {
    explorer: 'bg-sky-600 hover:bg-sky-500',
    architect: 'bg-purple-600 hover:bg-purple-500',
    firm: 'bg-amber-600 hover:bg-amber-500',
};

const tierIcons = {
    explorer: '🚀',
    architect: '💎',
    firm: '🏢'
};

const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose }) => {
    const { currentUser, refreshCurrentUser, selectedCreditPack } = useAppStore(state => ({
        currentUser: state.currentUser,
        refreshCurrentUser: state.refreshCurrentUser,
        selectedCreditPack: state.selectedCreditPack,
    }));
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    const handlePurchase = useCallback(async (pack: CreditPack) => {
        if (!currentUser) {
            addNotification("Please log in to purchase credits.", "error");
            return;
        }
        setIsLoading(pack.id);

        await initiateCreditPurchase({
            currentUser,
            creditPack: pack,
            onPaymentSuccess: (response: RazorpayPaymentResponse) => {
                addNotification(`${pack.name} purchased successfully! Credits will be added to your account shortly.`, "success");
                refreshCurrentUser();
                onClose();
            },
            onPaymentError: (error) => {
                addNotification(error.description || "Payment failed. Please try again.", "error");
                setIsLoading(null);
                if (selectedCreditPack) onClose();
            },
            onModalDismiss: () => {
                addNotification("Payment process was cancelled.", "info");
                if (selectedCreditPack) onClose();
                setIsLoading(null);
            }
        });
    }, [currentUser, addNotification, refreshCurrentUser, onClose, selectedCreditPack]);

    useEffect(() => {
        if (isOpen && selectedCreditPack && !isLoading) {
            handlePurchase(selectedCreditPack);
        }
    }, [isOpen, selectedCreditPack, isLoading, handlePurchase]);
    
    useEffect(() => {
      if (!isOpen) setIsLoading(null);
    }, [isOpen]);

    if (!isOpen) return null;

    if (selectedCreditPack && isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex flex-col items-center justify-center z-[100]">
                <LoadingSpinner size="h-10 w-10" color="text-amber-400" />
                <p className="mt-4 text-white text-lg">Initiating purchase for {selectedCreditPack.name}...</p>
                <p className="text-slate-400">Please wait for the payment gateway.</p>
            </div>
        );
    }
    
    return (
        <div
            className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[100] animate-fade-in-up"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-5xl m-4 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-amber-300">Fuel Your Vision</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-sky-300 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-300 mb-8 text-center max-w-2xl mx-auto">Purchase AI Credits to unlock premium features like plan generation, photorealistic rendering, and advanced analysis.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {CREDIT_PACKS.map(pack => (
                        <div key={pack.id} className={`flex flex-col p-6 rounded-lg bg-slate-800/50 border ${tierStyles[pack.tier] || tierStyles.explorer} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}>
                            <div className="text-4xl mb-3">{tierIcons[pack.tier] || '📦'}</div>
                            <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                            <p className="text-4xl font-extrabold text-amber-400 my-4">{pack.credits.toLocaleString()} <span className="text-lg font-medium text-slate-300">Credits</span></p>
                            <p className="text-sm text-slate-400 flex-grow mb-6">{pack.description}</p>
                            <button
                                onClick={() => handlePurchase(pack)}
                                disabled={!!isLoading}
                                className={`w-full flex items-center justify-center px-6 py-3 text-md font-semibold rounded-md shadow-lg text-white transition-colors disabled:opacity-50 disabled:cursor-wait ${tierButtonStyles[pack.tier] || tierButtonStyles.explorer}`}
                            >
                                {isLoading === pack.id ? <LoadingSpinner size="h-5 w-5 mr-2"/> : null}
                                {isLoading === pack.id ? 'Processing...' : `Buy for ₹${pack.price.toLocaleString('en-IN')}`}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BuyCreditsModal;