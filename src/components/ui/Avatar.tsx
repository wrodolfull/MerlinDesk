import React from 'react';
import { cn } from '../../utils/cn';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar = ({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const fallbackStyles = {
    sm: { size: 14 },
    md: { size: 18 },
    lg: { size: 24 },
  };

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex items-center justify-center bg-gray-200',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="h-full w-full object-cover"
          onError={(e) => {
            // Replace with fallback icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('bg-gray-200');
          }}
        />
      ) : (
        <User size={fallbackStyles[size].size} className="text-gray-500" />
      )}
    </div>
  );
};

export default Avatar;