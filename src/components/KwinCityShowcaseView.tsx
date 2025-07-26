// src/components/KwinCityShowcaseView.tsx
import React from 'react';
import { InfoPanel } from './kwin-city/InfoPanel';
import { ThreeDScene } from './kwin-city/ThreeDScene';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

export const KwinCityShowcaseView: React.FC = () => {
    return (
        <div className="cosmic-background min-h-full py-12 md:py-16 flex flex-col">
            <header className="text-center mb-8 max-w-4xl mx-auto px-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">
                    Kwin City, Bangalore
                </h1>
                <p className="mt-4 text-lg text-slate-300">
                    A 40,000-acre AI-engineered metropolis, ready for construction. Explore the 3D master plan.
                </p>
            </header>
            <div className="container mx-auto px-4 flex-grow grid lg:grid-cols-12 gap-8">
                <MotionDiv 
                    className="lg:col-span-3"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <InfoPanel />
                </MotionDiv>
                <MotionDiv 
                    className="lg:col-span-9"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                >
                    <div className="w-full h-[70vh] min-h-[500px] bg-slate-900/50 rounded-xl border border-slate-700">
                        <ThreeDScene />
                    </div>
                </MotionDiv>
            </div>
        </div>
    );
};

export default KwinCityShowcaseView;
