// src/components/landing/LandingManifesto.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroVisuals } from './HeroVisuals';
import { Button } from '../ui/Button';
import { useAppStore } from '../../state/appStore';

interface LandingManifestoProps {
    onGetStarted: () => void;
}

const creed = [
    { key: 'spark', duration: 4000, text: 'A single spark of an idea.', prompt: 'a 2BHK vastu home' },
    { key: 'genesis', duration: 4000, text: 'Becomes a blueprint for reality.' },
    { key: 'intelligence', duration: 4000, text: 'Infused with divine intelligence.' },
    { key: 'beauty', duration: 5000, text: 'Forged into unparalleled beauty.' },
    { key: 'empire', duration: 5000, text: 'The foundation of an empire.' },
    { key: 'revolt', duration: 6000, text: 'This is not just software. It is a statement.' },
    { key: 'final_cta', duration: 12000, text: "Our Revolt Never Stops." },
];


const textVariant: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.43, 0.13, 0.23, 0.96] } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] } },
};

const MotionP = motion.p as any;
const MotionDiv = motion.div as any;

export const LandingManifesto: React.FC<LandingManifestoProps> = ({ onGetStarted }) => {
    const [index, setIndex] = useState(0);
    const { currentUser, setView } = useAppStore(state => ({
        currentUser: state.currentUser,
        setView: state.setView,
    }));

    useEffect(() => {
        const timer = setTimeout(() => {
            setIndex((prevIndex) => (prevIndex + 1) % creed.length);
        }, creed[index].duration);
        return () => clearTimeout(timer);
    }, [index]);

    const currentCreed = creed[index];
    const isFinalCta = currentCreed.key === 'final_cta';

    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
            <HeroVisuals visualKey={currentCreed.key} promptText={currentCreed.prompt} />
            <div className="relative z-20 p-8">
                <AnimatePresence mode="wait">
                    <MotionDiv key={currentCreed.key}>
                        <div className="overflow-hidden">
                            <MotionP
                                variants={textVariant}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={`text-4xl sm:text-5xl md:text-6xl font-extrabold text-shadow-custom max-w-4xl mx-auto ${isFinalCta ? 'text-primary' : ''}`}
                            >
                                {currentCreed.text}
                            </MotionP>
                        </div>
                    </MotionDiv>
                </AnimatePresence>
                <MotionDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button
                        size="lg"
                        onClick={currentUser ? () => setView('userDashboard') : onGetStarted}
                        className={`font-semibold text-lg ${isFinalCta ? 'animate-pulse-subtle' : ''}`}
                    >
                        {currentUser ? 'Open Dashboard' : 'Get Started Free'}
                    </Button>
                    <Button
                        size="lg"
                        variant="ghost"
                        onClick={() => {
                            const enginesSection = document.getElementById('engines');
                            enginesSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="font-semibold text-lg"
                    >
                        See the AI in Action
                    </Button>
                </MotionDiv>
            </div>
        </section>
    );
};