import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, Info } from 'lucide-react';
import { useAISettings, useAI } from '../../hooks/useAI';

const AISettings: React.FC = () => {
  const { settings, saveSettings } = useAISettings();
  const { testConnection } = useAI();
  const [showKey, setShowKey] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [isSaving, setIsSaving] = useState(false);

  // Placeholder shows masked key status

  const handleSaveKey = async () => {
    if (!keyInput) return;
    setIsSaving(true);
    await saveSettings({ apiKey: keyInput, enabled: true });
    setIsSaving(false);
    setKeyInput('');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    const success = await testConnection();
    setTestStatus(success ? 'success' : 'failed');
    setTimeout(() => setTestStatus('idle'), 5000);
  };

  const handleToggleEnabled = async () => {
    await saveSettings({ enabled: !settings.enabled });
  };

  const handleModelChange = async (model: string) => {
    await saveSettings({ model });
  };

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Data Privacy</p>
          <p className="mt-1">
            Your API key is stored locally in your browser and never transmitted to our servers.
            Only aggregated project data and uploaded document text is sent to Claude.
            Employee names, rates, and hours are never transmitted.
          </p>
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Enable AI Features</h3>
            <p className="text-xs text-slate-500 mt-0.5">Report narratives, budget queries, and agreement search</p>
          </div>
          <button
            onClick={handleToggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.enabled ? 'bg-slate-900' : 'bg-slate-300'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">API Key</h3>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder={settings.apiKey ? 'Key saved — enter new key to replace' : 'sk-ant-...'}
              className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              {showKey ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
          <button
            onClick={handleSaveKey}
            disabled={!keyInput || isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Test connection */}
        {settings.apiKey && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50"
            >
              {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            {testStatus === 'success' && (
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Connected
              </span>
            )}
            {testStatus === 'failed' && (
              <span className="flex items-center gap-1 text-xs text-red-600">
                <XCircle className="w-3.5 h-3.5" /> Connection failed
              </span>
            )}
          </div>
        )}
      </div>

      {/* Model selection */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Model</h3>
        <select
          value={settings.model}
          onChange={e => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        >
          <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Faster, lower cost)</option>
        </select>
        <p className="text-xs text-slate-400">Sonnet is more capable for narratives. Haiku is faster for simple queries.</p>
      </div>
    </div>
  );
};

export default AISettings;
