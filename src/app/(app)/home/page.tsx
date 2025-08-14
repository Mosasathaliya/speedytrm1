'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      <header className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
          Home Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Import your home components here
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="text-center text-muted-foreground">
          <p>Your home dashboard components will be imported here</p>
        </div>
      </main>
    </div>
  );
}
