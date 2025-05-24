import { ReviewDataService, InMemoryReviewDataService } from '../../src/services/reviewData';
import { ReviewSession, ReviewItem } from '../../src/types/wanikani';

describe('InMemoryReviewDataService', () => {
  let service: ReviewDataService;
  let testUserId: string;
  let testItem: ReviewItem;
  let testSession: ReviewSession;

  beforeEach(async () => {
    service = new InMemoryReviewDataService();
    testUserId = 'test-user-1';
    
    testItem = {
      id: 'item-1',
      wanikaniId: 'wk-1234',
      type: 'kanji',
      questionType: 'meaning',
      question: 'What is the meaning of 水?',
      expectedAnswer: 'water',
      character: '水',
      object: 'kanji',
      meanings: ['water'],
      srsStage: 1,
      userSpecificSrsStage: 1,
      subjectType: 'kanji'
    };
    
    const sessionData: Omit<ReviewSession, 'id'> = {
      userId: testUserId,
      items: [testItem],
      startedAt: new Date().toISOString(),
      completed: false,
      source: 'wanikani',
      currentItemIndex: 0,
      correctCount: 0,
      incorrectCount: 0
    };
    
    testSession = await service.createSession(sessionData);
  });

  describe('Session operations', () => {
    test('createSession should generate a unique ID and store the session', async () => {
      expect(testSession.id).toBeDefined();
      expect(testSession.userId).toBe(testUserId);
      expect(testSession.items).toHaveLength(1);
      
      const retrievedSession = await service.getSession(testSession.id);
      expect(retrievedSession).toEqual(testSession);
    });
    
    test('getSession should return null for non-existent session', async () => {
      const result = await service.getSession('non-existent-id');
      expect(result).toBeNull();
    });
    
    test('updateSession should update session fields', async () => {
      const updates = {
        completed: true,
        endedAt: new Date().toISOString(),
        score: 100
      };
      
      const updatedSession = await service.updateSession(testSession.id, updates);
      
      expect(updatedSession.completed).toBe(true);
      expect(updatedSession.endedAt).toBeDefined();
      expect(updatedSession.score).toBe(100);
      
      const retrievedSession = await service.getSession(testSession.id);
      expect(retrievedSession).toEqual(updatedSession);
    });
    
    test('updateSession should throw error for non-existent session', async () => {
      await expect(service.updateSession('non-existent-id', { completed: true }))
        .rejects.toThrow('Session with ID non-existent-id not found');
    });
    
    test('deleteSession should remove the session', async () => {
      await service.deleteSession(testSession.id);
      const result = await service.getSession(testSession.id);
      expect(result).toBeNull();
    });
    
    test('deleteSession should throw error for non-existent session', async () => {
      await expect(service.deleteSession('non-existent-id'))
        .rejects.toThrow('Session with ID non-existent-id not found');
    });
    
    test('getUserSessions should return all sessions for a user', async () => {
      const secondSessionData: Omit<ReviewSession, 'id'> = {
        userId: testUserId,
        items: [testItem],
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 0,
        correctCount: 0,
        incorrectCount: 0
      };
      
      await service.createSession(secondSessionData);
      
      const otherUserSessionData: Omit<ReviewSession, 'id'> = {
        userId: 'other-user',
        items: [testItem],
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 0,
        correctCount: 0,
        incorrectCount: 0
      };
      
      await service.createSession(otherUserSessionData);
      
      const userSessions = await service.getUserSessions(testUserId);
      
      expect(userSessions).toHaveLength(2);
      expect(userSessions.every(session => session.userId === testUserId)).toBe(true);
    });
  });

  describe('Item operations', () => {
    test('updateSessionItem should update an item within a session', async () => {
      const itemUpdates: Partial<ReviewItem> = {
        userAnswer: 'water',
        result: 'correct',
        answeredAt: new Date().toISOString()
      };
      
      const updatedItem = await service.updateSessionItem(testSession.id, testItem.id, itemUpdates);
      
      expect(updatedItem.userAnswer).toBe('water');
      expect(updatedItem.result).toBe('correct');
      expect(updatedItem.answeredAt).toBeDefined();
      
      const updatedSession = await service.getSession(testSession.id);
      expect(updatedSession?.items[0]).toEqual(updatedItem);
    });
    
    test('updateSessionItem should throw error for non-existent session', async () => {
      await expect(service.updateSessionItem('non-existent-id', testItem.id, { result: 'correct' }))
        .rejects.toThrow('Session with ID non-existent-id not found');
    });
    
    test('updateSessionItem should throw error for non-existent item', async () => {
      await expect(service.updateSessionItem(testSession.id, 'non-existent-item', { result: 'correct' }))
        .rejects.toThrow('Item with ID non-existent-item not found in session');
    });
    
    test('getSessionProgress should calculate correct progress metrics', async () => {
      const items: ReviewItem[] = [
        {
          id: 'item-1',
          wanikaniId: 'wk-1',
          type: 'kanji',
          questionType: 'meaning',
          question: 'What is the meaning of 水?',
          expectedAnswer: 'water',
          character: '水',
          result: 'correct',
          startedAt: '2023-01-01T10:00:00Z',
          answeredAt: '2023-01-01T10:00:05Z',
          object: 'kanji',
          meanings: ['water'],
          srsStage: 1,
          userSpecificSrsStage: 1,
          subjectType: 'kanji'
        },
        {
          id: 'item-2',
          wanikaniId: 'wk-2',
          type: 'kanji',
          questionType: 'reading',
          question: 'What is the reading of 火?',
          expectedAnswer: 'ひ',
          character: '火',
          result: 'incorrect',
          startedAt: '2023-01-01T10:00:10Z',
          answeredAt: '2023-01-01T10:00:18Z',
          object: 'kanji',
          meanings: ['fire'],
          srsStage: 1,
          userSpecificSrsStage: 1,
          subjectType: 'kanji'
        },
        {
          id: 'item-3',
          wanikaniId: 'wk-3',
          type: 'vocabulary',
          questionType: 'meaning',
          question: 'What is the meaning of 犬?',
          expectedAnswer: 'dog',
          character: '犬',
          object: 'vocabulary',
          meanings: ['dog'],
          srsStage: 1,
          userSpecificSrsStage: 1,
          subjectType: 'vocabulary'
        }
      ];
      
      const sessionData: Omit<ReviewSession, 'id'> = {
        userId: testUserId,
        items,
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 2,
        correctCount: 1,
        incorrectCount: 1
      };
      
      const session = await service.createSession(sessionData);
      
      const progress = await service.getSessionProgress(session.id);
      
      expect(progress.totalItems).toBe(3);
      expect(progress.completedItems).toBe(2);
      expect(progress.correctAnswers).toBe(1);
      expect(progress.incorrectAnswers).toBe(1);
      expect(progress.averageTime).toBe(6500); // (5000 + 8000) / 2 = 6500ms
    });
  });

  describe('User data management (GDPR compliance)', () => {
    test('deleteUserData should remove all user sessions', async () => {
      for (let i = 0; i < 3; i++) {
        await service.createSession({
          userId: testUserId,
          items: [testItem],
          startedAt: new Date().toISOString(),
          completed: false,
          source: 'wanikani',
          currentItemIndex: 0,
          correctCount: 0,
          incorrectCount: 0
        });
      }
      
      const otherUserId = 'other-user';
      const otherSessionData: Omit<ReviewSession, 'id'> = {
        userId: otherUserId,
        items: [testItem],
        startedAt: new Date().toISOString(),
        completed: false,
        source: 'wanikani',
        currentItemIndex: 0,
        correctCount: 0,
        incorrectCount: 0
      };
      
      const otherSession = await service.createSession(otherSessionData);
      
      await service.deleteUserData(testUserId);
      
      const testUserSessions = await service.getUserSessions(testUserId);
      expect(testUserSessions).toHaveLength(0);
      
      const otherUserSessions = await service.getUserSessions(otherUserId);
      expect(otherUserSessions).toHaveLength(1);
      expect(otherUserSessions[0].id).toBe(otherSession.id);
    });
    
    test('exportUserData should return all user sessions and statistics', async () => {
      const items1: ReviewItem[] = [
        { ...testItem, id: 'item-1', result: 'correct' },
        { ...testItem, id: 'item-2', result: 'correct' }
      ];
      
      const items2: ReviewItem[] = [
        { ...testItem, id: 'item-3', result: 'incorrect' },
        { ...testItem, id: 'item-4', result: 'correct' }
      ];
      
      await service.createSession({
        userId: testUserId,
        items: items1,
        startedAt: new Date().toISOString(),
        completed: true,
        source: 'wanikani',
        currentItemIndex: 2,
        correctCount: 2,
        incorrectCount: 0
      });
      
      await service.createSession({
        userId: testUserId,
        items: items2,
        startedAt: new Date().toISOString(),
        completed: true,
        source: 'wanikani',
        currentItemIndex: 2,
        correctCount: 1,
        incorrectCount: 1
      });
      
      const userData = await service.exportUserData(testUserId);
      
      expect(userData.sessions).toHaveLength(3); // Including the one from beforeEach
      expect(userData.totalSessions).toBe(3);
      expect(userData.totalCorrect).toBe(3); // 2 from first session, 1 from second
      expect(userData.totalIncorrect).toBe(1); // 0 from first session, 1 from second
    });
  });
});
