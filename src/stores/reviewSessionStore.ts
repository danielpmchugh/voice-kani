import { create } from 'zustand';
import { ReviewSession, ReviewItem, VoiceInputConfig } from '../types/wanikani';
import { reviewDataService } from '../services/reviewData';

interface ReviewSessionState {
  currentSession: ReviewSession | null;
  loading: boolean;
  error: string | null;
  
  startSession: (userId?: string, items?: ReviewItem[]) => Promise<ReviewSession | null>;
  updateSessionItem: (itemId: string, updates: Partial<ReviewItem>) => Promise<void>;
  submitAnswer: (
    itemId: string, 
    isCorrect: boolean, 
    questionType?: 'meaning' | 'reading',
    inputMethod?: 'voice' | 'text',
    voiceConfidence?: number
  ) => Promise<void>;
  endSession: () => Promise<void>;
  clearSession: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  toggleVoiceInput: (enabled: boolean) => Promise<void>;
  updateVoiceConfig: (config: Partial<VoiceInputConfig>) => Promise<void>;
}

const defaultVoiceConfig: VoiceInputConfig = {
  language: 'ja-JP',
  maxDuration: 10000, // 10 seconds
  minDuration: 500,   // 0.5 seconds
  continuous: false,
  interimResults: true,
};

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
        settings: {
          voiceEnabled: true,
          voiceConfig: defaultVoiceConfig,
        },
        voiceStats: {
          voiceAnswerCount: 0,
          textAnswerCount: 0,
          averageConfidence: 0,
          failureCount: 0,
        },
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

  submitAnswer: async (
    itemId: string, 
    isCorrect: boolean, 
    questionType: 'meaning' | 'reading' = 'meaning',
    inputMethod: 'voice' | 'text' = 'text',
    voiceConfidence?: number
  ) => {
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
        answeredAt: now,
        inputMethod,
        voiceConfidence: inputMethod === 'voice' ? voiceConfidence : undefined,
      };
      
      await get().updateSessionItem(itemId, itemUpdates);
      
      const voiceStats = currentSession.voiceStats || {
        voiceAnswerCount: 0,
        textAnswerCount: 0,
        averageConfidence: 0,
        failureCount: 0,
      };
      
      if (inputMethod === 'voice') {
        voiceStats.voiceAnswerCount += 1;
        if (voiceConfidence) {
          const totalConfidence = voiceStats.averageConfidence * (voiceStats.voiceAnswerCount - 1) + voiceConfidence;
          voiceStats.averageConfidence = totalConfidence / voiceStats.voiceAnswerCount;
        }
      } else {
        voiceStats.textAnswerCount += 1;
      }
      
      const sessionUpdates: Partial<ReviewSession> = {
        currentItemIndex: currentSession.currentItemIndex + 1,
        correctCount: isCorrect ? currentSession.correctCount + 1 : currentSession.correctCount,
        incorrectCount: isCorrect ? currentSession.incorrectCount : currentSession.incorrectCount + 1,
        voiceStats,
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
  
  toggleVoiceInput: async (enabled: boolean) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    try {
      const settings = {
        ...(currentSession.settings || {}),
        voiceEnabled: enabled,
      };
      
      const updatedSession = await reviewDataService.updateSession(currentSession.id, { settings });
      set({ currentSession: updatedSession });
    } catch (err) {
      set({ error: 'Failed to toggle voice input' });
      console.error('Error toggling voice input:', err);
    }
  },
  
  updateVoiceConfig: async (config: Partial<VoiceInputConfig>) => {
    const { currentSession } = get();
    if (!currentSession) return;
    
    try {
      const currentConfig = currentSession.settings?.voiceConfig || defaultVoiceConfig;
      const updatedConfig = { ...currentConfig, ...config };
      
      const settings = {
        ...(currentSession.settings || {}),
        voiceConfig: updatedConfig,
      };
      
      const updatedSession = await reviewDataService.updateSession(currentSession.id, { settings });
      set({ currentSession: updatedSession });
    } catch (err) {
      set({ error: 'Failed to update voice configuration' });
      console.error('Error updating voice configuration:', err);
    }
  },
}));
