import axios, { AxiosError, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    questions: Question[];
    metadata: {
      subject: string;
      questionCount: number;
      difficulty: string;
      syllabus: string | null;
      generatedAt: string;
    };
  };
}

interface ApiError {
  success: false;
  message: string;
  error: string;
  timestamp?: string;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error('Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const generateQuestions = async (
  subject: string,
  topic: string,
  questionCount: number = 10,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Question[]> => {
  try {
    const response = await apiClient.post<ApiResponse>('/generate-question', {
      subject: subject.trim(),
      syllabus: topic.trim(),
      questionCount: Math.min(Math.max(questionCount, 1), 50),
      difficulty
    });
    
    if (response.data.success) {
      return response.data.data.questions;
    } else {
      throw new Error(response.data.message || 'Failed to generate questions');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data;
      if (apiError) {
        throw new Error(apiError.message || 'API request failed');
      }
    }
    throw new Error('Network error or server unavailable');
  }
}; 