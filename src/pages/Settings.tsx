import { useState } from 'react';
import { Calendar, Building2, Tag, Database } from 'lucide-react';
import { FiscalYearSettings } from '../components/settings/FiscalYearSettings';
import { FunderSettings } from '../components/settings/FunderSettings';
import { ExpenseCategorySettings } from '../components/settings/ExpenseCategorySettings';
import { DataManagement } from '../components/settings/DataManagement';
import { PageHeader } from '../components/shared/PageHeader';

type SettingsTab = 'fiscal-years' | 'funders' | 'categories' | 'data';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'fiscal-years', label: 'Fiscal Years', icon: Calendar, description: 'Manage fiscal years and quarters' },
  { id: 'funders', label: 'Funders', icon: Building2, description: 'Funding organizations' },
  { id: 'categories', label: 'Categories', icon: Tag, description: 'Expense categories' },
  { id: 'data', label: 'Data', icon: Database, description: 'Backup, restore & reset' },
];

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('fiscal-years');

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Settings"
        subtitle="Manage lookup data, fiscal years, and database backups."
      />

      {/* Tab navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'fiscal-years' && <FiscalYearSettings />}
      {activeTab === 'funders' && <FunderSettings />}
      {activeTab === 'categories' && <ExpenseCategorySettings />}
      {activeTab === 'data' && <DataManagement />}
    </div>
  );
};

export default Settings;
