import React from 'react';
import { Bell } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-xl p-8 shadow-lg border border-white/30 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full">
        <Bell className="text-white" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics Coming Soon</h3>
      <p className="text-gray-600">This section will contain detailed email analytics and insights.</p>
    </div>
  );
};

export default AnalyticsPage;
