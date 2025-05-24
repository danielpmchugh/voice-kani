import { ReviewItem, ReviewSession } from '../../src/types/wanikani';

describe('ReviewItem interface', () => {
  test('should create a valid ReviewItem with required fields', () => {
    const item: ReviewItem = {
      id: 'item-1',
      wanikaniId: 'wk-1234',
      type: 'kanji',
      questionType: 'meaning',
      question: 'What is the meaning of 水?',
      expectedAnswer: 'water',
      object: 'kanji',
      meanings: ['water'],
      srsStage: 1,
      userSpecificSrsStage: 1,
      subjectType: 'kanji'
    };
    
    expect(item.id).toBe('item-1');
    expect(item.wanikaniId).toBe('wk-1234');
    expect(item.type).toBe('kanji');
    expect(item.questionType).toBe('meaning');
    expect(item.question).toBe('What is the meaning of 水?');
    expect(item.expectedAnswer).toBe('water');
  });
  
  test('should support optional fields', () => {
    const item: ReviewItem = {
      id: 'item-1',
      wanikaniId: 'wk-1234',
      type: 'kanji',
      questionType: 'meaning',
      question: 'What is the meaning of 水?',
      expectedAnswer: 'water',
      userAnswer: 'water',
      result: 'correct',
      startedAt: '2023-01-01T10:00:00Z',
      answeredAt: '2023-01-01T10:00:05Z',
      audioUrl: 'https://example.com/audio/water.mp3',
      character: '水',
      auxiliaryMeanings: ['liquid', 'fluid'],
      mnemonic: 'Looks like a flowing river',
      object: 'kanji',
      meanings: ['water'],
      srsStage: 1,
      userSpecificSrsStage: 1,
      subjectType: 'kanji'
    };
    
    expect(item.userAnswer).toBe('water');
    expect(item.result).toBe('correct');
    expect(item.startedAt).toBe('2023-01-01T10:00:00Z');
    expect(item.answeredAt).toBe('2023-01-01T10:00:05Z');
    expect(item.audioUrl).toBe('https://example.com/audio/water.mp3');
    expect(item.character).toBe('水');
    expect(item.auxiliaryMeanings).toEqual(['liquid', 'fluid']);
    expect(item.mnemonic).toBe('Looks like a flowing river');
  });
  
  test('should support backward compatibility with legacy fields', () => {
    const item: ReviewItem = {
      id: 'item-1',
      wanikaniId: 'wk-1234',
      type: 'kanji',
      questionType: 'meaning',
      question: 'What is the meaning of 水?',
      expectedAnswer: 'water',
      character: '水',
      characters: '水',
      object: 'kanji',
      meanings: ['water'],
      readings: ['みず', 'すい'],
      srsStage: 1,
      userSpecificSrsStage: 1,
      subjectType: 'kanji'
    };
    
    expect(item.characters).toBe('水'); // Deprecated but still supported
    expect(item.object).toBe('kanji'); // Deprecated but still supported
    expect(item.meanings).toEqual(['water']); // Deprecated but still supported
    expect(item.readings).toEqual(['みず', 'すい']); // Deprecated but still supported
  });
});

describe('ReviewSession interface', () => {
  test('should create a valid ReviewSession with required fields', () => {
    const session: ReviewSession = {
      id: 'session-1',
      userId: 'user-1',
      items: [],
      startedAt: '2023-01-01T10:00:00Z',
      completed: false,
      source: 'wanikani',
      currentItemIndex: 0,
      correctCount: 0,
      incorrectCount: 0
    };
    
    expect(session.id).toBe('session-1');
    expect(session.userId).toBe('user-1');
    expect(session.items).toEqual([]);
    expect(session.startedAt).toBe('2023-01-01T10:00:00Z');
    expect(session.completed).toBe(false);
    expect(session.source).toBe('wanikani');
  });
  
  test('should support optional fields', () => {
    const session: ReviewSession = {
      id: 'session-1',
      userId: 'user-1',
      items: [],
      startedAt: '2023-01-01T10:00:00Z',
      endedAt: '2023-01-01T10:30:00Z',
      score: 85,
      completed: true,
      settings: {
        voiceEnabled: true,
        timeLimit: 30,
        autoAdvance: true
      },
      source: 'wanikani',
      currentItemIndex: 10,
      correctCount: 8,
      incorrectCount: 2,
      completedAt: '2023-01-01T10:30:00Z'
    };
    
    expect(session.endedAt).toBe('2023-01-01T10:30:00Z');
    expect(session.score).toBe(85);
    expect(session.settings).toEqual({
      voiceEnabled: true,
      timeLimit: 30,
      autoAdvance: true
    });
  });
  
  test('should support backward compatibility with legacy fields', () => {
    const session: ReviewSession = {
      id: 'session-1',
      userId: 'user-1',
      items: [],
      startedAt: '2023-01-01T10:00:00Z',
      completed: true,
      source: 'wanikani',
      currentItemIndex: 10,
      correctCount: 8,
      incorrectCount: 2,
      completedAt: '2023-01-01T10:30:00Z'
    };
    
    expect(session.currentItemIndex).toBe(10); // Deprecated but still supported
    expect(session.correctCount).toBe(8); // Deprecated but still supported
    expect(session.incorrectCount).toBe(2); // Deprecated but still supported
    expect(session.completedAt).toBe('2023-01-01T10:30:00Z'); // Deprecated but still supported
  });
  
  test('should handle multi-user functionality', () => {
    const user1Session: ReviewSession = {
      id: 'session-1',
      userId: 'user-1',
      items: [],
      startedAt: '2023-01-01T10:00:00Z',
      completed: false,
      source: 'wanikani',
      currentItemIndex: 0,
      correctCount: 0,
      incorrectCount: 0
    };
    
    const user2Session: ReviewSession = {
      id: 'session-2',
      userId: 'user-2',
      items: [],
      startedAt: '2023-01-01T11:00:00Z',
      completed: false,
      source: 'wanikani',
      currentItemIndex: 0,
      correctCount: 0,
      incorrectCount: 0
    };
    
    expect(user1Session.userId).toBe('user-1');
    expect(user2Session.userId).toBe('user-2');
    expect(user1Session.userId).not.toBe(user2Session.userId);
  });
});
