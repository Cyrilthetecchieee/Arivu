import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred within the Arivu protocol.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.operationType) {
            errorMessage = `Arivu encountered a synchronization error: ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        // Not a JSON error message
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-8">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] cinematic-shadow p-12 text-center space-y-8 border border-black/5">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-serif italic text-ink">Protocol Interruption</h2>
              <p className="text-xs font-bold tracking-widest uppercase text-muted leading-relaxed">
                {errorMessage}
              </p>
              {isFirestoreError && (
                <p className="text-[10px] text-red-500 font-bold tracking-widest uppercase opacity-60">
                  Insufficient permissions or network failure detected.
                </p>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full bg-ink text-canvas py-5 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            >
              <RefreshCcw size={16} />
              Re-initiate Protocol
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
