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

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = 'http://127.0.0.1:5000/interview';

  constructor(private http: HttpClient) {}

  startConversation(request: InterviewRequest): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(this.apiUrl, request);
  }

  continueConversation(request: InterviewRequest): Observable<InterviewResponse> {
    return this.http.post<InterviewResponse>(this.apiUrl, request);
  }
} 