export interface WaniKaniUser {
  id: string;
  username: string;
  level: number;
  profileUrl: string;
  startedAt: string;
}

export interface ReviewItem {
  id: string;
  object: 'kanji' | 'vocabulary' | 'radical';
  characters?: string;
  meanings: string[];
  readings?: string[];
  srsStage: number;
  userSpecificSrsStage: number;
  subjectType: string;
}

export interface ReviewSession {
  id: string;
  items: ReviewItem[];
  currentItemIndex: number;
  startedAt: string;
  completedAt?: string;
  correctCount: number;
  incorrectCount: number;
}
