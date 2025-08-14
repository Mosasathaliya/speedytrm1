// src/components/navigation/BottomNavBar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Brain, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavBar: React.FC = () => {
  const pathname = usePathname();

  const navigationItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home
    },
    {
      href: '/learn',
      label: 'Learn',
      icon: BookOpen
    },
    {
      href: '/ai',
      label: 'AI',
      icon: Brain
    },
    {
      href: '/score',
      label: 'Score',
      icon: Trophy
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
