import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Conversation {
  conversation_id: string;
  title: string;
  created_at: string;
  technology: string;
  level: string;
  language: string;
  user_id: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
  study_data?: {
    highlights: number[];
    notes: { [key: string]: string };
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  private baseUrl = 'https://seahorse-app-dr62o.ondigitalocean.app';

  constructor(private http: HttpClient) {}

  // Get all conversations for the current user
  getConversations(): Observable<{ success: boolean, conversations: Conversation[] }> {
    return this.http.get<{ success: boolean, conversations: Conversation[] }>(
      `${this.baseUrl}/conversations`,
      { withCredentials: true }
    );
  }

  // Get a specific conversation by ID
  getConversation(conversationId: string): Observable<{ success: boolean, conversation: ConversationDetail }> {
    return this.http.get<{ success: boolean, conversation: ConversationDetail }>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { withCredentials: true }
    );
  }

  // Save study data (notes and highlights) for a conversation
  saveStudyData(conversationId: string, highlights: number[], notes: { [key: string]: string }): Observable<{ success: boolean, message: string }> {
    return this.http.post<{ success: boolean, message: string }>(
      `${this.baseUrl}/conversations/${conversationId}/study`,
      { 
        highlights, 
        notes,
        requestId: new Date().getTime().toString() 
      },
      { withCredentials: true }
    );
  }

  // Delete a conversation (if we need this functionality)
  deleteConversation(conversationId: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(
      `${this.baseUrl}/conversations/${conversationId}`,
      { withCredentials: true }
    );
  }
} 