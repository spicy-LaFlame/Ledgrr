import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Receipt,
  Users,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Menu,
  X,
  HandCoins,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Allocations from './pages/Allocations';
import Expenses from './pages/Expenses';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Claims from './pages/Claims';

const navItems = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/allocations', label: 'Allocations', icon: ClipboardList },
  { path: '/expenses', label: 'Expenses', icon: Receipt },
  { path: '/claims', label: 'Claims', icon: HandCoins },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50
        w-64 transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">IB</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Innovation</div>
                <div className="text-xs text-slate-500">Budget Tracker</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/projects' && location.pathname.startsWith('/projects/'));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100">
          <div className="text-xs text-slate-400">FY 2025-26 • Q3</div>
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-30 lg:hidden">
      <button onClick={onMenuClick} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg">
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
      <div className="flex items-center gap-2 ml-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">IB</span>
        </div>
        <span className="text-sm font-semibold text-slate-900">Innovation Budget Tracker</span>
      </div>
    </header>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ChevronRight className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-sm text-slate-500">Coming soon...</p>
      </div>
    </div>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <MobileHeader onMenuClick={() => setMobileOpen(true)} />
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/allocations" element={<Allocations />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
