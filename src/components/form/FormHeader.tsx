import React from 'react';

interface FormHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  children,
  className = ''
}) => {
  return (
    <h1 className={`col-span-2 text-lg font-semibold mt-4 text-[#DC2626] ${className}`}>
      {children}
    </h1>
  );
};

export default FormHeader;