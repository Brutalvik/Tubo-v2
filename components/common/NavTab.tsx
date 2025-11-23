import React from 'react';

export const NavTab = ({ icon, label, active, onClick, isAvatar = false }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isAvatar?: boolean }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 w-14 transition-all duration-300 group`}
  >
    <div className={`relative p-1 rounded-xl transition-all duration-300 ${active ? 'text-tubo-orange -translate-y-1' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
        {isAvatar ? (
            <div className={`h-6 w-6 rounded-full overflow-hidden ring-2 transition-all ${active ? 'ring-tubo-orange' : 'ring-transparent'}`}>
                {icon}
            </div>
        ) : (
            React.cloneElement(icon as React.ReactElement<any>, { 
                size: 24, 
                strokeWidth: active ? 2.5 : 2,
                fill: active ? "currentColor" : "none",
                className: active ? "opacity-100" : "opacity-80"
            })
        )}
        {active && !isAvatar && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-tubo-orange rounded-full"></span>}
    </div>
    <span className={`text-[10px] font-bold transition-colors truncate w-full text-center ${active ? 'text-tubo-blue dark:text-white' : 'text-gray-400'}`}>{label}</span>
  </button>
);