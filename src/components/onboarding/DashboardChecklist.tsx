// src/components/onboarding/DashboardChecklist.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';
import { OnboardingChecklist } from '../../types';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const checklistItems: { key: keyof OnboardingChecklist; text: string }[] = [
    { key: 'profileCompleted', text: 'Complete your profile' },
    { key: 'projectCreated', text: 'Create your first project' },
    { key: 'aiToolUsed', text: 'Use any AI tool' },
    { key: 'versionSaved', text: 'Save a project version' },
];

const ChecklistItem: React.FC<{ text: string; isCompleted: boolean }> = ({ text, isCompleted }) => (
    <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`}>
            {isCompleted && <span className="text-white text-xs">✓</span>}
        </div>
        <span className={`transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
            {text}
        </span>
    </div>
);

const DashboardChecklist: React.FC = () => {
    const { onboardingChecklist, startInteractiveTutorial } = useAppStore();

    if (!onboardingChecklist) return null;

    const completedCount = Object.values(onboardingChecklist).filter(Boolean).length;
    const totalCount = checklistItems.length;
    const progress = (completedCount / totalCount) * 100;
    
    // Hide checklist once completed
    if (completedCount === totalCount) return null;

    return (
        <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
        >
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-amber-300">Getting Started</h4>
                <button onClick={startInteractiveTutorial} className="text-xs text-sky-400 hover:underline">
                    Take an Interactive Tour
                </button>
            </div>
            <div className="space-y-2 mb-4">
                {checklistItems.map(item => (
                    <ChecklistItem
                        key={item.key}
                        text={item.text}
                        isCompleted={onboardingChecklist[item.key]}
                    />
                ))}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </MotionDiv>
    );
};

export default DashboardChecklist;
