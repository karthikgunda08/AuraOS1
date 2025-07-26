// src/features/tools/misc/GenericApiTool.tsx
import React, { useState, useCallback } from 'react';
import { PhoenixEnginePanelProps } from '../../../types';
import { useNotificationStore } from '../../../state/notificationStore';
import { LoadingSpinner } from '../../../components/LoadingSpinner';
import { ResponseDisplay } from '../../../components/ResponseDisplay';

interface GenericApiToolProps<T, P extends any[]> extends PhoenixEnginePanelProps {
  toolName: string;
  description: string;
  creditCost: number;
  icon: string | React.ReactNode;
  apiFn: (projectId: string, ...args: P) => Promise<T>;
  buildPayload: (props: PhoenixEnginePanelProps) => P | null;
  onSuccess: (result: T, props: PhoenixEnginePanelProps) => void;
  buttonText?: string;
  renderResult?: (result: T) => React.ReactNode;
  resultPlaceholder?: React.ReactNode;
  children?: React.ReactNode;
}

export function GenericApiTool<T, P extends any[]>({
  toolName,
  description,
  creditCost,
  icon,
  apiFn,
  buildPayload,
  onSuccess,
  buttonText,
  renderResult,
  resultPlaceholder,
  children,
  ...props
}: GenericApiToolProps<T, P>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const { addNotification } = useNotificationStore();
  const { currentUser, onBuyCreditsClick, refreshCurrentUser, currentProject, completeOnboardingChecklistItem } = props;

  const handleExecute = useCallback(async () => {
    if (!currentUser || !currentProject) {
      addNotification("Please log in and select a project.", "error");
      return;
    }
    if (currentUser.role !== 'owner' && currentUser.credits < creditCost) {
      addNotification(`You need ${creditCost} credits for ${toolName}. You have ${currentUser.credits}.`, "info");
      onBuyCreditsClick();
      return;
    }

    const payloadArgs = buildPayload(props);
    if (payloadArgs === null) {
      // buildPayload is expected to handle its own notifications for validation errors
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await apiFn(currentProject.id, ...payloadArgs);
      setResult(apiResult);
      onSuccess(apiResult, props);
      addNotification(`${toolName} executed successfully!`, "success");
      completeOnboardingChecklistItem('aiToolUsed'); // Onboarding hook
      if (creditCost > 0 && currentUser.role !== 'owner') {
        await refreshCurrentUser();
      }
    } catch (err: any) {
      const errorMessage = err.message || `An error occurred while running ${toolName}.`;
      setError(errorMessage);
      addNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [apiFn, buildPayload, creditCost, currentUser, onBuyCreditsClick, onSuccess, props, refreshCurrentUser, toolName, addNotification, currentProject, completeOnboardingChecklistItem]);

  return (
    <div>
        {!children && (
            <>
                <h3 className="text-lg font-bold text-sky-300">{toolName}</h3>
                <p className="text-sm text-slate-300 my-3">{description}</p>
            </>
        )}
      
      {children}

      <button
        id="generic-tool-button"
        onClick={handleExecute}
        disabled={isLoading}
        className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700"
      >
        {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">{icon}</span>}
        <span className="flex-grow">{isLoading ? 'Processing...' : (buttonText || `Run ${toolName}`)}</span>
        <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">{creditCost} credits</span>
      </button>

      <ResponseDisplay
        isLoading={isLoading}
        error={error}
        result={result}
        renderResult={renderResult || (() => <p>Success!</p>)}
        placeholder={resultPlaceholder}
      />
    </div>
  );
}
