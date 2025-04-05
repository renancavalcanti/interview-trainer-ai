import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService, QuizDetail, QuizResult } from '../services/interview.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="quiz-container">
      <div *ngIf="loading" class="loading">
        <p>Loading quiz...</p>
      </div>

      <div *ngIf="!loading && error" class="error">
        <p>{{ error }}</p>
        <button (click)="navigateBack()">Go Back</button>
      </div>

      <div *ngIf="!loading && !error && !result && quiz" class="quiz-content">
        <h2>Quiz: {{ quiz.technology }}</h2>
        <p>Level: {{ quiz.level }}</p>

        <div *ngFor="let question of quiz.content?.quiz; let i = index" class="question">
          <h3>Question {{ i+1 }}</h3>
          <p>{{ question.question }}</p>
          
          <div class="options">
            <div *ngFor="let option of question.options; let j = index" class="option">
              <label>
                <input type="radio" [(ngModel)]="userAnswers[i]" [value]="j" name="question-{{i}}" />
                {{ option }}
              </label>
            </div>
          </div>
        </div>

        <div class="quiz-actions">
          <button (click)="submitQuiz()" [disabled]="!isQuizComplete()">Submit Quiz</button>
          <button (click)="navigateBack()" class="secondary">Cancel</button>
        </div>
      </div>

      <div *ngIf="result" class="quiz-results">
        <h2>Quiz Results</h2>
        <div class="score">
          <h3>Your Score: {{ result.score.toFixed(1) }}%</h3>
          <p>{{ result.correct_answers }} correct out of {{ result.total_questions }}</p>
        </div>

        <div *ngFor="let answer of result.results; let i = index" class="result-item">
          <h4>Question {{ i+1 }}</h4>
          
          <ng-container *ngIf="quiz && quiz.content && quiz.content.quiz && quiz.content.quiz[i] as question">
            <p>{{ question.question }}</p>
            
            <div class="options">
              <div *ngFor="let option of question.options; let j = index" 
                   class="option"
                   [ngClass]="{
                     'correct': j === answer.correct_answer,
                     'incorrect': j === answer.user_answer && !answer.is_correct
                   }">
                {{ option }}
                <span *ngIf="j === answer.correct_answer" class="correct-marker">✓</span>
                <span *ngIf="j === answer.user_answer && !answer.is_correct" class="incorrect-marker">✗</span>
              </div>
            </div>
          </ng-container>
          
          <div class="explanation">
            <h5>Explanation:</h5>
            <p>{{ answer.explanation }}</p>
          </div>
        </div>

        <div class="quiz-actions">
          <button (click)="navigateBack()">Back to Interview</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quiz-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .loading, .error {
      text-align: center;
      padding: 40px 0;
    }

    .question {
      margin-bottom: 25px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .options {
      margin: 15px 0;
    }

    .option {
      margin: 8px 0;
      padding: 10px;
      border-radius: 4px;
      background-color: #f9f9f9;
    }

    .option label {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .option input {
      margin-right: 10px;
    }

    .quiz-actions {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #4285f4;
      color: white;
      cursor: pointer;
      font-weight: bold;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    button.secondary {
      background-color: #f1f1f1;
      color: #333;
    }

    .quiz-results .score {
      text-align: center;
      margin: 20px 0;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .result-item {
      margin-bottom: 30px;
    }

    .correct {
      background-color: rgba(76, 175, 80, 0.2);
    }

    .incorrect {
      background-color: rgba(244, 67, 54, 0.2);
    }

    .correct-marker {
      color: #4CAF50;
      margin-left: 10px;
      font-weight: bold;
    }

    .incorrect-marker {
      color: #F44336;
      margin-left: 10px;
      font-weight: bold;
    }

    .explanation {
      margin-top: 15px;
      padding: 15px;
      background-color: #f9f9f9;
      border-left: 4px solid #4285f4;
    }
  `]
})
export class QuizComponent implements OnInit {
  @Input() quizId: string = '';
  @Input() conversationId: string = '';

  quiz: QuizDetail | null = null;
  loading: boolean = false;
  error: string | null = null;
  userAnswers: number[] = [];
  result: QuizResult | null = null;

  constructor(
    private interviewService: InterviewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if we get the quizId from the route or as @Input
    if (!this.quizId) {
      this.route.params.subscribe(params => {
        this.quizId = params['id'];
        if (this.quizId) {
          this.loadQuiz();
        }
      });
    } else {
      this.loadQuiz();
    }

    // If we have a conversationId but no quizId, then generate a new quiz
    if (this.conversationId && !this.quizId) {
      this.generateQuiz();
    }
  }

  loadQuiz(): void {
    this.loading = true;
    this.error = null;

    this.interviewService.getQuiz(this.quizId).subscribe({
      next: (response) => {
        if (response.success) {
          this.quiz = response.quiz;
          // Updated to use content.quiz instead of quiz.quiz
          const quizLength = this.quiz?.content?.quiz?.length || 0;
          // Initialize user answers array with -1 values (nothing selected)
          this.userAnswers = new Array(quizLength).fill(-1);
        } else {
          this.error = 'Failed to load quiz. Please try again.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading quiz:', err);
        this.error = 'An error occurred while loading the quiz. Please try again.';
        this.loading = false;
      }
    });
  }

  generateQuiz(): void {
    this.loading = true;
    this.error = null;

    this.interviewService.generateQuiz(this.conversationId).subscribe({
      next: (response) => {
        if (response.success) {
          this.quizId = response.quiz_id;
          this.loadQuiz();
        } else {
          this.error = 'Failed to generate quiz. Please try again.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error generating quiz:', err);
        this.error = 'An error occurred while generating the quiz. Please try again.';
        this.loading = false;
      }
    });
  }

  isQuizComplete(): boolean {
    // Check if all questions have an answer selected
    return this.userAnswers.every(answer => answer !== -1);
  }

  submitQuiz(): void {
    if (!this.isQuizComplete()) {
      return;
    }

    this.loading = true;

    this.interviewService.submitQuizAnswers(this.quizId, this.userAnswers).subscribe({
      next: (response) => {
        if (response.success) {
          this.result = {
            result_id: response.result_id,
            quiz_id: this.quizId,
            score: response.score,
            correct_answers: response.results.filter(r => r.is_correct).length,
            total_questions: response.results.length,
            results: response.results
          };
        } else {
          this.error = 'Failed to submit quiz. Please try again.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
        this.error = 'An error occurred while submitting the quiz. Please try again.';
        this.loading = false;
      }
    });
  }

  navigateBack(): void {
    if (this.conversationId) {
      this.router.navigate(['/conversation', this.conversationId]);
    } else {
      this.router.navigate(['/history']);
    }
  }
} 