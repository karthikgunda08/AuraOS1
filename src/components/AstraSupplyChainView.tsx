// src/components/AstraSupplyChainView.tsx
import React, { useState, useEffect } from 'react';
import { Quote } from '../../types';
import * as astraService from '../../services/astraService';
import { LoadingSpinner } from '../LoadingSpinner';
import { useNotificationStore } from '../../state/notificationStore';

const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => {
    const statusStyles = {
        pending: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
        accepted: 'bg-green-900/50 text-green-300 border-green-700',
        rejected: 'bg-red-900/50 text-red-300 border-red-700',
    };

    const supplierName = (quote.supplierId && typeof quote.supplierId === 'object' && 'name' in quote.supplierId) 
        ? quote.supplierId.name 
        : 'Unknown Supplier';

    return (
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-slate-100">{quote.materialName}</h4>
                    <p className="text-sm text-cyan-300">from {supplierName}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[quote.status]}`}>
                    {quote.status}
                </span>
            </div>
            <div className="mt-3 flex justify-between items-end">
                <p className="text-sm text-slate-400">{quote.quantity} {quote.unit}</p>
                <p className="text-2xl font-bold text-green-400">₹{quote.price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
};

const AstraSupplyChainView: React.FC = () => {
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        astraService.getUserQuotes()
            .then(data => {
                if (Array.isArray(data)) {
                    setQuotes(data);
                }
            })
            .catch(err => {
                addNotification(`Failed to load quotes: ${err.message}`, 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [addNotification]);
    
    const quotesByProject = quotes.reduce<Record<string, Quote[]>>((acc, quote) => {
        const projectName = (quote.projectId && typeof quote.projectId === 'object' && 'name' in quote.projectId) 
            ? quote.projectId.name 
            : 'Unknown Project';
        if (!acc[projectName]) {
            acc[projectName] = [];
        }
        acc[projectName].push(quote);
        return acc;
    }, {});


    return (
        <div className="flex-grow p-8 bg-slate-900 text-white animated-gradient-bg-studio">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-cyan-300">Astra Global Supply Chain</h1>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Connect your designs to a real-time network of material suppliers. From automated RFQs to procurement management, Astra is the logistics backbone of your architectural empire.</p>
            </div>
            
            <div className="mt-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Your Live Quotes</h2>
                {isLoading ? (
                    <div className="flex justify-center"><LoadingSpinner /></div>
                ) : Object.keys(quotesByProject).length > 0 ? (
                    <div className="space-y-8">
                        {Object.keys(quotesByProject).map((projectName) => (
                            <div key={projectName}>
                                <h3 className="text-lg font-semibold text-slate-300 mb-3">{projectName}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {quotesByProject[projectName].map(quote => <QuoteCard key={quote._id} quote={quote} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                        <p className="text-slate-400">You have no active quotes.</p>
                        <p className="text-sm text-slate-500 mt-1">Generate a Bill of Quantities (BoQ) in the editor and request quotes to see them here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AstraSupplyChainView;