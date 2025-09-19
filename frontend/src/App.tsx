import { useState } from 'react';
import { Account } from './types';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/Toast/ToastContainer';
import AccountsPage from './pages/AccountPage';
import EmailsPage from './pages/EmailPage';
import AnalyticsPage from './pages/AnalyticsPage';


function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { toasts, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<'accounts' | 'emails' | 'analytics'>('accounts');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const handleAccountsUpdate = (updatedAccounts: Account[]) => {
    setAccounts(updatedAccounts);
  };

  return (
    <div className="min-h-screen">
          <div className="container mx-auto px-4 py-6">
          {/* Header */}
            <header className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 mb-10 text-center border-b-2 border-gray-200 pb-4">Email Management</header>
          {/* Tabs */}
          <div className="flex justify-center mb-8">
          <nav className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-xl p-1 shadow-lg border border-white/30 flex justify-center">
            {[
              { key: 'accounts', label: 'Accounts' },
              { key: 'emails', label: 'Emails' },
              { key: 'analytics', label: 'Analytics' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300 text-center ${
                  activeTab === tab.key
                    ? 'bg-[#875cf5] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-[#875cf5]/15 hover:text-[#875cf5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          </div>
    
          {/* Content */}
          <main className="p-6 transition-all duration-300">
            {activeTab === 'accounts' && (
              <AccountsPage
                accounts={accounts}
                onAccountsUpdate={handleAccountsUpdate}
                onViewEmails={(id) => {
                  setSelectedAccountId(id);
                  setActiveTab('emails');  
                }}
              />
            )}
            {activeTab === 'emails' && selectedAccountId && (<EmailsPage accountId={selectedAccountId} />)}
            {activeTab === 'analytics' && <AnalyticsPage />}
          </main>
    
          {/* Toasts */}
          <ToastContainer toasts={toasts} removeToast={removeToast} />
          </div>
        </div>
  );
}

export default App;
