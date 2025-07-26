// src/components/ResetPasswordPage.tsx
import React, { useState } from 'react';
import * as authService from '../services/authService';
import { LoadingSpinner } from './LoadingSpinner';
import { useNotificationStore } from '../state/notificationStore';
import { APP_TITLE } from '../constants';

interface ResetPasswordPageProps {
  token: string;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ token }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, password);
      authService.storeToken(response.token);
      addNotification("Your password has been reset successfully! You are now logged in.", "success");
      // Redirect to the user dashboard after a short delay
      setTimeout(() => window.location.href = '/user-dashboard', 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred. The token might be invalid or expired.');
      addNotification(`Error: ${err.message}`, 'error');
      setIsLoading(false);
    }
    // No need to set isLoading to false on success, as we will be redirecting
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 animated-gradient-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700">
        <div>
           <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-gold to-brand-accent text-center">
              {APP_TITLE}
            </h1>
          <h2 className="mt-4 text-center text-2xl font-bold text-slate-100">
            Set a New Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-800/50 text-red-200 rounded-md text-sm">{error}</div>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:ring-2 focus:ring-orange-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-sky-600 hover:from-orange-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading && <span className="absolute left-0 inset-y-0 flex items-center pl-3"><LoadingSpinner size="h-5 w-5" /></span>}
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;