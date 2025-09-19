import React from 'react';
import Modal from '../Modal/Modal';
import type { Email } from '../../types';

interface Props {
  email: Email | null;
  onClose: () => void;
}

const EmailDetailModal: React.FC<Props> = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <Modal isOpen={!!email} onClose={onClose} title={email.subject}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-black text-sm font-semibold">
            {email.from.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800">{email.from}</p>
            <p className="text-sm text-gray-600">{new Date(email.receivedDate).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-gray-700">
          <p>This is a preview of the email content. In a real app, full email body would load here.</p>
        </div>
      </div>
    </Modal>
  );
};

export default EmailDetailModal;
