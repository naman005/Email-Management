import axios from 'axios';
import { Account, Email, SearchCriteria } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE;

export const api = {
  // Account management
  addAccount: (account: Partial<Account>) =>
    axios.post(`${API_BASE}/emails/accounts`, account),

  getAccounts: () =>
    axios.get<Account[]>(`${API_BASE}/emails/accounts`),

  syncAccount: (accountId: string) =>
    axios.post(`${API_BASE}/emails/accounts/${accountId}/sync`),

  deleteAccount: (accountId: string) =>
    axios.delete(`${API_BASE}/emails/accounts/${accountId}`),

  fetchEmails: (accountId: string) =>
  axios.get<Email[]>(`${API_BASE}/emails/${accountId}/fetch`),

  // Email search
  searchEmails: (query: string, accountId?: string, limit = 50, skip = 0) =>
    axios.get<Email[]>(`${API_BASE}/emails/search`, {
      params: { q: query, accountId, limit, skip }
    }),

  advancedSearch: (criteria: SearchCriteria) =>
    axios.post<Email[]>(`${API_BASE}/emails/search/advanced`, criteria),
};

