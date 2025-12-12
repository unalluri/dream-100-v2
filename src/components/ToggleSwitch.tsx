import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: {
      switch: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-10 h-5',
      thumb: 'w-4 h-4',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: 'translate-x-6'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="flex items-center space-x-3">
      <button
        type="button"
        className={`
          relative inline-flex flex-shrink-0 border-2 border-transparent rounded-full 
          cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none 
          focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${classes.switch}
          ${checked 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25' 
            : 'bg-gray-700 hover:bg-gray-600'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block rounded-full bg-white shadow-lg 
            transform ring-0 transition ease-in-out duration-200
            ${classes.thumb}
            ${checked ? classes.translate : 'translate-x-0'}
          `}
        />
      </button>
      <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
};

export default ToggleSwitch;