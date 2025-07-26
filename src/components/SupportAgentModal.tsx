// src/components/SupportAgentModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import * as geminiService from '../services/geminiService';
import { useNotificationStore } from '../state/notificationStore';
import { LoadingSpinner } from './LoadingSpinner';

interface SupportAgentModalProps {
  onClose: () => void;
}

type Status = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const StatusIndicator: React.FC<{ status: Status, transcript?: string }> = ({ status, transcript }) => {
  const messages: Record<Status, string> = {
    idle: "Click the orb to ask a question.",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "...",
    error: "Sorry, I had trouble. Please try again."
  };
  return (
    <div className="text-center h-10">
      <p className="text-slate-300 italic">{transcript || messages[status]}</p>
    </div>
  );
};

const OrbButton: React.FC<{ status: Status, onClick: () => void }> = ({ status, onClick }) => {
  const getOrbClass = () => {
    switch(status) {
      case 'listening': return 'animate-pulse bg-red-500 shadow-red-500/50';
      case 'thinking': return 'animate-spin bg-purple-500 shadow-purple-500/50';
      case 'speaking': return 'animate-pulse bg-green-500 shadow-green-500/50';
      default: return 'bg-primary shadow-primary/50';
    }
  };
  return (
    <button
      onClick={onClick}
      disabled={status !== 'idle' && status !== 'error'}
      className={`w-24 h-24 rounded-full transition-all duration-300 flex items-center justify-center text-primary-foreground shadow-lg disabled:cursor-not-allowed ${getOrbClass()}`}
      aria-label="Start voice command"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </button>
  );
};


const SupportAgentModal: React.FC<SupportAgentModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');

  const recognitionRef = useRef<any>(null);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification("Voice recognition is not supported by your browser.", "error");
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const resultTranscript = event.results[0][0].transcript;
      setTranscript(resultTranscript);
      handleQuery(resultTranscript);
    };
    recognitionRef.current.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setStatus('error');
    };
    recognitionRef.current.onend = () => {
      if (status === 'listening') {
        setStatus('idle');
      }
    };
  }, [addNotification, status]);

  useEffect(() => {
      if (status === 'speaking' && aiResponse) {
          setDisplayedResponse('');
          let i = 0;
          const interval = setInterval(() => {
              i++;
              setDisplayedResponse(aiResponse.slice(0, i));
              if (i >= aiResponse.length) {
                  clearInterval(interval);
              }
          }, 35);
          return () => clearInterval(interval);
      }
  }, [status, aiResponse]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // You could add logic here to select a voice based on language detection
    utterance.onend = () => setStatus('idle');
    utterance.onerror = () => setStatus('error');
    window.speechSynthesis.speak(utterance);
  };
  
  const handleQuery = async (query: string) => {
      setStatus('thinking');
      setAiResponse('');
      try {
          const res = await geminiService.getSupportAgentResponseApi(query);
          setAiResponse(res.text);
          setStatus('speaking');
          speak(res.text);
      } catch (err: any) {
          addNotification(err.message, 'error');
          setStatus('error');
      }
  };

  const handleListen = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setAiResponse('');
      setDisplayedResponse('');
      setStatus('listening');
      recognitionRef.current.start();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in-up" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-8 flex flex-col gap-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-sky-300">AI Support Assistant</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        
        <div className="text-center min-h-[120px] flex items-center justify-center p-4 bg-black/20 rounded-lg">
            {aiResponse ? (
                <p className="text-lg text-slate-100">{displayedResponse}</p>
            ) : (
                <p className="text-slate-400">Your question and the AI's response will appear here.</p>
            )}
        </div>

        <div className="flex flex-col items-center gap-4">
            <StatusIndicator status={status} transcript={transcript} />
            <OrbButton status={status} onClick={handleListen} />
        </div>
      </div>
    </div>
  );
};

export default SupportAgentModal;
