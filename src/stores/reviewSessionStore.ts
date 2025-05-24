import { create } from 'zustand';
import { ReviewSession, ReviewItem } from '../types/wanikani';
import { reviewDataService } from '../services/reviewData';

interface ReviewSessionState {
  currentSession: ReviewSession | null;
  loading: boolean;
  error: string | null;
  
  startSession: (userId?: string, items?: ReviewItem[]) => Promise<ReviewSession | null>;
  updateSessionItem: (itemId: string, updates: Partial<ReviewItem>) => Promise<void>;
  submitAnswer: (itemId: string, isCorrect: boolean, questionType?: 'meaning' | 'reading') => Promise<void>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useReviewSessionStore = create<ReviewSessionState>((set, get) => ({
  currentSession: null,
  loading: false,
  error: null,

  startSession: async (userId = 'default-user', items = []) => {
    set({ loading: true, error: null });
    
    try {
      if (items.length === 0) {
        set({ error: 'No review items available', loading: false });
        return null;
      }

      const sessionData: Omit<ReviewSession, 'id'> = {
        userId,
        items,
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 0,
        correctCount: 0,
        incorrectCount: 0,
      };

      const newSession = await reviewDataService.createSession(sessionData);
      set({ currentSession: newSession, loading: false });
      return newSession;
    } catch (err) {
      const errorMessage = 'Failed to create review session';
      set({ error: errorMessage, loading: false });
      console.error(err);
      return null;
    }
  },

  updateSessionItem: async (itemId: string, updates: Partial<ReviewItem>) => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      await reviewDataService.updateSessionItem(currentSession.id, itemId, updates);
      
      const updatedItems = currentSession.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      
      set({
        currentSession: {
          ...currentSession,
          items: updatedItems
        }
      });
    } catch (err) {
      set({ error: 'Failed to update session item' });
      console.error('Error updating session item:', err);
    }
  },

  submitAnswer: async (itemId: string, isCorrect: boolean, _questionType: 'meaning' | 'reading' = 'meaning') => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      const itemIndex = currentSession.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error(`Item with ID ${itemId} not found in session`);
      }

      const item = currentSession.items[itemIndex];
      const now = new Date().toISOString();
      
      const itemUpdates: Partial<ReviewItem> = {
        userAnswer: item.expectedAnswer, // In a real app, this would be the user's actual input
        result: isCorrect ? 'correct' : 'incorrect',
        answeredAt: now
      };
      
      await get().updateSessionItem(itemId, itemUpdates);
      
      const sessionUpdates: Partial<ReviewSession> = {
        currentItemIndex: currentSession.currentItemIndex + 1,
        correctCount: isCorrect ? currentSession.correctCount + 1 : currentSession.correctCount,
        incorrectCount: isCorrect ? currentSession.incorrectCount : currentSession.incorrectCount + 1
      };
      
      const progress = await reviewDataService.getSessionProgress(currentSession.id);
      if (progress.completedItems >= progress.totalItems) {
        sessionUpdates.completed = true;
        sessionUpdates.endedAt = now;
        sessionUpdates.completedAt = now; // Legacy field
        
        const score = Math.round((progress.correctAnswers / progress.totalItems) * 100);
        sessionUpdates.score = score;
      }
      
      const updatedSession = await reviewDataService.updateSession(currentSession.id, sessionUpdates);
      set({ currentSession: updatedSession });
    } catch (err) {
      set({ error: 'Failed to submit answer' });
      console.error('Error submitting answer:', err);
    }
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    try {
      const now = new Date().toISOString();
      const updatedSession = await reviewDataService.updateSession(currentSession.id, {
        completed: true,
        endedAt: now,
        completedAt: now // Legacy field
      });
      
      set({ currentSession: updatedSession });
    } catch (err) {
      set({ error: 'Failed to end session' });
      console.error('Error ending session:', err);
    }
  },

  clearSession: () => {
    set({ currentSession: null, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },
}));
