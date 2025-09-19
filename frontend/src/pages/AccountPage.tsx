import React, { useState, useEffect } from 'react';
import { Account } from '../types';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Eye, EyeOff, RefreshCw, Trash2, Check, ChevronDown, Mail } from "lucide-react";
import { Alert } from '@mui/material';
import { Listbox } from "@headlessui/react";




interface AccountPageProps {
  accounts: Account[];
  onAccountsUpdate: (accounts: Account[]) => void;
  onViewEmails: (id: string) => void;
}

const AccountPage: React.FC<AccountPageProps> = ({
  accounts,
  onAccountsUpdate,
  onViewEmails,
}) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    imapHost: '',
    imapPort: 993,
    username: '',
    password: '',
    authMethod: 'PLAIN' as 'PLAIN' | 'LOGIN' | 'OAUTH2'
  });

  const getInitial = (email: string) => email.charAt(0).toUpperCase();
  const authMethods: Array<'PLAIN' | 'LOGIN' | 'OAUTH2'> = ['PLAIN', 'LOGIN', 'OAUTH2'];


  useEffect(() => {
      loadAccounts();
    }, []);
  
    const loadAccounts = async () => {
      try {
        const response = await api.getAccounts();
        onAccountsUpdate(response.data);
      } catch (err) {
        setError('Failed to load accounts');
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
          await api.addAccount(formData);
          setFormData({
            email: '',
            imapHost: '',
            imapPort: 993,
            username: '',
            password: '',
            authMethod: 'PLAIN'
          });
          await loadAccounts();
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to add account');
        } finally {
          setIsModalOpen(false);
          setLoading(false);
        }
    };
    
    const handleSync = async (accountId: string) => {
        setLoading(true);
        try {
          await api.syncAccount(accountId);
          await loadAccounts();
        } catch (err) {
          setError('Failed to sync account');
        } finally {
          setLoading(false);
        }
    };

    const handleDelete = async (accountId: string) => {
      try {
        await api.deleteAccount(accountId);
        toast.success("Account deleted successfully");
        onAccountsUpdate(accounts.filter((a) => a._id !== accountId));
      } catch (err) {
        toast.error("Failed to delete account");
      }
    };
    
    const getHostSuggestions = (email: string) => {
        const domain = email.split('@')[1]?.toLowerCase();
        const suggestions: { [key: string]: { host: string; port: number } } = {
          'gmail.com': { host: 'imap.gmail.com', port: 993 },
          'outlook.com': { host: 'outlook.office365.com', port: 993 },
          'hotmail.com': { host: 'outlook.office365.com', port: 993 },
          'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993 },
        };
        return suggestions[domain];
    };
    
    const handleEmailChange = (email: string) => {
        setFormData(prev => ({ ...prev, email, username: email }));
        
        const suggestion = getHostSuggestions(email);
        if (suggestion) {
          setFormData(prev => ({
            ...prev,
            imapHost: suggestion.host,
            imapPort: suggestion.port
          }));
        }
    };
    const handleClose = () => {
      setFormData({
            email: '',
            imapHost: '',
            imapPort: 993,
            username: '',
            password: '',
            authMethod: 'PLAIN'
      });
      setIsModalOpen(false);
    };
    
    return (
      <div> 
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:bg-[#875cf5]/15 hover:text-[#875cf5] bg-[#875cf5] text-white transition-all duration-300 flex items-center justify-center group"
        aria-label="Add account"
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button> 
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:bg-white/70">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-black font-semibold text-sm">
                {getInitial(account.email)}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-800 truncate">{account.email}</p>
            </div>
            </div>
            <div
                className={`w-3 h-3 rounded-full ${
                account.isConnected
                ? 'bg-green-400 shadow-green-400/60'
                : 'bg-red-400 shadow-red-400/60'
            }     shadow-[0_0_8px_3px]`}
            />
            </div>

            {/* Details */}
        <div className="text-xs text-gray-600 space-y-1 mb-4">
        <p><span className="font-medium">IMAP:</span> {account.imapHost}:{account.imapPort}</p>
        <p><span className="font-medium">Auth:</span> {account.authMethod}</p>
        <p>
          <span className="font-medium">Last Sync:</span>{' '}
          {account.lastSync ? new Date(account.lastSync).toLocaleString() : 'Never'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => onViewEmails(account._id)}
          className="px-3 py-1 rounded-lg flex items-center justify-center bg-[#875cf5]/15 text-[#875cf5] hover:bg-[#875cf5]/25 transition-all duration-200 shadow-md"
          title="View Emails"
        > 
          <Mail size={16} /> 
          <div className='px-1'>View Emails</div>
        </button>
        <button
          onClick={() => handleSync(account._id)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#875cf5]/15 text-[#875cf5] hover:bg-[#875cf5]/25 transition-all duration-200 shadow-md"
          title="Sync"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={() => handleDelete(account._id)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 shadow-md"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>))}

        </div>
        

      {isModalOpen && 
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h3 className="text-lg font-semibold mb-4">Add New Account</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
        <label className="label">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleEmailChange(e.target.value)}
          required
          className="input-box"
        />
        </div>
        <div>
        <label className="label">IMAP Host</label>
        <input
          type="text"
          value={formData.imapHost}
          onChange={(e) => setFormData(prev => ({ ...prev, imapHost: e.target.value }))}
          required
          className="input-box"
        />
        </div>

        <div>
        <label className="label">IMAP Port</label>
        <input
          type="number"
          value={formData.imapPort}
          onChange={(e) => setFormData(prev => ({ ...prev, imapPort: parseInt(e.target.value) }))}
          required
          className="input-box"
        />
        </div>

        <div>
        <label className="label">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          required
          className="input-box"
        />
        </div>

        <div>
        <label className="label">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
            className="input-box"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#875cf5]"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
        </div>

        <div>
        <label className="label">Auth Method</label>
        <Listbox
        value={formData.authMethod}
        onChange={(value) =>
        setFormData((prev) => ({ ...prev, authMethod: value }))
    }
    >
  <div className="relative mt-2">
    {/* Button */}
    <Listbox.Button className="input-box text-[#875cf5] flex justify-between items-center cursor-pointer">
      {formData.authMethod}
      <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
    </Listbox.Button>

    {/* Options */}
    <Listbox.Options className="absolute mt-1 w-full bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-gray-200 z-10 focus:outline-none">
      {authMethods.map((method) => (
        <Listbox.Option
          key={method}
          value={method}
          className={({ active, selected }) =>
            `cursor-pointer px-3 py-2 text-sm rounded-md ${
              active
                ? "bg-[#875cf5]/15 text-[#875cf5]"
                : "text-gray-800"
            } ${selected ? "font-semibold text-[#875cf5]" : ""}`
          }
        >
          {({ selected }) => (
            <div className="flex justify-between items-center">
              {method}
              {selected && <Check className="h-4 w-4 text-[#875cf5]" />}
            </div>
            )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
        </div>
        </Listbox>
        </div>

        <div className="flex justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-[#875cf5] text-white hover:bg-[#875cf5]/15 hover:text-[#875cf5] transition disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Account'}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
        >
          Cancel 
        </button>
        </div>
        </form>
        </div>
        </div>}
    </div>
    );    

}


export default AccountPage;