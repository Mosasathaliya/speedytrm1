'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const LogoutButton = ({ className = '', variant = 'ghost', size = 'sm' }) => {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant={variant} 
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      <span dir="rtl">عودة للرئيسية</span>
    </Button>
  );
};

export default LogoutButton;
