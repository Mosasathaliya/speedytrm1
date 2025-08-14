'use client';

import React, { useEffect } from 'react';

/**
 * ApiProxyProvider
 * Redirects any client-side fetch requests to relative "/api/..." paths
 * to the configured Cloudflare Worker base URL.
 * This enables a static export frontend (Cloudflare Pages) to talk to the
 * Worker backend without relying on server-side routes.
 */
export const ApiProxyProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const workerBaseUrl = (process.env.NEXT_PUBLIC_WORKER_URL || '').replace(/\/$/, '');
    if (!workerBaseUrl) return;

    const originalFetch = window.fetch.bind(window);

    // Attach base URL for visibility in debugging
    (window as any).__API_BASE__ = workerBaseUrl;

    // Patch global fetch to rewrite relative API calls
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        if (typeof input === 'string' || input instanceof URL) {
          const urlString = String(input);
          if (urlString.startsWith('/api/')) {
            const rewritten = `${workerBaseUrl}${urlString}`;
            return originalFetch(rewritten, init);
          }
        }
      } catch {
        // fall through to original fetch on any error
      }
      return originalFetch(input as any, init);
    };

    return () => {
      // Restore original fetch on unmount to avoid leaks in dev HMR
      window.fetch = originalFetch as any;
    };
  }, []);

  return <>{children}</>;
};

export default ApiProxyProvider;


