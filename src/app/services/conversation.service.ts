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
  private apiUrl = 'http://127.0.0.1:5000/conversations';

  constructor(private http: HttpClient) {}

  // Get all conversations for the current user
  getConversations(): Observable<{ success: boolean, conversations: Conversation[] }> {
    return this.http.get<{ success: boolean, conversations: Conversation[] }>(
      `${this.apiUrl}`,
      { withCredentials: true }
    );
  }

  // Get a specific conversation by ID
  getConversation(conversationId: string): Observable<{ success: boolean, conversation: ConversationDetail }> {
    return this.http.get<{ success: boolean, conversation: ConversationDetail }>(
      `${this.apiUrl}/${conversationId}`,
      { withCredentials: true }
    );
  }

  // Delete a conversation (if we need this functionality)
  deleteConversation(conversationId: string): Observable<{ success: boolean, message: string }> {
    return this.http.delete<{ success: boolean, message: string }>(
      `${this.apiUrl}/${conversationId}`,
      { withCredentials: true }
    );
  }
} 