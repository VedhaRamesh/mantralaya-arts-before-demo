import React from 'react';
import { BrandLogo } from './BrandLogo';

interface MantralayaLogoProps {
  className?: string;
  size?: number | string | 'sm' | 'md' | 'lg' | 'xl';
  withBackground?: boolean;
}

export const MantralayaLogo: React.FC<MantralayaLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const normalizedSize =
    typeof size === 'string' && ['sm', 'md', 'lg', 'xl'].includes(size)
      ? (size as 'sm' | 'md' | 'lg' | 'xl')
      : typeof size === 'number' && size <= 32
      ? 'sm'
      : typeof size === 'number' && size >= 56
      ? 'lg'
      : 'md';

  return <BrandLogo size={normalizedSize} className={className} />;
};
