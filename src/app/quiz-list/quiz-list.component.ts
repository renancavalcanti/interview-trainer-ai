import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InterviewService, Quiz } from '../services/interview.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="quiz-list-container">
      <div class="container py-4">
        <h1 class="mb-4">Your Quizzes</h1>
        
        <!-- Loading indicator -->
        <div *ngIf="loading" class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading quizzes...</p>
        </div>
        
        <!-- Error message -->
        <div *ngIf="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2"></i> {{ error }}
        </div>
        
        <!-- Empty state -->
        <div *ngIf="!loading && !error && (!quizzes || quizzes.length === 0)" class="text-center my-5">
          <div class="empty-state">
            <i class="fas fa-clipboard-question fa-4x mb-3"></i>
            <h3>No Quizzes Found</h3>
            <p class="text-muted">You haven't generated any quizzes yet.</p>
            <p>Complete an interview and then generate a quiz to test your knowledge!</p>
            <a routerLink="/interview" class="btn btn-primary mt-3">Start an Interview</a>
          </div>
        </div>
        
        <!-- Quiz list -->
        <div *ngIf="!loading && !error && quizzes && quizzes.length > 0" class="row">
          <div *ngFor="let quiz of quizzes" class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100 quiz-card">
              <div class="card-body">
                <h5 class="card-title text-primary">
                  <i class="fas fa-question-circle me-2"></i> {{ quiz.technology }} Quiz
                </h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ quiz.level | titlecase }} Level</h6>
                <p class="card-text small">
                  Created on {{ formatDate(quiz.created_at) }}
                </p>
              </div>
              <div class="card-footer bg-white border-top-0">
                <a [routerLink]="['/quiz', quiz.quiz_id]" class="btn btn-primary w-100">
                  <i class="fas fa-play me-1"></i> Take Quiz
                </a>
                <a [routerLink]="['/conversation', quiz.conversation_id]" class="btn btn-link btn-sm w-100 mt-2">
                  <i class="fas fa-eye me-1"></i> View Source Interview
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-card {
      transition: transform 0.2s, box-shadow 0.2s;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .quiz-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    }
    
    .empty-state {
      padding: 3rem;
      background-color: #f8f9fa;
      border-radius: 8px;
      color: #495057;
    }
    
    .empty-state i {
      color: #6c757d;
    }
  `]
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes(): void {
    this.loading = true;
    this.error = '';

    this.interviewService.getQuizzes().subscribe({
      next: (response) => {
        if (response.success) {
          this.quizzes = response.quizzes;
        } else {
          this.error = 'Failed to load quizzes. Please try again.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quizzes:', err);
        this.error = 'An error occurred while loading quizzes. Please try again.';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 