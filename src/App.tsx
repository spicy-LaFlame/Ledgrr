import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Receipt,
  Users,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Menu,
  X,
  HandCoins,
  BookOpen,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Allocations from './pages/Allocations';
import Expenses from './pages/Expenses';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Claims from './pages/Claims';
import GeneralLedger from './pages/GeneralLedger';
import Settings from './pages/Settings';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

const mainNavItems = [
  { path: '/app', label: 'Overview', icon: LayoutDashboard },
  { path: '/app/projects', label: 'Projects', icon: FolderKanban },
  { path: '/app/allocations', label: 'Allocations', icon: ClipboardList },
  { path: '/app/expenses', label: 'Expenses', icon: Receipt },
  { path: '/app/claims', label: 'Claims', icon: HandCoins },
  { path: '/app/general-ledger', label: 'General Ledger', icon: BookOpen },
];

const systemNavItems = [
  { path: '/app/employees', label: 'Employees', icon: Users },
  { path: '/app/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

function Sidebar({
  mobileOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/app/projects' && location.pathname.startsWith('/app/projects/'));

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={onClose}
        title={collapsed ? item.label : undefined}
        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
          active
            ? 'bg-cyan-50 text-cyan-700'
            : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-600 rounded-r-full" />
        )}
        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-cyan-600' : ''}`} />
        {!collapsed && (
          <span className="text-sm font-medium">{item.label}</span>
        )}
        {collapsed && (
          <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none">
            {item.label}
          </div>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-backdrop-enter"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex flex-col z-50
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-64'}
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0 !w-64' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className={`${collapsed ? 'px-3' : 'px-5'} py-6 border-b border-slate-100`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-cyan-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">IB</span>
              </div>
              {(!collapsed || mobileOpen) && (
                <div>
                  <div className="text-sm font-semibold text-cyan-900">Innovation</div>
                  <div className="text-xs text-slate-500">Budget Tracker</div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${collapsed ? 'px-2' : 'px-3'} py-4 overflow-y-auto`}>
          {/* Main section */}
          {!collapsed && (
            <div className="px-3 mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Main</span>
            </div>
          )}
          <div className="space-y-1">
            {mainNavItems.map(renderNavItem)}
          </div>

          {/* System section */}
          <div className="mt-6">
            {!collapsed && (
              <div className="px-3 mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">System</span>
              </div>
            )}
            {collapsed && <div className="border-t border-slate-100 mb-3 mt-3" />}
            <div className="space-y-1">
              {systemNavItems.map(renderNavItem)}
            </div>
          </div>
        </nav>

        {/* Footer with collapse toggle */}
        <div className={`${collapsed ? 'px-2' : 'px-3'} py-4 border-t border-slate-100`}>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors duration-200 cursor-pointer"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronsRight className="w-5 h-5 shrink-0 mx-auto" />
            ) : (
              <>
                <ChevronsLeft className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
          {!collapsed && (
            <div className="px-3 mt-2">
              <div className="text-xs text-slate-400">FY 2025-26</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 shadow-sm flex items-center px-4 z-30 lg:hidden">
      <button onClick={onMenuClick} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg cursor-pointer">
        <Menu className="w-5 h-5 text-slate-700" />
      </button>
      <div className="flex items-center gap-2 ml-3">
        <div className="w-7 h-7 bg-cyan-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">IB</span>
        </div>
        <span className="text-sm font-semibold text-cyan-900">Innovation Budget Tracker</span>
      </div>
    </header>
  );
}

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next)); } catch {}
      return next;
    });
  };

  // Close mobile sidebar on route change
  const location = useLocation();
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />
      <MobileHeader onMenuClick={() => setMobileOpen(true)} />
      <main className={`min-h-screen pt-14 lg:pt-0 transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
        <div className="animate-fade-in">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/allocations" element={<Allocations />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/claims" element={<Claims />} />
            <Route path="/general-ledger" element={<GeneralLedger />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
