'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReviewSessionStore } from '@/stores/reviewSessionStore';
import ReviewCard from '@/components/review/ReviewCard';
import Button from '@/components/common/Button';

export default function ReviewPage() {
  const router = useRouter();
  const { currentSession, loading, error, submitAnswer, endSession, clearSession } =
    useReviewSessionStore();

  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  useEffect(() => {
    if (!loading && !currentSession) {
      router.push('/');
    }
  }, [currentSession, loading, router]);

  useEffect(() => {
    if (currentSession && currentItemIndex >= currentSession.items.length) {
      setSessionComplete(true);
    }
  }, [currentItemIndex, currentSession]);

  const handleAnswer = async (isCorrect: boolean) => {
    if (!currentSession || currentItemIndex >= currentSession.items.length) return;

    const currentItem = currentSession.items[currentItemIndex];
    await submitAnswer(currentItem.id, isCorrect);

    setCurrentItemIndex(prev => prev + 1);
  };

  const handleEndSession = async () => {
    await endSession();
    router.push('/');
  };

  const handleReturnHome = () => {
    clearSession();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading review session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Session Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={handleReturnHome}>Return to Home</Button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">No active session found. Redirecting...</div>
      </div>
    );
  }

  if (sessionComplete) {
    const score = Math.round((currentSession.correctCount / currentSession.items.length) * 100);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-6">Review Session Complete!</h1>
        <div className="text-center mb-8">
          <div className="text-2xl mb-2">Final Score: {score}%</div>
          <div className="text-lg text-gray-600">
            {currentSession.correctCount} correct out of {currentSession.items.length} items
          </div>
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleEndSession} variant="primary">
            End Session
          </Button>
          <Button onClick={handleReturnHome} variant="secondary">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const currentItem = currentSession.items[currentItemIndex];
  const progress = Math.round((currentItemIndex / currentSession.items.length) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between mb-2">
          <span>Progress</span>
          <span>
            {currentItemIndex} / {currentSession.items.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ReviewCard item={currentItem} onAnswer={handleAnswer} />

      <div className="mt-6">
        <Button onClick={handleReturnHome} variant="outline">
          End Review Early
        </Button>
      </div>
    </div>
  );
}
