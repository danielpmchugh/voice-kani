export interface WaniKaniUser {
  id: string;
  username: string;
  level: number;
  profileUrl: string;
  startedAt: string;
}

/**
 * Represents a single review item with complete metadata and user interaction data.
 * Compatible with WaniKani API /subjects and /assignments endpoints.
 */
export interface ReviewItem {
  /** Unique identifier for this review item */
  id: string;
  /** WaniKani subject ID from the API */
  wanikaniId: string;
  /** Type of Japanese learning item */
  type: 'radical' | 'kanji' | 'vocabulary';
  /** Type of question being asked */
  questionType: 'meaning' | 'reading';
  /** The question text displayed to the user */
  question: string;
  /** The expected correct answer */
  expectedAnswer: string;
  /** The user's submitted answer */
  userAnswer?: string;
  /** Result of the user's attempt */
  result?: 'correct' | 'incorrect' | 'skipped';
  /** When the question was presented to the user */
  startedAt?: string;
  /** When the user submitted their answer */
  answeredAt?: string;
  /** Optional audio URL for pronunciation */
  audioUrl?: string;
  /** The character being studied (kanji/kana) */
  character?: string;
  /** Additional acceptable meanings */
  auxiliaryMeanings?: string[];
  /** Memory aid for learning */
  mnemonic?: string;
  
  /** @deprecated Use character instead */
  characters?: string;
  /** @deprecated Use expectedAnswer instead */
  meanings: string[];
  /** @deprecated Use expectedAnswer instead */
  readings?: string[];
  srsStage: number;
  userSpecificSrsStage: number;
  /** @deprecated Use type instead */
  object: 'kanji' | 'vocabulary' | 'radical';
  subjectType: string;
}

/**
 * Represents a complete review session with metadata and progress tracking.
 * Supports multi-user functionality and partial completion.
 */
export interface ReviewSession {
  /** Unique identifier for this session */
  id: string;
  /** User ID for multi-user support */
  userId: string;
  /** Array of review items in this session */
  items: ReviewItem[];
  /** When the session was started */
  startedAt: string;
  /** When the session was completed (if finished) */
  endedAt?: string;
  /** Overall session score (0-100) */
  score?: number;
  /** Whether the session has been completed */
  completed: boolean;
  /** Optional session configuration */
  settings?: {
    /** Voice input enabled */
    voiceEnabled?: boolean;
    /** Time limit per item in seconds */
    timeLimit?: number;
    /** Auto-advance to next item */
    autoAdvance?: boolean;
  };
  /** Source of the review items */
  source: 'wanikani' | 'custom';
  
  /** @deprecated Use items.length instead */
  currentItemIndex: number;
  /** @deprecated Calculate from items */
  correctCount: number;
  /** @deprecated Calculate from items */
  incorrectCount: number;
  /** @deprecated Use endedAt instead */
  completedAt?: string;
}
