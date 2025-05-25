export interface WaniKaniUser {
  id: string;
  username: string;
  level: number;
  profileUrl: string;
  startedAt: string;
}

/**
 * API response wrapper types
 */
export interface WaniKaniCollection<T> {
  object: 'collection';
  url: string;
  pages: {
    next_url: string | null;
    previous_url: string | null;
    per_page: number;
  };
  total_count: number;
  data_updated_at: string | null;
  data: T[];
}

export interface WaniKaniResource<T> {
  id: number;
  object: string;
  url: string;
  data_updated_at: string;
  data: T;
}

/**
 * API-specific data structures
 */
export interface AssignmentData {
  available_at: string | null;
  burned_at: string | null;
  created_at: string;
  hidden: boolean;
  passed_at: string | null;
  resurrected_at: string | null;
  srs_stage: number;
  started_at: string | null;
  subject_id: number;
  subject_type: 'radical' | 'kanji' | 'vocabulary' | 'kana_vocabulary';
  unlocked_at: string | null;
}

export interface SubjectData {
  auxiliary_meanings: Array<{
    meaning: string;
    type: 'whitelist' | 'blacklist';
  }>;
  characters: string | null;
  created_at: string;
  document_url: string;
  hidden_at: string | null;
  lesson_position: number;
  level: number;
  meaning_mnemonic: string;
  meanings: Array<{
    meaning: string;
    primary: boolean;
    accepted_answer: boolean;
  }>;
  slug: string;
  spaced_repetition_system_id: number;
}

export interface ReviewData {
  assignment_id: number;
  created_at: string;
  ending_srs_stage: number;
  incorrect_meaning_answers: number;
  incorrect_reading_answers: number;
  spaced_repetition_system_id: number;
  starting_srs_stage: number;
  subject_id: number;
}

/**
 * Pagination control interface
 */
export interface PaginationOptions {
  page_after_id?: number;
  page_before_id?: number;
}

/**
 * Filter interfaces for different endpoints
 */
export interface AssignmentFilters extends PaginationOptions {
  available_after?: string;
  available_before?: string;
  burned?: boolean;
  hidden?: boolean;
  ids?: number[];
  immediately_available_for_lessons?: boolean;
  immediately_available_for_review?: boolean;
  in_review?: boolean;
  levels?: number[];
  srs_stages?: number[];
  started?: boolean;
  subject_ids?: number[];
  subject_types?: string[];
  unlocked?: boolean;
  updated_after?: string;
}

export interface SubjectFilters extends PaginationOptions {
  ids?: number[];
  types?: string[];
  slugs?: string[];
  levels?: number[];
  hidden?: boolean;
  updated_after?: string;
}

/**
 * Voice input method used for answering review questions
 */
export type VoiceInputMethod = 'webSpeechAPI' | 'none';

/**
 * Voice input status for tracking recognition state
 */
export type VoiceInputStatus = 'idle' | 'recording' | 'processing' | 'error' | 'success';

/**
 * Voice input configuration and settings
 */
export interface VoiceInputConfig {
  /** The language code for speech recognition */
  language: string;
  /** Maximum recording duration in milliseconds */
  maxDuration: number;
  /** Minimum recording duration in milliseconds */
  minDuration: number;
  /** Whether to use continuous recognition */
  continuous: boolean;
  /** Whether to show interim results during recognition */
  interimResults: boolean;
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
  /** Method used to input the answer (voice or text) */
  inputMethod?: 'voice' | 'text';
  /** Voice recognition confidence score (0-1) if voice input was used */
  voiceConfidence?: number;
  
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
    /** Voice input configuration */
    voiceConfig?: VoiceInputConfig;
    /** Time limit per item in seconds */
    timeLimit?: number;
    /** Auto-advance to next item */
    autoAdvance?: boolean;
  };
  /** Source of the review items */
  source: 'wanikani' | 'custom';
  /** Voice input usage statistics */
  voiceStats?: {
    /** Number of answers submitted using voice input */
    voiceAnswerCount: number;
    /** Number of answers submitted using text input */
    textAnswerCount: number;
    /** Average voice recognition confidence */
    averageConfidence: number;
    /** Number of times voice recognition failed */
    failureCount: number;
  };
  
  /** @deprecated Use items.length instead */
  currentItemIndex: number;
  /** @deprecated Calculate from items */
  correctCount: number;
  /** @deprecated Calculate from items */
  incorrectCount: number;
  /** @deprecated Use endedAt instead */
  completedAt?: string;
}
