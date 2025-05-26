import { useState, useEffect } from 'react';
import { fetchReviewItems, submitReviewResult } from '../services/wanikani/api';
import { ReviewItem } from '../types/wanikani';
import { useReviewSessionStore } from '../stores/reviewSessionStore';

export const useWaniKani = () => {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const {
    currentSession: session,
    loading: sessionLoading,
    error: sessionError,
    startSession,
    submitAnswer: submitSessionAnswer,
    setError,
  } = useReviewSessionStore();

  const [loading, setLocalLoading] = useState<boolean>(false);
  const [error, setLocalError] = useState<string | null>(null);

  const loadReviewItems = async () => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      const data = await fetchReviewItems();
      setReviewItems(data.items || []);
    } catch (err) {
      setLocalError('Failed to load review items');
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };

  const startReviewSession = async (userId = 'default-user') => {
    return await startSession(userId, reviewItems);
  };

  const submitAnswer = async (
    itemId: string,
    isCorrect: boolean,
    questionType: 'meaning' | 'reading' = 'meaning'
  ) => {
    if (!session) return;

    try {
      await submitSessionAnswer(itemId, isCorrect, questionType);

      await submitReviewResult(itemId, {
        review: {
          incorrect_meaning_answers: questionType === 'meaning' && !isCorrect ? 1 : 0,
          incorrect_reading_answers: questionType === 'reading' && !isCorrect ? 1 : 0,
        },
      });

      return session;
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    }
  };

  useEffect(() => {
    loadReviewItems();
  }, []);

  return {
    loading: loading || sessionLoading,
    error: error || sessionError,
    reviewItems,
    session,
    loadReviewItems,
    startSession: startReviewSession,
    submitAnswer,
  };
};
