// src/components/AuraOS/AICompanionWidget.tsx
import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../state/appStore';
import * as socketService from '../../services/socketService';
import { useNotificationStore } from '../../state/notificationStore';

export const AICompanionWidget: React.FC = () => {
    const { 
        companionState, setCompanionState, 
        companionTranscript, setCompanionTranscript,
        currentProject
    } = useAppStore(state => ({
        companionState: state.companionState,
        setCompanionState: state.setCompanionState,
        companionTranscript: state.companionTranscript,
        setCompanionTranscript: state.setCompanionTranscript,
        currentProject: state.currentProject,
    }));
    
    const recognitionRef = useRef<any>(null);
    const { addNotification } = useNotificationStore();
    
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const finalTranscript = event.results[i][0].transcript;
                    setCompanionTranscript(finalTranscript);
                    handleQuery(finalTranscript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                    setCompanionTranscript(interimTranscript + '...');
                }
            }
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            if(event.error !== 'no-speech') {
                addNotification(`Speech recognition error: ${event.error}`, 'error');
            }
            setCompanionState('idle');
            setCompanionTranscript(null);
        };
        
        recognitionRef.current.onend = () => {
             const currentState = useAppStore.getState().companionState;
            if (currentState === 'listening') {
                setCompanionState('idle');
            }
        };

    }, [addNotification, setCompanionState, setCompanionTranscript]);

    const handleQuery = async (query: string) => {
        if (!query.trim() || !currentProject) {
            setCompanionState('idle');
            return;
        };
        
        setCompanionState('thinking');
        try {
            socketService.emitChatMessage(currentProject.id, `@aura ${query}`);
            
            // Set a timeout to revert state if no response is received, to prevent getting stuck.
            setTimeout(() => {
                if (useAppStore.getState().companionState === 'thinking') {
                    setCompanionState('idle');
                    setCompanionTranscript(null);
                    addNotification("Aura didn't respond. Please try again.", 'info');
                }
            }, 15000);

        } catch (err: any) {
            addNotification(err.message, 'error');
            setCompanionState('error');
            setCompanionTranscript(null);
        }
    };
    
    const toggleListen = () => {
        if (!recognitionRef.current) {
            addNotification("Voice recognition is not supported by your browser.", "error");
            return;
        }

        if (companionState === 'listening') {
            recognitionRef.current.stop();
            setCompanionState('idle');
            setCompanionTranscript(null);
        } else {
            setCompanionTranscript('Listening...');
            setCompanionState('listening');
            recognitionRef.current.start();
        }
    };

    const orbClasses: Record<typeof companionState, string> = {
        idle: "bg-primary/20 border-primary/50 text-primary",
        listening: "bg-red-500/20 border-red-500 text-red-400 animate-pulse",
        thinking: "bg-purple-500/20 border-purple-500 text-purple-400 animate-spin",
        speaking: "bg-green-500/20 border-green-500 text-green-400 animate-pulse",
        error: "bg-destructive/20 border-destructive/50 text-destructive",
    };

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto">
            {companionTranscript && (
                <div className="px-4 py-2 bg-black/50 rounded-lg text-white text-center text-sm">
                    {companionTranscript}
                </div>
            )}
            <button
                onClick={toggleListen}
                className={`w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-lg ${orbClasses[companionState]}`}
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        </div>
    );
};
