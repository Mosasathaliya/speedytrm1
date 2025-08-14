'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  // Redirect to dashboard immediately
  useEffect(() => {
    router.push('/');
  }, [router]);

  // This component will redirect before rendering anything
  return null;
}
