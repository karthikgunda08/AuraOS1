// src/components/AuraOS/ChatPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../state/appStore';
import * as socketService from '../../services/socketService';

const ChatPanel: React.FC = () => {
    const { currentUser, currentProject, chatHistory, addChatMessage } = useAppStore(state => ({
        currentUser: state.currentUser,
        currentProject: state.currentProject,
        chatHistory: state.chatHistory,
        addChatMessage: state.addChatMessage,
    }));
    
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'en-US';
            recognitionRef.current.interimResults = false;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };
        }
        
        // Cleanup on component unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentProject || !currentUser) return;
        
        // Optimistically add the message to the local state
        addChatMessage({
            userId: currentUser.id,
            userName: currentUser.name || currentUser.email.split('@')[0],
            text: input,
            isAI: false,
            timestamp: new Date().toISOString()
        });

        // Emit the message to the server
        socketService.emitChatMessage(currentProject.id, input);
        
        setInput('');
    };

    const handleMicClick = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };


    return (
        <div className="h-full flex flex-col bg-slate-800/80 text-white">
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {chatHistory.map((msg, index) => (
                    <div key={msg._id || index} className={`flex items-start gap-2.5 ${msg.isAI || msg.userId !== currentUser?.id ? 'justify-start' : 'justify-end'}`}>
                        <div className={`flex flex-col w-full max-w-[320px] leading-1.5 p-3 border-gray-200 rounded-xl ${
                            msg.isAI ? 'bg-purple-800' : (msg.userId === currentUser?.id ? 'bg-blue-800' : 'bg-slate-700')
                        }`}>
                             <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className="text-sm font-semibold text-slate-200">{msg.userName}</span>
                            </div>
                            <p className="text-sm font-normal py-2.5 text-slate-100">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a message or command..."
                        className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:ring-sky-500"
                    />
                    <button type="button" onClick={handleMicClick} className={`p-2 rounded-lg transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600 hover:bg-slate-500'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                    </button>
                    <button type="submit" className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold" disabled={!input.trim()}>
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatPanel;
