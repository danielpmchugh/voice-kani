import axios from 'axios';

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

export default wanikaniApi;
