import { useState, useEffect } from 'react';
import { fetchReviewItems, submitReviewResult } from '@/services/wanikani/api';
import { ReviewItem, ReviewSession } from '@/types/wanikani';

export const useWaniKani = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [session, setSession] = useState<ReviewSession | null>(null);

  const loadReviewItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchReviewItems();
      setReviewItems(data.items || []);
    } catch (err) {
      setError('Failed to load review items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startSession = () => {
    if (reviewItems.length === 0) {
      setError('No review items available');
      return null;
    }

    const newSession: ReviewSession = {
      id: `session-${Date.now()}`,
      items: reviewItems,
      currentItemIndex: 0,
      startedAt: new Date().toISOString(),
      correctCount: 0,
      incorrectCount: 0,
    };

    setSession(newSession);
    return newSession;
  };

  const submitAnswer = async (itemId: string, isCorrect: boolean) => {
    if (!session) return;

    const updatedSession = { ...session };

    if (isCorrect) {
      updatedSession.correctCount += 1;
    } else {
      updatedSession.incorrectCount += 1;
    }

    updatedSession.currentItemIndex += 1;

    if (updatedSession.currentItemIndex >= updatedSession.items.length) {
      updatedSession.completedAt = new Date().toISOString();
    }

    setSession(updatedSession);

    try {
      await submitReviewResult(itemId, {
        review: {
          incorrect_meaning_answers: isCorrect ? 0 : 1,
          incorrect_reading_answers: isCorrect ? 0 : 1,
        },
      });
    } catch (err) {
      console.error('Error submitting review result:', err);
    }

    return updatedSession;
  };

  useEffect(() => {
    loadReviewItems();
  }, []);

  return {
    loading,
    error,
    reviewItems,
    session,
    loadReviewItems,
    startSession,
    submitAnswer,
  };
};
