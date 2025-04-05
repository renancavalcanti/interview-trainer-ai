import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService, InterviewLimits } from '../services/interview.service';

@Component({
  selector: 'app-interview-limits',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="limits-container" *ngIf="limits && loaded">
      <div class="limits-content">
        <div class="limit-info">
          <span class="limit-label">Daily Interview Limit:</span>
          <div class="limit-counter">
            <span>{{ limits.current_count }}/{{ limits.limit }}</span>
            <div class="progress-bar">
              <div class="progress" [style.width.%]="(limits.current_count / limits.limit) * 100"></div>
            </div>
          </div>
        </div>
        <div class="limit-reset" *ngIf="formattedResetTime">
          <span>Resets in: {{ formattedResetTime }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .limits-container {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 12px 15px;
      margin-bottom: 15px;
      border: 1px solid #e9ecef;
    }

    .limits-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .limit-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .limit-label {
      font-weight: bold;
      color: #495057;
    }

    .limit-counter {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .progress-bar {
      height: 8px;
      width: 100px;
      background-color: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress {
      height: 100%;
      background-color: #4285f4;
      border-radius: 4px;
    }

    .limit-reset {
      font-size: 0.85rem;
      color: #6c757d;
    }
  `]
})
export class InterviewLimitsComponent implements OnInit {
  limits: InterviewLimits | null = null;
  loaded: boolean = false;
  formattedResetTime: string = '';
  resetInterval: any;

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.loadLimits();

    // Update the countdown every minute
    this.resetInterval = setInterval(() => {
      if (this.limits) {
        this.updateResetCountdown();
      }
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.resetInterval) {
      clearInterval(this.resetInterval);
    }
  }

  loadLimits(): void {
    this.interviewService.getInterviewLimits().subscribe({
      next: (response) => {
        if (response.success) {
          this.limits = {
            limit: response.limit,
            current_count: response.current_count,
            remaining: response.remaining,
            reset_time: response.reset_time
          };
          this.updateResetCountdown();
        }
        this.loaded = true;
      },
      error: (err) => {
        console.error('Error loading interview limits:', err);
        this.loaded = true;
      }
    });
  }

  updateResetCountdown(): void {
    if (!this.limits?.reset_time) return;

    const resetTime = new Date(this.limits.reset_time);
    const now = new Date();
    const diffMs = resetTime.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      this.formattedResetTime = 'Resetting soon';
      return;
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      this.formattedResetTime = `${diffHours}h ${diffMinutes}m`;
    } else {
      this.formattedResetTime = `${diffMinutes}m`;
    }
  }
} 