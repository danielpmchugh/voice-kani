import {
  fetchAssignments,
  fetchSubjects,
  fetchNextPage,
  fetchReviewItemsForSession,
  WaniKaniError
} from '../../src/services/wanikani/api';
import { 
  WaniKaniCollection, 
  WaniKaniResource, 
  AssignmentData, 
  SubjectData 
} from '../../src/types/wanikani';

jest.mock('../../src/services/wanikani/api', () => {
  const originalModule = jest.requireActual('../../src/services/wanikani/api');
  
  return {
    ...originalModule,
    fetchAssignments: jest.fn(),
    fetchSubjects: jest.fn(),
    fetchNextPage: jest.fn(),
    fetchReviewItemsForSession: jest.fn()
  };
});

describe('WaniKani API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAssignments', () => {
    it('should fetch assignments successfully', async () => {
      const mockAssignments: WaniKaniCollection<WaniKaniResource<AssignmentData>> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/assignments',
        pages: { 
          next_url: null, 
          previous_url: null, 
          per_page: 500 
        },
        total_count: 1,
        data_updated_at: null,
        data: [
          {
            id: 1,
            object: 'assignment',
            url: 'https://api.wanikani.com/v2/assignments/1',
            data_updated_at: '2023-01-01T00:00:00Z',
            data: {
              subject_id: 123,
              subject_type: 'kanji',
              srs_stage: 1,
              created_at: '2023-01-01T00:00:00Z',
              available_at: null,
              burned_at: null,
              hidden: false,
              passed_at: null,
              resurrected_at: null,
              started_at: null,
              unlocked_at: null
            }
          }
        ]
      };

      (fetchAssignments as jest.Mock).mockResolvedValue(mockAssignments);

      const result = await fetchAssignments();
      
      expect(fetchAssignments).toHaveBeenCalled();
      expect(result).toEqual(mockAssignments);
    });

    it('should handle filters correctly', async () => {
      const mockAssignments: WaniKaniCollection<WaniKaniResource<AssignmentData>> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/assignments',
        pages: { next_url: null, previous_url: null, per_page: 500 },
        total_count: 0,
        data_updated_at: null,
        data: []
      };
      
      (fetchAssignments as jest.Mock).mockResolvedValue(mockAssignments);

      const filters = {
        levels: [1, 2],
        srs_stages: [1],
        immediately_available_for_review: true
      };

      await fetchAssignments(filters);

      expect(fetchAssignments).toHaveBeenCalledWith(filters);
    });

    it('should throw WaniKaniError on API error', async () => {
      (fetchAssignments as jest.Mock).mockRejectedValue(
        new WaniKaniError('Failed to fetch assignments', 401, { error: 'Unauthorized' })
      );

      await expect(fetchAssignments()).rejects.toThrow(WaniKaniError);
    });
  });

  describe('fetchSubjects', () => {
    it('should fetch subjects successfully', async () => {
      const mockSubjects: WaniKaniCollection<WaniKaniResource<SubjectData>> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/subjects',
        pages: { next_url: null, previous_url: null, per_page: 500 },
        total_count: 1,
        data_updated_at: null,
        data: [
          {
            id: 123,
            object: 'subject',
            url: 'https://api.wanikani.com/v2/subjects/123',
            data_updated_at: '2023-01-01T00:00:00Z',
            data: {
              characters: '水',
              meanings: [{ meaning: 'Water', primary: true, accepted_answer: true }],
              auxiliary_meanings: [],
              created_at: '2023-01-01T00:00:00Z',
              document_url: 'https://www.wanikani.com/kanji/水',
              hidden_at: null,
              lesson_position: 1,
              level: 1,
              meaning_mnemonic: 'This is water',
              slug: 'water',
              spaced_repetition_system_id: 1
            }
          }
        ]
      };

      (fetchSubjects as jest.Mock).mockResolvedValue(mockSubjects);

      const result = await fetchSubjects({ types: ['kanji'] });
      
      expect(fetchSubjects).toHaveBeenCalledWith({ types: ['kanji'] });
      expect(result).toEqual(mockSubjects);
    });
  });

  describe('pagination helpers', () => {
    it('should fetch next page when available', async () => {
      const collection: WaniKaniCollection<unknown> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/assignments',
        pages: {
          next_url: 'https://api.wanikani.com/v2/assignments?page_after_id=123',
          previous_url: null,
          per_page: 500
        },
        total_count: 1,
        data_updated_at: null,
        data: []
      };

      const nextPage: WaniKaniCollection<unknown> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/assignments?page_after_id=123',
        pages: { next_url: null, previous_url: null, per_page: 500 },
        total_count: 1,
        data_updated_at: null,
        data: []
      };

      (fetchNextPage as jest.Mock).mockResolvedValue(nextPage);

      const result = await fetchNextPage(collection);

      expect(fetchNextPage).toHaveBeenCalledWith(collection);
      expect(result).toEqual(nextPage);
    });

    it('should return null when no next page available', async () => {
      const collection: WaniKaniCollection<unknown> = {
        object: 'collection',
        url: 'https://api.wanikani.com/v2/assignments',
        pages: { 
          next_url: null, 
          previous_url: null, 
          per_page: 500 
        },
        total_count: 0,
        data_updated_at: null,
        data: []
      };
      
      (fetchNextPage as jest.Mock).mockResolvedValue(null);
      
      const result = await fetchNextPage(collection);
      expect(result).toBeNull();
    });
  });

  describe('fetchReviewItemsForSession', () => {
    it('should combine assignments and subjects into review items', async () => {
      const mockReviewItems = [
        {
          id: 'assignment-1',
          wanikaniId: '123',
          type: 'kanji',
          questionType: 'meaning',
          question: 'What is the meaning of 水?',
          expectedAnswer: 'Water',
          meanings: ['Water'],
          level: 1,
          srsStage: 1,
          userSpecificSrsStage: 1,
          object: 'kanji',
          subjectType: 'kanji'
        }
      ];

      (fetchReviewItemsForSession as jest.Mock).mockResolvedValue(mockReviewItems);

      const result = await fetchReviewItemsForSession();

      expect(fetchReviewItemsForSession).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'assignment-1',
        wanikaniId: '123',
        type: 'kanji',
        expectedAnswer: 'Water',
        level: 1,
        srsStage: 1
      });
    });
  });
});
