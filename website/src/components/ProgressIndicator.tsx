// website/src/components/ProgressIndicator.tsx
'use client';

import React from 'react';

interface ProgressIndicatorProps {
  status: string;
  isLoading: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ status, isLoading }) => {
  if (!isLoading || !status) return null;
  
  return (
    <div className="mt-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center">
        <div className="mr-3">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <div className="text-blue-800">{status}</div>
      </div>
    </div>
  );
};

export default ProgressIndicator;