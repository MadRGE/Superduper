import React from 'react';

interface ForceNavigationProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const ForceNavigation: React.FC<ForceNavigationProps> = ({
  to,
  children,
  className = '',
  title = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`ForceNavigation: Navegando forzadamente a ${to}`);

    // Forzar navegación directa
    window.location.href = to;
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      title={title}
    >
      {children}
    </button>
  );
};