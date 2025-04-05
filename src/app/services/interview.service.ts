import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface InterviewRequest {
  technology: string;
  level: string;
  language: string;
  message: string;
  conversation_id?: string;
}

export interface InterviewResponse {
  message: string;
  conversation_id: string;
}

export interface InterviewLimits {
  limit: number;
  current_count: number;
  remaining: number;
  reset_time: string;
}

export interface Quiz {
  quiz_id: string;
  conversation_id: string;
  technology: string;
  level: string;
  created_at: string;
}

export interface QuizDetail {
  _id: string;
  quiz_id: string;
  conversation_id: string;
  technology: string;
  level: string;
  created_at: string;
  user_id: string;
  content: {
    quiz: Array<{
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    }>;
  };
}

export interface QuizSubmission {
  answers: number[];
}

export interface QuizResult {
  result_id: string;
  quiz_id: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  results: Array<{
    question_index: number;
    user_answer: number;
    correct_answer: number;
    is_correct: boolean;
    explanation: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private baseUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  startConversation(request: InterviewRequest): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(`${this.baseUrl}/interview`, request, {
      withCredentials: true
    });
  }

  continueConversation(request: InterviewRequest): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(`${this.baseUrl}/interview`, request, {
      withCredentials: true
    });
  }

  // Get interview limits for current user
  getInterviewLimits(): Observable<{ success: boolean, limit: number, current_count: number, remaining: number, reset_time: string }> {
    return this.http.get<{ success: boolean, limit: number, current_count: number, remaining: number, reset_time: string }>(
      `${this.baseUrl}/interview/limits`,
      { withCredentials: true }
    );
  }

  // Generate a quiz from a conversation
  generateQuiz(conversationId: string): Observable<{ success: boolean, quiz_id: string, quiz: any }> {
    return this.http.get<{ success: boolean, quiz_id: string, quiz: any }>(
      `${this.baseUrl}/interview/quiz/${conversationId}`,
      { withCredentials: true }
    );
  }

  // Get all quizzes for the current user
  getQuizzes(): Observable<{ success: boolean, quizzes: Quiz[] }> {
    return this.http.get<{ success: boolean, quizzes: Quiz[] }>(
      `${this.baseUrl}/interview/quizzes`,
      { withCredentials: true }
    );
  }

  // Get a specific quiz by ID
  getQuiz(quizId: string): Observable<{ success: boolean, quiz: QuizDetail }> {
    return this.http.get<{ success: boolean, quiz: QuizDetail }>(
      `${this.baseUrl}/interview/quizzes/${quizId}`,
      { withCredentials: true }
    );
  }

  // Submit answers for a quiz
  submitQuizAnswers(quizId: string, answers: number[]): Observable<{ success: boolean, result_id: string, score: number, results: any[] }> {
    return this.http.post<{ success: boolean, result_id: string, score: number, results: any[] }>(
      `${this.baseUrl}/interview/quizzes/${quizId}/submit`,
      { answers },
      { withCredentials: true }
    );
  }

  // Get quiz results
  getQuizResults(): Observable<{ success: boolean, results: any[] }> {
    return this.http.get<{ success: boolean, results: any[] }>(
      `${this.baseUrl}/interview/quiz-results`,
      { withCredentials: true }
    );
  }

  // Get a specific quiz result
  getQuizResult(resultId: string): Observable<{ success: boolean, result: QuizResult }> {
    return this.http.get<{ success: boolean, result: QuizResult }>(
      `${this.baseUrl}/interview/quiz-results/${resultId}`,
      { withCredentials: true }
    );
  }
} 