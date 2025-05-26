'use client';
import React, { useState } from 'react';
import Button from '@/components/common/Button';
import { useWaniKani } from '@/hooks/useWaniKani';

export default function Home() {
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startSession, loading, error: hookError, reviewItems } = useWaniKani();

  const handleStartReview = async () => {
    setIsStarting(true);
    setError(null);

    try {
      if (reviewItems.length === 0) {
        setError(
          'No review items available. Please check your WaniKani account or try again later.'
        );
        return;
      }

      const session = await startSession();
      if (session) {
        window.location.href = '/review';
      }
    } catch (err) {
      setError('Failed to start review session. Please try again.');
      console.error('Error starting review session:', err);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Voice-Enabled WaniKani Review System</h1>
      <p className="text-xl mb-8">
        A voice-enabled review system for WaniKani that allows users to practice Japanese language
        learning through voice input and provides enhanced progress tracking.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {hookError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {hookError}
        </div>
      )}

      <div className="mb-8">
        <Button
          onClick={handleStartReview}
          disabled={loading || isStarting || reviewItems.length === 0}
          variant="primary"
          size="lg"
        >
          {isStarting ? 'Starting Review...' : `Start Review Session (${reviewItems.length} items)`}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Voice Input</h2>
          <p>
            Practice your Japanese pronunciation while completing reviews using our voice
            recognition system.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Enhanced Dashboard</h2>
          <p>
            Track your progress with detailed analytics and visualizations to improve your learning
            experience.
          </p>
        </div>
      </div>
    </main>
  );
}
