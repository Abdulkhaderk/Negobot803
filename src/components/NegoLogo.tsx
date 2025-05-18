
import React from 'react';

const NegoLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  // Define sizes based on the size prop
  const dimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  const { width, height } = dimensions[size];

  return (
    <div className={`nego-logo animate-pulse inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-0.5`} style={{ width, height }}>
      <div className="bg-white dark:bg-gray-900 rounded-full w-full h-full flex items-center justify-center">
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600" style={{ fontSize: width * 0.5 }}>
          N
        </span>
      </div>
    </div>
  );
};

export default NegoLogo;
