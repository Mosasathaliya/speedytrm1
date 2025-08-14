'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AnimatedBackground from '@/components/layout/AnimatedBackground';

export default function RegisterPage() {
  const router = useRouter();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-2xl bg-card/95 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">التسجيل غير مطلوب — اضغط المتابعة للدخول إلى المنصة.</p>
                <Button type="submit" className="w-full">Continue to App</Button>
              </form>
              <div className="text-center text-sm opacity-70 mt-4">
                <a className="underline" href="/">Go to Home</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
