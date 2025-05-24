import axios from 'axios';
import { 
  WaniKaniCollection, 
  WaniKaniResource, 
  AssignmentData, 
  SubjectData, 
  ReviewData,
  AssignmentFilters,
  SubjectFilters,
  PaginationOptions,
  ReviewItem
} from '../types/wanikani';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.wanikani.com/v2';
const API_KEY = process.env.WANIKANI_API_KEY;
const API_VERSION = process.env.WANIKANI_API_VERSION || '20230710';

const wanikaniApi = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Wanikani-Revision': API_VERSION,
    'Content-Type': 'application/json',
  },
});

export class WaniKaniError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'WaniKaniError';
  }
}

export const fetchAssignments = async (
  filters: AssignmentFilters = {}
): Promise<WaniKaniCollection<WaniKaniResource<AssignmentData>>> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await wanikaniApi.get(`/assignments?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    throw new WaniKaniError(
      'Failed to fetch assignments',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchAssignment = async (
  id: number
): Promise<WaniKaniResource<AssignmentData>> => {
  try {
    const response = await wanikaniApi.get(`/assignments/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    throw new WaniKaniError(
      `Failed to fetch assignment ${id}`,
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchSubjects = async (
  filters: SubjectFilters = {}
): Promise<WaniKaniCollection<WaniKaniResource<SubjectData>>> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await wanikaniApi.get(`/subjects?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    throw new WaniKaniError(
      'Failed to fetch subjects',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchSubject = async (
  id: number
): Promise<WaniKaniResource<SubjectData>> => {
  try {
    const response = await wanikaniApi.get(`/subjects/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching subject:', error);
    throw new WaniKaniError(
      `Failed to fetch subject ${id}`,
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchReviews = async (
  filters: PaginationOptions & { 
    assignment_ids?: number[];
    ids?: number[];
    subject_ids?: number[];
    updated_after?: string;
  } = {}
): Promise<WaniKaniCollection<WaniKaniResource<ReviewData>>> => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await wanikaniApi.get(`/reviews?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    throw new WaniKaniError(
      'Failed to fetch reviews',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchReviewItems = async () => {
  try {
    const response = await wanikaniApi.get('/reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching review items:', error);
    throw error;
  }
};

interface ReviewResultData {
  review: {
    incorrect_meaning_answers: number;
    incorrect_reading_answers: number;
  };
}

export const submitReviewResult = async (reviewId: string, data: ReviewResultData) => {
  try {
    const response = await wanikaniApi.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting review result:', error);
    throw error;
  }
};

export const fetchSummary = async () => {
  try {
    const response = await wanikaniApi.get('/summary');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching summary:', error);
    throw new WaniKaniError(
      'Failed to fetch summary',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchNextPage = async <T>(
  collection: WaniKaniCollection<T>
): Promise<WaniKaniCollection<T> | null> => {
  if (!collection.pages.next_url) {
    return null;
  }
  
  try {
    const response = await wanikaniApi.get(collection.pages.next_url.replace(wanikaniApi.defaults.baseURL!, ''));
    return response.data;
  } catch (error: any) {
    console.error('Error fetching next page:', error);
    throw new WaniKaniError(
      'Failed to fetch next page',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchPreviousPage = async <T>(
  collection: WaniKaniCollection<T>
): Promise<WaniKaniCollection<T> | null> => {
  if (!collection.pages.previous_url) {
    return null;
  }
  
  try {
    const response = await wanikaniApi.get(collection.pages.previous_url.replace(wanikaniApi.defaults.baseURL!, ''));
    return response.data;
  } catch (error: any) {
    console.error('Error fetching previous page:', error);
    throw new WaniKaniError(
      'Failed to fetch previous page',
      error.response?.status,
      error.response?.data
    );
  }
};

export const fetchReviewItemsForSession = async (): Promise<ReviewItem[]> => {
  try {
    const assignments = await fetchAssignments({
      immediately_available_for_review: true
    });

    if (assignments.data.length === 0) {
      return [];
    }

    const subjectIds = assignments.data.map(assignment => assignment.data.subject_id);
    
    const subjects = await fetchSubjects({
      ids: subjectIds
    });

    const subjectMap = new Map();
    subjects.data.forEach(subject => {
      subjectMap.set(subject.id, subject);
    });

    const reviewItems: ReviewItem[] = assignments.data.map(assignment => {
      const subject = subjectMap.get(assignment.data.subject_id);
      if (!subject) {
        return null;
      }
      
      const meaning = subject.data.meanings?.find((m: any) => m.primary)?.meaning || '';
      
      return {
        id: `assignment-${assignment.id}`,
        wanikaniId: String(assignment.data.subject_id),
        type: assignment.data.subject_type as any,
        questionType: Math.random() > 0.5 ? 'meaning' : 'reading', // Randomize for demo
        question: `What is the ${assignment.data.subject_type === 'kanji' ? 'meaning' : 'reading'} of ${subject.data.characters || subject.data.slug}?`,
        expectedAnswer: meaning,
        meanings: [meaning],
        level: subject.data.level || 1,
        srsStage: assignment.data.srs_stage,
        userSpecificSrsStage: assignment.data.srs_stage,
        object: assignment.data.subject_type as any,
        subjectType: assignment.data.subject_type
      };
    }).filter(Boolean) as ReviewItem[];

    return reviewItems;
  } catch (error) {
    console.error('Error fetching review items for session:', error);
    throw error;
  }
};

export default wanikaniApi;
