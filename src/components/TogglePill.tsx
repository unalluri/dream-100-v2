import React from 'react';

interface TogglePillProps {
  label: string;
  isOn: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const TogglePill: React.FC<TogglePillProps> = ({ 
  label, 
  isOn, 
  onClick, 
  disabled = false,
  size = 'sm'
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center rounded-full font-medium transition-all duration-200 ease-out
        ${sizeClasses[size]}
        ${isOn 
          ? 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/25 hover:shadow-[#10b981]/40' 
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
      `}
    >
      <div className={`w-2 h-2 rounded-full mr-1.5 ${
        isOn ? 'bg-white' : 'bg-gray-500'
      }`} />
      {label}
    </button>
  );
};

export default TogglePill;