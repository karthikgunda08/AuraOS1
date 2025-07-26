// src/components/landing/LandingFeaturesGrid.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { generatePublicGenesisPlanApi, generateShowcaseImageFromApi } from '../../services/geminiService';
import { AiSketchToPlanResponse, Room } from '../../types';
import { BlueprintCanvas } from './BlueprintCanvas';

type Engine = 'genesis' | 'helios' | 'oracle';

const engines = [
    { id: 'genesis', name: 'Genesis Engine', icon: '💡', description: 'Text-to-Plan Generation' },
    { id: 'helios', name: 'Helios Engine', icon: '🖼️', description: 'Photorealistic Rendering' },
    { id: 'oracle', name: 'Oracle AI', icon: '🔮', description: 'Market & Data Analysis' },
];

const mockOracleResponse = {
    summary: "Based on current market data for Goa, a luxury villa project shows strong viability. Demand is high, and rental yields for high-end properties are estimated at 5-8% annually. Key considerations include sourcing premium materials and managing local construction timelines.",
    data: [
        { label: "Est. Land Cost (Goa, Coastal)", value: "₹40,000 - ₹75,000 / sq. meter" },
        { label: "Avg. Construction Cost (Luxury)", value: "₹3,000 - ₹4,500 / sq. foot" },
        { label: "Est. Rental Yield", value: "5-8% per annum" },
    ]
};

const MotionDiv = motion.div as any;

const EngineButton: React.FC<{ isActive: boolean; onClick: () => void; engine: typeof engines[0] }> = ({ isActive, onClick, engine }) => (
    <button
        onClick={onClick}
        className={`w-full p-4 text-left rounded-lg transition-all duration-200 border-l-4 ${
            isActive ? 'bg-slate-700 border-sky-400' : 'bg-transparent border-slate-600 hover:bg-slate-700/50'
        }`}
    >
        <div className="flex items-center gap-4">
            <span className="text-3xl">{engine.icon}</span>
            <div>
                <h4 className="font-bold text-white">{engine.name}</h4>
                <p className="text-sm text-slate-400">{engine.description}</p>
            </div>
        </div>
    </button>
);

const GenesisDemo: React.FC = () => {
    const [prompt, setPrompt] = useState('A 1200 sq.ft. Vastu-compliant 2BHK house with an open kitchen and a study.');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AiSketchToPlanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await generatePublicGenesisPlanApi(prompt);
            setResult(res);
        } catch (err: any) {
            setError(err.message || 'Failed to generate plan.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <p className="text-sm text-slate-300 mb-4">Describe the building you want to create. The AI will generate a floor plan from your text.</p>
            <div className="flex gap-2">
                <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A modern 2BHK house..."
                    disabled={isLoading}
                />
                <Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Generating...' : 'Generate'}</Button>
            </div>
            <div className="mt-4 aspect-video w-full rounded-lg bg-blue-900/50 border border-slate-700 overflow-hidden">
                <BlueprintCanvas
                    walls={result?.levels?.[0]?.walls || []}
                    rooms={result?.levels?.[0]?.rooms as Room[]}
                    isLoading={isLoading}
                />
            </div>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
        </div>
    );
};

const HeliosDemo: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('/videos/hero-poster.jpg');
    
    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            // There are 3 showcase prompts at indices 3, 4, 5 on the backend.
            const randomIndex = 3 + Math.floor(Math.random() * 3);
            const res = await generateShowcaseImageFromApi(randomIndex);
            setImageUrl(res.imageUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <p className="text-sm text-slate-300 mb-4">Click the button to have the Helios Engine generate a photorealistic architectural render.</p>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
                {isLoading ? 'Rendering...' : 'Generate Photorealistic Image'}
            </Button>
            <div className="mt-4 aspect-video w-full rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                {isLoading ? <div className="text-slate-300">AI is rendering...</div> : <img src={imageUrl} alt="AI Render" className="w-full h-full object-cover" />}
            </div>
        </div>
    );
};

const OracleDemo: React.FC = () => {
    return (
         <div>
            <p className="text-sm text-slate-300 mb-4">The Oracle AI provides real-world data analysis for your projects. Here's a sample analysis for a luxury villa project in Goa.</p>
            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                <p className="text-sm text-slate-200 italic">"{mockOracleResponse.summary}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                    {mockOracleResponse.data.map(item => (
                        <div key={item.label} className="bg-slate-700/50 p-3 rounded-md">
                            <p className="text-xs text-slate-400">{item.label}</p>
                            <p className="font-semibold text-sky-300">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export const LandingFeaturesGrid: React.FC = () => {
    const [activeEngine, setActiveEngine] = useState<Engine>('genesis');
    
    return (
        <section id="engines" className="py-16 md:py-24">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Experience the Engines</h2>
                    <p className="text-lg text-slate-300 max-w-3xl mx-auto font-body">
                        Don't just read about our features—interact with them. See how our core AI engines work right now.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 space-y-2">
                        {engines.map(engine => (
                            <EngineButton
                                key={engine.id}
                                engine={engine}
                                isActive={activeEngine === engine.id}
                                onClick={() => setActiveEngine(engine.id as Engine)}
                            />
                        ))}
                    </div>
                    <div className="w-full md:w-2/3 bg-slate-800/50 p-6 rounded-xl border border-slate-700 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <MotionDiv
                                key={activeEngine}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeEngine === 'genesis' && <GenesisDemo />}
                                {activeEngine === 'helios' && <HeliosDemo />}
                                {activeEngine === 'oracle' && <OracleDemo />}
                            </MotionDiv>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};
