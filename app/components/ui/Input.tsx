import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <label htmlFor={id} className="text-secondary text-sm font-medium ml-1">
                {label}
            </label>
            <input
                id={id}
                className={`
          w-full 
          h-[50px]
          bg-white 
          border border-[#260E01]/10 
          px-4 py-3 
          rounded-[12px] 
          text-primary text-[15px] font-semibold
          placeholder:text-secondary/50 placeholder:text-[15px] placeholder:font-semibold
          focus:outline-none focus:ring-1 focus:ring-primary/20
          ${className}
        `}
                {...props}
            />
        </div>
    );
};
