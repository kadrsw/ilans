import React from 'react';
import { Crown, Star, Zap } from 'lucide-react';

interface PremiumBadgeProps {
  packageType: 'daily' | 'weekly' | 'monthly';
  className?: string;
}

export function PremiumBadge({ packageType, className = '' }: PremiumBadgeProps) {
  const getBadgeConfig = () => {
    switch (packageType) {
      case 'daily':
        return {
          icon: <Zap className="h-3 w-3" />,
          text: 'ÖZEL',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white'
        };
      case 'weekly':
        return {
          icon: <Star className="h-3 w-3" />,
          text: 'PREMİUM',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
      case 'monthly':
        return {
          icon: <Crown className="h-3 w-3" />,
          text: 'GOLD',
          bgColor: 'bg-purple-500',
          textColor: 'text-white'
        };
      default:
        return {
          icon: <Star className="h-3 w-3" />,
          text: 'PREMİUM',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full ${config.bgColor} ${config.textColor} ${className}`}>
      {config.icon}
      {config.text}
    </span>
  );
}