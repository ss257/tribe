import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { label: string; value: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, options, className = '', ...props }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <label htmlFor={id} className="text-secondary text-sm font-medium ml-1">
                {label}
            </label>
            <div className="relative">
                <select
                    id={id}
                    className={`
            w-full 
            bg-white 
            border border-transparent 
            px-4 py-3 
            rounded-xl 
            text-primary 
            appearance-none
            focus:outline-none focus:ring-1 focus:ring-primary/20
            shadow-[0px_2px_4px_rgba(0,0,0,0.02)]
            ${className}
          `}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-primary">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
