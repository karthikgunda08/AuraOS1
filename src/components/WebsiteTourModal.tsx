// src/components/WebsiteTourModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../state/appStore';

interface Scene {
    id: string;
    duration: number;
    text: string;
    component: React.FC;
}

const MotionDiv = motion.div as any;
const MotionPath = motion.path as any;
const MotionP = motion.p as any;

const DashboardScene: React.FC = () => (
    <div className="w-full h-full p-8 grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
             <MotionDiv
                key={i}
                className="bg-slate-700/50 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.2, duration: 0.5 } }}
                exit={{ opacity: 0, y: 20 }}
            />
        ))}
    </div>
);

const EditorScene: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 200 150" className="w-2/3 h-2/3">
            <MotionPath
                d="M 20 20 L 180 20 L 180 130 L 20 130 L 20 20 M 20 75 L 180 75 M 100 20 L 100 130"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: { duration: 2, ease: "easeInOut" } }}
                exit={{ opacity: 0 }}
            />
        </svg>
    </div>
);

const ThreeDScene: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center [perspective:800px]">
        <MotionDiv
            className="w-40 h-40 bg-transparent [transform-style:preserve-3d]"
            initial={{ rotateX: -30, rotateY: 30, scale: 0 }}
            animate={{ rotateX: -30, rotateY: 30, scale: 1, transition: { duration: 1 } }}
            exit={{ scale: 0 }}
        >
             <div className="absolute w-40 h-40 bg-primary/20 border border-primary [transform:rotateY(0deg)_translateZ(20px)]"></div>
             <div className="absolute w-40 h-40 bg-primary/20 border border-primary [transform:rotateY(180deg)_translateZ(20px)]"></div>
             <div className="absolute w-40 h-40 bg-primary/20 border border-primary [transform:rotateY(90deg)_translateZ(20px)]"></div>
             <div className="absolute w-40 h-40 bg-primary/20 border border-primary [transform:rotateY(-90deg)_translateZ(20px)]"></div>
        </MotionDiv>
    </div>
);

const AnalysisScene: React.FC = () => (
    <div className="w-full h-full p-8 flex flex-col gap-2">
        {['Structural Analysis: ✅ PASS', 'Vastu Compliance: ⚠️ WARNING', 'Cost Estimation: ₹4,500,000'].map((item, i) => (
             <MotionDiv
                key={i}
                className="bg-slate-700/50 rounded-lg p-3 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.4, duration: 0.5 } }}
                exit={{ opacity: 0, x: -20 }}
            >
                {item}
            </MotionDiv>
        ))}
    </div>
);

const RenderScene: React.FC = () => (
    <MotionDiv
        className="w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url('/videos/hero-poster.jpg')` }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1, transition: { duration: 1.5 } }}
        exit={{ opacity: 0 }}
    />
);

const CollaborationScene: React.FC = () => (
     <div className="w-full h-full relative">
        {[...Array(5)].map((_, i) => (
            <MotionDiv
                key={i}
                className="absolute w-12 h-12 rounded-full bg-slate-700 border-2 border-slate-500"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.15, type: 'spring' } }}
                exit={{ opacity: 0, scale: 0 }}
                style={{
                    top: `${20 + Math.sin(i * 1.5) * 30}%`,
                    left: `${20 + Math.cos(i * 2.5) * 30}%`
                }}
            />
        ))}
    </div>
);

const FinalCtaScene: React.FC = () => (
    <MotionDiv
        className="w-full h-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1.5 } }}
        exit={{ opacity: 0 }}
    >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-24 h-24">
            <defs><linearGradient id="g-tour" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(var(--primary))" /><stop offset="100%" stop-color="#FBBF24" /></linearGradient></defs>
            <path fill="none" stroke="url(#g-tour)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 3L2 12h5v8h10v-8h5L12 3z"/><path fill="none" stroke="hsl(48, 95%, 58%)" strokeWidth="1" d="M12 21V12l-5 4.5" opacity="0.7"/>
        </svg>
    </MotionDiv>
);


const scenes: Scene[] = [
    { id: 'dashboard', duration: 4000, text: "Welcome to your Command Center.", component: DashboardScene },
    { id: 'editor', duration: 4000, text: "From a simple idea...", component: EditorScene },
    { id: '3d', duration: 4000, text: "...to a stunning 3D reality. Instantly.", component: ThreeDScene },
    { id: 'analysis', duration: 4000, text: "Unleash the power of AI analysis.", component: AnalysisScene },
    { id: 'render', duration: 4000, text: "Visualize your creation with photorealistic renders.", component: RenderScene },
    { id: 'collab', duration: 4000, text: "Collaborate with your team in real-time.", component: CollaborationScene },
    { id: 'final', duration: 5000, text: "AuraOS. Architecting Reality. Start Your Free Trial.", component: FinalCtaScene }
];

const WebsiteTourModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [sceneIndex, setSceneIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSceneIndex(prev => (prev + 1) % scenes.length);
        }, scenes[sceneIndex].duration);

        return () => clearTimeout(timer);
    }, [sceneIndex]);
    
    const CurrentScene = scenes[sceneIndex].component;

    return (
        <div className="fixed inset-0 bg-black/90 z-[200] flex flex-col items-center justify-center p-4" onClick={onClose}>
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-20" aria-label="Close Tour">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="w-full max-w-4xl aspect-video bg-slate-800/50 rounded-lg border border-slate-700 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={scenes[sceneIndex].id}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <CurrentScene />
                    </MotionDiv>
                </AnimatePresence>
            </div>
            
            <div className="w-full max-w-4xl mt-4 h-12 text-center">
                 <AnimatePresence mode="wait">
                      <MotionP
                        key={scenes[sceneIndex].text}
                        className="text-white text-xl md:text-2xl font-semibold text-shadow-custom"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                          {scenes[sceneIndex].text}
                      </MotionP>
                 </AnimatePresence>
            </div>

             <div className="w-full max-w-sm mt-2">
                <div className="w-full bg-slate-700/50 rounded-full h-1">
                    <MotionDiv
                        key={sceneIndex}
                        className="bg-primary h-1 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: scenes[sceneIndex].duration / 1000, ease: 'linear' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default WebsiteTourModal;