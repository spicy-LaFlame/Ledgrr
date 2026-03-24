import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  FileSpreadsheet,
  Shield,
  Wifi,
  WifiOff,
  ArrowRight,
  HandCoins,
  BookOpen,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: FolderKanban,
    title: 'Project Tracking',
    desc: 'Manage 5-10 innovation projects per fiscal year with budget allocations, cost centres, and spending deadlines.',
  },
  {
    icon: ClipboardList,
    title: 'Salary Allocations',
    desc: 'Allocate team hours across projects by quarter. Auto-calculate costs with benefits caps per funder.',
  },
  {
    icon: HandCoins,
    title: 'Claims & Expenses',
    desc: 'Track non-salary expenses, submit claims, and reconcile actuals against budgeted amounts.',
  },
  {
    icon: BookOpen,
    title: 'General Ledger',
    desc: 'Reconciliation drilldowns and ledger views to keep your books clean and audit-ready.',
  },
  {
    icon: FileSpreadsheet,
    title: 'Export Reports',
    desc: 'Generate Excel and PDF reports for funders, leadership, and quarterly claims documentation.',
  },
  {
    icon: LayoutDashboard,
    title: 'Live Dashboard',
    desc: 'At-a-glance spending pace, budget vs actuals, and alerts when projects need attention.',
  },
];

const trustPoints = [
  {
    icon: Shield,
    title: 'Data stays local',
    desc: 'All data is stored in your browser. Employee salary information never leaves your device.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    desc: 'Full PWA support \u2014 load once, then use without an internet connection.',
  },
  {
    icon: Wifi,
    title: 'No install required',
    desc: 'Runs in any modern browser. No admin privileges, no IT tickets.',
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">IB</span>
            </div>
            <span className="text-sm font-semibold text-cyan-900">Innovation Budget Tracker</span>
          </div>
          <button
            onClick={() => navigate('/app')}
            className="text-sm font-medium text-slate-600 hover:text-cyan-700 flex items-center gap-1 transition-colors duration-200 cursor-pointer"
          >
            Open App <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 text-xs font-medium text-cyan-700 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            FY 2025-26 Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-900 tracking-tight leading-tight">
            Track innovation budgets
            <br />
            <span className="text-slate-400">with clarity and confidence</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            A lightweight tool for the Innovation Team at Bruyere Health to manage project budgets,
            salary allocations, and funder reporting \u2014 all from your browser.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/app')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 text-white text-sm font-medium rounded-xl hover:bg-cyan-700 transition-colors duration-200 cursor-pointer"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-50 text-cyan-700 text-sm font-medium rounded-xl hover:bg-cyan-100 transition-colors duration-200"
            >
              See Features
            </a>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-xl shadow-cyan-100/30">
            <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 bg-slate-100 rounded-md max-w-xs mx-auto" />
                </div>
              </div>
              {/* Fake dashboard content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {['Total Budget', 'Spent to Date', 'Remaining', 'Active Projects'].map(
                  (label, i) => (
                    <div key={label} className="p-4 rounded-xl bg-cyan-50/50 border border-cyan-100">
                      <div className="text-xs text-slate-400 mb-1">{label}</div>
                      <div className="h-6 bg-cyan-100 rounded w-2/3" />
                      <div className="mt-2 h-1.5 bg-cyan-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-300 rounded-full"
                          style={{ width: `${[65, 42, 58, 80][i]}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="px-6 pb-6 grid grid-cols-3 gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-16 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-cyan-50/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-900">Everything you need in one place</h2>
            <p className="mt-3 text-slate-500">
              Purpose-built for tracking innovation project budgets across multiple funders.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg hover:shadow-cyan-50 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-cyan-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust / Privacy */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-900">Built for privacy</h2>
            <p className="mt-3 text-slate-500">
              No servers, no accounts, no data leaving your machine.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {trustPoints.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-cyan-900 mb-1">{t.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-2xl bg-cyan-900 p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to take control of your budgets?
            </h2>
            <p className="text-cyan-300 mb-8">
              No sign-up, no setup. Just open and start tracking.
            </p>
            <button
              onClick={() => navigate('/app')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-900 text-sm font-medium rounded-xl hover:bg-cyan-50 transition-colors duration-200 cursor-pointer"
            >
              Open the Tracker <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">IB</span>
            </div>
            <span>Innovation Budget Tracker</span>
          </div>
          <span>Bruyere Health Innovation Team</span>
        </div>
      </footer>
    </div>
  );
}
