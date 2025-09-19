import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import EmailItem from '../components/Email/EmailItem';
import EmailDetailModal from '../components/Email/EmailDetailModal';
import { socketService } from '../services/socket';
import type { Email } from '../types';
import { api } from '../services/api';

interface Props {
  accountId: string; 
}

const EmailsPage: React.FC<Props> = ({ accountId }) => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [syncProgress, setSyncProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

//   useEffect(() => {
//   const loadEmails = async () => {
//     if (!accountId) return;
//     try {
//       const { data } = await api.fetchEmails(accountId);
//       setEmails(data);
//     } catch (err) {
//       console.error("Failed to fetch emails:", err);
//     }
//   };

//   if (accountId) loadEmails();
// }, [accountId]);

//  useEffect(() => {
//     if (!accountId) return;

//     setLoading(true);

//     api.fetchEmails(accountId)
//       .then((res) => {
//         setEmails(res.data);
//       })
//       .catch((err) => {
//         console.error('Failed to fetch emails:', err);
//       })
//       .finally(() => setLoading(false));
//   }, [accountId]);

useEffect(() => {
  if (!accountId) return;

  console.log('Fetching emails for', accountId);
  setLoading(true);
  
  api.fetchEmails(accountId)
    .then((res) => {
      console.log('API response:', res);
      setEmails(res.data);
    })
    .catch((err) => {
      console.error('Failed to fetch emails:', err);
    })
    .finally(() => setLoading(false));
}, [accountId]);

  if (loading) return <div>Loading emails...</div>;

  if (!emails.length) return <div>No emails found</div>;

  useEffect(() => {
    // Listen for real-time email updates
    socketService.onEmailProcessed((email: Email) => {
      setEmails(prev => [email, ...prev]);
    });

    // Listen for sync progress
    socketService.onSyncProgress((progress: any) => {
      setSyncProgress(progress);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const filteredEmails = emails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const emailsPerPage = 5;
  const totalPages = Math.ceil(filteredEmails.length / emailsPerPage);
  const paginated = filteredEmails.slice(
    (currentPage - 1) * emailsPerPage,
    currentPage * emailsPerPage
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-md rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
        />
        <button className="px-4 py-3 cursor-pointer rounded-xl bg-[#875cf5]/15 text-[#875cf5] shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2">
          <Search size={18} />
        </button>
        <button className="px-4 py-3 cursor-pointer bg-white/60 backdrop-blur-md rounded-xl border border-black/10 text-gray-600 transition-all duration-200">
          <Filter size={18} />
        </button>
      </div>
      {syncProgress && 
              <p> Syncing {syncProgress.folder} - {syncProgress.total} messages </p>
            }

      {/* Email List */}
      <div className="space-y-3 mb-6">
        {paginated.map((email) => (
          <EmailItem key={email._id} email={email} onClick={setSelectedEmail} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white/60 rounded-lg border disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-2 rounded-lg border ${
                currentPage === p
                  ? 'bg-gradient-to-r from-purple-500 to-orange-500 text-white'
                  : 'bg-white/60'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white/60 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <EmailDetailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
    </div>
  );
};

export default EmailsPage;
