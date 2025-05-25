/**
 * Data access layer interface for review sessions and items.
 * Provides abstraction for future migration from in-memory to persistent storage.
 */
export interface ReviewDataService {
  createSession(session: Omit<ReviewSession, 'id'>): Promise<ReviewSession>;
  getSession(sessionId: string): Promise<ReviewSession | null>;
  updateSession(sessionId: string, updates: Partial<ReviewSession>): Promise<ReviewSession>;
  deleteSession(sessionId: string): Promise<void>;
  getUserSessions(userId: string): Promise<ReviewSession[]>;

  updateSessionItem(
    sessionId: string,
    itemId: string,
    updates: Partial<ReviewItem>
  ): Promise<ReviewItem>;
  getSessionProgress(sessionId: string): Promise<{
    totalItems: number;
    completedItems: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTime: number;
  }>;

  deleteUserData(userId: string): Promise<void>;
  exportUserData(userId: string): Promise<{
    sessions: ReviewSession[];
    totalSessions: number;
    totalCorrect: number;
    totalIncorrect: number;
  }>;
}

import { ReviewSession, ReviewItem } from '../types/wanikani';

/**
 * In-memory implementation of the ReviewDataService.
 * Suitable for prototyping and development.
 */
export class InMemoryReviewDataService implements ReviewDataService {
  private sessions: Map<string, ReviewSession> = new Map();

  /**
   * Creates a new review session with a generated ID
   * @param sessionData Session data without ID
   * @returns The created session with ID
   */
  async createSession(sessionData: Omit<ReviewSession, 'id'>): Promise<ReviewSession> {
    const session: ReviewSession = {
      ...sessionData,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Retrieves a session by ID
   * @param sessionId The session ID
   * @returns The session or null if not found
   */
  async getSession(sessionId: string): Promise<ReviewSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Updates a session with partial data
   * @param sessionId The session ID
   * @param updates Partial session data to update
   * @returns The updated session
   * @throws Error if session not found
   */
  async updateSession(sessionId: string, updates: Partial<ReviewSession>): Promise<ReviewSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const updatedSession = { ...session, ...updates };
    this.sessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Deletes a session by ID
   * @param sessionId The session ID
   * @throws Error if session not found
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!this.sessions.has(sessionId)) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }
    this.sessions.delete(sessionId);
  }

  /**
   * Gets all sessions for a specific user
   * @param userId The user ID
   * @returns Array of sessions belonging to the user
   */
  async getUserSessions(userId: string): Promise<ReviewSession[]> {
    return Array.from(this.sessions.values()).filter(session => session.userId === userId);
  }

  /**
   * Updates a specific item within a session
   * @param sessionId The session ID
   * @param itemId The item ID
   * @param updates Partial item data to update
   * @returns The updated item
   * @throws Error if session or item not found
   */
  async updateSessionItem(
    sessionId: string,
    itemId: string,
    updates: Partial<ReviewItem>
  ): Promise<ReviewItem> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const itemIndex = session.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Item with ID ${itemId} not found in session ${sessionId}`);
    }

    const updatedItem = { ...session.items[itemIndex], ...updates };
    const updatedItems = [...session.items];
    updatedItems[itemIndex] = updatedItem;

    this.sessions.set(sessionId, { ...session, items: updatedItems });
    return updatedItem;
  }

  /**
   * Calculates and returns session progress metrics
   * @param sessionId The session ID
   * @returns Object containing progress metrics
   * @throws Error if session not found
   */
  async getSessionProgress(sessionId: string): Promise<{
    totalItems: number;
    completedItems: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTime: number;
  }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    const totalItems = session.items.length;
    const completedItems = session.items.filter(item => item.result).length;
    const correctAnswers = session.items.filter(item => item.result === 'correct').length;
    const incorrectAnswers = session.items.filter(item => item.result === 'incorrect').length;

    const answeredItems = session.items.filter(item => item.startedAt && item.answeredAt);
    let totalTime = 0;

    for (const item of answeredItems) {
      if (item.startedAt && item.answeredAt) {
        const startTime = new Date(item.startedAt).getTime();
        const endTime = new Date(item.answeredAt).getTime();
        totalTime += endTime - startTime;
      }
    }

    const averageTime = answeredItems.length > 0 ? totalTime / answeredItems.length : 0;

    return {
      totalItems,
      completedItems,
      correctAnswers,
      incorrectAnswers,
      averageTime,
    };
  }

  /**
   * Deletes all data for a specific user (GDPR compliance)
   * @param userId The user ID
   */
  async deleteUserData(userId: string): Promise<void> {
    const userSessionIds = Array.from(this.sessions.entries())
      .filter(([_, session]) => session.userId === userId)
      .map(([id]) => id);

    for (const sessionId of userSessionIds) {
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Exports all data for a specific user (GDPR compliance)
   * @param userId The user ID
   * @returns Object containing user's sessions and aggregated statistics
   */
  async exportUserData(userId: string): Promise<{
    sessions: ReviewSession[];
    totalSessions: number;
    totalCorrect: number;
    totalIncorrect: number;
  }> {
    const userSessions = await this.getUserSessions(userId);

    let totalCorrect = 0;
    let totalIncorrect = 0;

    for (const session of userSessions) {
      totalCorrect += session.items.filter(item => item.result === 'correct').length;
      totalIncorrect += session.items.filter(item => item.result === 'incorrect').length;
    }

    return {
      sessions: userSessions,
      totalSessions: userSessions.length,
      totalCorrect,
      totalIncorrect,
    };
  }
}

export const reviewDataService = new InMemoryReviewDataService();
