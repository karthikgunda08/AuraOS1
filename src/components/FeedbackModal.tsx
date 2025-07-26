// src/components/FeedbackModal.tsx
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useNotificationStore } from '../state/notificationStore';
import * as feedbackService from '../services/feedbackService';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [category, setCategory] = useState<'bug_report' | 'feature_request' | 'general_feedback'>('general_feedback');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      addNotification('Please enter a message for your feedback.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await feedbackService.submitFeedback(category, message);
      addNotification('Thank you! Your feedback has been submitted.', 'success');
      onClose();
    } catch (error: any) {
      addNotification(`Submission failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-[100]"
      onClick={onClose}
      role="dialog"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-slate-800 p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="feedback-modal-title" className="text-2xl font-bold text-sky-300">
            Submit Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-sky-300 transition-colors"
            aria-label="Close feedback modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-6">We appreciate you taking the time to help us improve Dakshin Vaarahi. Your feedback is invaluable.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Feedback Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500"
              disabled={isLoading}
            >
              <option value="general_feedback">General Feedback</option>
              <option value="feature_request">Feature Request</option>
              <option value="bug_report">Bug Report</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">
              Your Message
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500"
              placeholder="Please be as detailed as possible..."
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 disabled:opacity-50"
          >
            {isLoading && <LoadingSpinner size="h-5 w-5 mr-2" />}
            {isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;