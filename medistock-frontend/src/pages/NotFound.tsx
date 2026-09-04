import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

export function NotFound() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><section className="max-w-md text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-cyan-100 text-cyan-700"><SearchX className="h-8 w-8" /></div><p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">404 error</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Page not found</h1><p className="mt-3 text-slate-500">The page you requested does not exist or may have moved.</p><Link className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700" to="/"><ArrowLeft className="mr-2 h-4 w-4"/>Back to dashboard</Link></section></main>;
}
