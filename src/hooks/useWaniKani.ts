import { useState, useEffect } from 'react';
import { fetchReviewItems, submitReviewResult } from '../services/wanikani/api';
import { ReviewItem, ReviewSession } from '../types/wanikani';
import { reviewDataService } from '../services/reviewData';

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

  const startSession = async (userId = 'default-user') => {
    if (reviewItems.length === 0) {
      setError('No review items available');
      return null;
    }

    try {
      const sessionData: Omit<ReviewSession, 'id'> = {
        userId,
        items: reviewItems,
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
      };

      const newSession = await reviewDataService.createSession(sessionData);
      setSession(newSession);
      return newSession;
    } catch (err) {
      setError('Failed to create review session');
      console.error(err);
      return null;
    }
  };

  const submitAnswer = async (itemId: string, isCorrect: boolean, questionType: 'meaning' | 'reading' = 'meaning') => {
    if (!session) return;

    try {
      const itemIndex = session.items.findIndex((item: ReviewItem) => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error(`Item with ID ${itemId} not found in session`);
      }

      const item = session.items[itemIndex];
      const now = new Date().toISOString();
      
      const itemUpdates: Partial<ReviewItem> = {
        userAnswer: item.expectedAnswer, // In a real app, this would be the user's actual input
        result: isCorrect ? 'correct' : 'incorrect',
        answeredAt: now
      };
      
      await reviewDataService.updateSessionItem(session.id, itemId, itemUpdates);
      
      const sessionUpdates: Partial<ReviewSession> = {
        currentItemIndex: session.currentItemIndex + 1,
        correctCount: isCorrect ? session.correctCount + 1 : session.correctCount,
        incorrectCount: isCorrect ? session.incorrectCount : session.incorrectCount + 1
      };
      
      const progress = await reviewDataService.getSessionProgress(session.id);
      if (progress.completedItems >= progress.totalItems) {
        sessionUpdates.completed = true;
        sessionUpdates.endedAt = now;
        sessionUpdates.completedAt = now; // Legacy field
        
        const score = Math.round((progress.correctAnswers / progress.totalItems) * 100);
        sessionUpdates.score = score;
      }
      
      const updatedSession = await reviewDataService.updateSession(session.id, sessionUpdates);
      setSession(updatedSession);

      await submitReviewResult(itemId, {
        review: {
          incorrect_meaning_answers: questionType === 'meaning' && !isCorrect ? 1 : 0,
          incorrect_reading_answers: questionType === 'reading' && !isCorrect ? 1 : 0,
        },
      });
      
      return updatedSession;
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    }
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
