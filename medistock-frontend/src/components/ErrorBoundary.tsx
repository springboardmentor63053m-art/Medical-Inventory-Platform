import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Unhandled application error", error, info); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-50"><AlertTriangle className="text-rose-600" /></div><h1 className="text-xl font-bold text-slate-900">Something went wrong</h1><p className="mt-2 text-sm text-slate-500">This page could not be displayed. Your data has not been changed.</p><Button className="mt-6" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Reload application</Button></section></main>;
  }
}
