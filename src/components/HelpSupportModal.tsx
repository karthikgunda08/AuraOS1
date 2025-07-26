// src/components/HelpSupportModal.tsx
import React, { useState } from 'react';
import { APP_TITLE } from '../constants';

interface HelpSupportModalProps {
  onClose: () => void;
}

const faqs = [
  {
    question: "What are AI Credits and why do I need them?",
    answer: `AI Credits are the currency of AuraOS. You get a generous amount for free when you sign up during your trial period. They are used to power advanced features like the Master Architect, construction document generation, and photorealistic rendering. This allows us to offer powerful, computationally-intensive tools on a flexible pay-as-you-go basis, so you only pay for the value you receive.`
  },
  {
    question: "How do I save my project?",
    answer: `Your work is auto-saved every two minutes. You can also manually save a version at any time using the Command Palette (Ctrl+K or Cmd+K) and searching for "Save Project", or by clicking the save icon in the bottom dock. This creates a permanent version you can restore later.`
  },
  {
    question: "Can I use my designs for commercial projects?",
    answer: `Yes, absolutely. All designs you create, plans you generate, and reports you receive are your intellectual property. You can use them for personal or commercial architectural projects without restriction.`
  },
  {
    question: "Is the Vastu analysis always accurate?",
    answer: "Our AI provides Vastu analysis based on established principles of Vastu Shastra. It is a powerful guide for creating harmonious spaces. However, for critical projects, we always recommend consulting with a professional human Vastu expert for nuanced interpretations and remedies."
  },
  {
    question: "How do I share my project with a client?",
    answer: `From the Project Hub, you can generate a shareable link to the Client Portal or the Architect's Folio. The Client Portal is a simple 2D/3D viewer, while the Folio is a more narrative-driven presentation. You can also create an interactive Holocron presentation for the most immersive experience.`
  },
    {
    question: "What do I do if an AI tool gives a strange or unhelpful result?",
    answer: "AI can sometimes produce unexpected results. If this happens, try rephrasing your prompt with more specific details. For example, instead of 'a nice house', try 'a 2-story contemporary house with 4 bedrooms and a flat roof'. Providing more context in the Project Hub also dramatically improves results. If the issue persists, please contact support with details about your prompt."
  },
];

const FAQItem: React.FC<{ q: string; a: string; }> = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4"
            >
                <span className="font-medium text-slate-200">{q}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {isOpen && (
                <div className="pb-4 text-slate-400">
                    <p>{a}</p>
                </div>
            )}
        </div>
    );
};

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[100]"
      onClick={onClose}
      role="dialog"
      aria-labelledby="help-modal-title"
    >
      <div
        className="bg-slate-800 p-0 rounded-xl shadow-2xl w-full max-w-2xl m-4 h-[90vh] max-h-[700px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-700 flex-shrink-0">
          <h2 id="help-modal-title" className="text-2xl font-bold text-sky-300">
            Help & Support
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-300 transition-colors"
            aria-label="Close help modal"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto px-6">
            <h3 className="text-lg font-semibold text-slate-100 my-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
                {faqs.map(faq => <FAQItem key={faq.question} q={faq.question} a={faq.answer} />)}
            </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex-shrink-0">
            <p className="text-sm text-slate-300">Can't find what you're looking for?</p>
            <a href="mailto:dakshinnvaarahi@gmail.com" className="font-semibold text-primary hover:underline">
                Contact our support team
            </a>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportModal;