// src/components/dashboard/FeaturedProjectCard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Project } from '../../types';
import * as communityService from '../../services/communityService';
import { LoadingSpinner } from '../LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;
const MotionP = motion.p as any;
const MotionH3 = motion.h3 as any;


const AssetThumbnail: React.FC<{ assetType: 'image' | 'video' | 'holocron'; url: string; onClick: () => void; isActive: boolean }> = ({ assetType, url, onClick, isActive }) => {
    const icons = {
        video: '🎬',
        holocron: '✨'
    };
    return (
        <button onClick={onClick} className={`relative w-20 h-16 rounded-md overflow-hidden ring-2 transition-all ${isActive ? 'ring-primary' : 'ring-transparent hover:ring-primary/50'}`}>
            {assetType === 'image' ? (
                 <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
            ): (
                 <div className="w-full h-full bg-slate-700 flex items-center justify-center text-3xl">
                    {icons[assetType]}
                 </div>
            )}
            <div className="absolute inset-0 bg-black/30"></div>
        </button>
    );
};


export const FeaturedProjectCard: React.FC = () => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mediaItems, setMediaItems] = useState<string[]>([]);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

    const timerRef = React.useRef<number | null>(null);

    const startSlideshow = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            setActiveMediaIndex(prevIndex => (prevIndex + 1) % mediaItems.length);
        }, 5000);
    }, [mediaItems.length]);

    useEffect(() => {
        if (mediaItems.length > 1) {
            startSlideshow();
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [activeMediaIndex, mediaItems.length, startSlideshow]);

    useEffect(() => {
        communityService.getFeaturedProjectApi()
            .then(data => {
                setProject(data);
                const renders = data.generatedRenders?.map((r) => r.url) || [];
                const allMedia = [data.previewImageUrl, ...renders].filter(Boolean) as string[];
                setMediaItems(allMedia);
                setActiveMediaIndex(0);
            })
            .catch(err => {
                console.warn("Could not load featured project:", err.message);
                setError("No featured project available this week.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const handleThumbnailClick = (index: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setActiveMediaIndex(index);
    };


    if (isLoading) {
        return (
            <div className="w-full min-h-[24rem] bg-slate-800/50 rounded-xl border border-slate-700 flex items-center justify-center">
                <LoadingSpinner />
                <span className="ml-3 text-slate-400">Loading Showcase...</span>
            </div>
        )
    }

    if (error || !project) {
        return null;
    }
    
    const folioLink = project.folio?.isEnabled ? `/folio/${project.folio.shareableLink}` : '#';
    const holocronLink = project.holocron?.isEnabled ? `/holocron/${project.holocron.shareableLink}` : '#';

    const textRevealVariants = {
        hidden: { y: "100%" },
        visible: (i: number = 0) => ({
            y: 0,
            transition: { delay: 0.5 + i * 0.1, duration: 0.8 }
        })
    };
    
    const projectUserId = (typeof project.userId === 'object' && project.userId !== null) ? project.userId.name : 'AuraOS Architect';

    return (
        <MotionDiv
            className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden premium-glow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Media Player */}
                <div className="relative lg:col-span-3 bg-slate-900 aspect-video lg:aspect-auto">
                    <AnimatePresence>
                        <MotionImg
                            key={activeMediaIndex}
                            src={mediaItems[activeMediaIndex]}
                            alt="Featured Project"
                            className="absolute inset-0 w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: 'easeInOut' }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                </div>

                {/* Content */}
                <div className="p-6 lg:col-span-2 flex flex-col">
                     <div className="overflow-hidden mb-1">
                        <MotionP className="font-semibold text-primary" variants={textRevealVariants} initial="hidden" animate="visible" custom={0}>
                            Featured Project of the Week
                        </MotionP>
                     </div>
                     <div className="overflow-hidden mb-2">
                        <MotionH3 className="text-3xl font-bold text-white mt-1" variants={textRevealVariants} initial="hidden" animate="visible" custom={1}>
                           {project.name}
                        </MotionH3>
                     </div>
                    <p className="text-sm text-slate-400 mt-1">by {projectUserId}</p>
                    
                    <p className="text-sm text-slate-300 my-4 flex-grow">
                        { project.folio?.narrative ? 
                            `${project.folio.narrative.substring(0, 150)}...`
                            : 'An exemplary project showcasing the power and elegance of AI-driven design on the AuraOS platform.'
                        }
                    </p>
                    
                    <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-2">Project Assets</h4>
                        <div className="flex gap-2 flex-wrap">
                            {mediaItems.map((url: string, index: number) => (
                                <AssetThumbnail key={index} assetType="image" url={url} onClick={() => handleThumbnailClick(index)} isActive={activeMediaIndex === index} />
                            ))}
                            {project.holocron?.isEnabled && (
                                <AssetThumbnail assetType="holocron" url={holocronLink} onClick={() => window.open(holocronLink, '_blank')} isActive={false} />
                            )}
                        </div>
                    </div>

                    <a href={folioLink} target="_blank" rel="noopener noreferrer" className="w-full mt-6 px-4 py-3 text-center text-white font-semibold rounded-md bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 transition-all flex items-center justify-center gap-2 group">
                        Explore Full Project Folio
                        <span className="transform transition-transform group-hover:translate-x-1">→</span>
                    </a>
                </div>
            </div>
        </MotionDiv>
    );
};