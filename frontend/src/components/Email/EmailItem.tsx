import React from 'react';
import type { Email } from '../../types';

interface Props {
  email: Email;
  onClick: (email: Email) => void;
}

const EmailItem: React.FC<Props> = ({ email, onClick }) => {
  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={() => onClick(email)}
      className="bg-white/60 backdrop-blur-md rounded-lg p-4 shadow-md border border-white/30 hover:shadow-lg transition-all duration-200 cursor-pointer hover:bg-white/70"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm ${email.flags.read ? 'font-normal' : 'font-semibold'} text-gray-800 truncate`}>
            {email.subject}
          </h4>
          <p className="text-xs text-gray-600 mt-1 truncate">{email.from}</p>
        </div>
        <div className="flex items-center gap-2">
          {!email.flags.read && <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-orange-500" />}
          <span className="text-xs text-gray-500">{formatTime((email.receivedDate).toLocaleTimeString())}</span>
        </div>
      </div>
    </div>
  );
};

export default EmailItem;
