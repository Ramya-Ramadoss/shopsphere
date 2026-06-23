import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RotateCcw, ArrowLeft } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ShopSphere Boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoBack = () => {
    this.setState({ hasError: false, error: null });
    window.history.back();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
            <AlertTriangle size={40} className="animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Something went wrong</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              An unexpected error occurred in this view. Don't worry, you can recover using the controls below.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-slate-400 bg-slate-50 p-3 rounded-lg overflow-x-auto text-left max-w-full">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={this.handleRetry}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
            >
              <RotateCcw size={16} />
              <span>Retry</span>
            </button>
            <button
              onClick={this.handleGoBack}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
          <button
            onClick={this.handleGoHome}
            className="flex items-center justify-center gap-2 text-xs text-blue-600 hover:underline pt-2"
          >
            <Home size={14} />
            <span>Return to Home</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
