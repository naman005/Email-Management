import React from 'react';
import { X } from 'lucide-react';
import type { Toast } from '../../types';

interface Props {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<Props> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-green-100/80 border-green-200 text-green-800'
              : toast.type === 'error'
              ? 'bg-red-100/80 border-red-200 text-red-800'
              : 'bg-blue-100/80 border-blue-200 text-blue-800'
          }`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current hover:opacity-70 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
