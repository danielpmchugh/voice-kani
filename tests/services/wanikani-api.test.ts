import axios from 'axios';
import {
  fetchAssignments,
  fetchAssignment,
  fetchSubjects,
  fetchSubject,
  fetchReviews,
  fetchSummary,
  fetchNextPage,
  fetchPreviousPage,
  fetchReviewItemsForSession,
  WaniKaniError
} from '../../src/services/wanikani/api';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxiosInstance = {
  get: jest.fn(),
  put: jest.fn(),
  defaults: { baseURL: 'https://api.wanikani.com/v2' }
} as any;

mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe('WaniKani API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAssignments', () => {
    it('should fetch assignments successfully', async () => {
      const mockResponse = {
        data: {
          object: 'collection',
          data: [
            {
              id: 1,
              object: 'assignment',
              data: {
                subject_id: 123,
                subject_type: 'kanji',
                srs_stage: 1
              }
            }
          ],
          pages: { next_url: null, previous_url: null, per_page: 500 },
          total_count: 1
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchAssignments();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/assignments?');
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle filters correctly', async () => {
      const mockResponse = { data: { object: 'collection', data: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await fetchAssignments({
        levels: [1, 2],
        srs_stages: [1],
        immediately_available_for_review: true
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/assignments?levels=1%2C2&srs_stages=1&immediately_available_for_review=true'
      );
    });

    it('should throw WaniKaniError on API error', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      };
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(fetchAssignments()).rejects.toThrow(WaniKaniError);
    });
  });

  describe('fetchSubjects', () => {
    it('should fetch subjects successfully', async () => {
      const mockResponse = {
        data: {
          object: 'collection',
          data: [
            {
              id: 123,
              object: 'kanji',
              data: {
                characters: '水',
                meanings: [{ meaning: 'Water', primary: true }],
                level: 1
              }
            }
          ]
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchSubjects({ types: ['kanji'] });
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/subjects?types=kanji');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('pagination helpers', () => {
    it('should fetch next page when available', async () => {
      const collection = {
        pages: {
          next_url: 'https://api.wanikani.com/v2/assignments?page_after_id=123',
          previous_url: null,
          per_page: 500
        }
      } as any;

      const mockResponse = { data: { object: 'collection', data: [] } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await fetchNextPage(collection);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/assignments?page_after_id=123');
      expect(result).toEqual(mockResponse.data);
    });

    it('should return null when no next page available', async () => {
      const collection = {
        pages: { next_url: null, previous_url: null, per_page: 500 }
      } as any;

      const result = await fetchNextPage(collection);
      expect(result).toBeNull();
    });
  });

  describe('fetchReviewItemsForSession', () => {
    it('should combine assignments and subjects into review items', async () => {
      const assignmentsResponse = {
        data: {
          data: [
            {
              id: 1,
              data: {
                subject_id: 123,
                subject_type: 'kanji',
                srs_stage: 1
              }
            }
          ]
        }
      };

      const subjectsResponse = {
        data: {
          data: [
            {
              id: 123,
              data: {
                characters: '水',
                meanings: [{ meaning: 'Water', primary: true }],
                level: 1,
                slug: 'water'
              }
            }
          ]
        }
      };

      mockAxiosInstance.get
        .mockResolvedValueOnce(assignmentsResponse)
        .mockResolvedValueOnce(subjectsResponse);

      const result = await fetchReviewItemsForSession();

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
