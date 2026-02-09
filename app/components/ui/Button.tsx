import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    fullWidth = false,
    ...props
}) => {
    return (
        <button
            className={`
        bg-primary text-white 
        h-[50px] px-6 flex items-center justify-center
        rounded-[12px] 
        text-[15px]
        font-semibold 
        hover:bg-opacity-90 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
};
