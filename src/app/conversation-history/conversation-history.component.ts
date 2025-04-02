import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ConversationService, Conversation } from '../services/conversation.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-conversation-history',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, DatePipe],
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.scss']
})
export class ConversationHistoryComponent implements OnInit {
  conversations: Conversation[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  filteredConversations: Conversation[] = [];

  constructor(private conversationService: ConversationService) {}

  ngOnInit(): void {
    this.loadConversations();
  }

  loadConversations(): void {
    this.loading = true;
    this.conversationService.getConversations().subscribe({
      next: (response) => {
        if (response.success) {
          this.conversations = response.conversations;
          this.filteredConversations = [...this.conversations];
          this.sortConversationsByDate();
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load conversations. Please try again later.';
        console.error('Error loading conversations:', error);
        this.loading = false;
      }
    });
  }

  sortConversationsByDate(): void {
    this.conversations.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    this.filteredConversations = [...this.conversations];
  }

  filterConversations(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value.toLowerCase();
    
    if (!this.searchTerm) {
      this.filteredConversations = [...this.conversations];
      return;
    }
    
    this.filteredConversations = this.conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(this.searchTerm) ||
      conversation.technology.toLowerCase().includes(this.searchTerm) ||
      conversation.level.toLowerCase().includes(this.searchTerm) ||
      conversation.language.toLowerCase().includes(this.searchTerm)
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteConversation(conversationId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      this.conversationService.deleteConversation(conversationId).subscribe({
        next: (response) => {
          if (response.success) {
            this.conversations = this.conversations.filter(c => c.conversation_id !== conversationId);
            this.filteredConversations = this.filteredConversations.filter(c => c.conversation_id !== conversationId);
          }
        },
        error: (error) => {
          console.error('Error deleting conversation:', error);
          alert('Failed to delete conversation. Please try again.');
        }
      });
    }
  }
} 