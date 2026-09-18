import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, RotateCcw, ShieldAlert, Terminal } from 'lucide-react';
import { AgroIotLogo } from './AgroIotLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AGRO-IOT caught runtime exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#040e0a] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-slate-950 font-sans">
          <div className="w-full max-w-2xl bg-[#081e16] border border-rose-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Header branding */}
            <div className="flex items-center justify-between border-b border-emerald-950/80 pb-4">
              <AgroIotLogo size="md" showTagline={true} />
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-mono font-bold uppercase">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>Runtime Protected</span>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                  AGRO-IOT Recovered From an Unexpected State
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The smart farming platform encountered an unexpected client error. The system safely caught
                this exception to prevent a blank screen. Real-time field telemetry and hardware state have been preserved.
              </p>
            </div>

            {/* Error specifics */}
            {this.state.error && (
              <div className="p-4 rounded-xl bg-[#04100c] border border-rose-950 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-mono font-bold uppercase text-[11px]">
                  <Terminal className="w-4 h-4" />
                  <span>Exception Trace</span>
                </div>
                <div className="font-mono text-rose-200/90 break-words bg-[#020805] p-3 rounded-lg border border-rose-900/40 max-h-32 overflow-y-auto">
                  {this.state.error.name}: {this.state.error.message}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <details className="text-[11px] text-slate-400 pt-1">
                    <summary className="cursor-pointer text-emerald-400 hover:text-emerald-300 select-none">
                      Show Component Hierarchy
                    </summary>
                    <pre className="mt-2 font-mono text-[10px] text-slate-400 bg-[#020805] p-3 rounded-lg border border-emerald-950/60 overflow-x-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Dashboard</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-300 font-semibold text-xs transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Return to Home View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
