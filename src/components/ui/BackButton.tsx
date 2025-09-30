import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRobustNavigation } from '@/hooks/useRobustNavigation';

interface BackButtonProps {
  to?: string;
  children?: React.ReactNode;
  className?: string;
  variant?: 'button' | 'link';
  fallbackUrl?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to,
  children = 'Volver',
  className = '',
  variant = 'button',
  fallbackUrl = '/'
}) => {
  const { navigate, goBack } = useRobustNavigation();

  const handleBack = () => {
    console.log('BackButton: Iniciando navegación...');

    if (to) {
      console.log(`BackButton: Navegando a ${to}`);
      navigate(to, { replace: true, fallback: fallbackUrl });
    } else {
      console.log('BackButton: Usando goBack');
      goBack(fallbackUrl);
    }
  };

  if (variant === 'link') {
    return (
      <button
        onClick={handleBack}
        className={`text-blue-600 hover:text-blue-800 hover:underline ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      title="Volver atrás"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};